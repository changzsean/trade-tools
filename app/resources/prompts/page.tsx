import { AppShell } from "@/components/app-shell/app-shell";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { getFeaturedResources } from "@/lib/data/trademind";

export default async function PromptsPage() {
  const resources = await getFeaturedResources();
  return <AppShell><ResourceGrid resources={resources.filter((resource) => resource.type !== "agent")} title="Prompt 与模板资源" /></AppShell>;
}
