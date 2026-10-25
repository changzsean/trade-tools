"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const CHECK_INTERVAL = 5 * 60 * 1000;

export function NewsRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const lastCheck = useRef(0);
  const refresh = useCallback(() => {
    lastCheck.current = Date.now();
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    lastCheck.current = Date.now();
    const check = () => {
      if (document.visibilityState !== "visible" || document.activeElement?.closest("form, [contenteditable='true']")
        || window.getSelection()?.toString()) return;
      if (Date.now() - lastCheck.current >= CHECK_INTERVAL) refresh();
    };
    const interval = window.setInterval(check, CHECK_INTERVAL);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, [refresh]);

  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 text-xs text-muted">
    <span>每 5 分钟自动检查更新；切回本页时检查到期更新。</span>
    <button type="button" onClick={refresh} disabled={pending} aria-busy={pending}
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-60">
      <RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
      {pending ? "正在刷新…" : "立即刷新"}
    </button>
  </div>;
}
