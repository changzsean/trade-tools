import { SectionHeading } from "@/components/common/section-heading";
import { ResourceCard } from "@/components/resources/resource-card";
import { Card } from "@/components/ui/card";
import type { Resource } from "@/types/resource";

export function ResourceGrid({
  resources,
  title = "为你推荐",
  description,
}: {
  resources: Resource[];
  title?: string;
  description?: string;
}) {
  return (
    <section>
      <SectionHeading title={title} description={description} href="/resources" actionLabel="查看全部" />
      {resources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      ) : (
        <Card className="flex min-h-[220px] items-center justify-center p-6 text-center">
          <div>
            <div className="font-semibold">没有匹配的资源</div>
            <p className="mt-2 text-sm text-muted">换一个标签组合，或重置筛选查看全部内容。</p>
          </div>
        </Card>
      )}
    </section>
  );
}
