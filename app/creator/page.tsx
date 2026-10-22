import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";

export default function CreatorPage() {
  return (
    <AppShell>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["本月收入", "¥12,860", "来自课程、工作流与 Agent 模板"],
          ["资源转化", "8.7%", "详情页到解锁的综合转化"],
          ["待处理评价", "14", "需要回复或转为版本优化任务"],
        ].map(([label, value, detail]) => (
          <Card key={label} className="p-5">
            <div className="text-sm text-muted">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
            <p className="mt-2 text-sm text-muted">{detail}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
