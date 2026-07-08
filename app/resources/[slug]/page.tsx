import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { PricingModeBadge } from "@/components/resources/pricing-mode-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFeaturedResources, getResourceBySlug } from "@/lib/data/trademind";
import { resolveResourceEntitlement } from "@/lib/services/entitlements";

export async function generateStaticParams() {
  const resources = await getFeaturedResources();
  return resources.map((resource) => ({ slug: resource.slug }));
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();
  const entitlement = resolveResourceEntitlement(resource);

  return (
    <AppShell>
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Badge>{resource.type}</Badge>
                <PricingModeBadge mode={resource.pricingMode} />
                <Badge variant="neutral">v{resource.version}</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">{resource.title}</h1>
              <p className="mt-3 text-base leading-7 text-muted">{resource.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {resource.tags.map((tag) => <Badge key={tag} variant="neutral">{tag}</Badge>)}
              </div>
            </div>
            <Card className="w-full p-4 sm:w-[280px]">
              <div className="text-sm text-muted">访问状态</div>
              <div className="mt-2 text-lg font-semibold">{entitlement.canUse ? "可直接使用" : "需要解锁"}</div>
              <div className="mt-3 text-2xl font-semibold">
                {resource.priceCents === 0 ? "免费" : `¥${resource.priceCents / 100}`}
              </div>
              {resource.originalPriceCents ? (
                <div className="text-sm text-muted line-through">¥{resource.originalPriceCents / 100}</div>
              ) : null}
              <Button className="mt-4 w-full">{entitlement.canUse ? "打开资源" : "解锁资源"}</Button>
            </Card>
          </div>
        </Card>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="p-5">
            <h2 className="font-semibold">资源内容</h2>
            <div className="mt-4 space-y-3">
              {(resource.includedItems ?? resource.useCases).map((item, index) => (
                <div key={item} className="rounded-lg border border-border p-4">
                  <div className="text-sm font-medium">{index + 1}. {item}</div>
                  <p className="mt-1 text-sm text-muted">包含可复用说明、执行步骤、检查标准和团队协作建议。</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold">创作者</h2>
            <div className="mt-4 flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {resource.creator.avatarInitials}
              </div>
              <div>
                <div className="font-medium">{resource.creator.name}</div>
                <div className="text-sm text-muted">{resource.creator.title}</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-surface-muted p-3"><b>{resource.ratingAverage}</b><div className="text-xs text-muted">评分</div></div>
              <div className="rounded-lg bg-surface-muted p-3"><b>{resource.usageCount}</b><div className="text-xs text-muted">使用</div></div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
