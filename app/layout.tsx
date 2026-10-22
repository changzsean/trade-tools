import type { Metadata } from "next";
import "./globals.css";
import { MeekaAssistant } from "@/components/common/meeka-assistant";

export const metadata: Metadata = {
  title: "MEEKA | AI 外贸人的共同成长社区",
  description:
    "MEEKA（米卡）是面向外贸人的 AI 共同成长社区，聚合成长任务、协作社区、资源市场和 AI 工作流实验室。Learn Together. Trade Smarter.",
  icons: { icon: "/assets/meeka/meeka-happy.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        {children}
        <MeekaAssistant />
      </body>
    </html>
  );
}
