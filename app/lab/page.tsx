import { AppShell } from "@/components/app-shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LabPage() {
  return (
    <AppShell>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">AI 实验室</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          运行工作流、测试 Prompt、启动 Agent，并把成功结果保存为团队可复用资源。
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["开发信工作流", "询盘分析 Prompt", "运营助手 Agent"].map((item) => (
            <Card key={item} className="p-4">
              <div className="font-medium">{item}</div>
              <p className="mt-2 text-sm text-muted">带输入表单、运行记录和输出保存能力的实验单元。</p>
              <Button className="mt-4" variant="secondary">打开</Button>
            </Card>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
