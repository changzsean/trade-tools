import { NextResponse } from "next/server";
import { getFeaturedResources } from "@/lib/data/trademind";

export async function GET() {
  const resources = await getFeaturedResources();
  return NextResponse.json({ ok: true, data: resources });
}
