import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PricingModeBadge } from "@/components/resources/pricing-mode-badge";
import type { Resource } from "@/types/resource";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link href={`/resources/${resource.slug}`} className="block h-full">
      <Card className="group flex h-full min-h-[326px] flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="h-24 border-b border-border bg-[linear-gradient(135deg,#eaf0ff,#ffffff_55%,#eefdf7)] p-4">
          <div className="flex items-center justify-between">
            <Badge>{resource.type}</Badge>
            <PricingModeBadge mode={resource.pricingMode} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start gap-3">
            <h3 className="line-clamp-2 flex-1 text-base font-semibold leading-6">{resource.title}</h3>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand" />
          </div>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted">{resource.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...resource.useCases, ...resource.industryTags].slice(0, 4).map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs font-medium text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pt-5 text-sm">
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star className="h-4 w-4 fill-current" /> {resource.ratingAverage}
            </span>
            <span className="text-muted">{resource.usageCount.toLocaleString()} 人使用</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
