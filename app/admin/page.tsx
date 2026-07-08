import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <AppShell>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Admin CMS</h1>
        <p className="mt-3 text-sm text-muted">审核资源、处理举报、管理订单、配置精选内容和运营活动。</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["资源审核 12", "举报 3", "退款 2", "精选位 6"].map((item) => <Badge key={item} variant="warning">{item}</Badge>)}
        </div>
      </Card>
    </AppShell>
  );
}
