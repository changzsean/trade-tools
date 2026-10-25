import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";
export const metadata: Metadata = { title: "重置密码 | MEEKA", robots: { index: false } };
export default function ResetPasswordPage() {
  return <main className="mx-auto mt-16 max-w-md rounded-2xl border border-border bg-white p-8"><h1 className="text-2xl font-semibold">重置密码</h1><PasswordRecoveryForm mode="reset" /></main>;
}
