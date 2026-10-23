/** Report diagnostic identifiers only; driver messages may contain connection credentials. */
export function startupFailure(error: unknown, role: "API" | "worker") {
  const codes = new Set<string>();
  let migration: string | undefined;
  let cause: unknown = error;
  for (let depth = 0; depth < 5 && cause instanceof Error; depth++) {
    const code = (cause as Error & { code?: unknown }).code;
    if (typeof code === "string" && /^[A-Z0-9_]{2,64}$/.test(code)) codes.add(code);
    migration ??= /^migration (\d{4}_[a-z0-9_]+\.sql) failed /.exec(cause.message)?.[1];
    cause = cause.cause;
  }
  return { level: "error", msg: `Cloud ${role} startup failed; check configuration and database access`, codes: [...codes], ...(migration ? { migration } : {}) };
}

/** Keep secret-free failure identifiers available when the host's log API is unavailable. */
export async function recordStartupFailure(error: unknown, role: "API" | "worker"): Promise<void> {
  const diagnostic = { ...startupFailure(error, role), at: new Date().toISOString(), release: process.env.AIHOT_RELEASE ?? "dev" };
  console.error(JSON.stringify(diagnostic));
  try {
    const { sql, closeDb } = await import("@aihot/backend/db");
    await sql`INSERT INTO settings (key, value, updated_by) VALUES (${`cloud-startup.${role}`}, ${sql.json(diagnostic)}, 'cloud-startup')
      ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_by=EXCLUDED.updated_by, updated_at=now()`;
    await closeDb();
  } catch { /* The database itself may be the failed dependency. */ }
}
