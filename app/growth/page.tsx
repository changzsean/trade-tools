import { AppShell } from "@/components/app-shell/app-shell";
import { ContinueLearning } from "@/components/learning/continue-learning";
import { DailyTasks } from "@/components/growth/daily-tasks";
import { GrowthHero } from "@/components/growth/growth-hero";
import { getGrowthSummary } from "@/lib/data/trademind";

export default async function GrowthPage() {
  const summary = await getGrowthSummary();
  return (
    <AppShell>
      <div className="space-y-5">
        <p role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">成长功能预览：以下等级、排名和学习进度为示例数据，尚未接入个人学习记录。</p>
        <GrowthHero summary={summary} />
        <DailyTasks tasks={summary.tasks} />
        <ContinueLearning learning={summary.learning} />
      </div>
    </AppShell>
  );
}
