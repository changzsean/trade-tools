import { AppShell } from "@/components/app-shell/app-shell";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { getFeaturedResources } from "@/lib/data/trademind";

export default async function WorkflowsPage() {
  const resources = (await getFeaturedResources()).filter((resource) => resource.type === "workflow" || resource.type === "skill");
  return <AppShell><ResourceGrid resources={resources} title="工作流与 Skills" /></AppShell>;
}
