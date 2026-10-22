import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTeamOpportunities } from "@/lib/data/trademind";

export default async function TeamsPage() {
  const teams = await getTeamOpportunities();
  return (
    <AppShell>
      <div className="space-y-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold">{team.title}</h1>
                <p className="mt-2 text-sm text-muted">{team.goal}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {team.roles.map((role) => <Badge key={role} variant="neutral">{role}</Badge>)}
                </div>
              </div>
              <div className="text-sm text-muted">{team.city} · {team.capacity} · {team.duration}</div>
            </div>
            <Button className="mt-5">申请加入</Button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
