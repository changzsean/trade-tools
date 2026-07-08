import { AppShell } from "@/components/app-shell/app-shell";
import { RightRail } from "@/components/app-shell/right-rail";
import { CommunityFeed } from "@/components/community/community-feed";
import { PublishBox } from "@/components/feed/publish-box";
import { getCommunityFeed } from "@/lib/data/trademind";

/**
 * 首页 = 知乎式真实信息流（产品文档 §4.2 / §6）
 * 不做营销落地页：发布入口 + 推荐 Feed；成长/资源等入口在导航和右栏。
 */
export default async function HomePage() {
  const posts = await getCommunityFeed();

  return (
    <AppShell rightRail={<RightRail />}>
      <div className="space-y-5">
        <PublishBox />
        <CommunityFeed posts={posts} />
      </div>
    </AppShell>
  );
}
