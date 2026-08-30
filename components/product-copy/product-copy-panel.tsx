"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CheckSquare, ClipboardPaste, ExternalLink, Loader2, RefreshCw, Save, Send, ShieldCheck, Square, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";

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
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/product-copy/pair" className="rounded-lg border border-brand/30 bg-brand-soft px-3 py-2 text-xs font-medium text-brand">配对批量采集扩展</Link>
              <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />当前仅生成草稿，不自动上架</div>
            </div>
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

      <ProductCopyRunsPanel />

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

type BatchRun = {
  id: string;
  source_store_url: string;
  status: string;
  total_count: number;
  queued_count: number;
  success_count: number;
  failed_count: number;
  created_at: string;
};

type BatchItem = {
  id: string;
  run_id: string;
  source_product_id: string;
  source_url: string;
  source_title: string | null;
  source_image_url: string | null;
  status: string;
  normalized_payload: Record<string, unknown>;
  error_message: string | null;
};

type EditableProduct = {
  title: string;
  description: string;
  keywords: string[];
  brand: string;
  categoryId: string;
  price: string;
  moq: string;
  images: string[];
};

type BulkField = "title" | "description" | "brand" | "keywords" | "categoryId" | "price" | "moq";

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 3) : [];
}

function editableFromItem(item: BatchItem): EditableProduct {
  const payload = objectValue(item.normalized_payload);
  return {
    title: stringValue(payload.title) || item.source_title || "",
    description: stringValue(payload.description),
    keywords: stringList(payload.keywords),
    brand: stringValue(payload.brand || payload.trademark),
    categoryId: stringValue(payload.categoryId || payload.category_id),
    price: stringValue(payload.price),
    moq: stringValue(payload.moq || payload.minOrderQuantity),
    images: Array.isArray(payload.images) ? payload.images.filter((image): image is string => typeof image === "string") : (item.source_image_url ? [item.source_image_url] : []),
  };
}

function statusLabel(status: string): string {
  return ({ queued: "待处理", fetched: "已读取", needs_review: "待检查", draft_ready: "已进草稿", published: "已发布", failed: "失败" } as Record<string, string>)[status] ?? status;
}

function ProductCopyRunsPanel() {
  const [runs, setRuns] = useState<BatchRun[]>([]);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accountUserId, setAccountUserId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, EditableProduct>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkField, setBulkField] = useState<BulkField>("brand");
  const [bulkFind, setBulkFind] = useState("");
  const [bulkReplace, setBulkReplace] = useState("");
  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);
  const dirtyRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      if (!SUPABASE_READY) {
        setMessage("MEEKA 数据库尚未配置，暂时无法读取同步结果。");
        return;
      }
      const client = getSupabase();
      if (!client) return;
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        setMessage("请先登录 MEEKA，登录后才能查看同步结果。");
        return;
      }
      setAccountUserId(userData.user.id);
      const { data: runData, error: runError } = await client
        .from("product_copy_runs")
        .select("id, source_store_url, status, total_count, queued_count, success_count, failed_count, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (runError) throw runError;
      const nextRuns = (runData ?? []) as BatchRun[];
      setRuns(nextRuns);
      const latestRun = nextRuns[0];
      if (!latestRun) {
        setItems([]);
        setMessage("还没有同步记录。采集完成后点击扩展中的“同步到 MEEKA 后台”。");
        return;
      }
      const { data: itemData, error: itemError } = await client
        .from("product_copy_items")
        .select("id, run_id, source_product_id, source_url, source_title, source_image_url, status, normalized_payload, error_message")
        .eq("user_id", userData.user.id)
        .eq("run_id", latestRun.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (itemError) throw itemError;
      const nextItems = (itemData ?? []) as BatchItem[];
      setItems(nextItems);
      if (!dirtyRef.current) setDrafts(Object.fromEntries(nextItems.map((item) => [item.id, editableFromItem(item)])));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? `同步结果读取失败：${error.message}` : "同步结果读取失败，请稍后刷新");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 3000);
    return () => window.clearInterval(timer);
  }, [load]);

  const latestRun = runs[0];

  function updateDraft(id: string, patch: Partial<EditableProduct>) {
    dirtyRef.current = true;
    setDrafts((current) => ({ ...current, [id]: { ...(current[id] ?? { title: "", description: "", keywords: [], brand: "", categoryId: "", price: "", moq: "", images: [] }), ...patch } }));
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function selectAll() {
    setSelectedIds((current) => current.length === items.length ? [] : items.map((item) => item.id));
  }

  function applyBulkEdit() {
    if (!selectedIds.length) { setMessage("请先勾选要修改的商品"); return; }
    const find = bulkFind;
    const replacement = bulkReplace.trim();
    setDrafts((current) => {
      const next = { ...current };
      for (const id of selectedIds) {
        const source = next[id];
        if (!source) continue;
        if (bulkField === "keywords") {
          const value = find ? source.keywords.map((item) => item.split(find).join(replacement)).join(", ") : replacement;
          next[id] = { ...source, keywords: value.split(/[,，]/).map((item) => item.trim()).filter(Boolean).slice(0, 3) };
        } else {
          const currentValue = source[bulkField];
          const value = Array.isArray(currentValue) ? currentValue.join(", ") : currentValue;
          next[id] = { ...source, [bulkField]: find ? value.split(find).join(replacement) : replacement };
        }
      }
      return next;
    });
    dirtyRef.current = true;
    setMessage(`已生成 ${selectedIds.length} 个商品的批量修改预览，请点击“保存修改”。`);
  }

  async function persistSelected(ids: string[]) {
    const client = getSupabase();
    if (!client || !accountUserId) throw new Error("请先登录 MEEKA");
    await Promise.all(ids.map(async (id) => {
      const product = drafts[id];
      if (!product) return;
      const { error } = await client.from("product_copy_items").update({ normalized_payload: product, status: "needs_review", error_message: null, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", accountUserId);
      if (error) throw error;
    }));
  }

  async function saveSelected() {
    if (!selectedIds.length) { setMessage("请先勾选要保存的商品"); return; }
    setSaving(true);
    try {
      await persistSelected(selectedIds);
      dirtyRef.current = false;
      setMessage(`已保存 ${selectedIds.length} 个商品到 Supabase，状态为“待检查”。`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? `保存失败：${error.message}` : "保存失败，请检查 Supabase 权限");
    } finally { setSaving(false); }
  }

  async function syncSelectedToAlibaba() {
    if (!selectedIds.length) { setMessage("请先勾选要同步的商品"); return; }
    setSaving(true);
    try {
      await persistSelected(selectedIds);
      const client = getSupabase();
      const sessionResult = await client?.auth.getSession();
      const accessToken = sessionResult?.data.session?.access_token;
      if (!accessToken) throw new Error("MEEKA 登录已过期，请重新登录");
      const response = await fetch("/api/product-copy/drafts", { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ items: selectedIds.map((id) => ({ id, product: drafts[id] })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "草稿同步失败");
      dirtyRef.current = false;
      setMessage(`草稿同步完成：成功 ${result.acceptedCount} 个，失败 ${result.failedCount} 个。失败商品请按卡片提示补齐。`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? `草稿同步失败：${error.message}` : "草稿同步失败");
    } finally { setSaving(false); }
  }

  return (
    <Card className="space-y-5 p-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">同步记录与商品明细</h2>
          <p className="mt-1 text-xs text-muted">采集结果写入 Supabase 后会自动出现在这里，页面每 3 秒刷新一次。</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />刷新结果
        </Button>
      </div>

      {message ? <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-muted">{message}</p> : null}

      {runs.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {runs.slice(0, 6).map((run) => (
            <div key={run.id} className={`rounded-xl border p-4 ${run.id === latestRun?.id ? "border-brand/40 bg-brand-soft/30" : "border-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{run.total_count} 个商品 · {run.status === "queued" ? "待处理" : run.status}</div>
                  <a href={run.source_store_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-brand">{run.source_store_url}</a>
                </div>
                <span className="shrink-0 text-xs text-muted">{new Date(run.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-3 text-xs text-muted">已入队 {run.queued_count} · 成功 {run.success_count} · 失败 {run.failed_count}</div>
            </div>
          ))}
        </div>
      ) : null}

      {latestRun && items.length ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">最近一次同步的商品（{items.length}/{latestRun.total_count}）</h3><p className="mt-1 text-xs text-muted">先批量修改并保存，再同步到阿里国际站草稿箱；不会自动上架。</p></div><button type="button" onClick={selectAll} className="text-xs font-medium text-brand">{selectedIds.length === items.length ? "取消全选" : "全选商品"}</button></div>

          <div className="mb-4 rounded-xl border border-brand/20 bg-brand-soft/20 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold"><WandSparkles className="h-4 w-4 text-brand" />批量修改</div>
            <div className="mt-3 grid gap-2 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <select value={bulkField} onChange={(event) => setBulkField(event.target.value as BulkField)} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="brand">商标 / 品牌名</option><option value="title">英文标题</option><option value="description">商品描述</option><option value="keywords">关键词</option><option value="categoryId">叶子类目 ID</option><option value="price">价格</option><option value="moq">起订量 MOQ</option></select>
              <input value={bulkFind} onChange={(event) => setBulkFind(event.target.value)} placeholder="查找内容（留空=直接覆盖）" className="h-10 rounded-lg border border-border bg-white px-3 text-sm" />
              <input value={bulkReplace} onChange={(event) => setBulkReplace(event.target.value)} placeholder="替换为 / 统一设置为" className="h-10 rounded-lg border border-border bg-white px-3 text-sm" />
              <Button size="sm" onClick={applyBulkEdit}><WandSparkles className="h-4 w-4" />生成预览</Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-muted">已选 {selectedIds.length} 个</span><Button size="sm" variant="secondary" onClick={saveSelected} disabled={saving || !selectedIds.length}><Save className="h-4 w-4" />保存修改</Button><Button size="sm" onClick={syncSelectedToAlibaba} disabled={saving || !selectedIds.length}><Send className="h-4 w-4" />同步到阿里草稿箱</Button><span className="text-xs text-muted">需要标题和叶子类目 ID；只创建草稿，不发布。</span></div>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const product = drafts[item.id] ?? editableFromItem(item);
              const selected = selectedIds.includes(item.id);
              return <div key={item.id} className={`rounded-xl border p-4 ${selected ? "border-brand/50 bg-brand-soft/10" : "border-border"}`}>
                <div className="flex items-start gap-3">
                  <button type="button" aria-label={selected ? "取消选择商品" : "选择商品"} onClick={() => toggleSelected(item.id)} className="mt-1 text-brand">{selected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-muted" />}</button>
                  {item.source_image_url ? <img src={item.source_image_url} alt="来源商品" className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover" /> : <div className="h-16 w-16 shrink-0 rounded-lg bg-surface-muted" />}
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-medium">{item.source_title || `商品 ${item.source_product_id}`}</div><span className={`text-xs ${item.status === "failed" ? "text-red-600" : item.status === "draft_ready" ? "text-emerald-700" : "text-muted"}`}>{statusLabel(item.status)}</span></div><a href={item.source_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-brand">查看来源页面</a>{item.error_message ? <div className="mt-2 text-xs text-red-600">{item.error_message}</div> : null}</div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-xs font-medium">英文标题<input value={product.title} onChange={(event) => updateDraft(item.id, { title: event.target.value })} maxLength={128} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-brand" /></label>
                  <label className="text-xs font-medium">商标 / 品牌名<input value={product.brand} onChange={(event) => updateDraft(item.id, { brand: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-brand" /></label>
                  <label className="text-xs font-medium md:col-span-2">商品描述<textarea value={product.description} onChange={(event) => updateDraft(item.id, { description: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-border bg-white p-3 text-sm font-normal outline-none focus:border-brand" /></label>
                  <label className="text-xs font-medium">关键词（最多 3 个）<input value={product.keywords.join(", ")} onChange={(event) => updateDraft(item.id, { keywords: event.target.value.split(/[,，]/).map((value) => value.trim()).filter(Boolean).slice(0, 3) })} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-brand" /></label>
                  <label className="text-xs font-medium">叶子类目 ID<input value={product.categoryId} onChange={(event) => updateDraft(item.id, { categoryId: event.target.value })} placeholder="必填，例如 123" className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-brand" /></label>
                  <label className="text-xs font-medium">价格<input value={product.price} onChange={(event) => updateDraft(item.id, { price: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-brand" /></label>
                  <label className="text-xs font-medium">起订量 MOQ<input value={product.moq} onChange={(event) => updateDraft(item.id, { moq: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-brand" /></label>
                </div>
              </div>;
            })}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function ProductImage({ src }: { src: string }) {
  // These are third-party source images shown for review only; they are not uploaded by this MVP.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="来源商品图片" className="aspect-square rounded-lg border border-border object-cover" />;
}
