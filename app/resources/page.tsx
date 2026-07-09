import { BookOpen, Download, FileText, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { ResourceFilterPanel, type ResourceFilters } from "@/components/resources/resource-filter-panel";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { Card } from "@/components/ui/card";
import { getFeaturedResources } from "@/lib/data/trademind";
import type { Resource } from "@/types/resource";

const manuals = [
  { icon: BookOpen, title: "外贸实战手册", desc: "从 0 到 1 的独立站/平台运营全流程", href: "/manuals/field-manual.html" },
  { icon: FileText, title: "账号运营手册", desc: "多平台账号搭建、养号与合规要点", href: "/manuals/account-manual.html" },
  { icon: FileText, title: "冠军选品手册", desc: "选品方法论、爆款拆解与验证清单", href: "/manuals/champion-manual.html" },
  { icon: Wrench, title: "AI 外贸工具库", desc: "常用 AI 工具清单与使用场景速查", href: "/manuals/trade-tools.html" },
];

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
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">手册与工具（免费下载）</h2>
          </div>
          <p className="mt-1 text-sm text-muted">MEEKA 原创外贸手册，注册会员免费在线阅读。</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {manuals.map((m) => (
              <a key={m.title} href={m.href} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="h-full min-h-[112px] p-4 transition-colors hover:border-border-strong">
                  <div className="flex h-full items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-slate-700">
                      <m.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold leading-6 text-foreground">{m.title}</div>
                      <div className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{m.desc}</div>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
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
