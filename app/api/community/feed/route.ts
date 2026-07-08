import { NextResponse } from "next/server";
import { getCommunityFeed } from "@/lib/data/trademind";

export async function GET() {
  const posts = await getCommunityFeed();
  return NextResponse.json({ ok: true, data: posts });
}
