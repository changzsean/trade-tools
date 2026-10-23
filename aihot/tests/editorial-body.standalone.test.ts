import assert from "node:assert/strict";
import { test } from "node:test";
import { editorialBodyFor } from "../packages/backend/src/publication/editorial-body.ts";

const current = { visibility: "public", revision: 2, analysisRevision: 2, generated: "当前编辑稿", manual: null };
test("editorial copy follows visibility and material revisions, with current manual edits taking priority", () => {
  assert.equal(editorialBodyFor(current), "当前编辑稿");
  assert.equal(editorialBodyFor({ ...current, manual: { revision: 2, text: "人工核对后的编辑稿" } }), "人工核对后的编辑稿");
  assert.equal(editorialBodyFor({ ...current, manual: { revision: 1, text: "过期稿" } }), "当前编辑稿");
  assert.equal(editorialBodyFor({ ...current, analysisRevision: 1 }), null);
  for (const visibility of ["summary-only", "withdrawn"]) assert.equal(editorialBodyFor({ ...current, visibility, manual: { revision: 2, text: "不能泄露" } }), null);
  for (const generated of [null, {}, " ", "x".repeat(12001)]) assert.equal(editorialBodyFor({ ...current, generated }), null);
});
