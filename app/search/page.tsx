import Link from "next/link";
import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedResources, getCommunityFeed, getQuestions } from "@/lib/data/trademind";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const keyword = q.trim().toLowerCase();

  const [resources, posts, questions] = await Promise.all([
    getFeaturedResources(),
    getCommunityFeed(),
    getQuestions(),
  ]);

  const hit = (text: string) => keyword !== "" && text.toLowerCase().includes(keyword);

  const resHits = resources.filter(
    (r) => hit(r.title) || hit(r.description) || r.tags.some(hit) || r.useCases.some(hit),
  );
  const postHits = posts.filter((p) => hit(p.title) || hit(p.body) || p.tags.some(hit));
  const qHits = questions.filter((qq) => hit(qq.title) || qq.tags.some(hit));
  const total = resHits.length + postHits.length + qHits.length;

  return (
    <AppShell>
      <div className="space-y-5">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold tracking-tight">搜索结果</h1>
          <p className="mt-2 text-sm text-muted">
            {keyword ? (
              <>
                关键词「<span className="font-medium text-foreground">{q}</span>」共找到 {total} 条结果
              </>
            ) : (
              "在顶部搜索框输入问题、资源、供应链或人名。"
            )}
          </p>
        </Card>

        {keyword && total === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/meeka/meeka-empty.png" alt="Meeka" className="h-32 w-auto object-contain" />
            <p className="text-sm text-muted">没有找到匹配内容，换个关键词，或到资源市场逛逛。</p>
            <Link href="/resources" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
              去资源市场
            </Link>
          </Card>
        ) : null}

        {resHits.length > 0 ? (
          <Section title={`资源 · ${resHits.length}`}>
            {resHits.map((r) => (
              <Link key={r.id} href={`/resources/${r.slug}`} className="block">
                <Card className="p-4 transition-colors hover:border-border-strong">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{r.type}</Badge>
                    <span className="font-medium">{r.title}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">{r.description}</p>
                </Card>
              </Link>
            ))}
          </Section>
        ) : null}

        {qHits.length > 0 ? (
          <Section title={`问答 · ${qHits.length}`}>
            {qHits.map((qq) => (
              <Link key={qq.id} href="/community/questions" className="block">
                <Card className="p-4 transition-colors hover:border-border-strong">
                  <span className="font-medium">{qq.title}</span>
                  <p className="mt-1 text-xs text-muted">
                    {qq.answers} 个回答 · {qq.views} 浏览 · {qq.updatedAt}
                  </p>
                </Card>
              </Link>
            ))}
          </Section>
        ) : null}

        {postHits.length > 0 ? (
          <Section title={`社区内容 · ${postHits.length}`}>
            {postHits.map((p) => (
              <Link key={p.id} href="/community/feed" className="block">
                <Card className="p-4 transition-colors hover:border-border-strong">
                  <span className="font-medium">{p.title}</span>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">{p.body}</p>
                </Card>
              </Link>
            ))}
          </Section>
        ) : null}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
