import Link from "next/link";
import { Bookmark, FileText, GraduationCap, Package } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";
import { WorkspacePanel } from "@/components/workspace/workspace-panel";

const SECTIONS = [
  { icon: Bookmark, title: "我的收藏", desc: "收藏的资源、问答和案例", href: "/resources", cta: "去资源市场收藏" },
  { icon: FileText, title: "我的发布", desc: "我发过的文章、回答与需求", href: "/community/feed", cta: "去社区发布" },
  { icon: Package, title: "已购资源", desc: "已解锁的工作流、Skills 与模板", href: "/resources", cta: "浏览资源" },
  { icon: GraduationCap, title: "学习记录", desc: "课程进度、笔记与作业", href: "/growth", cta: "去成长中心" },
];

export default function WorkspacePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <WorkspacePanel />

        <div className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <s.icon className="h-4 w-4" />
                </span>
                <div className="font-semibold">{s.title}</div>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted">{s.desc}</p>
              <Link
                href={s.href}
                className="mt-4 inline-flex h-9 w-fit items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface-muted"
              >
                {s.cta}
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
