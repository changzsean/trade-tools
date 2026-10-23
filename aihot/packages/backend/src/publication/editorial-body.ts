// Editorial copy is independently written, never a licence to republish the source's full text.
export interface EditorialBodyInput {
  visibility: string;
  revision: number;
  analysisRevision: number | null;
  manual: unknown;
  generated: unknown;
}

function bodyText(value: unknown): string | null {
  return typeof value === "string" && value.trim() && value.length <= 12000 ? value.trim() : null;
}

export function editorialBodyFor(input: EditorialBodyInput): string | null {
  if (input.visibility !== "public") return null;
  const manual = input.manual;
  if (manual && typeof manual === "object" && "revision" in manual && "text" in manual && manual.revision === input.revision) {
    const text = bodyText(manual.text);
    if (text) return text;
  }
  return input.analysisRevision === input.revision ? bodyText(input.generated) : null;
}
