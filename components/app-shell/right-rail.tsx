/**
 * 首页右侧栏（产品文档 §4.2 / §6.3–6.7）
 * 新人导航 · 大家都在找 · 资源对接 · 继续学习 · 近期活动（无直播）
 */

import Link from "next/link";
import { Handshake, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Meeka } from "@/components/meeka/meeka";
import { NEWBIE_STEPS } from "@/types/onboarding";

const HOT_SEARCHES = [
  "欧洲新能源客户开发渠道",
  "国际站询盘分级模板",
  "TikTok B2B 获客案例",
  "外贸业务员 AI 工作流",
];

const MATCHING_ENTRIES = ["找货源", "找供应商", "找物流", "找海外仓", "求合作", "找服务商", "找渠道", "找样品"];

const EVENTS = [
  { marker: "🔥", title: "AI 外贸增长实战营", meta: "作业挑战 · 今晚 20:00 开始" },
  { marker: "📍", title: "深圳同城外贸交流会", meta: "线下交流 · 本周六" },
  { marker: "🧩", title: "询盘转化案例拆解", meta: "主题共创 · 征集中" },
];

export function RightRail() {
  return (
    <div className="space-y-5">
      {/* 新人导航（§6.3，IP: profile 64-96px） */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Meeka state="profile" size={64} alt="Meeka 新人向导" />
            <div>
              <h2 className="text-base font-semibold">新人导航</h2>
              <p className="mt-0.5 text-xs text-muted">先认识你，再推荐内容和伙伴</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2.5">
            {NEWBIE_STEPS.map((step, i) => (
              <li key={step.id} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    i === 0 ? "bg-brand text-white" : "bg-surface-muted text-muted"
                  }`}
                >
                  {step.id}
                </span>
                <div>
                  <div className="text-sm font-medium leading-5">{step.title}</div>
                  <div className="text-xs leading-4 text-muted">{step.description}</div>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/onboarding"
            className="mt-4 flex h-9 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:opacity-90"
          >
            继续完成
          </Link>
        </CardContent>
      </Card>

      {/* 大家都在找（§6.4） */}
      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Search className="h-4 w-4 text-brand" />
            大家都在找
          </h2>
        </CardHeader>
        <CardContent className="space-y-1">
          {HOT_SEARCHES.map((q, i) => (
            <Link
              key={q}
              href="/community/questions"
              className="flex items-baseline gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-muted"
            >
              <span className={`text-xs font-bold ${i < 2 ? "text-brand" : "text-muted"}`}>{i + 1}</span>
              <span className="line-clamp-1 text-sm text-slate-700">{q}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* 资源对接（§6.5，重点功能） */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Handshake className="h-4 w-4 text-brand" />
              资源对接
            </h2>
            <Meeka state="discover" size={40} alt="Meeka 探索" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-1.5">
            {MATCHING_ENTRIES.map((entry) => (
              <Link
                key={entry}
                href="/community/resource-matching"
                className="rounded-lg bg-surface-muted px-1 py-2 text-center text-xs font-medium text-slate-700 hover:bg-brand-soft hover:text-brand"
              >
                {entry}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 继续学习（§6.6，IP: thinking） */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">继续学习</h2>
              <p className="mt-0.5 text-xs text-muted">AI 外贸业务增长实战营 · 第 4 章</p>
            </div>
            <Meeka state="thinking" size={56} alt="Meeka 学习中" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-[68%] rounded-full bg-brand" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>已完成 68%</span>
            <span>预计还需 40 分钟</span>
          </div>
          <Link
            href="/growth"
            className="mt-3 flex h-9 items-center justify-center rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            继续
          </Link>
        </CardContent>
      </Card>

      {/* 近期活动（§6.7，无直播，以录播/作业/交流为主） */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold">近期活动</h2>
            <p className="mt-1 text-xs text-muted">实战营 · 作业挑战 · 同城交流</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {EVENTS.map((event) => (
            <div key={event.title} className="flex gap-3 rounded-xl border border-border bg-background/60 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm">
                {event.marker}
              </div>
              <div className="min-w-0">
                <div className="line-clamp-1 text-sm font-medium leading-5">{event.title}</div>
                <div className="mt-1 text-xs leading-4 text-muted">{event.meta}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
