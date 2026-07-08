import { AppShell } from "@/components/app-shell/app-shell";
import { CommunityFeed } from "@/components/community/community-feed";
import { getCommunityFeed } from "@/lib/data/trademind";

export default async function FeedPage() {
  const posts = await getCommunityFeed();
  return (
    <AppShell>
      <CommunityFeed posts={posts} />
    </AppShell>
  );
}
