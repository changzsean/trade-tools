import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";

export default function PartnersPage() {
  return (
    <AppShell>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">成长伙伴匹配</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          根据角色、行业、AI 水平、城市和每周可投入时间匹配学习伙伴。MVP 阶段会先提供人工审核的高质量匹配池。
        </p>
      </Card>
    </AppShell>
  );
}
