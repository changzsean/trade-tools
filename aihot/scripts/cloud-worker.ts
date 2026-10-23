import { setupCloudDatabase } from "./cloud-setup.ts";
import { recordStartupFailure } from "./cloud-errors.ts";

process.env.UPLOAD_STORE_REQUIRED = "true";
try {
  await setupCloudDatabase();
  const { sql } = await import("@aihot/backend/db");
  const { existsSync } = await import("node:fs");
  const { getCACertificates } = await import("node:tls");
  await sql`INSERT INTO settings (key, value, updated_by) VALUES ('cloud-startup.worker-phase', ${sql.json({ phase: "database-ready", at: new Date().toISOString(), extraCaFile: existsSync(process.env.NODE_EXTRA_CA_CERTS ?? ""), extraCaCount: getCACertificates("extra").length })}, 'cloud-startup')
    ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`;
  await import("../apps/worker/src/main.ts");
} catch (error) {
  await recordStartupFailure(error, "worker");
  process.exit(1);
}
