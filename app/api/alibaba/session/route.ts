import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ALIBABA_SESSION_COOKIE } from "@/lib/alibaba/iop";
import { openAlibabaToken } from "@/lib/alibaba/token-cookie";

export const runtime = "nodejs";

export async function GET() {
  const value = (await cookies()).get(ALIBABA_SESSION_COOKIE)?.value;
  if (!value) return NextResponse.json({ connected: false });
  try {
    const token = openAlibabaToken(value);
    return NextResponse.json({ connected: Boolean(token.access_token), accountId: token.account_id ?? null });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
