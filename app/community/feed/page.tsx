import { AppShell } from "@/components/app-shell/app-shell";
import { CommunityBoard } from "@/components/community/community-board";
import { getCommunityFeed } from "@/lib/data/trademind";

export default async function FeedPage() {
  const seed = await getCommunityFeed();
  return (
    <AppShell>
      <CommunityBoard seed={seed} />
    </AppShell>
  );
}
