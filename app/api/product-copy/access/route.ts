import { NextResponse } from "next/server";
import {
  getProductCopyAccessToken,
  isProductCopyPasswordValid,
  PRODUCT_COPY_ACCESS_COOKIE,
  PRODUCT_COPY_ACCESS_MAX_AGE,
} from "@/lib/product-copy/access";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!getProductCopyAccessToken()) {
    return NextResponse.json({ error: "内部工具尚未配置访问密码" }, { status: 503 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "请输入访问密码" }, { status: 400 });
  }

  if (!isProductCopyPasswordValid(password)) {
    return NextResponse.json({ error: "访问密码不正确" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PRODUCT_COPY_ACCESS_COOKIE, getProductCopyAccessToken() as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PRODUCT_COPY_ACCESS_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PRODUCT_COPY_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
