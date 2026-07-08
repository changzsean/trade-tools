/**
 * 首页发布入口（产品文档 §6.1）
 * 知乎式轻量入口：Meeka 小图 + 输入框 + 四个动作。不做大卡片任务中心。
 */

import Link from "next/link";
import { Meeka } from "@/components/meeka/meeka";

const ACTIONS = [
  { title: "提问题", href: "/community/questions" },
  { title: "写回答", href: "/community/questions" },
  { title: "发文章", href: "/community/feed" },
  { title: "发需求", href: "/community/resource-matching" },
];

export function PublishBox() {
  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-3 px-5 py-4">
        <Meeka state="wave" size={48} className="shrink-0" alt="Meeka 欢迎" />
        <Link
          href="/community/feed"
          className="flex h-10 flex-1 items-center rounded-lg border border-border bg-background px-4 text-sm text-muted hover:border-border-strong"
        >
          分享一个真实外贸问题、经验，或发布资源对接需求...
        </Link>
        <Link
          href="/community/feed"
          className="hidden h-9 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:opacity-90 sm:flex"
        >
          发布
        </Link>
      </div>
      <div className="grid grid-cols-4 border-t border-border">
        {ACTIONS.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="flex h-11 items-center justify-center text-sm font-medium text-slate-600 hover:bg-surface-muted hover:text-foreground"
          >
            {a.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
