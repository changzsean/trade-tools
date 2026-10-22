import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { NewsResult } from "@/lib/aihot/api";

export function NewsState({ state, emptyTitle = "首批资讯正在准备中", emptyText = "收录完成后，这里会展示资讯摘要、来源和发布时间。" }: { state: NewsResult<unknown>["state"] | "empty"; emptyTitle?: string; emptyText?: string }) {
  const title = state === "unavailable" ? "资讯暂时无法加载" : state === "not-found" ? "这条资讯已下线或不存在" : emptyTitle;
  const detail = state === "unavailable" ? "请稍后重试，已发布的资讯会在服务恢复后重新显示。" : state === "not-configured" ? "AI与外贸资讯栏目已开放，首批内容正在接入。" : state === "not-found" ? "可以返回资讯首页，继续查看其他动态。" : emptyText;
  return <div className="rounded-xl border border-border bg-white px-6 py-16 text-center" role="status">
    <Newspaper className="mx-auto mb-4 h-8 w-8 text-teal-700" aria-hidden="true" />
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{detail}</p>
    <Link href="/aihot" className="mt-5 inline-block text-sm font-medium text-teal-700 underline underline-offset-4">{state === "unavailable" ? "重新加载资讯" : "查看全部动态"}</Link>
  </div>;
}
