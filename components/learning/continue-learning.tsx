import { BookOpen } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LearningProgress } from "@/types/growth";

export function ContinueLearning({ learning }: { learning: LearningProgress }) {
  return (
    <section>
      <SectionHeading title="继续学习" href="/growth/pathways" />
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{learning.pathTitle}</div>
            <p className="mt-1 text-sm text-muted">{learning.currentLesson}</p>
            <div className="mt-4 h-2 rounded-full bg-surface-muted">
              <div className="h-2 rounded-full bg-brand" style={{ width: `${learning.progressPercent}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted">已完成 {learning.progressPercent}%</div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{learning.nextAction}</p>
          <Button>继续</Button>
        </div>
      </Card>
    </section>
  );
}
