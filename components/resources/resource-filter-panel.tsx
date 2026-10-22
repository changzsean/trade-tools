import Link from "next/link";
import { SlidersHorizontal, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { PricingMode, Resource, ResourceType } from "@/types/resource";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface ResourceFilters {
  type?: string;
  pricing?: string;
  tag?: string;
  industry?: string;
}

const typeLabels: Record<ResourceType, string> = {
  course: "课程",
  doc: "文档",
  skill: "Skill",
  workflow: "Workflow",
  prompt: "Prompt",
  agent: "Agent",
  template: "模板",
  playbook: "Playbook",
  case: "案例",
  tool: "工具",
  bundle: "套装",
};

const pricingLabels: Record<PricingMode, string> = {
  free: "免费",
  paid: "付费",
  member_only: "会员",
  limited_free: "限时免费",
  discounted: "折扣",
  coupon_required: "优惠券",
  bundle_included: "套装包含",
  enterprise_only: "企业专属",
};

export function ResourceFilterPanel({
  resources,
  filters,
}: {
  resources: Resource[];
  filters: ResourceFilters;
}) {
  const typeOptions = countBy(resources, "type").map(([value, count]) => ({
    label: typeLabels[value as ResourceType],
    value,
    count,
  }));

  const pricingOptions = countBy(resources, "pricingMode").map(([value, count]) => ({
    label: pricingLabels[value as PricingMode],
    value,
    count,
  }));

  const useCaseOptions = countList(resources.flatMap((resource) => resource.useCases));
  const industryOptions = countList(resources.flatMap((resource) => resource.industryTags));

  const activeCount = [filters.type, filters.pricing, filters.tag, filters.industry].filter(Boolean).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">资源标签筛选</h2>
            {activeCount > 0 ? <Badge>{activeCount} 个条件</Badge> : null}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            按资源类型、销售模式、业务场景和行业标签快速定位内容。筛选条件会同步到 URL，方便收藏和分享。
          </p>
        </div>
        <Link
          href="/resources"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-slate-700 hover:bg-surface-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          重置筛选
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        <FilterRow title="资源类型" param="type" options={typeOptions} filters={filters} />
        <FilterRow title="销售模式" param="pricing" options={pricingOptions} filters={filters} />
        <FilterRow title="业务场景" param="tag" options={useCaseOptions} filters={filters} />
        <FilterRow title="行业标签" param="industry" options={industryOptions} filters={filters} />
      </div>
    </Card>
  );
}

function FilterRow({
  title,
  param,
  options,
  filters,
}: {
  title: string;
  param: keyof ResourceFilters;
  options: FilterOption[];
  filters: ResourceFilters;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)]">
      <div className="pt-1 text-sm font-medium text-slate-600">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = filters[param] === option.value;
          return (
            <Link
              key={`${param}-${option.value}`}
              href={`/resources?${buildFilterQuery(filters, param, option.value)}`}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition",
                active
                  ? "border-brand bg-brand text-white shadow-sm"
                  : "border-border bg-surface-muted text-slate-600 hover:border-blue-200 hover:bg-brand-soft hover:text-brand",
              )}
            >
              <span>{option.label}</span>
              {option.count ? (
                <span className={cn("text-xs", active ? "text-white/80" : "text-slate-400")}>{option.count}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function buildFilterQuery(filters: ResourceFilters, key: keyof ResourceFilters, value: string) {
  const params = new URLSearchParams();
  const nextFilters: ResourceFilters = { ...filters, [key]: filters[key] === value ? undefined : value };

  Object.entries(nextFilters).forEach(([entryKey, entryValue]) => {
    if (entryValue) params.set(entryKey, entryValue);
  });

  return params.toString();
}

function countBy(resources: Resource[], key: "type" | "pricingMode") {
  return Array.from(
    resources.reduce((counts, resource) => {
      counts.set(resource[key], (counts.get(resource[key]) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()),
  );
}

function countList(values: string[]): FilterOption[] {
  return Array.from(
    values.reduce((counts, value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()),
  ).map(([value, count]) => ({ label: value, value, count }));
}
