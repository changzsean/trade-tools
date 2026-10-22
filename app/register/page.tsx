import Link from "next/link";
import type { Metadata } from "next";
import { Meeka } from "@/components/meeka/meeka";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "注册 | MEEKA" };

/** 注册页（产品文档 §9.1）— IP: meeka-register 160-260px，文案「一起开启 AI 外贸成长吧。」 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-white md:grid-cols-[1fr_300px]">
        <div className="p-8 md:p-10">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/logo-meeka-nav.png" alt="MEEKA" className="h-6 w-auto" />
          </Link>
          <h1 className="mt-8 text-xl font-semibold">一起开启 AI 外贸成长吧。</h1>
          <p className="mt-1 text-sm text-muted">注册后完成新人引导，社区会为你定制学习路径。</p>

          <AuthForm mode="register" />
          <p className="mt-3 text-xs text-muted">注册后可在新人引导里补充身份、主营平台与行业，系统据此推荐内容。</p>

          <p className="mt-6 text-sm text-muted">
            已有账号？
            <Link href="/login" className="ml-1 font-medium text-brand hover:underline">
              直接登录
            </Link>
          </p>
        </div>
        {/* 图内已含「一起开启 AI 外贸成长吧」文案，不再叠加文字 */}
        <div className="hidden flex-col items-center justify-center border-l border-border bg-background p-8 md:flex">
          <Meeka state="register" size={220} alt="Meeka 欢迎加入" />
        </div>
      </div>
    </div>
  );
}
