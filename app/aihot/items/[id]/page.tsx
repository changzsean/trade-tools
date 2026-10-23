import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NewsState } from "@/components/aihot/news-state";
import { readNews, safeSourceUrl, validDetail } from "@/lib/aihot/api";
import type { NewsDetail } from "@/lib/aihot/api";
import { editorialBlocks } from "@/lib/aihot/editorial";

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
  const blocks = item.editorialBody ? editorialBlocks(item.editorialBody) : [];
  return <article className="rounded-xl border border-border bg-white p-5 sm:p-8">
    <Link href="/aihot" className="inline-flex items-center gap-2 text-sm text-teal-700"><ArrowLeft className="h-4 w-4" />返回资讯</Link>
    <div className="mt-7 text-sm text-muted">作者：meeka编辑部 · 编辑整理{date && Number.isFinite(Date.parse(date)) ? ` · 来源发布于 ${new Date(date).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}` : ""}</div>
    <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{item.title}</h1>
    <div className="mt-8 max-w-3xl space-y-6 text-base leading-9 text-slate-700">
      {blocks.length ? blocks.map((block, index) => block.kind === "heading"
        ? <h2 key={index} className="pt-3 text-xl font-semibold text-slate-900">{block.text}</h2>
        : block.kind === "list"
          ? <ul key={index} className="list-disc space-y-2 pl-6">{block.items!.map((line, n) => <li key={n}>{line}</li>)}</ul>
          : <p key={index} className="whitespace-pre-line">{block.text}</p>)
        : <><p className="whitespace-pre-line">{item.summary}</p><p className="text-sm text-muted">编辑稿正在整理中，当前已核实的信息如上。</p></>}
    </div>
    <footer className="mt-10 border-t border-border pt-5 text-sm leading-7 text-muted">
      <p>作者：meeka编辑部</p>
      <p>信息来源：{source ? <a href={source} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline underline-offset-4">{item.source.name}</a> : item.source.name}{item.author ? ` · 原文作者：${item.author}` : ""}</p>
      {item.originalTitle && item.originalTitle !== item.title ? <p className="mt-1 break-words text-xs">原始标题：{item.originalTitle}</p> : null}
      <p className="mt-2 text-xs">编辑部依据所列来源整理事实；“编辑部观察”和“实践建议”为本站分析。</p>
    </footer>
  </article>;
}
