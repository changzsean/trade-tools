import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ALIBABA_CALLBACK_PATH,
  ALIBABA_RETURN_TO_COOKIE,
  ALIBABA_SESSION_COOKIE,
  ALIBABA_STATE_COOKIE,
  exchangeAlibabaCode,
  requiredAlibabaCookieSecret,
  sameSecret,
} from "@/lib/alibaba/iop";
import { sealAlibabaToken, tokenCookieMaxAge } from "@/lib/alibaba/token-cookie";

export const runtime = "nodejs";

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message, callback: ALIBABA_CALLBACK_PATH }, { status });
}

function resultRedirect(request: Request, returnTo: string | undefined, result: "connected" | "denied" | "error"): NextResponse {
  const target = returnTo === "/product-copy/pair" ? returnTo : "/product-copy";
  const redirect = new URL(target, request.url);
  redirect.searchParams.set("alibaba", result);
  return NextResponse.redirect(redirect);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const returnTo = cookieStore.get(ALIBABA_RETURN_TO_COOKIE)?.value;
  const providerError = url.searchParams.get("error");
  if (providerError) return resultRedirect(request, returnTo, "denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return errorResponse("Missing Alibaba authorization code or state", 400);

  const expectedState = cookieStore.get(ALIBABA_STATE_COOKIE)?.value;
  if (!expectedState || !sameSecret(expectedState, state)) return errorResponse("Invalid Alibaba OAuth state", 400);

  try {
    // Fail before consuming the one-time authorization code if token storage is not configured.
    requiredAlibabaCookieSecret();
    const token = await exchangeAlibabaCode(code);
    const response = resultRedirect(request, returnTo, "connected");
    response.cookies.set(ALIBABA_SESSION_COOKIE, sealAlibabaToken(token), {
      httpOnly: true,
      maxAge: tokenCookieMaxAge(token),
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set(ALIBABA_STATE_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
    response.cookies.set(ALIBABA_RETURN_TO_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
    return response;
  } catch {
    return resultRedirect(request, returnTo, "error");
  }
}
