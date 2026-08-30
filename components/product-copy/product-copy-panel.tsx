"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardPaste, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Product = {
  sourceUrl: string;
  canonicalUrl: string;
  title: string;
  description: string;
  images: string[];
  price?: string;
  currency?: string;
  keywords: string[];
  fetchedAt: string;
};

const STORAGE_KEY = "meeka-product-copy-drafts";

export function ProductCopyPanel() {
  const [url, setUrl] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/alibaba/session").then((response) => response.json()).then((data) => setConnected(Boolean(data.connected))).catch(() => undefined);
  }, []);

  async function inspect() {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/product-copy/inspect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "读取失败");
      setProduct(data.product);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "读取失败");
    }
  }

  function saveDraft() {
    if (!product) return;
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as Product[];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...product, categoryId }, ...saved].slice(0, 30)));
    setStatus("saved");
    setMessage("已保存到本机草稿箱；下一步可提交到阿里国际站草稿接口。");
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border bg-surface-muted px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-brand"><ClipboardPaste className="h-4 w-4" />快速搬品</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">商品链接 → 可编辑发布草稿</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">读取公开页面的标题、描述、主图和价格信息，先由你确认并改写，再进入阿里国际站发品流程。</p>
            </div>
            <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />当前仅生成草稿，不自动上架</div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <label className="block text-sm font-medium">商品链接</label>
          <div className="flex flex-col gap-3 md:flex-row">
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="粘贴你有权使用的商品公开链接，例如 https://..." className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand" />
            <Button onClick={inspect} disabled={!url.trim() || status === "loading"}>{status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}读取商品信息</Button>
          </div>
          <p className="text-xs leading-5 text-muted">请确认你有权使用页面中的文字、图片和视频；页面读取受目标站点访问规则限制，不绕过验证码或登录限制。</p>
          {status === "error" ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}
        </div>
      </Card>

      {product ? (
        <Card className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">检查并编辑</h2><p className="mt-1 text-xs text-muted">来源：{product.canonicalUrl}</p></div>
            <a href={product.canonicalUrl} target="_blank" rel="noreferrer" className="text-sm text-brand">打开来源 <ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <label className="block text-sm font-medium">英文标题（建议重写）<input value={product.title} onChange={(event) => setProduct({ ...product, title: event.target.value })} maxLength={128} className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block text-sm font-medium">商品描述<textarea value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} rows={10} className="mt-2 w-full rounded-lg border border-border p-3 text-sm leading-6 outline-none focus:border-brand" /></label>
              <label className="block text-sm font-medium">关键词（最多 3 个，逗号分隔）<input value={product.keywords.join(", ")} onChange={(event) => setProduct({ ...product, keywords: event.target.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean).slice(0, 3) })} className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-brand" /></label>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium">阿里国际站叶子类目 ID<input value={categoryId} onChange={(event) => setCategoryId(event.target.value)} placeholder="先从类目树获取，例如 123" className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-brand" /></label>
              <div className="rounded-lg border border-border p-4 text-sm"><div className="font-medium">抓取结果</div><div className="mt-3 space-y-2 text-muted"><div>图片：{product.images.length} 张</div><div>价格：{product.price ? `${product.price} ${product.currency ?? ""}` : "未识别"}</div><div>来源：公开页面元数据</div></div></div>
              {product.images.length ? <div className="grid grid-cols-3 gap-2">{product.images.slice(0, 6).map((image) => <ProductImage key={image} src={image} />)}</div> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button onClick={saveDraft}><CheckCircle2 className="h-4 w-4" />保存本机草稿</Button>
            <span className="text-xs text-muted">阿里授权状态：{connected ? <span className="text-emerald-700">已连接</span> : <a className="text-brand" href="/api/alibaba/oauth/start">未连接，先授权</a>}</span>
            {status === "saved" ? <span className="text-sm text-emerald-700">{message}</span> : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function ProductImage({ src }: { src: string }) {
  // These are third-party source images shown for review only; they are not uploaded by this MVP.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="来源商品图片" className="aspect-square rounded-lg border border-border object-cover" />;
}
