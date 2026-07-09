import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  FlaskConical,
  Handshake,
  Home,
  Inbox,
  LayoutGrid,
  MapPin,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/app-shell/user-menu";
import { SearchBar } from "@/components/app-shell/search-bar";
import type { NavItem } from "@/types/navigation";

const primaryNav: NavItem[] = [
  { title: "首页", href: "/", icon: Home },
  { title: "成长", href: "/growth", icon: Star },
  { title: "资源", href: "/resources", icon: LayoutGrid },
  { title: "社区", href: "/community/feed", icon: Users },
  { title: "实验室", href: "/lab", icon: FlaskConical },
  { title: "工作台", href: "/workspace", icon: BriefcaseBusiness },
];

const resourceNav: NavItem[] = [
  { title: "课程库", href: "/resources/courses", icon: BookOpen },
  { title: "工作流", href: "/resources/workflows", icon: Sparkles },
  { title: "Prompt 库", href: "/resources/prompts", icon: Inbox },
  { title: "AI Agent", href: "/resources/agents", icon: Bot },
];

const communityNav: NavItem[] = [
  { title: "动态广场", href: "/community/feed", icon: LayoutGrid },
  { title: "问答专区", href: "/community/questions", icon: Inbox },
  { title: "资源对接", href: "/community/resource-matching", icon: Handshake },
  { title: "组队学习", href: "/community/teams", icon: Users },
  { title: "成长伙伴", href: "/community/partners", icon: Star },
  { title: "同城交流", href: "/community/cities", icon: MapPin },
];

export function AppShell({ children, rightRail }: { children: ReactNode; rightRail?: ReactNode }) {
  const shellGrid = rightRail
    ? "lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)_300px]"
    : "lg:grid-cols-[248px_minmax(0,1fr)]";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1540px] items-center gap-4 px-5">
          <Link href="/" className="flex w-[230px] items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/logo-meeka-nav.png" alt="MEEKA" className="h-6 w-auto" />
          </Link>
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {primaryNav.map((item) => (
              <Button key={item.href} asChild variant={item.href === "/" ? "subtle" : "ghost"} size="sm">
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
          <SearchBar />
          <UserMenu />
        </div>
      </header>
      <div className={`mx-auto grid max-w-[1540px] grid-cols-1 gap-5 px-5 py-5 ${shellGrid}`}>
        <aside className="hidden lg:block">
          <SidebarGroup title="资源中心" items={resourceNav} />
          <SidebarGroup title="社区互动" items={communityNav} className="mt-4" />
          <SidebarGroup
            title="个人中心"
            items={[
              { title: "创作者中心", href: "/creator", icon: Sparkles },
              { title: "管理后台", href: "/admin", icon: Settings },
            ]}
            className="mt-4"
          />
        </aside>
        <main>{children}</main>
        {rightRail ? <aside className="hidden xl:block">{rightRail}</aside> : null}
      </div>
    </div>
  );
}

function SidebarGroup({ title, items, className = "" }: { title: string; items: NavItem[]; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-white p-3 ${className}`}>
      <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-surface-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
