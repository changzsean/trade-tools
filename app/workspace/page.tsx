import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";

export default function WorkspacePage() {
  return (
    <AppShell>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">工作台</h1>
        <p className="mt-3 text-sm text-muted">集中管理收藏资源、学习笔记、团队项目、内部资源库和 AI Lab 运行结果。</p>
      </Card>
    </AppShell>
  );
}
