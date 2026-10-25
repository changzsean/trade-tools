"use client";

/**
 * 登录 / 注册表单（接 Supabase Auth）
 * mode="login"  → signInWithPassword
 * mode="register" → signUp（附带 display_name / username 元数据，触发器自动建 profile）
 * 未配置后端时降级为提示，不报错。
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!SUPABASE_READY) {
      setMsg({ type: "err", text: "后端尚未配置，请稍后再试。" });
      return;
    }
    const sb = getSupabase();
    if (!sb) return;

    if (!email || !password) {
      setMsg({ type: "err", text: "请填写邮箱和密码。" });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          setMsg({ type: "err", text: error.message === "Invalid login credentials" ? "邮箱或密码错误。" : error.message });
          return;
        }
        router.push("/");
        router.refresh();
      } else {
        if (!acceptedPolicy) {
          setMsg({ type: "err", text: "请先阅读并同意会员服务协议和隐私说明。" });
          return;
        }
        if (!name.trim() || !username.trim()) {
          setMsg({ type: "err", text: "请填写显示名称和用户名。" });
          return;
        }
        if (password.length < 8) {
          setMsg({ type: "err", text: "密码至少 8 位。" });
          return;
        }
        if (!/^[a-z0-9_]{3,32}$/.test(username)) {
          setMsg({ type: "err", text: "用户名须为 3–32 位小写字母、数字或下划线。" });
          return;
        }
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: { display_name: name.trim(), username, policy_accepted: true, terms_version: "2026-10-26", privacy_version: "2026-10-26" },
          },
        });
        if (error) {
          setMsg({ type: "err", text: error.message });
          return;
        }
        setMsg({ type: "ok", text: "注册成功！请查收邮件完成验证，然后返回登录。" });
      }
    } catch {
      setMsg({ type: "err", text: "暂时无法连接账号服务，请稍后重试。" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {msg ? (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.type === "ok" ? "bg-brand-soft text-brand" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      {mode === "register" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium" htmlFor="name">显示名称</label>
            <input
              id="name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
              placeholder="Sean"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="username">用户名</label>
            <input
              id="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-z0-9_]{3,32}"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
              placeholder="sean"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium" htmlFor="account">邮箱</label>
        <input
          id="account"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="password">密码{mode === "register" ? "（至少 8 位）" : ""}</label>
        <input
          id="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand"
          placeholder="••••••••"
        />
      </div>
      {mode === "register" ? (
        <label className="flex items-start gap-2 text-sm leading-6 text-slate-600">
          <input type="checkbox" required checked={acceptedPolicy} onChange={e => setAcceptedPolicy(e.target.checked)} className="mt-1.5" />
          <span>我已阅读并同意<Link href="/terms" target="_blank" className="text-brand underline">会员服务协议</Link>和<Link href="/privacy" target="_blank" className="text-brand underline">隐私说明</Link>（2026-10-26 版）。</span>
        </label>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-lg bg-brand text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "请稍候…" : mode === "login" ? "登录" : "注册并开始成长"}
      </button>
    </form>
  );
}
