import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell/app-shell";

export const metadata: Metadata = {
  title: "AI与外贸资讯 | MEEKA",
  description: "关注 AI 新动态、新方法与外贸落地案例，以及外贸趋势、市场机会和新产品。",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell activeHref="/aihot">{children}</AppShell>;
}
