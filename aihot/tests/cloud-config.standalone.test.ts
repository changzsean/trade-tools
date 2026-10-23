import test from "node:test";
import assert from "node:assert/strict";
import { waitForSetupLock } from "../scripts/cloud-setup.ts";
import { startupFailure } from "../scripts/cloud-errors.ts";
import { configureVerifiedDatabaseTls } from "../scripts/cloud-config.ts";
import { checkCloudConfig } from "../scripts/cloud-config.ts";

const valid = () => ({ NODE_ENV: "production", DATABASE_URL: "postgres://owner:s3cret%40encoded@db.example:5432/postgres?sslmode=require", SESSION_SECRET: "s".repeat(32), IMG_PROXY_SIGN_SECRET: "i".repeat(32), ADMIN_PASSWORD: "admin-password-123", COLLECT_ENABLED: "false", MODEL_CALLS_ENABLED: "false" });
test("cloud configuration accepts escaped credentials and disabled actions", () => {
  assert.doesNotThrow(() => checkCloudConfig(valid()));
});
test("invalid database configuration errors do not disclose credentials", () => {
  const env = { ...valid(), DATABASE_URL: "invalid-private-password" };
  assert.throws(() => checkCloudConfig(env), error => error instanceof Error && /DATABASE_URL/.test(error.message) && !error.message.includes(env.DATABASE_URL));
  assert.throws(() => checkCloudConfig({ ...valid(), DATABASE_URL: "postgres://owner:YOUR_PASSWORD@db.example/postgres" }));
});
test("cloud configuration rejects missing secrets and ambiguous action valves", () => {
  assert.throws(() => checkCloudConfig({ ...valid(), ADMIN_PASSWORD: "short" }));
  assert.throws(() => checkCloudConfig({ ...valid(), SESSION_SECRET: "" }));
  assert.throws(() => checkCloudConfig({ ...valid(), COLLECT_ENABLED: "yes" }));
  assert.throws(() => checkCloudConfig({ ...valid(), MODEL_CALLS_ENABLED: "" }));
});

test("cloud database TLS verifies the server and preserves escaped credentials", () => {
  const env = { DATABASE_URL: "postgres://owner:p%40ss%23word@db.example:5432/postgres?sslmode=require" };
  configureVerifiedDatabaseTls(env);
  const url = new URL(env.DATABASE_URL);
  assert.equal(url.searchParams.get("sslmode"), "verify-full");
  assert.equal(url.password, "p%40ss%23word");
  assert.equal(url.hostname, "db.example");
});

test("setup lock waits outside the database and stops after acquisition", async () => {
  let tries = 0, pauses = 0;
  await waitForSetupLock(async () => ++tries === 3, async () => { pauses++; });
  assert.equal(tries, 3); assert.equal(pauses, 2);
});
test("setup lock has a bounded wait", async () => {
  await assert.rejects(waitForSetupLock(async () => false, async () => {}, 0), /timed out/);
});
test("startup diagnostics identify failed migration without logging secrets", () => {
  const secret = "postgres://owner:private-password@db.example/postgres";
  const inner = Object.assign(new Error(secret), { code: "55P03" });
  const result = startupFailure(new Error(`migration 0055_example.sql failed after 5ms: ${secret}`, { cause: inner }), "worker");
  assert.deepEqual(result.codes, ["55P03"]);
  assert.equal(result.migration, "0055_example.sql");
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.ok(!JSON.stringify(result).includes("private-password"));
});
