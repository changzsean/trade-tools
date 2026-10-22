import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsState } from "@/components/aihot/news-state";
import { readNews, validStory } from "@/lib/aihot/api";
import type { StoryNews } from "@/lib/aihot/api";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) notFound();
  const result = await readNews<StoryNews>(`/api/site/stories/${id}`, validStory);
  if (result.state === "not-found") notFound();
  if (result.state !== "ready") return <NewsState state={result.state} />;
  const story = result.data;
  return <article className="rounded-xl border border-border bg-white p-5 sm:p-8">
    <Link href="/aihot?view=hot" className="text-sm text-teal-700">← 返回热点榜</Link>
    <h1 className="mt-6 text-2xl font-bold sm:text-3xl">{story.title}</h1>
    <p className="mt-3 text-sm text-muted">{story.sourceCount} 家来源 · {story.reportCount} 条报道</p>
    {story.digest || story.summary ? <p className="mt-6 whitespace-pre-line text-base leading-9 text-slate-700">{story.digest || story.summary}</p> : null}
    {story.latest ? <p className="mt-5 border-l-2 border-teal-500 pl-4 text-sm leading-7 text-teal-800">最新进展：{story.latest}</p> : null}
    <h2 className="mt-8 border-b border-border pb-3 text-lg font-semibold">相关报道</h2>
    <div className="divide-y divide-border">{story.timeline.map(item => <div key={item.id} className="py-5"><p className="text-xs text-muted">{item.source.name}</p><h3 className="mt-2 font-medium"><Link href={`/aihot/items/${encodeURIComponent(item.id)}`} className="hover:text-teal-700">{item.title}</Link></h3>{item.summary ? <p className="mt-2 text-sm leading-7 text-slate-600">{item.summary}</p> : null}</div>)}</div>
  </article>;
}
