"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ProductCopyAccessGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/product-copy/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "验证失败");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "验证失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-xl p-7">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
        <ShieldCheck className="h-4 w-4" /> 内部工具
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">快速搬品暂未对外开放</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        该功能用于你的店铺选品和内部发品流程。请输入内部访问密码；通过后还需要登录 MEEKA 才能使用采集和同步功能。
      </p>
      {!configured ? (
        <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          管理员尚未在部署环境配置 PRODUCT_COPY_ACCESS_PASSWORD。
        </p>
      ) : (
        <form className="mt-6 space-y-3" onSubmit={submit}>
          <label className="block text-sm font-medium" htmlFor="product-copy-access-password">
            内部访问密码
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <KeyRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
              <input
                id="product-copy-access-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="输入内部访问密码"
                className="h-11 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-brand"
              />
            </div>
            <Button type="submit" disabled={!password || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              验证进入
            </Button>
          </div>
          {message ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}
        </form>
      )}
    </Card>
  );
}
