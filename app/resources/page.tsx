import { AppShell } from "@/components/app-shell/app-shell";
import { ResourceFilterPanel, type ResourceFilters } from "@/components/resources/resource-filter-panel";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { Card } from "@/components/ui/card";
import { getFeaturedResources } from "@/lib/data/trademind";
import type { Resource } from "@/types/resource";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<ResourceFilters>;
}) {
  const filters = await searchParams;
  const resources = await getFeaturedResources();
  const filteredResources = filterResources(resources, filters);
  const activeFilterText = getActiveFilterText(filters);

  return (
    <AppShell>
      <div className="space-y-5">
        <Card className="p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">统一资源市场</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              课程、文档、Skills、Workflow、Prompt、Agent、模板与案例使用同一资源模型。通过标签筛选快速定位业务场景、行业方向和购买方式。
            </p>
          </div>
        </Card>
        <ResourceFilterPanel resources={resources} filters={filters} />
        <ResourceGrid
          resources={filteredResources}
          title={activeFilterText ? `筛选结果：${activeFilterText}` : "全部资源"}
          description={`当前展示 ${filteredResources.length} / ${resources.length} 个资源`}
        />
      </div>
    </AppShell>
  );
}

function filterResources(resources: Resource[], filters: ResourceFilters) {
  return resources.filter((resource) => {
    if (filters.type && resource.type !== filters.type) return false;
    if (filters.pricing && resource.pricingMode !== filters.pricing) return false;
    if (filters.tag && !resource.useCases.includes(filters.tag)) return false;
    if (filters.industry && !resource.industryTags.includes(filters.industry)) return false;
    return true;
  });
}

function getActiveFilterText(filters: ResourceFilters) {
  return [filters.type, filters.pricing, filters.tag, filters.industry].filter(Boolean).join(" / ");
}
