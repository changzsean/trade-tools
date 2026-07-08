import { BookOpen, Check, Edit3, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GrowthSummary } from "@/types/growth";

export function GrowthHero({ summary }: { summary: GrowthSummary }) {
  return (
    <Card className="overflow-hidden border-blue-100 bg-white p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-semibold text-white shadow-sm">
              S
              <span className="absolute -bottom-2 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                Lv.{summary.level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    早上好，{summary.userName}
                  </h1>
                  <p className="mt-2 text-sm text-muted sm:text-base">
                    今天是你在社区的第 {summary.dayInCommunity} 天
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="secondary" size="sm">
                    <Edit3 className="h-4 w-4" />
                    编辑资料
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Share2 className="h-4 w-4" />
                    分享主页
                  </Button>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
                每一次分享、学习和协作，都在让更多外贸人变得更强大。
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {summary.metrics.map((metric) => (
              <div key={metric.label} className="min-h-[104px] rounded-2xl border border-border bg-background/70 p-4">
                <div className="text-sm text-muted">{metric.label}</div>
                <div className="mt-2 text-xl font-semibold leading-tight text-foreground">{metric.value}</div>
                <div className="mt-1 text-sm leading-5 text-muted">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">继续学习</div>
                <div className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{summary.learning.currentLesson}</div>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-surface-muted">
              <div className="h-2 rounded-full bg-brand" style={{ width: `${summary.learning.progressPercent}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted">已完成 {summary.learning.progressPercent}%</span>
              <Button size="sm">继续</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">连续签到 {summary.streakDays} 天</div>
                <div className="mt-1 text-xs text-muted">再签 2 天可获得额外积分奖励</div>
              </div>
              <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">本周</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
              {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
                <span key={day} className="leading-5">
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-8 min-w-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand"
                >
                  {index === 6 ? "+10" : <Check className="h-4 w-4" />}
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full" size="lg">
              签到
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
