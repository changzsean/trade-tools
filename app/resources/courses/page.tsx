import { AppShell } from "@/components/app-shell/app-shell";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { getFeaturedResources } from "@/lib/data/trademind";

export default async function CoursesPage() {
  const resources = (await getFeaturedResources()).filter((resource) => resource.type === "course" || resource.type === "case");
  return <AppShell><ResourceGrid resources={resources} title="课程与案例" /></AppShell>;
}
