"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Chrome, Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";

export default function ProductCopyPairPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("扩展尚未配对");
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window) return;
      if (event.data?.type !== "MEEKA_PRODUCT_COPY_PAIR_RESULT") return;
      setLoading(false);
      setPaired(Boolean(event.data.ok));
      setMessage(event.data.ok ? "配对成功，可以回到 Alibaba 店铺集合页采集。" : (event.data.error ?? "扩展没有收到配对信息，请确认已加载扩展。"));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function pairExtension() {
    setMessage("");
    if (!SUPABASE_READY) {
      setMessage("MEEKA 后端尚未配置，暂时不能配对。");
      return;
    }
    const client = getSupabase();
    if (!client) return;
    setLoading(true);
    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.access_token) {
      setLoading(false);
      setMessage("请先登录 MEEKA，再进行配对。");
      return;
    }
    window.postMessage({ type: "MEEKA_PRODUCT_COPY_PAIR", accessToken: data.session.access_token }, window.location.origin);
    window.setTimeout(() => setLoading(false), 4000);
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/product-copy" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" />返回快速搬品</Link>
        <Card className="mt-6 p-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand"><Chrome className="h-4 w-4" />配对 Chrome 采集扩展</div>
          <h1 className="mt-3 text-2xl font-semibold">让采集结果进入你的 MEEKA 后台</h1>
          <p className="mt-2 text-sm leading-6 text-muted">配对只把当前登录用户的短期 Supabase 访问令牌交给本机扩展，用于调用 MEEKA 入库接口。不会读取或上传 Alibaba Cookie、密码、App Secret。</p>
          <div className="mt-6 space-y-3 rounded-xl border border-border bg-surface-muted p-4 text-sm leading-6">
            <div>1. 在 Chrome 扩展管理页加载仓库中的 <code>extensions/alibaba-product-collector</code> 文件夹。</div>
            <div>2. 保持本页登录状态，点击下面的“配对扩展”。</div>
            <div>3. 打开 Alibaba 店铺集合页，在扩展弹窗点击“自动采集全部分页”。</div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={pairExtension} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : paired ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}{paired ? "已配对" : "配对扩展"}</Button>
            <span className={`text-sm ${paired ? "text-emerald-700" : "text-muted"}`}>{message}</span>
          </div>
        </Card>
      </div>
    </main>
  );
}
