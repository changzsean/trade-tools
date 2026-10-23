import { checkCloudConfig, configureVerifiedDatabaseTls } from "./cloud-config.ts";
import { setTimeout as sleep } from "node:timers/promises";

/** A blocked advisory-lock SELECT holds a snapshot and can block CREATE INDEX CONCURRENTLY. */
export async function waitForSetupLock(tryLock: () => Promise<boolean>, pause = () => sleep(250), timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!await tryLock()) {
    if (Date.now() >= deadline) throw new Error("Cloud database setup lock timed out");
    await pause();
  }
}

/** API cold starts and daemon rollouts may overlap. One database session owns setup at a time. */
export async function setupCloudDatabase(): Promise<void> {
  checkCloudConfig();
  configureVerifiedDatabaseTls();
  const { sql } = await import("@aihot/backend/db");
  const { REPO_ROOT } = await import("@aihot/backend/config");
  const { runMigrations } = await import("./migrate.ts");
  const { seedSources } = await import("./seed.ts");
  const session = await sql.reserve();
  let locked = false;
  try {
    await session`SET statement_timeout = '120s'`;
    await waitForSetupLock(async () => {
      const [row] = await session<{ acquired: boolean }[]>`SELECT pg_try_advisory_lock(742981306) AS acquired`;
      return row?.acquired === true;
    });
    locked = true;
    await runMigrations(sql, REPO_ROOT);
    await seedSources();
    // These are private backend tables. Supabase browser roles must not gain access to them.
    const tables = await sql<{ tablename: string }[]>`
      SELECT c.relname AS tablename FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity`;
    for (const { tablename } of tables) {
      await sql.unsafe(`ALTER TABLE public."${tablename.replaceAll('"', '""')}" ENABLE ROW LEVEL SECURITY`);
    }
    await sql`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated`;
    await sql`REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated`;
    await sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated`;
    await sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated`;
  } finally {
    try { if (locked) await session`SELECT pg_advisory_unlock(742981306)`; }
    finally { session.release(); }
  }
}
