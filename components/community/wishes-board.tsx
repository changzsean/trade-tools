"use client";

/**
 * 许愿池（真实 Supabase wishes 表）
 * 会员许愿 + 投票，按票数排序决定官方开发优先级。
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";

type Wish = { id: string; content: string; vote_count: number; status: string; created_at: string };

const STATUS: Record<string, { label: string; variant: "neutral" | "warning" | "success" }> = {
  open: { label: "征集中", variant: "neutral" },
  planned: { label: "已排期", variant: "warning" },
  shipped: { label: "已上线", variant: "success" },
};

export function WishesBoard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.from("wishes").select("*").order("vote_count", { ascending: false }).limit(50);
    setWishes((data as Wish[]) ?? []);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    sb.auth.getUser().then(async ({ data }) => {
      setUserId(data.user?.id ?? null);
      if (data.user) await load();
      setReady(true);
    });
  }, [load]);

  async function submit() {
    const sb = getSupabase();
    if (!sb || !userId || !content.trim()) return;
    setPosting(true);
    await sb.from("wishes").insert({ author_id: userId, content: content.trim() });
    setContent("");
    setPosting(false);
    await load();
  }

  async function vote(id: string) {
    const sb = getSupabase();
    if (!sb || !userId) return;
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, vote_count: w.vote_count + 1 } : w)));
    await sb.from("votes").upsert(
      { user_id: userId, target_type: "wish", target_id: id, value: 1 },
      { onConflict: "user_id,target_type,target_id" },
    );
  }

  if (!SUPABASE_READY || (ready && !userId)) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="text-lg font-semibold">许愿池 · 会员共创</div>
        <p className="max-w-sm text-sm text-muted">登录后，说出你最想要的 Skill / 工具 / 选题，票数高的官方优先做。</p>
        <div className="flex gap-2">
          <Link href="/login" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">登录</Link>
          <Link href="/register" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">免费注册</Link>
        </div>
      </Card>
    );
  }
  if (!ready) return <Card className="p-10 text-center text-sm text-muted">加载中…</Card>;

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="font-semibold">许个愿</h2>
        <p className="mt-1 text-sm text-muted">你最想要哪个 Skill、工具或选题？</p>
        <div className="mt-3 flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="例：希望有一个自动生成 TikTok 独立站产品描述的 Skill"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
          />
          <Button onClick={submit} disabled={posting}>{posting ? "提交中…" : "许愿"}</Button>
        </div>
      </Card>

      {wishes.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">还没有愿望，许第一个吧。</Card>
      ) : null}

      {wishes.map((w) => {
        const st = STATUS[w.status] ?? STATUS.open;
        return (
          <Card key={w.id} className="flex items-center gap-4 p-5">
            <div className="flex flex-col items-center">
              <button type="button" onClick={() => vote(w.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-slate-600 hover:bg-brand-soft hover:text-brand">
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="mt-1 text-sm font-semibold">{w.vote_count}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6">{w.content}</p>
            </div>
            <Badge variant={st.variant}>{st.label}</Badge>
          </Card>
        );
      })}
    </div>
  );
}
