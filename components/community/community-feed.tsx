import Link from "next/link";
import { Factory, Handshake, MessageCircle, MoreHorizontal, PackageSearch, Share2, ThumbsUp, Truck } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CommunityPost } from "@/types/community";

const matchingItems = [
  { icon: PackageSearch, title: "找货源", desc: "发布采购需求，匹配供货方", href: "/community/resource-matching" },
  { icon: Factory, title: "找供应商", desc: "工厂、档口、代工伙伴", href: "/community/resource-matching" },
  { icon: Truck, title: "找物流仓配", desc: "货代、海外仓、清关资源", href: "/community/resource-matching" },
  { icon: Handshake, title: "求合作", desc: "联名开发、拼单、渠道互换", href: "/community/resource-matching" },
];

export function CommunityFeed({ posts }: { posts: CommunityPost[] }) {
  return (
    <section>
      <SectionHeading title="社区互动" description="动态、问答、组队和资源对接放在同一个协作场景里" href="/community/feed" />
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {matchingItems.map((item) => (
          <Link key={item.title} href={item.href} className="block">
            <Card className="min-h-[108px] p-4 transition-colors hover:border-border-strong">
              <div className="flex h-full items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-slate-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="whitespace-nowrap text-base font-semibold leading-6 text-foreground">{item.title}</div>
                  <div className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{item.desc}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">S</div>
          <Link
            href="/community/feed"
            className="min-h-10 flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:border-border-strong"
          >
            分享经验、提出问题，或发布资源对接需求...
          </Link>
          <Button asChild className="sm:w-auto">
            <Link href="/community/feed">发布</Link>
          </Button>
        </div>
      </Card>
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                  {post.authorInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{post.authorName}</span>
                    <Badge variant="neutral">{post.authorTitle}</Badge>
                    <span className="text-xs text-muted">{post.createdAt}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{post.body}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="更多操作">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="neutral">
                  # {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex gap-5 text-sm text-muted">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {post.likes}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                评论 {post.comments}
              </span>
              <span className="inline-flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                分享
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
