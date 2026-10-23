/** Check configuration without including credentials in exceptions or logs. */
export function checkCloudConfig(env: NodeJS.ProcessEnv = process.env): void {
  let database: URL;
  try { database = new URL(env.DATABASE_URL ?? ""); }
  catch { throw new Error("DATABASE_URL must be a PostgreSQL connection URI"); }
  if (!["postgres:", "postgresql:"].includes(database.protocol) || !database.hostname || !database.username || !database.password || /YOUR.?PASSWORD/i.test(database.password)) {
    throw new Error("DATABASE_URL is missing valid PostgreSQL connection details");
  }
  if (env.NODE_ENV !== "production") throw new Error("Cloud entrypoints require NODE_ENV=production");
  for (const name of ["SESSION_SECRET", "IMG_PROXY_SIGN_SECRET"]) {
    if ((env[name]?.length ?? 0) < 32) throw new Error(`${name} must contain at least 32 characters`);
  }
  if ((env.ADMIN_PASSWORD?.length ?? 0) < 12) throw new Error("ADMIN_PASSWORD must contain at least 12 characters");
  for (const name of ["COLLECT_ENABLED", "MODEL_CALLS_ENABLED"]) {
    if (env[name] !== "true" && env[name] !== "false") throw new Error(`${name} must be explicitly true or false`);
  }
}
/** Node's database drivers share the container's trusted Supabase root CA. */
export function configureVerifiedDatabaseTls(env: Record<string, string | undefined> = process.env): void {
  const url = new URL(env.DATABASE_URL!);
  url.searchParams.set("sslmode", "verify-full");
  env.DATABASE_URL = url.toString();
}
