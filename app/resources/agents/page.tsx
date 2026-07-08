import { AppShell } from "@/components/app-shell/app-shell";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { getFeaturedResources } from "@/lib/data/trademind";

export default async function AgentsPage() {
  const resources = (await getFeaturedResources()).filter((resource) => resource.type === "agent");
  return <AppShell><ResourceGrid resources={resources} title="AI Agent" /></AppShell>;
}
