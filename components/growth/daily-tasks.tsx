import { Handshake, MessageCircle, Rocket, Share2 } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DailyTask } from "@/types/growth";

const iconMap = {
  learning: Rocket,
  community: MessageCircle,
  resource: Share2,
  help: Handshake,
};

export function DailyTasks({ tasks }: { tasks: DailyTask[] }) {
  return (
    <section className="mt-5">
      <SectionHeading title="今日任务" description="用 10 分钟完成一个小动作，持续累积成长值" href="/growth/tasks" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tasks.map((task) => {
          const Icon = iconMap[task.category];
          return (
            <Card key={task.id} className="flex min-h-[190px] flex-col p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-foreground">{task.title}</div>
                  <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-muted">{task.description}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <Button size="sm">{task.status === "completed" ? "已完成" : "去完成"}</Button>
                <span className="inline-flex h-8 min-w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft px-3 text-sm font-semibold text-brand">
                  +{task.rewardPoints}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
