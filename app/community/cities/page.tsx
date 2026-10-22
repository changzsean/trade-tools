import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function CitiesPage() {
  const cities = ["深圳", "杭州", "广州", "宁波", "上海", "义乌"];
  return (
    <AppShell>
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">同城交流</h1>
        <p className="mt-3 text-sm text-muted">连接本地外贸人、线下沙龙、行业小组和城市资源共创。</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {cities.map((city) => <Badge key={city} variant="neutral">{city}</Badge>)}
        </div>
      </Card>
    </AppShell>
  );
}
