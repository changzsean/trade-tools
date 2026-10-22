import { NextResponse } from "next/server";
import { authenticateProductCopyRequest } from "@/lib/product-copy/server-auth";
import { corsHeaders, isAlibabaStoreUrl, normalizeBatchItems, withCors } from "@/lib/product-copy/batch";

export const runtime = "nodejs";

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  const auth = await authenticateProductCopyRequest(request);
  if (!auth) return withCors(NextResponse.json({ error: "请先登录 MEEKA 并配对采集扩展" }, { status: 401 }));

  try {
    const body = await request.json() as { sourceStoreUrl?: unknown; items?: unknown };
    const sourceStoreUrl = typeof body.sourceStoreUrl === "string" ? body.sourceStoreUrl.trim() : "";
    if (!isAlibabaStoreUrl(sourceStoreUrl)) {
      return withCors(NextResponse.json({ error: "仅支持 Alibaba 国际站店铺集合页" }, { status: 400 }));
    }

    const items = normalizeBatchItems(body.items);
    if (!items.length) return withCors(NextResponse.json({ error: "没有识别到可入库的商品" }, { status: 400 }));

    const { data: run, error: runError } = await auth.client
      .from("product_copy_runs")
      .insert({
        user_id: auth.user.id,
        source_platform: "alibaba",
        source_store_url: sourceStoreUrl,
        status: "queued",
        total_count: items.length,
        queued_count: items.length,
      })
      .select("id")
      .single();
    if (runError || !run) {
      console.error("product_copy_runs insert failed", runError);
      return withCors(NextResponse.json({ error: "采集任务入库失败，请检查数据库 migration 是否已执行" }, { status: 503 }));
    }

    const rows = items.map((item) => ({ ...item, run_id: run.id, user_id: auth.user.id, status: "queued" }));
    const { error: itemError } = await auth.client.from("product_copy_items").insert(rows);
    if (itemError) {
      console.error("product_copy_items insert failed", itemError);
      return withCors(NextResponse.json({ error: "商品明细入库失败", runId: run.id }, { status: 503 }));
    }

    return withCors(NextResponse.json({ runId: run.id, acceptedCount: items.length, status: "queued" }));
  } catch (error) {
    console.error("product copy batch request failed", error);
    return withCors(NextResponse.json({ error: "请求格式不正确" }, { status: 400 }));
  }
}

export async function GET(request: Request) {
  const auth = await authenticateProductCopyRequest(request);
  if (!auth) return withCors(NextResponse.json({ error: "请先登录 MEEKA 并配对采集扩展" }, { status: 401 }));

  const { data, error } = await auth.client
    .from("product_copy_runs")
    .select("id, source_platform, source_store_url, status, total_count, queued_count, success_count, failed_count, created_at, updated_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return withCors(NextResponse.json({ error: "采集任务读取失败" }, { status: 503 }));
  return withCors(NextResponse.json({ runs: data ?? [] }));
}
