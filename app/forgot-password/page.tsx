import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";
export const metadata: Metadata = { title: "找回密码 | MEEKA", robots: { index: false } };
export default function ForgotPasswordPage() {
  return <main className="mx-auto mt-16 max-w-md rounded-2xl border border-border bg-white p-8"><h1 className="text-2xl font-semibold">找回密码</h1><p className="mt-2 text-sm text-muted">输入注册邮箱，获取密码重置链接。</p><PasswordRecoveryForm mode="request" /></main>;
}
