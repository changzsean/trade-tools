"use client";

/**
 * 社区广场（真实 Supabase）
 * - 登录后：读 posts_with_author 视图、发帖入库、点赞写 votes
 * - 未登录：显示会员墙引导登录
 * - 后端未配置：降级展示种子数据（seed），保证界面不空
 */

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";
import type { CommunityPost } from "@/types/community";

type DBPost = {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[] | null;
  vote_count: number;
  created_at: string;
  display_name: string | null;
  username: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  article: "文章",
  tip: "实战技巧",
  skill_share: "Skill 分享",
  tool_rec: "工具推荐",
  intro: "自我介绍",
};

export function CommunityBoard({ seed = [] }: { seed?: CommunityPost[] }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [posts, setPosts] = useState<DBPost[] | null>(null);

  // composer
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("article");
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("posts_with_author")
      .select("id,title,content,type,tags,vote_count,created_at,display_name,username")
      .order("created_at", { ascending: false })
      .limit(30);
    setPosts((data as DBPost[]) ?? []);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getUser().then(async ({ data }) => {
      setUserId(data.user?.id ?? null);
      if (data.user) await load();
      setReady(true);
    });
  }, [load]);

  async function publish() {
    setMsg(null);
    const sb = getSupabase();
    if (!sb || !userId) return;
    if (!title.trim() || !content.trim()) {
      setMsg("请填写标题和内容。");
      return;
    }
    setPosting(true);
    const { error } = await sb.from("posts").insert({
      author_id: userId,
      title: title.trim(),
      content: content.trim(),
      type,
      tags: [],
    });
    setPosting(false);
    if (error) {
      setMsg("发布失败：" + error.message);
      return;
    }
    setTitle("");
    setContent("");
    await load();
  }

  async function like(postId: string) {
    const sb = getSupabase();
    if (!sb || !userId) return;
    // 乐观 +1
    setPosts((prev) => prev?.map((p) => (p.id === postId ? { ...p, vote_count: p.vote_count + 1 } : p)) ?? prev);
    await sb.from("votes").upsert(
      { user_id: userId, target_type: "post", target_id: postId, value: 1 },
      { onConflict: "user_id,target_type,target_id" },
    );
  }

  // 后端未配置 → 种子数据只读
  if (!SUPABASE_READY) {
    return <SeedFeed seed={seed} />;
  }

  if (!ready) {
    return <Card className="p-10 text-center text-sm text-muted">加载中…</Card>;
  }

  // 未登录 → 会员墙
  if (!userId) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/meeka/meeka-cheer.png" alt="Meeka" className="h-28 w-auto object-contain" />
        <div className="text-lg font-semibold">社区内容会员可见</div>
        <p className="max-w-sm text-sm text-muted">注册免费，登录后即可查看经验分享、发帖、点赞和参与讨论。</p>
        <div className="flex gap-2">
          <Link href="/login" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">登录</Link>
          <Link href="/register" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">免费注册</Link>
        </div>
      </Card>
    );
  }

  // 已登录 → 发帖框 + 真实信息流
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {Object.entries(TYPE_LABEL).filter(([k]) => k !== "intro").map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setType(k)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                type === k ? "border-brand bg-brand-soft text-brand" : "border-border text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题：一句话说清你要分享什么"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="写下你的实战经验、方法或思考……"
          className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-brand"
        />
        {msg ? <div className="mt-2 text-sm text-red-600">{msg}</div> : null}
        <Button className="mt-3" onClick={publish} disabled={posting}>
          {posting ? "发布中…" : "发布"}
        </Button>
      </Card>

      {posts && posts.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          还没有内容，成为第一个分享经验的人。
        </Card>
      ) : null}

      {(posts ?? []).map((p) => (
        <Card key={p.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {(p.display_name ?? "会员")[0]}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.display_name ?? "会员"}</span>
                  <Badge variant="neutral">{TYPE_LABEL[p.type] ?? p.type}</Badge>
                  <span className="text-xs text-muted">{timeAgo(p.created_at)}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-6">{p.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{p.content}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="更多"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
          <div className="mt-4 flex gap-5 text-sm text-muted">
            <button type="button" onClick={() => like(p.id)} className="inline-flex items-center gap-1 hover:text-brand">
              <Heart className="h-4 w-4" /> {p.vote_count}
            </button>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> 评论</span>
            <span className="inline-flex items-center gap-1"><Share2 className="h-4 w-4" /> 分享</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SeedFeed({ seed }: { seed: CommunityPost[] }) {
  return (
    <div className="space-y-4">
      {seed.map((post) => (
        <Card key={post.id} className="p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
              {post.authorInitials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{post.authorName}</span>
                <Badge variant="neutral">{post.authorTitle}</Badge>
                <span className="text-xs text-muted">{post.createdAt}</span>
              </div>
              <h3 className="mt-3 text-base font-semibold leading-6">{post.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{post.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((t) => <Badge key={t} variant="neutral"># {t}</Badge>)}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000;
  if (s < 60) return "刚刚";
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`;
  if (s < 604800) return `${Math.floor(s / 86400)} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}
