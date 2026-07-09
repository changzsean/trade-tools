"use client";

/**
 * 资源对接（真实 Supabase listings 表）
 * 会员发布采购/供应/服务需求，社区可见。
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";

type Listing = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  contact: string | null;
  created_at: string;
};

const KIND: Record<string, string> = {
  source: "找货源",
  supplier: "找供应商",
  agent: "找服务商",
  buyer: "找买家",
  hire: "招募合作",
};

export function ListingsBoard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [kind, setKind] = useState("source");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [contact, setContact] = useState("");
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.from("listings").select("*").order("created_at", { ascending: false }).limit(50);
    setListings((data as Listing[]) ?? []);
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
    if (!sb || !userId || !title.trim()) return;
    setPosting(true);
    await sb.from("listings").insert({
      author_id: userId,
      kind,
      title: title.trim(),
      body: body.trim() || null,
      contact: contact.trim() || null,
    });
    setTitle("");
    setBody("");
    setContact("");
    setPosting(false);
    setShowForm(false);
    await load();
  }

  if (!SUPABASE_READY || (ready && !userId)) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="text-lg font-semibold">资源对接 · 会员可见</div>
        <p className="max-w-sm text-sm text-muted">登录后发布找货源、找供应商、找物流等真实业务需求，社区帮你匹配。</p>
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
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">发布对接需求</h2>
          <Button variant={showForm ? "secondary" : "default"} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "收起" : "＋ 发布需求"}
          </Button>
        </div>
        {showForm ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(KIND).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    kind === k ? "border-brand bg-brand-soft text-brand" : "border-border text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题：例 找新能源配件供应商，小批量打样"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="详细需求：产品/规格/数量/交期/预算/市场……"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-brand" />
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="联系方式（微信/邮箱，可选）"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
            <Button onClick={submit} disabled={posting}>{posting ? "发布中…" : "发布"}</Button>
          </div>
        ) : null}
      </Card>

      {listings.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">还没有对接需求，发布第一个吧。</Card>
      ) : null}

      {listings.map((l) => (
        <Card key={l.id} className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{KIND[l.kind] ?? l.kind}</Badge>
            <span className="text-xs text-muted">{new Date(l.created_at).toLocaleDateString("zh-CN")}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold">{l.title}</h3>
          {l.body ? <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{l.body}</p> : null}
          {l.contact ? <p className="mt-2 text-xs text-brand">联系方式：{l.contact}</p> : null}
        </Card>
      ))}
    </div>
  );
}
