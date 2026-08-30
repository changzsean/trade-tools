import { NextResponse } from "next/server";
import { inspectProductUrl } from "@/lib/product-copy/extract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string" || !body.url.trim()) return NextResponse.json({ error: "请输入商品链接" }, { status: 400 });
    const product = await inspectProductUrl(body.url.trim());
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "商品页面读取失败";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
