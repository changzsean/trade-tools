import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/data/trademind";

export async function GET() {
  const questions = await getQuestions();
  return NextResponse.json({ ok: true, data: questions });
}
