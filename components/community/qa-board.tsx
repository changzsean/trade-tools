"use client";

/**
 * 答疑专区（真实 Supabase）
 * - 登录后：读 questions_with_author、提问入库、回答入库、赞同写 votes
 * - 未登录：会员墙
 * - 后端未配置：种子数据只读
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";
import type { Question } from "@/types/community";

type DBQuestion = {
  id: string;
  title: string;
  body: string;
  tags: string[] | null;
  vote_count: number;
  answer_count: number;
  is_solved: boolean;
  created_at: string;
  display_name: string | null;
};

export function QaBoard({ seed = [] }: { seed?: Question[] }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState<DBQuestion[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("questions_with_author")
      .select("id,title,body,tags,vote_count,answer_count,is_solved,created_at,display_name")
      .order("created_at", { ascending: false })
      .limit(30);
    setQuestions((data as DBQuestion[]) ?? []);
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

  async function ask() {
    setMsg(null);
    const sb = getSupabase();
    if (!sb || !userId) return;
    if (!title.trim() || !body.trim()) {
      setMsg("请填写标题和详细描述。");
      return;
    }
    setPosting(true);
    const { error } = await sb.from("questions").insert({
      author_id: userId,
      title: title.trim(),
      body: body.trim(),
      tags: [],
    });
    setPosting(false);
    if (error) {
      setMsg("发布失败：" + error.message);
      return;
    }
    setTitle("");
    setBody("");
    await load();
  }

  async function upvote(id: string) {
    const sb = getSupabase();
    if (!sb || !userId) return;
    setQuestions((prev) => prev?.map((q) => (q.id === id ? { ...q, vote_count: q.vote_count + 1 } : q)) ?? prev);
    await sb.from("votes").upsert(
      { user_id: userId, target_type: "question", target_id: id, value: 1 },
      { onConflict: "user_id,target_type,target_id" },
    );
  }

  if (!SUPABASE_READY) {
    return <SeedQa seed={seed} />;
  }
  if (!ready) return <Card className="p-10 text-center text-sm text-muted">加载中…</Card>;

  if (!userId) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/meeka/meeka-thinking.png" alt="Meeka" className="h-28 w-auto object-contain" />
        <div className="text-lg font-semibold">答疑仅会员可见</div>
        <p className="max-w-sm text-sm text-muted">P4P 烧钱没询盘？客户已读不回？登录后在这里提问，有人答。</p>
        <div className="flex gap-2">
          <Link href="/login" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">登录</Link>
          <Link href="/register" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">免费注册</Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="font-semibold">提一个问题</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题：一句话说清你的问题"
          className="mt-3 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="详细描述：你的处境、已经尝试过什么、期望什么帮助……"
          className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-brand"
        />
        {msg ? <div className="mt-2 text-sm text-red-600">{msg}</div> : null}
        <Button className="mt-3" onClick={ask} disabled={posting}>{posting ? "发布中…" : "发布问题"}</Button>
      </Card>

      {questions && questions.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">还没有问题，提第一个吧。</Card>
      ) : null}

      {(questions ?? []).map((q) => (
        <Card key={q.id} className="flex gap-4 p-5">
          <div className="flex flex-col items-center">
            <button type="button" onClick={() => upvote(q.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-slate-600 hover:bg-brand-soft hover:text-brand">
              <ChevronUp className="h-4 w-4" />
            </button>
            <span className="mt-1 text-sm font-semibold">{q.vote_count}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {q.is_solved ? <Badge variant="success">已解决</Badge> : <Badge variant="warning">待回答</Badge>}
              <span className="text-xs text-muted">{q.display_name ?? "会员"} · {timeAgo(q.created_at)}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold leading-6">{q.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{q.body}</p>
            <div className="mt-2 text-xs text-muted">{q.answer_count} 个回答</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SeedQa({ seed }: { seed: Question[] }) {
  return (
    <div className="space-y-3">
      {seed.map((q) => (
        <Card key={q.id} className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            {q.accepted ? <Badge variant="success">已解决</Badge> : <Badge variant="warning">待回答</Badge>}
            <span className="text-xs text-muted">{q.updatedAt}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold">{q.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {q.tags.map((t) => <Badge key={t} variant="neutral"># {t}</Badge>)}
          </div>
          <div className="mt-2 text-xs text-muted">{q.answers} 个回答 · {q.views} 浏览</div>
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
  return new Date(ts).toLocaleDateString("zh-CN");
}
