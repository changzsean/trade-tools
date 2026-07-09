"use client";

/**
 * 自我介绍模板发布框（接 Supabase posts, type='intro'）
 * 固定四段模板，降低新人写作门槛。未登录引导登录，未配置后端降级提示。
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";

export function SayHelloComposer() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");
  const [offer, setOffer] = useState("");
  const [seeking, setSeeking] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setAuthed(false);
      return;
    }
    sb.auth.getUser().then(({ data }) => setAuthed(Boolean(data.user)));
  }, []);

  async function submit() {
    setMsg(null);
    const sb = getSupabase();
    if (!SUPABASE_READY || !sb) {
      setMsg({ type: "err", text: "后端尚未配置。" });
      return;
    }
    if (!product.trim() || !market.trim()) {
      setMsg({ type: "err", text: "至少填写主营产品和主打市场。" });
      return;
    }
    const { data: userData } = await sb.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    const title = `自我介绍 · ${market.trim()} · ${product.trim()}`.slice(0, 60);
    const content = [
      `主营产品：${product.trim()}`,
      `主打市场：${market.trim()}`,
      offer.trim() ? `我能提供：${offer.trim()}` : "",
      seeking.trim() ? `正在寻找：${seeking.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setLoading(true);
    const { error } = await sb.from("posts").insert({
      author_id: userData.user.id,
      title,
      content,
      type: "intro",
      tags: ["自我介绍"],
    });
    setLoading(false);

    if (error) {
      setMsg({ type: "err", text: `发布失败：${error.message}` });
      return;
    }
    setMsg({ type: "ok", text: "自我介绍已发布！社区会认识你。" });
    setProduct("");
    setMarket("");
    setOffer("");
    setSeeking("");
    router.refresh();
  }

  if (authed === false) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="text-sm text-muted">登录后即可发布你的自我介绍，让社区认识你。</p>
        <Link href="/login" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          登录 / 注册
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="font-semibold">写一条自我介绍</h2>
      <p className="mt-1 text-sm text-muted">按模板填几句就好，越具体越容易被对的人看到。</p>

      {msg ? (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            msg.type === "ok" ? "bg-brand-soft text-brand" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="主营产品 *" value={product} onChange={setProduct} placeholder="例：工业设备配件、新能源周边" />
        <Field label="主打市场 *" value={market} onChange={setMarket} placeholder="例：欧洲、北美 B2B" />
        <Field label="我能提供" value={offer} onChange={setOffer} placeholder="例：AI 询盘复盘、P4P 诊断经验" />
        <Field label="正在寻找" value={seeking} onChange={setSeeking} placeholder="例：开发信工作流的实战案例" />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="mt-5 h-10 rounded-lg bg-brand px-6 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "发布中…" : "发布自我介绍"}
      </button>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
