import Link from "next/link";
import type { Metadata } from "next";
import { Meeka } from "@/components/meeka/meeka";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "登录 | MEEKA" };

/** 登录页（产品文档 §9.2）— IP: meeka-login 160-260px，文案「欢迎回来，我们继续成长。」 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-white md:grid-cols-[1fr_300px]">
        <div className="p-8 md:p-10">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/logo-meeka-nav.png" alt="MEEKA" className="h-6 w-auto" />
          </Link>
          <h1 className="mt-8 text-xl font-semibold">欢迎回来，我们继续成长。</h1>
          <p className="mt-1 text-sm text-muted">登录 MEEKA，接着上次的进度学习和交流。</p>

          <AuthForm mode="login" />

          <p className="mt-6 text-sm text-muted">
            还没有账号？
            <Link href="/register" className="ml-1 font-medium text-brand hover:underline">
              免费注册
            </Link>
          </p>
        </div>
        {/* 图内已含「欢迎回来」文案，不再叠加文字 */}
        <div className="hidden flex-col items-center justify-center border-l border-border bg-background p-8 md:flex">
          <Meeka state="login" size={220} alt="Meeka 欢迎回来" />
        </div>
      </div>
    </div>
  );
}
