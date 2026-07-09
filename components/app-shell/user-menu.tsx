"use client";

/**
 * 右上角个人中心（产品文档 §1.2 / §5.4）
 * 通知 · 私信 · 头像 · 用户名 · 等级 · 下拉菜单（含权限控制）
 * 读取真实 Supabase 登录态；未登录显示「登录 / 注册」。
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  ChevronDown,
  FileText,
  Home,
  Inbox,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";
import type { UserRole } from "@/types/user";

type CurrentUser = {
  name: string;
  level: number;
  role: UserRole;
  avatarInitial: string;
};

const MENU = [
  { title: "我的主页", href: "/workspace", icon: Home },
  { title: "我的成长", href: "/growth", icon: TrendingUp },
  { title: "我的资源", href: "/workspace#resources", icon: LayoutGrid },
  { title: "我的收藏", href: "/workspace#saves", icon: Bookmark },
  { title: "我的发布", href: "/workspace#posts", icon: FileText },
];

export function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // 关闭下拉：点击外部
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // 读取登录态
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    let active = true;

    async function loadProfile(userId: string, email: string | undefined) {
      const { data: profile } = await sb!.from("profiles").select("*").eq("id", userId).single();
      if (!active) return;
      const name = profile?.display_name || email?.split("@")[0] || "会员";
      setUser({
        name,
        level: Math.max(1, Math.floor((profile?.reputation ?? 0) / 500) + 1),
        role: (profile?.role as UserRole) || "member",
        avatarInitial: name[0]?.toUpperCase() || "M",
      });
    }

    sb.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) loadProfile(data.user.id, data.user.email);
      else setUser(null);
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) loadProfile(session.user.id, session.user.email);
      else setUser(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  // 未配置后端 或 未登录 → 显示登录/注册
  if (!SUPABASE_READY || (!loading && !user)) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-surface-muted"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
        >
          注册
        </Link>
      </div>
    );
  }

  // 加载中占位
  if (loading || !user) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-surface-muted" />;
  }

  const { name, level, role, avatarInitial } = user;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="通知"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-surface-muted"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
      </button>
      <button
        type="button"
        aria-label="私信"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-surface-muted"
      >
        <Inbox className="h-4 w-4" />
      </button>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-muted"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {avatarInitial}
          </span>
          <span className="hidden text-sm font-medium sm:inline">{name}</span>
          <Badge>Lv.{level}</Badge>
          <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-border bg-white p-1.5 shadow-lg"
          >
            {MENU.map((item) => (
              <MenuLink key={item.title} href={item.href} icon={item.icon} onSelect={() => setOpen(false)}>
                {item.title}
              </MenuLink>
            ))}
            {role === "creator" || role === "admin" ? (
              <MenuLink href="/creator" icon={Sparkles} onSelect={() => setOpen(false)}>
                创作者中心
              </MenuLink>
            ) : null}
            {role === "admin" ? (
              <MenuLink href="/admin" icon={Shield} onSelect={() => setOpen(false)}>
                管理后台
              </MenuLink>
            ) : null}
            <div className="my-1.5 border-t border-border" />
            <MenuLink href="/workspace#settings" icon={Settings} onSelect={() => setOpen(false)}>
              账号设置
            </MenuLink>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-surface-muted"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onSelect,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-surface-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
