import { NextResponse } from "next/server";
import { getGrowthSummary } from "@/lib/data/trademind";

export async function GET() {
  const summary = await getGrowthSummary();
  return NextResponse.json({ ok: true, data: summary });
}
