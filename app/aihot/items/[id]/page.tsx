import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { NewsState } from "@/components/aihot/news-state";
import { readNews, safeSourceUrl, validDetail } from "@/lib/aihot/api";
import type { NewsDetail } from "@/lib/aihot/api";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) notFound();
  const result = await readNews<NewsDetail>(`/api/site/items/${id}`, validDetail);
  if (result.state === "not-found") notFound();
  if (result.state !== "ready") return <NewsState state={result.state} />;
  const item = result.data;
  const source = safeSourceUrl(item.links.original);
  const date = item.publishedAt || item.timelineAt;
  return <article className="rounded-xl border border-border bg-white p-5 sm:p-8">
    <Link href="/aihot" className="inline-flex items-center gap-2 text-sm text-teal-700"><ArrowLeft className="h-4 w-4" />返回资讯</Link>
    <div className="mt-7 text-sm text-muted">{item.source.name}{date && Number.isFinite(Date.parse(date)) ? ` · ${new Date(date).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}` : ""}</div>
    <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{item.title}</h1>
    {item.originalTitle && item.originalTitle !== item.title ? <p className="mt-3 text-sm text-muted">{item.originalTitle}</p> : null}
    {item.summary ? <p className="mt-7 whitespace-pre-line text-base leading-9 text-slate-700">{item.summary}</p> : <p className="mt-7 text-sm text-muted">此条资讯暂未提供摘要，可前往来源阅读全文。</p>}
    {item.reason ? <div className="mt-6 rounded-lg bg-teal-50 p-4 text-sm leading-7 text-teal-900">{item.reason}</div> : null}
    {source ? <a href={source} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-medium text-white">查看原文<ArrowUpRight className="h-4 w-4" /></a> : null}
    <p className="mt-4 text-xs leading-6 text-muted">摘要供信息参考，完整内容及后续更正以原始来源为准。</p>
  </article>;
}
