"use client";

/**
 * 右上角个人中心（产品文档 §1.2 / §5.4）
 * 通知 · 私信 · 头像 · 用户名 · 等级 · 下拉菜单（含权限控制）
 */

import Link from "next/link";
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
import type { UserRole } from "@/types/user";

/** TODO: 接入真实登录态（Supabase / NextAuth）后替换 */
const CURRENT_USER = { name: "Sean", level: 8, role: "admin" as UserRole };

const MENU = [
  { title: "我的主页", href: "/workspace", icon: Home },
  { title: "我的成长", href: "/growth", icon: TrendingUp },
  { title: "我的资源", href: "/workspace#resources", icon: LayoutGrid },
  { title: "我的收藏", href: "/workspace#saves", icon: Bookmark },
  { title: "我的发布", href: "/workspace#posts", icon: FileText },
];

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const { name, level, role } = CURRENT_USER;

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
            {name[0]}
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
              onClick={() => setOpen(false)}
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
