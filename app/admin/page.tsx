import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <AppShell>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">管理功能筹备中</h1>
        <p className="mt-3 text-sm text-muted">资源审核、举报处理和订单管理尚未接入。本页不展示真实管理数据。</p>
      </Card>
    </AppShell>
  );
}
