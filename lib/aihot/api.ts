// Only public AIHOT publication endpoints are read here. This module never invokes a model.
export const NEWS_CATEGORIES = [
  ["ai-models", "AI动态"], ["tip", "AI方法"], ["ai-trade", "AI+外贸案例"],
  ["industry", "外贸动态"], ["opportunity", "市场机会"], ["ai-products", "新产品"],
] as const;

export type NewsView = "latest" | "hot" | "daily";
export interface NewsItem {
  id: string; title: string; summary: string | null; reason: string | null;
  source: { name: string }; publishedAt: string | null; timelineAt: string;
  category: string | null; selected: boolean; tags: string[];
}
export interface NewsPool { items: NewsItem[]; total: number; page: number; pageCount: number; freshness: string }
export interface NewsDetail extends NewsItem { links: { original: string }; originalTitle: string | null; author?: string | null; editorialBody?: string | null }
export interface HotNews {
  computedAt: string | null; windowHours: number;
  entries: Array<{ rank: number; story: { publicId: string; title: string }; sourceCount: number; sourceNames: string[]; summary: string | null; latest: string | null }>;
}
export interface StoryNews {
  title: string; summary: string | null; digest: string | null; latest: string | null;
  sourceCount: number; reportCount: number;
  timeline: Array<{ id: string; title: string; source: { name: string }; publishedAt: string; summary: string | null }>;
}
export interface ReportCitation { itemId: string | null; title: string; summary: string | null; sourceName: string; sourceUrl: string; available: boolean }
export interface DailyNews {
  report: null | { title: string; key: string; generatedAt: string; overview: string | null;
    lead: { title: string; leadParagraph: string } | null; highlights: ReportCitation[];
    sections: Array<{ label: string; summary: string | null; items: ReportCitation[] }>; flashes: ReportCitation[] };
}
export type NewsResult<T> = { state: "ready"; data: T } | { state: "not-configured" | "unavailable" | "not-found" };

export function newsFilters(query: Record<string, string | string[] | undefined>) {
  const one = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const view: NewsView = one("view") === "hot" ? "hot" : one("view") === "daily" ? "daily" : "latest";
  const category = NEWS_CATEGORIES.some(([key]) => key === one("category")) ? one("category") : "";
  const page = Math.min(50, Math.max(1, Number.parseInt(one("page"), 10) || 1));
  return { view, category, page, q: one("q").trim().slice(0, 200) };
}

export function newsHref(query: { view?: NewsView; category?: string; page?: number; q?: string }) {
  const params = new URLSearchParams();
  if (query.view && query.view !== "latest") params.set("view", query.view);
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return `/aihot${params.size ? `?${params}` : ""}`;
}

export function safeSourceUrl(value: string): string | null {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}

type Endpoint = "/api/site/pool" | "/api/site/hot" | "/api/site/reports/daily/latest-page" | `/api/site/items/${string}` | `/api/site/stories/${string}`;

export async function readNews<T>(endpoint: Endpoint, validate: (value: unknown) => boolean, params?: URLSearchParams): Promise<NewsResult<T>> {
  const base = process.env.AIHOT_API_BASE_URL;
  if (!base) return { state: "not-configured" };
  try {
    const origin = new URL(base);
    if (!safeSourceUrl(base) || origin.search || origin.hash || origin.pathname !== "/") return { state: "unavailable" };
    if (process.env.NODE_ENV === "production" && origin.protocol !== "https:") return { state: "unavailable" };
    const url = new URL(endpoint, origin);
    if (params) url.search = params.toString();
    const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000), headers: { accept: "application/json" } });
    if (response.status === 404) return { state: "not-found" };
    if (!response.ok) return { state: "unavailable" };
    const data: unknown = await response.json();
    return validate(data) ? { state: "ready", data: data as T } : { state: "unavailable" };
  } catch { return { state: "unavailable" }; }
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown) => value === null || typeof value === "string";
const source = (value: unknown) => record(value) && typeof value.name === "string";
const reportItem = (value: unknown) => record(value) && typeof value.id === "string" && typeof value.title === "string" && source(value.source) && text(value.summary);
const item = (value: unknown) => reportItem(value) && record(value) && text(value.reason) && text(value.publishedAt) && typeof value.timelineAt === "string" && typeof value.selected === "boolean";
const citation = (value: unknown) => record(value) && typeof value.title === "string" && text(value.itemId) && text(value.summary) && typeof value.sourceName === "string" && typeof value.available === "boolean";
export const validPool = (value: unknown) => record(value) && Array.isArray(value.items) && value.items.every(item) && typeof value.freshness === "string" && [value.total, value.page, value.pageCount].every(n => typeof n === "number" && Number.isFinite(n));
export const validHot = (value: unknown) => record(value) && text(value.computedAt) && typeof value.windowHours === "number" && Array.isArray(value.entries) && value.entries.every(entry => record(entry) && typeof entry.rank === "number" && typeof entry.sourceCount === "number" && text(entry.summary) && text(entry.latest) && record(entry.story) && typeof entry.story.publicId === "string" && typeof entry.story.title === "string" && Array.isArray(entry.sourceNames) && entry.sourceNames.every(name => typeof name === "string"));
export const validDetail = (value: unknown) => item(value) && record(value) && text(value.originalTitle) && record(value.links) && typeof value.links.original === "string" && (value.author === undefined || text(value.author)) && (value.editorialBody === undefined || value.editorialBody === null || (typeof value.editorialBody === "string" && value.editorialBody.length <= 12000));
export const validStory = (value: unknown) => record(value) && typeof value.title === "string" && text(value.summary) && text(value.digest) && text(value.latest) && typeof value.sourceCount === "number" && typeof value.reportCount === "number" && Array.isArray(value.timeline) && value.timeline.every(reportItem);
export const validDaily = (value: unknown) => record(value) && (value.report === null || (record(value.report) && typeof value.report.title === "string" && typeof value.report.key === "string" && typeof value.report.generatedAt === "string" && text(value.report.overview) && (value.report.lead === null || (record(value.report.lead) && typeof value.report.lead.leadParagraph === "string")) && Array.isArray(value.report.sections) && value.report.sections.every(section => record(section) && typeof section.label === "string" && text(section.summary) && Array.isArray(section.items) && section.items.every(citation)) && Array.isArray(value.report.highlights) && value.report.highlights.every(citation) && Array.isArray(value.report.flashes) && value.report.flashes.every(citation)));
