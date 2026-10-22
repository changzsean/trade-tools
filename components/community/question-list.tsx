import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Question } from "@/types/community";

export function QuestionList({ questions, compact = false }: { questions: Question[]; compact?: boolean }) {
  return (
    <section>
      <SectionHeading title="热门讨论" href="/community/questions" actionLabel="查看更多" />
      <Card className="divide-y divide-border">
        {questions.map((question) => (
          <div key={question.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-brand">{question.accepted ? <CheckCircle2 className="h-4 w-4" /> : <span className="block h-4 w-4 rounded-full border border-border" />}</div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{question.title}</div>
                {!compact ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {question.tags.map((tag) => <Badge key={tag} variant="neutral">{tag}</Badge>)}
                  </div>
                ) : null}
                <div className="mt-2 text-xs text-muted">{question.answers} 回答 · {question.views} 浏览 · {question.updatedAt}</div>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
