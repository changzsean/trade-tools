import assert from "node:assert/strict";
import { after, test } from "node:test";
import { newsFilters, newsHref, readNews, safeSourceUrl, validHot, validPool } from "../lib/aihot/api.ts";

const originalFetch = globalThis.fetch;
const originalBase = process.env.AIHOT_API_BASE_URL;
after(() => { globalThis.fetch = originalFetch; if (originalBase === undefined) delete process.env.AIHOT_API_BASE_URL; else process.env.AIHOT_API_BASE_URL = originalBase; });

test("filters keep the six configured categories and bound search and paging", () => {
  assert.deepEqual(newsFilters({ category: "ai-trade", page: "900", q: " x ", view: "hot" }), { category: "ai-trade", page: 50, q: "x", view: "hot" });
  assert.deepEqual(newsFilters({ category: "unknown", view: ["hot"], page: "-4" }), { category: "", view: "latest", page: 1, q: "" });
  assert.equal(newsFilters({ q: "a".repeat(201) }).q.length, 200);
  assert.equal(newsHref({ category: "ai-trade", q: "客户 开发", page: 2 }), "/aihot?category=ai-trade&q=%E5%AE%A2%E6%88%B7+%E5%BC%80%E5%8F%91&page=2");
});

test("source links cannot execute scripts or carry credentials", () => {
  for (const value of ["javascript:alert(1)", "data:text/html,a", "/admin", "https://user:password@example.com"]) assert.equal(safeSourceUrl(value), null);
  assert.equal(safeSourceUrl("https://example.com/news"), "https://example.com/news");
});

test("unconfigured and unavailable services stay distinct from a valid empty publication", async () => {
  delete process.env.AIHOT_API_BASE_URL;
  globalThis.fetch = async () => { throw new Error("must not fetch without configuration"); };
  assert.deepEqual(await readNews("/api/site/pool", validPool), { state: "not-configured" });
  process.env.AIHOT_API_BASE_URL = "https://news.invalid";
  globalThis.fetch = async () => new Response(null, { status: 503 });
  assert.deepEqual(await readNews("/api/site/pool", validPool), { state: "unavailable" });
  globalThis.fetch = async () => Response.json({ items: [], total: 0, page: 1, pageCount: 0, freshness: "" });
  const result = await readNews("/api/site/pool", validPool);
  assert.equal(result.state, "ready");
  globalThis.fetch = async () => Response.json({ items: [{ title: "bad response" }], total: 1 });
  assert.deepEqual(await readNews("/api/site/pool", validPool), { state: "unavailable" });
});

test("the section reads only public API paths with no visitor cookies, auth or model request", async () => {
  process.env.AIHOT_API_BASE_URL = "https://news.invalid";
  globalThis.fetch = async (input, options) => {
    assert.equal(String(input), "https://news.invalid/api/site/hot");
    assert.deepEqual(options?.headers, { accept: "application/json" });
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    return Response.json({ entries: [], computedAt: null, windowHours: 48 });
  };
  assert.equal((await readNews("/api/site/hot", validHot)).state, "ready");
});

test("withdrawn article responses stay unavailable for publication", async () => {
  globalThis.fetch = async () => new Response(null, { status: 404 });
  assert.deepEqual(await readNews("/api/site/items/fixture", validPool), { state: "not-found" });
});
