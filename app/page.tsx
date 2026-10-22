import Link from "next/link";
import { Factory, Handshake, PackageSearch, Truck } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { RightRail } from "@/components/app-shell/right-rail";
import { CommunityBoard } from "@/components/community/community-board";
import { SectionHeading } from "@/components/common/section-heading";
import { Card } from "@/components/ui/card";
import { getCommunityFeed } from "@/lib/data/trademind";

const matchingItems = [
  { icon: PackageSearch, title: "找货源", desc: "发布采购需求，匹配供货方", href: "/community/resource-matching" },
  { icon: Factory, title: "找供应商", desc: "工厂、档口、代工伙伴", href: "/community/resource-matching" },
  { icon: Truck, title: "找物流仓配", desc: "货代、海外仓、清关资源", href: "/community/resource-matching" },
  { icon: Handshake, title: "求合作", desc: "联名开发、拼单、渠道互换", href: "/community/resource-matching" },
];

/**
 * 首页 = 知乎式真实信息流（产品文档 §4.2 / §6）
 * 资源对接快捷入口 + 真实社区广场（CommunityBoard 接 Supabase）
 */
export default async function HomePage() {
  const seed = await getCommunityFeed();

  return (
    <AppShell rightRail={<RightRail />}>
      <div className="space-y-5">
        <section>
          <SectionHeading
            title="社区互动"
            description="动态、问答、组队和资源对接放在同一个协作场景里"
            href="/community/feed"
          />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {matchingItems.map((item) => (
              <Link key={item.title} href={item.href} className="block">
                <Card className="min-h-[108px] p-4 transition-colors hover:border-border-strong">
                  <div className="flex h-full items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-slate-700">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="whitespace-nowrap text-base font-semibold leading-6 text-foreground">{item.title}</div>
                      <div className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{item.desc}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <CommunityBoard seed={seed} />
      </div>
    </AppShell>
  );
}
