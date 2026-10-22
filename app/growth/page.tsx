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
        <GrowthHero summary={summary} />
        <DailyTasks tasks={summary.tasks} />
        <ContinueLearning learning={summary.learning} />
      </div>
    </AppShell>
  );
}
