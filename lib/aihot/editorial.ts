export type EditorialBlock = { kind: "heading" | "paragraph" | "list"; text: string; items?: string[] };

/** Only paragraph structure is interpreted. HTML and Markdown links remain inert text. */
export function editorialBlocks(body: string): EditorialBlock[] {
  return body.trim().split(/\n\s*\n/).filter(Boolean).map(part => {
    const text = part.trim();
    if (/^#{2,3}\s+[^\n]+$/.test(text)) return { kind: "heading", text: text.replace(/^#{2,3}\s+/, "") };
    const lines = text.split("\n");
    if (lines.every(line => /^-\s+/.test(line))) return { kind: "list", text: "", items: lines.map(line => line.replace(/^-\s+/, "")) };
    return { kind: "paragraph", text };
  });
}
