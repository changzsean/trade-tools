const ALIBABA_STORE_HOSTS = [".en.alibaba.com", ".fm.alibaba.com", ".trustpass.alibaba.com"];
const ALIBABA_DETAIL_HOSTS = ["www.alibaba.com", ...ALIBABA_STORE_HOSTS];

export type BatchItemInput = {
  sourceProductId?: unknown;
  sourceUrl?: unknown;
  sourceTitle?: unknown;
  sourceImageUrl?: unknown;
  rawPayload?: unknown;
};

export type NormalizedBatchItem = {
  source_product_id: string;
  source_url: string;
  source_title: string | null;
  source_image_url: string | null;
  raw_payload: Record<string, unknown>;
};

export function isAlibabaStoreUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALIBABA_STORE_HOSTS.some((suffix) => url.hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

function isAlibabaDetailUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALIBABA_DETAIL_HOSTS.some((host) => host.startsWith(".") ? url.hostname.endsWith(host) : url.hostname === host);
  } catch {
    return false;
  }
}

function textValue(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function normalizeBatchItems(items: unknown): NormalizedBatchItem[] {
  if (!Array.isArray(items)) return [];

  const deduped = new Map<string, NormalizedBatchItem>();
  for (const candidate of items.slice(0, 1000)) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const item = candidate as BatchItemInput;
    const sourceProductId = textValue(item.sourceProductId, 128);
    const sourceUrl = textValue(item.sourceUrl, 2048);
    if (!sourceProductId || !sourceUrl || !isAlibabaDetailUrl(sourceUrl)) continue;

    const normalizedUrl = new URL(sourceUrl);
    normalizedUrl.hash = "";
    const normalized: NormalizedBatchItem = {
      source_product_id: sourceProductId,
      source_url: normalizedUrl.toString(),
      source_title: textValue(item.sourceTitle, 500),
      source_image_url: textValue(item.sourceImageUrl, 2048),
      raw_payload: recordValue(item.rawPayload),
    };
    deduped.set(sourceProductId, normalized);
  }
  return [...deduped.values()];
}

export function corsHeaders(): HeadersInit {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Authorization, Content-Type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-max-age": "86400",
  };
}

export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
