"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

export function PasswordRecoveryForm({ mode }: { mode: "request" | "reset" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode !== "reset") return;
    const client = getSupabase();
    if (!client) return;
    const { data } = client.auth.onAuthStateChange(event => {
      if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
    });
    client.auth.getSession().then(({ error }) => {
      if (error) setMessage("重置链接无效或已过期，请重新申请。");
    }).catch(() => setMessage("暂时无法验证重置链接，请稍后重试。"));
    return () => data.subscription.unsubscribe();
  }, [mode]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const client = getSupabase();
    if (!client) { setMessage("账号服务尚未配置，请稍后重试。"); return; }
    if (mode === "reset" && (!recoveryReady || password.length < 8 || password !== confirmation)) {
      setMessage("请使用有效的重置邮件链接，并填写两次一致的密码（至少 8 位）。");
      return;
    }
    setLoading(true);
    try {
      if (mode === "request") {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        setMessage(error ? "重置邮件暂时未能发送，请稍后重试。" : "若该邮箱已注册，我们会发送密码重置邮件。请检查收件箱及垃圾邮件。");
      } else {
        const { error } = await client.auth.updateUser({ password });
        if (error) { setMessage("密码未能更新，链接可能已过期，请重新申请重置邮件。"); return; }
        await client.auth.signOut({ scope: "global" });
        setRecoveryReady(false);
        setPassword(""); setConfirmation("");
        setMessage("密码已更新，请使用新密码重新登录。");
      }
    } catch { setMessage("暂时无法连接账号服务，请稍后重试。"); }
    finally { setLoading(false); }
  }

  const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand";
  return <form className="mt-6 space-y-4" onSubmit={submit}>
    {message ? <p role="status" className="rounded-lg bg-surface-muted p-3 text-sm">{message}</p> : null}
    {mode === "request" ? <div><label htmlFor="recovery-email">注册邮箱</label><input id="recovery-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></div> : recoveryReady ? <>
      <div><label htmlFor="new-password">新密码（至少 8 位）</label><input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></div>
      <div><label htmlFor="confirm-password">再次输入新密码</label><input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} className={inputClass} /></div>
    </> : <p className="text-sm text-muted">请从密码重置邮件中的链接进入。链接过期时可重新申请。</p>}
    {mode === "request" || recoveryReady ? <button type="submit" disabled={loading} className="h-10 w-full rounded-lg bg-brand text-sm font-semibold text-white disabled:opacity-60">{loading ? "请稍候…" : mode === "request" ? "发送重置邮件" : "保存新密码"}</button> : <Link href="/forgot-password" className="block text-brand underline">重新申请重置邮件</Link>}
    <Link href="/login" className="block text-sm text-brand underline">返回登录</Link>
  </form>;
}
