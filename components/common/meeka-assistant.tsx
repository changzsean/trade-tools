"use client";

/**
 * MEEKA 悬浮学习伙伴
 * 依据 MEEKA Design Kit v2.0（04 角色状态 / 07 悬浮助手 / 08 页面规则 / 06 文案系统）
 * 适配说明：不依赖 framer-motion，使用 CSS 过渡；PNG 资产在 /public/assets/meeka/。
 * 尚未生成的状态图（study / 404 等）自动回退到最接近的已生成资产。
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type MeekaState =
  | "idle"
  | "wave"
  | "login"
  | "register"
  | "profile"
  | "study"
  | "thinking"
  | "discover"
  | "cheer"
  | "success"
  | "empty"
  | "error";

/** 已生成的 PNG：wave/wave1/login/register/profile/thinking/happy/discover/cheer/success/empty/error */
const assetMap: Record<MeekaState, string> = {
  idle: "/assets/meeka/meeka-cheer.png", // 右下角助手用 cheer（产品文档 §7.2）
  wave: "/assets/meeka/meeka-wave.png",
  login: "/assets/meeka/meeka-login.png",
  register: "/assets/meeka/meeka-register.png",
  profile: "/assets/meeka/meeka-profile.png",
  study: "/assets/meeka/meeka-thinking.png", // meeka-study.png 未生成，回退
  thinking: "/assets/meeka/meeka-thinking.png",
  discover: "/assets/meeka/meeka-discover.png",
  cheer: "/assets/meeka/meeka-cheer.png",
  success: "/assets/meeka/meeka-success.png",
  empty: "/assets/meeka/meeka-empty.png",
  error: "/assets/meeka/meeka-error.png",
};

const messageMap: Record<MeekaState, string> = {
  idle: "Hi，我是 Meeka，需要我帮你找学习资源吗？",
  wave: "Hi，欢迎来到 MEEKA 👋",
  login: "欢迎回来，我们继续成长！",
  register: "一起开启 AI 外贸成长吧！",
  profile: "完善资料，我会为你定制学习路线。",
  study: "专注学习中 📖",
  thinking: "让我想一想……",
  discover: "我来帮你找找～",
  cheer: "太棒了！继续分享吧！",
  success: "今天又成长了一点！🎉",
  empty: "这里还没有内容，一起探索吧～",
  error: "网络开小差了，我们再试一次。",
};

function resolveState(pathname: string): MeekaState {
  if (pathname.includes("login")) return "login";
  if (pathname.includes("register")) return "register";
  if (pathname.includes("onboarding") || pathname.includes("profile")) return "profile";
  if (pathname.includes("growth") || pathname.includes("course")) return "study";
  if (pathname.includes("lab") || pathname.includes("docs")) return "thinking";
  if (pathname.includes("resources") || pathname.includes("search")) return "discover";
  if (pathname.includes("community")) return "cheer";
  if (pathname.includes("success") || pathname.includes("complete")) return "success";
  return "idle";
}

const quickLinks = [
  { title: "找资源", href: "/resources" },
  { title: "提问", href: "/community/questions" },
  { title: "今日任务", href: "/growth/tasks" },
];

export function MeekaAssistant({ state }: { state?: MeekaState }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentState = useMemo(() => state ?? resolveState(pathname ?? "/"), [state, pathname]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      <div
        className={`w-72 rounded-2xl border border-border bg-white p-4 shadow-lg transition-all duration-200 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
        role="dialog"
        aria-label="Meeka 学习伙伴"
      >
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetMap[currentState]} alt="Meeka" className="h-14 w-14 shrink-0 object-contain" />
          <div>
            <div className="text-sm font-semibold">Meeka</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{messageMap[currentState]}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border/50"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label={open ? "收起 Meeka 助手" : "打开 Meeka 助手"}
        onClick={() => setOpen((v) => !v)}
        className="h-[72px] w-[72px] overflow-hidden rounded-full border border-border bg-white p-1 shadow-md transition-transform duration-200 hover:scale-105"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetMap[currentState]} alt="Meeka" className="h-full w-full object-contain" />
      </button>
    </div>
  );
}
