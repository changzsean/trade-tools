// Import reviewed editorial copy through the normal version-checked, audited correction path.
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { sql, closeDb } from "@aihot/backend/db";
import { overrideFields } from "@aihot/backend/admin/content";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/import-editorial.ts site/editorial/YYYY-MM-DD.json");
const entries = z.array(z.object({ id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/), revision: z.number().int().positive(),
  text: z.string().trim().min(1).max(12000) }).strict()).parse(JSON.parse(await readFile(file, "utf8")));
try {
  for (const entry of entries) {
    const [row] = await sql<{ revision: number; version: number; body: unknown }[]>`
      SELECT a.revision, coalesce(e.version,0) AS version, e.fields->'editorialBody' AS body
      FROM publications p JOIN articles a ON a.id=p.article_id LEFT JOIN editorial_overrides e ON e.article_id=a.id
      WHERE a.id=${entry.id} AND p.visibility='public' AND p.eligible`;
    if (!row || row.revision !== entry.revision) throw new Error(`Review current publication and material first: ${entry.id}`);
    const editorialBody = { revision: entry.revision, text: entry.text };
    if (row.body && typeof row.body === "object" && "revision" in row.body && "text" in row.body
      && row.body.revision === entry.revision && row.body.text === entry.text) continue;
    await overrideFields(entry.id, { fields: { editorialBody }, reason: "站内独立编辑稿，经资料核对后发布", version: row.version }, "meeka编辑部");
    console.log(`Imported ${entry.id} (${entry.text.length} characters)`);
  }
} finally { await closeDb(); }
