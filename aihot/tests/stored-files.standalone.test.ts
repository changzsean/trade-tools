import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const root = await mkdtemp(path.join(tmpdir(), "meeka-files-test-"));
process.env.NODE_ENV = "test";
process.env.AIHOT_DATA_DIR = root;
const files = await import("../packages/backend/src/media/stored-files.ts");
const keys = ["UPLOAD_STORE_ENDPOINT", "UPLOAD_STORE_BUCKET", "UPLOAD_STORE_ACCESS_KEY_ID", "UPLOAD_STORE_SECRET_ACCESS_KEY", "UPLOAD_STORE_REGION", "UPLOAD_STORE_REQUIRED"];
const clear = () => { for (const key of keys) delete process.env[key]; };
const objects = new Map<string, { body: Buffer; date: string }>();
let failure = false;
let requests = 0;
const server = createServer(async (req, res) => {
  try {
    requests++;
    assert.match(String(req.headers.authorization), /^AWS4-HMAC-SHA256 Credential=test-access\//);
    assert.ok(req.headers["x-amz-content-sha256"]);
    if (failure) { res.writeHead(503).end(); return; }
    const url = new URL(req.url!, "http://localhost");
    const key = url.pathname.slice("/private-test/".length);
    if (url.searchParams.get("list-type") === "2") {
      const prefix = url.searchParams.get("prefix")!;
      const rows = [...objects].filter(([k]) => k.startsWith(prefix)).sort();
      const offset = Number(url.searchParams.get("continuation-token") || 0);
      const page = rows.slice(offset, offset + 1);
      const more = offset + 1 < rows.length;
      res.end(`<ListBucketResult><IsTruncated>${more}</IsTruncated>${more ? `<NextContinuationToken>${offset + 1}</NextContinuationToken>` : ""}${page.map(([k, v]) => `<Contents><Key>${k}</Key><LastModified>${v.date}</LastModified></Contents>`).join("")}</ListBucketResult>`);
      return;
    }
    if (req.method === "PUT") {
      const chunks = []; for await (const c of req) chunks.push(c);
      objects.set(key, { body: Buffer.concat(chunks), date: new Date().toISOString() });
      res.end(); return;
    }
    if (req.method === "DELETE") { objects.delete(key); res.writeHead(204).end(); return; }
    const object = objects.get(key);
    if (object) res.end(object.body); else res.writeHead(404).end();
  } catch { res.writeHead(500).end(); }
});

test("private originals persist across processes, paginate, back up and erase without stale copies", async () => {
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  Object.assign(process.env, { UPLOAD_STORE_ENDPOINT: `http://127.0.0.1:${address.port}`, UPLOAD_STORE_BUCKET: "private-test", UPLOAD_STORE_ACCESS_KEY_ID: "test-access", UPLOAD_STORE_SECRET_ACCESS_KEY: "test-secret", UPLOAD_STORE_REQUIRED: "true" });
  try {
    await files.writeStoredFile("uploads", "one.png", Buffer.from("one"));
    await files.writeStoredFile("uploads", "two.png", Buffer.from("two"));
    assert.equal((await files.readStoredFile("uploads", "one.png"))?.toString(), "one");
    const child = await promisify(execFile)(process.execPath, ["--input-type=module", "-e", 'const f=await import("./packages/backend/src/media/stored-files.ts"); process.stdout.write((await f.readStoredFile("uploads","one.png")).toString());'], { cwd: path.resolve(import.meta.dirname, ".."), env: process.env });
    assert.equal(child.stdout, "one");
    objects.set("feedback-screenshots/old.png", { body: Buffer.from("old"), date: "2020-01-01T00:00:00Z" });
    const scratch = await files.materializeUploadsForBackup(root);
    assert.equal(await readFile(path.join(scratch, "uploads", "two.png"), "utf8"), "two");
    await files.deleteStoredFile("uploads", "one.png");
    assert.equal(await files.readStoredFile("uploads", "one.png"), null);
    await files.materializeUploadsForBackup(root);
    await assert.rejects(stat(path.join(scratch, "uploads", "one.png")), { code: "ENOENT" });
    assert.equal(await files.pruneStoredFiles("feedback-screenshots", 86400000, Date.now()), 1);
    failure = true;
    await assert.rejects(files.readStoredFile("uploads", "two.png"), /503/);
    await assert.rejects(files.materializeUploadsForBackup(root), /503/);
    await assert.rejects(files.deleteStoredFile("uploads", "two.png"), /503/);
    assert.ok(requests > 10);
    await assert.rejects(stat(path.join(root, "uploads", "two.png")), { code: "ENOENT" });
  } finally {
    failure = false; clear();
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});

test("local storage remains compatible and required cloud storage fails closed", async () => {
  clear();
  try {
    await files.writeStoredFile("uploads", "local.png", Buffer.from("local"));
    assert.equal((await files.readStoredFile("uploads", "local.png"))?.toString(), "local");
    await files.deleteStoredFile("uploads", "local.png");
    assert.equal(await files.readStoredFile("uploads", "local.png"), null);
    await assert.rejects(files.writeStoredFile("uploads", "../escape", Buffer.from("x")), /Invalid/);
    process.env.UPLOAD_STORE_REQUIRED = "true";
    await assert.rejects(files.writeStoredFile("uploads", "no-fallback.png", Buffer.from("x")), { statusCode: 503 });
    await assert.rejects(stat(path.join(root, "uploads", "no-fallback.png")), { code: "ENOENT" });
  } finally { clear(); await rm(root, { recursive: true, force: true }); }
});
