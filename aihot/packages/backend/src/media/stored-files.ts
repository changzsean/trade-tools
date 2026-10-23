// Originals live in private object storage in cloud deployments; derived caches remain disposable.
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { config, credential } from "../config.ts";
import { signV4 } from "../providers/s3.ts";

export type FileGroup = "uploads" | "feedback-screenshots";
type StoredFile = { name: string; mtimeMs: number };
type Store = { endpoint: string; bucket: string; accessKey: string; secretKey: string; region: string };

function checkedName(group: FileGroup, name: string): void {
  if (!["uploads", "feedback-screenshots"].includes(group) || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name) || name === "." || name === "..") throw new Error("Invalid stored file name");
}
function store(): Store | null {
  const endpoint = process.env.UPLOAD_STORE_ENDPOINT;
  const bucket = process.env.UPLOAD_STORE_BUCKET;
  const accessKey = credential("integrations", "UPLOAD_STORE_ACCESS_KEY_ID");
  const secretKey = credential("integrations", "UPLOAD_STORE_SECRET_ACCESS_KEY");
  if (!endpoint && !bucket && !accessKey && !secretKey && process.env.UPLOAD_STORE_REQUIRED !== "true") return null;
  if (!endpoint || !bucket || !accessKey || !secretKey) throw Object.assign(new Error("Private upload storage is not configured"), { statusCode: 503 });
  let url: URL;
  try { url = new URL(endpoint); } catch { throw new Error("Invalid UPLOAD_STORE_ENDPOINT"); }
  const testEndpoint = process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if ((!testEndpoint && url.protocol !== "https:") || url.username || url.password || url.search || url.hash || url.pathname !== "/" || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error("Invalid private upload storage endpoint or bucket");
  return { endpoint: url.origin, bucket, accessKey, secretKey, region: process.env.UPLOAD_STORE_REGION || "auto" };
}
async function request(s: Store, method: string, key: string, body?: Buffer, query?: URLSearchParams): Promise<Response> {
  const url = new URL(`${s.endpoint}/${s.bucket}/${key}`);
  if (query) url.search = query.toString();
  const headers = signV4({ method, url, region: s.region, accessKey: s.accessKey, secretKey: s.secretKey, payloadHash: createHash("sha256").update(body ?? "").digest("hex") });
  const response = await fetch(url, { method, headers, ...(body ? { body: body as never } : {}), redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok && response.status !== 404) throw new Error(`Private upload storage ${method} failed: HTTP ${response.status}`);
  return response;
}
export async function writeStoredFile(group: FileGroup, name: string, body: Buffer): Promise<void> {
  checkedName(group, name);
  const s = store();
  if (s) {
    const response = await request(s, "PUT", `${group}/${name}`, body);
    if (!response.ok) throw new Error("Private upload storage PUT failed");
  } else {
    const dir = path.join(config.dataDir, group);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), body);
  }
}
export async function readStoredFile(group: FileGroup, name: string): Promise<Buffer | null> {
  checkedName(group, name);
  const s = store();
  if (s) {
    const response = await request(s, "GET", `${group}/${name}`);
    return response.status === 404 ? null : Buffer.from(await response.arrayBuffer());
  }
  return readFile(path.join(config.dataDir, group, name)).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
}
export async function deleteStoredFile(group: FileGroup, name: string): Promise<void> {
  checkedName(group, name);
  const s = store();
  if (s) { await request(s, "DELETE", `${group}/${name}`); return; }
  await unlink(path.join(config.dataDir, group, name)).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
}
async function listStoredFiles(group: FileGroup): Promise<StoredFile[]> {
  checkedName(group, "check");
  const s = store();
  if (!s) {
    const dir = path.join(config.dataDir, group);
    const names = await readdir(dir).catch((error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return []; throw error; });
    const files: StoredFile[] = [];
    for (const name of names) {
      checkedName(group, name);
      const info = await stat(path.join(dir, name));
      if (info.isFile()) files.push({ name, mtimeMs: info.mtimeMs });
    }
    return files;
  }
  const files: StoredFile[] = [];
  let continuation: string | undefined;
  const seen = new Set<string>();
  do {
    const query = new URLSearchParams({ "list-type": "2", prefix: `${group}/` });
    if (continuation) query.set("continuation-token", continuation);
    const response = await request(s, "GET", "", undefined, query);
    if (!response.ok) throw new Error("Private upload storage listing failed");
    const result = new XMLParser({ parseTagValue: false }).parse(await response.text()).ListBucketResult;
    if (!result) throw new Error("Invalid private upload storage listing");
    const objects = !result.Contents ? [] : Array.isArray(result.Contents) ? result.Contents : [result.Contents];
    for (const object of objects) {
      const key = String(object.Key);
      if (!key.startsWith(`${group}/`)) throw new Error("Private upload storage returned an unexpected prefix");
      const name = key.slice(group.length + 1);
      checkedName(group, name);
      const mtimeMs = Date.parse(String(object.LastModified));
      if (!Number.isFinite(mtimeMs)) throw new Error("Private upload storage returned an invalid modification date");
      files.push({ name, mtimeMs });
    }
    continuation = String(result.IsTruncated) === "true" ? result.NextContinuationToken : undefined;
    if (String(result.IsTruncated) === "true" && (!continuation || seen.has(continuation))) throw new Error("Invalid private upload storage continuation");
    if (continuation) seen.add(continuation);
  } while (continuation);
  return files;
}
export async function pruneStoredFiles(group: FileGroup, ageMs: number, now: number): Promise<number> {
  let count = 0;
  for (const file of await listStoredFiles(group)) if (now - file.mtimeMs > ageMs) {
    await deleteStoredFile(group, file.name);
    count++;
  }
  return count;
}
/** Materialize private originals in the worker's scratch directory before the existing tar backup. */
export async function materializeUploadsForBackup(directory: string): Promise<string> {
  if (!store()) return directory;
  const scratch = path.join(directory, "backups", "private-originals");
  await rm(scratch, { recursive: true, force: true });
  for (const group of ["uploads", "feedback-screenshots"] as const) for (const file of await listStoredFiles(group)) {
    const body = await readStoredFile(group, file.name);
    if (!body) continue; // The user can delete an object while a backup is being collected.
    const dir = path.join(scratch, group);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, file.name), body);
  }
  return scratch;
}
