import assert from "node:assert/strict";
import { after, test } from "node:test";
import { newsFilters, newsHref, readNews, safeSourceUrl, validDetail, validHot, validPool } from "../lib/aihot/api.ts";
import { editorialBlocks } from "../lib/aihot/editorial.ts";

const originalFetch = globalThis.fetch;
const originalBase = process.env.AIHOT_API_BASE_URL;

test("editorial paragraphs and lists stay plain text, with no HTML or executable links", () => {
  assert.deepEqual(editorialBlocks("## 业务影响\n\n事实和分析。\n\n- 核对价格\n- 保留人工审核"), [
    { kind: "heading", text: "业务影响" }, { kind: "paragraph", text: "事实和分析。" },
    { kind: "list", text: "", items: ["核对价格", "保留人工审核"] },
  ]);
  assert.deepEqual(editorialBlocks('<script>alert(1)</script>\n\n[危险链接](javascript:alert(1))'), [
    { kind: "paragraph", text: '<script>alert(1)</script>' }, { kind: "paragraph", text: '[危险链接](javascript:alert(1))' },
  ]);
  const detail = { id: "example", title: "标题", source: { name: "来源" }, summary: "摘要", reason: null,
    publishedAt: null, timelineAt: "2026-10-23T00:00:00Z", selected: false, originalTitle: null, links: { original: "https://example.com" } };
  assert.equal(validDetail({ ...detail, editorialBody: "编辑稿", author: "来源作者" }), true);
  assert.equal(validDetail({ ...detail, editorialBody: { html: "<script>" } }), false);
  assert.equal(validDetail({ ...detail, editorialBody: "x".repeat(12001) }), false);
});
after(() => { globalThis.fetch = originalFetch; if (originalBase === undefined) delete process.env.AIHOT_API_BASE_URL; else process.env.AIHOT_API_BASE_URL = originalBase; });

test("filters keep the six configured categories and bound search and paging", () => {
  assert.deepEqual(newsFilters({ category: "ai-trade", page: "900", q: " x ", view: "hot" }), { category: "ai-trade", page: 50, order: "updated", q: "x", view: "hot" });
  assert.deepEqual(newsFilters({ category: "unknown", view: ["hot"], page: "-4" }), { category: "", view: "latest", page: 1, order: "updated", q: "" });
  assert.equal(newsFilters({ order: "source" }).order, "source");
  assert.equal(newsHref({ order: "source", category: "ai-trade", page: 2 }), "/aihot?category=ai-trade&order=source&page=2");
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
