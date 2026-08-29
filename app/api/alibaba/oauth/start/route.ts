import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ALIBABA_STATE_COOKIE, buildAlibabaAuthorizeUrl } from "@/lib/alibaba/iop";

export const runtime = "nodejs";

export async function GET() {
  try {
    const state = randomBytes(32).toString("base64url");
    const response = NextResponse.redirect(buildAlibabaAuthorizeUrl(state));
    response.cookies.set(ALIBABA_STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Alibaba OAuth is not configured on the server" }, { status: 500 });
  }
}
