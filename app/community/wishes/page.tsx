import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";
import { Meeka } from "@/components/meeka/meeka";
import { WishesBoard } from "@/components/community/wishes-board";

export default function WishesPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <Card className="flex flex-wrap items-center gap-4 p-6">
          <Meeka state="discover" size={64} alt="Meeka" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">许愿池</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              说出你最想要的 Skill、工具或选题。票数高的，官方优先开发——社区共创路线图。
            </p>
          </div>
        </Card>
        <WishesBoard />
      </div>
    </AppShell>
  );
}
