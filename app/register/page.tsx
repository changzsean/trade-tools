import Link from "next/link";
import type { Metadata } from "next";
import { Meeka } from "@/components/meeka/meeka";

export const metadata: Metadata = { title: "注册 | MEEKA" };

const IDENTITIES = ["外贸老板", "运营", "业务员", "服务商", "学习者"];
const PLATFORMS = ["国际站", "独立站", "Amazon", "TikTok", "其他"];

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

          <form className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="account">手机号 / 邮箱</label>
              <input
                id="account"
                type="text"
                autoComplete="username"
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="password">密码</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                placeholder="至少 8 位"
              />
            </div>
            <div>
              <span className="text-sm font-medium">我的身份</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {IDENTITIES.map((v) => (
                  <label key={v} className="cursor-pointer">
                    <input type="radio" name="identity" className="peer sr-only" />
                    <span className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm text-slate-600 peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand">
                      {v}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">主营平台</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PLATFORMS.map((v) => (
                  <label key={v} className="cursor-pointer">
                    <input type="checkbox" name="platform" className="peer sr-only" />
                    <span className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm text-slate-600 peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand">
                      {v}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="h-10 w-full rounded-lg bg-brand text-sm font-semibold text-white hover:opacity-90"
            >
              注册并开始引导
            </button>
          </form>

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
