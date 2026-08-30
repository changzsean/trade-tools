import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ALIBABA_SESSION_COOKIE, callAlibabaIop } from "@/lib/alibaba/iop";
import { openAlibabaToken } from "@/lib/alibaba/token-cookie";
import { hasProductCopyAccess } from "@/lib/product-copy/access";
import { authenticateProductCopyRequest } from "@/lib/product-copy/server-auth";

export const runtime = "nodejs";

type DraftProduct = {
  title?: unknown;
  description?: unknown;
  keywords?: unknown;
  brand?: unknown;
  categoryId?: unknown;
  price?: unknown;
  moq?: unknown;
  images?: unknown;
};

type DraftInput = { id?: unknown; product?: DraftProduct };

function text(value: unknown, max = 50000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function firstImage(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const image = value.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof image === "string" ? image.trim().slice(0, 2048) : "";
}

function findValue(value: unknown, keys: string[]): string | null {
  if (!value || typeof value !== "object") return null;
  for (const [key, candidate] of Object.entries(value as Record<string, unknown>)) {
    if (keys.includes(key) && (typeof candidate === "string" || typeof candidate === "number")) return String(candidate);
    const nested = findValue(candidate, keys);
    if (nested) return nested;
  }
  return null;
}

function apiError(value: Record<string, unknown>): string | null {
  const message = findValue(value, ["sub_msg", "msg", "message", "error_description"]);
  return message ? message.slice(0, 1000) : null;
}

export async function POST(request: Request) {
  if (!(await hasProductCopyAccess())) return NextResponse.json({ error: "内部工具访问已过期" }, { status: 403 });
  const auth = await authenticateProductCopyRequest(request);
  if (!auth) return NextResponse.json({ error: "请先登录 MEEKA 并完成阿里授权" }, { status: 401 });

  let body: { items?: unknown };
  try { body = await request.json() as { items?: unknown }; } catch { return NextResponse.json({ error: "请求格式不正确" }, { status: 400 }); }
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) {
    return NextResponse.json({ error: "一次最多提交 50 个商品" }, { status: 400 });
  }

  const cookieValue = (await cookies()).get(ALIBABA_SESSION_COOKIE)?.value;
  if (!cookieValue) return NextResponse.json({ error: "阿里授权已过期，请先重新授权" }, { status: 401 });
  let session = "";
  try { session = openAlibabaToken(cookieValue).access_token; } catch { return NextResponse.json({ error: "阿里授权凭证无效，请重新授权" }, { status: 401 }); }
  if (!session) return NextResponse.json({ error: "阿里授权凭证为空，请重新授权" }, { status: 401 });

  const inputs = body.items.filter((item): item is DraftInput => Boolean(item && typeof item === "object")).slice(0, 50);
  const ids = inputs.map((item) => text(item.id, 80)).filter(Boolean);
  const { data: rows, error: rowError } = await auth.client
    .from("product_copy_items")
    .select("id, run_id, source_image_url, normalized_payload")
    .eq("user_id", auth.user.id)
    .in("id", ids);
  if (rowError) return NextResponse.json({ error: "商品草稿读取失败" }, { status: 503 });

  const rowMap = new Map((rows ?? []).map((row) => [row.id as string, row as { id: string; run_id: string; source_image_url: string | null; normalized_payload: Record<string, unknown> }]));
  const results: Array<{ id: string; ok: boolean; draftId?: string; error?: string }> = [];

  for (const input of inputs) {
    const id = text(input.id, 80);
    const row = rowMap.get(id);
    if (!row) { results.push({ id, ok: false, error: "商品记录不存在" }); continue; }
    const product = input.product ?? {};
    const title = text(product.title, 128);
    const description = text(product.description, 50000);
    const categoryId = text(product.categoryId, 32);
    const keywords = Array.isArray(product.keywords) ? product.keywords.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean).slice(0, 3) : [];
    if (!title || !categoryId) {
      const error = "缺少英文标题或叶子类目 ID";
      await auth.client.from("product_copy_items").update({ status: "needs_review", error_message: error }).eq("id", id).eq("user_id", auth.user.id);
      results.push({ id, ok: false, error });
      continue;
    }

    try {
      // This compatibility endpoint creates a draft only. It never submits or publishes the product.
      const response = await callAlibabaIop("alibaba.icbu.product.add.draft", session, {
        attributes: "[]",
        bulk_discount_prices: "[]",
        category_id: categoryId,
        custom_info: "{}",
        description,
        extra_context: "{}",
        group_id: "0",
        is_smart_edit: "false",
        keywords: JSON.stringify(keywords),
        language: "ENGLISH",
        main_image: firstImage(product.images) || row.source_image_url || "",
        market: "onesite",
        product_sku: "{}",
        product_type: "wholesale",
        sourcing_trade: "{}",
        subject: title,
        wholesale_trade: "{}",
      });
      const error = apiError(response);
      const draftId = findValue(response, ["product_id", "productId"]);
      if (error || !draftId) throw new Error(error ?? "阿里接口未返回草稿 ID，可能需要切换到新版 Schema 发品接口");
      const normalizedPayload = { ...(row.normalized_payload ?? {}), ...product, alibabaDraftId: draftId, alibabaDraftSyncedAt: new Date().toISOString() };
      await auth.client.from("product_copy_items").update({ normalized_payload: normalizedPayload, status: "draft_ready", error_message: null }).eq("id", id).eq("user_id", auth.user.id);
      results.push({ id, ok: true, draftId });
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 1000) : "草稿提交失败";
      await auth.client.from("product_copy_items").update({ status: "failed", error_message: message }).eq("id", id).eq("user_id", auth.user.id);
      results.push({ id, ok: false, error: message });
    }
  }

  const runIds = [...new Set((rows ?? []).map((row) => row.run_id as string))];
  for (const runId of runIds) {
    const { data: runItems } = await auth.client.from("product_copy_items").select("status").eq("run_id", runId).eq("user_id", auth.user.id);
    const statuses = (runItems ?? []).map((item) => item.status as string);
    const successCount = statuses.filter((status) => status === "draft_ready" || status === "published").length;
    const failedCount = statuses.filter((status) => status === "failed").length;
    const queuedCount = statuses.filter((status) => !["draft_ready", "published", "failed"].includes(status)).length;
    await auth.client.from("product_copy_runs").update({ success_count: successCount, failed_count: failedCount, queued_count: queuedCount, status: queuedCount ? "processing" : failedCount ? "failed" : "completed", updated_at: new Date().toISOString() }).eq("id", runId).eq("user_id", auth.user.id);
  }

  return NextResponse.json({ results, acceptedCount: results.filter((result) => result.ok).length, failedCount: results.filter((result) => !result.ok).length });
}
