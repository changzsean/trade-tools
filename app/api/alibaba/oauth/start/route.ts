import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ALIBABA_RETURN_TO_COOKIE, ALIBABA_STATE_COOKIE, buildAlibabaAuthorizeUrl } from "@/lib/alibaba/iop";

export const runtime = "nodejs";

function safeReturnTo(request: Request): string {
  const value = new URL(request.url).searchParams.get("returnTo");
  return value === "/product-copy/pair" ? value : "/product-copy";
}

export async function GET(request: Request) {
  try {
    const state = randomBytes(32).toString("base64url");
    const response = NextResponse.redirect(buildAlibabaAuthorizeUrl(state));
    const returnTo = safeReturnTo(request);
    response.cookies.set(ALIBABA_STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set(ALIBABA_RETURN_TO_COOKIE, returnTo, {
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
