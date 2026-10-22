export type InspectedProduct = {
  sourceUrl: string;
  canonicalUrl: string;
  title: string;
  description: string;
  images: string[];
  price?: string;
  currency?: string;
  keywords: string[];
  fetchedAt: string;
};

const MAX_HTML_BYTES = 2_000_000;
const MAX_IMAGES = 20;

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function clean(value: string | undefined): string {
  return decodeEntities((value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();
}

function meta(html: string, key: string): string | undefined {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1] ?? match?.[2];
}

function linkHref(html: string, rel: string): string | undefined {
  const match = html.match(new RegExp(`<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`, "i"));
  return match?.[1];
}

function absoluteUrl(value: string | undefined, base: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, base);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function jsonLdValues(html: string): Array<Record<string, unknown>> {
  const values: Array<Record<string, unknown>> = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (item && typeof item === "object") values.push(item as Record<string, unknown>);
      }
    } catch {
      // Some stores embed invalid JSON-LD; regular meta tags remain usable.
    }
  }
  return values;
}

function jsonLdProduct(values: Array<Record<string, unknown>>): Record<string, unknown> | undefined {
  return values.find((item) => {
    const type = item["@type"];
    return type === "Product" || (Array.isArray(type) && type.includes("Product"));
  });
}

function asImages(value: unknown, base: string): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => {
    const raw = typeof item === "string" ? item : item && typeof item === "object" && "url" in item ? item.url : undefined;
    const url = absoluteUrl(typeof raw === "string" ? raw : undefined, base);
    return url ? [url] : [];
  });
}

export function inspectHtml(html: string, sourceUrl: string): InspectedProduct {
  const ld = jsonLdProduct(jsonLdValues(html));
  const offers = ld?.offers && typeof ld.offers === "object" ? (ld.offers as Record<string, unknown>) : undefined;
  const images = [
    ...asImages(meta(html, "og:image"), sourceUrl),
    ...asImages(meta(html, "twitter:image"), sourceUrl),
    ...asImages(ld?.image, sourceUrl),
  ];
  const title = clean(meta(html, "og:title") ?? (typeof ld?.name === "string" ? ld.name : undefined) ?? html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const description = clean(meta(html, "og:description") ?? (typeof ld?.description === "string" ? ld.description : undefined) ?? meta(html, "description"));
  const keywordText = meta(html, "keywords") ?? "";
  const keywords = keywordText.split(/[,，、|]/).map(clean).filter(Boolean).slice(0, 3);

  return {
    sourceUrl,
    canonicalUrl: absoluteUrl(linkHref(html, "canonical"), sourceUrl) ?? sourceUrl,
    title: title.slice(0, 128),
    description: description.slice(0, 60000),
    images: [...new Set(images)].slice(0, MAX_IMAGES),
    price: typeof offers?.price === "number" || typeof offers?.price === "string" ? String(offers.price) : meta(html, "product:price:amount"),
    currency: typeof offers?.priceCurrency === "string" ? offers.priceCurrency : meta(html, "product:price:currency"),
    keywords,
    fetchedAt: new Date().toISOString(),
  };
}

function assertPublicUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("请输入完整的 http:// 或 https:// 商品链接");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("仅支持 http/https 商品链接");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "::1") {
    throw new Error("不允许读取本机或内网地址");
  }
  if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname)) {
    throw new Error("不允许读取内网地址");
  }
  return url;
}

export async function inspectProductUrl(input: string): Promise<InspectedProduct> {
  let url = assertPublicUrl(input);
  let response: Response | undefined;
  for (let i = 0; i < 4; i += 1) {
    response = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "MEEKA-Product-Importer/0.1 (+https://meeka.com.cn)" },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (response.status < 300 || response.status >= 400) break;
    const location = response.headers.get("location");
    if (!location) break;
    url = assertPublicUrl(new URL(location, url).toString());
  }
  if (!response) throw new Error("无法读取商品页面");
  if (!response.ok) throw new Error(`商品页面返回 HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) throw new Error("链接不是可读取的商品网页");
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_HTML_BYTES) throw new Error("商品页面过大，暂不支持读取");
  const html = await response.text();
  if (new TextEncoder().encode(html).byteLength > MAX_HTML_BYTES) throw new Error("商品页面过大，暂不支持读取");
  return inspectHtml(html, url.toString());
}
