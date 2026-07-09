import Link from "next/link";
import { Bookmark, FileText, GraduationCap, Package } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">工作台</h1>
              <p className="mt-2 text-sm text-muted">
                集中管理收藏资源、学习笔记、我的发布、已购内容和 AI Lab 运行结果。
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="neutral">Lv.8</Badge>
              <Badge variant="neutral">成长值 8,620</Badge>
            </div>
          </div>
        </Card>

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

        <Card className="p-6 text-sm text-muted">
          登录后，这里会显示你真实的收藏、发布和学习数据。
        </Card>
      </div>
    </AppShell>
  );
}
