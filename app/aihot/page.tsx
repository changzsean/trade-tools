import Link from "next/link";
import { ArrowUpRight, Flame, Newspaper, Search } from "lucide-react";
import { NewsState } from "@/components/aihot/news-state";
import { NewsRefresh } from "@/components/aihot/news-refresh";
import { NEWS_CATEGORIES, newsFilters, newsHref, readNews, validDaily, validHot, validPool } from "@/lib/aihot/api";
import type { DailyNews, HotNews, NewsPool, ReportCitation } from "@/lib/aihot/api";

export const dynamic = "force-dynamic";
const tabs = [["latest", "全部动态"], ["hot", "热点榜"], ["daily", "每日简报"]] as const;
const time = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }) : "";

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = newsFilters(await searchParams);
  return <div className="min-w-0 space-y-5">
    <section className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-5 sm:p-8">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-teal-800"><Newspaper className="h-4 w-4" /> MEEKA 资讯</div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI与外贸资讯</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">看懂 AI 新动态，把方法用到外贸业务里。关注行业变化，发现有依据的市场机会与新产品。</p>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span>优先官方与一手来源</span><span>案例关注流程、成本和结果</span><span>保留原文链接与发布日期</span></div>
    </section>
    <nav aria-label="资讯栏目" className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map(([view, label]) => <Link key={view} href={newsHref({ view })} aria-current={filters.view === view ? "page" : undefined} className={`shrink-0 border-b-2 px-5 py-3 text-sm font-medium ${filters.view === view ? "border-teal-700 text-teal-800" : "border-transparent text-muted hover:text-foreground"}`}>{label}</Link>)}
    </nav>
    <NewsRefresh />
    {filters.view === "latest" ? <>
      <div className="flex flex-wrap gap-2" aria-label="资讯分类">
        {[["", "全部"], ...NEWS_CATEGORIES].map(([key, label]) => <Link key={key} href={newsHref({ category: key, q: filters.q })} aria-current={filters.category === key ? "page" : undefined} className={`rounded-full border px-3 py-1.5 text-sm ${filters.category === key ? "border-teal-700 bg-teal-700 text-white" : "border-border bg-white text-slate-600 hover:border-teal-500"}`}>{label}</Link>)}
      </div>
      <form action="/aihot" className="flex min-w-0 gap-2">
        {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
        <label htmlFor="news-search" className="sr-only">搜索资讯</label>
        <input id="news-search" name="q" maxLength={200} defaultValue={filters.q} placeholder="搜索 AI 方法、市场、产品或案例" className="min-w-0 flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm" />
        <button className="flex shrink-0 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"><Search className="h-4 w-4" />搜索</button>
      </form>
      <Latest filters={filters} />
    </> : filters.view === "hot" ? <Hot /> : <Daily />}
  </div>;
}

async function Latest({ filters }: { filters: ReturnType<typeof newsFilters> }) {
  const params = new URLSearchParams({ page: String(filters.page), channel: "all" });
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  const result = await readNews<NewsPool>("/api/site/pool", validPool, params);
  if (result.state !== "ready") return <NewsState state={result.state} />;
  const data = result.data;
  if (!data.items.length) return <NewsState state="empty" emptyTitle={filters.q || filters.category ? "暂时没有符合条件的资讯" : undefined} emptyText={filters.q || filters.category ? "试试其他关键词，或查看全部动态。" : undefined} />;
  return <section aria-label="资讯列表" className="space-y-3">
    <div className="flex flex-wrap justify-between gap-2 text-xs text-muted"><span>共 {data.total} 条动态 · 按来源发布时间排序</span><span>{data.freshness ? `本站内容更新于 ${time(data.freshness)}` : ""}</span></div>
    {data.items.map(item => <article key={item.id} className="rounded-xl border border-border bg-white p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted"><span>{item.source.name}</span><span>·</span><span>{item.publishedAt ? "来源发布于 " : "收录于 "}<time dateTime={item.publishedAt || item.timelineAt}>{time(item.publishedAt || item.timelineAt)}</time></span>{item.selected ? <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-800">精选</span> : null}</div>
      <h2 className="text-lg font-semibold leading-7"><Link href={`/aihot/items/${encodeURIComponent(item.id)}`} className="hover:text-teal-700">{item.title}</Link></h2>
      {item.summary ? <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{item.summary}</p> : null}
      {item.reason ? <p className="mt-3 border-l-2 border-teal-500 pl-3 text-sm leading-6 text-teal-800">{item.reason}</p> : null}
      <Link href={`/aihot/items/${encodeURIComponent(item.id)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700">阅读与来源 <ArrowUpRight className="h-4 w-4" /></Link>
    </article>)}
    <nav aria-label="资讯分页" className="flex items-center justify-between py-3 text-sm">
      {data.page > 1 ? <Link href={newsHref({ ...filters, page: data.page - 1 })}>上一页</Link> : <span />}
      <span className="text-muted">第 {data.page} / {data.pageCount} 页</span>
      {data.page < Math.min(data.pageCount, 50) ? <Link href={newsHref({ ...filters, page: data.page + 1 })}>下一页</Link> : <span />}
    </nav>
  </section>;
}

async function Hot() {
  const result = await readNews<HotNews>("/api/site/hot", validHot);
  if (result.state !== "ready") return <NewsState state={result.state} />;
  if (!result.data.entries.length) return <NewsState state="empty" emptyTitle="暂未形成多源热点" emptyText="当多个来源共同讨论同一事件时，这里会展示热点排名。你也可以先看全部动态。" />;
  return <section className="space-y-3" aria-label="热点榜">
    <p className="text-sm text-muted">过去 {result.data.windowHours} 小时的多源热点{result.data.computedAt ? ` · ${time(result.data.computedAt)} 更新` : ""}</p>
    {result.data.entries.map(entry => <article key={entry.story.publicId} className="flex gap-4 rounded-xl border border-border bg-white p-5">
      <span className="text-2xl font-bold text-teal-700">{entry.rank}</span><div className="min-w-0">
        <h2 className="text-lg font-semibold"><Link className="hover:text-teal-700" href={`/aihot/stories/${encodeURIComponent(entry.story.publicId)}`}>{entry.story.title}</Link></h2>
        {entry.summary || entry.latest ? <p className="mt-2 text-sm leading-7 text-slate-600">{entry.summary || entry.latest}</p> : null}
        <p className="mt-3 flex items-center gap-1 text-xs text-muted"><Flame className="h-3.5 w-3.5" />{entry.sourceCount} 家来源 · {entry.sourceNames.join("、")}</p>
      </div>
    </article>)}
  </section>;
}

function Citations({ items }: { items: ReportCitation[] }) {
  return <div className="divide-y divide-border">{items.map((item, i) => <div key={`${item.itemId}-${i}`} className="py-4">
    <h3 className="font-medium">{item.available && item.itemId ? <Link href={`/aihot/items/${encodeURIComponent(item.itemId)}`} className="hover:text-teal-700">{item.title}</Link> : item.title}</h3>
    {item.summary ? <p className="mt-1 text-sm leading-7 text-slate-600">{item.summary}</p> : null}
    <p className="mt-2 text-xs text-muted">{item.sourceName}{!item.available ? " · 原资讯已撤回" : ""}</p>
  </div>)}</div>;
}

async function Daily() {
  const result = await readNews<DailyNews>("/api/site/reports/daily/latest-page", validDaily);
  if (result.state !== "ready") return <NewsState state={result.state} />;
  const report = result.data.report;
  if (!report) return <NewsState state="empty" emptyTitle="首份简报尚未发布" emptyText="简报会根据已收录和审核的资讯生成，不使用虚构内容填充。" />;
  return <article className="rounded-xl border border-border bg-white p-5 sm:p-8">
    <p className="text-xs text-muted">{report.key} · {time(report.generatedAt)} 发布</p>
    <h2 className="mt-3 text-2xl font-bold">{report.title}</h2>
    {report.overview || report.lead ? <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">{report.overview || report.lead?.leadParagraph}</p> : null}
    <Citations items={report.highlights} />
    {report.sections.map((section, i) => <section key={`${section.label}-${i}`} className="mt-6"><h3 className="border-b border-border pb-2 text-lg font-semibold">{section.label}</h3>{section.summary ? <p className="mt-3 text-sm leading-7 text-slate-600">{section.summary}</p> : null}<Citations items={section.items} /></section>)}
    {report.flashes.length ? <section className="mt-6"><h3 className="text-lg font-semibold">快讯</h3><Citations items={report.flashes} /></section> : null}
  </article>;
}
