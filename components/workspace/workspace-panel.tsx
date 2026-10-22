"use client";

/**
 * 工作台真实数据面板
 * - 头部：读当前用户 profile（等级 / 成长值）
 * - 我的发布：读当前用户在 posts / listings 的真实内容
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSupabase, SUPABASE_READY } from "@/lib/supabase/client";

type Profile = { display_name: string | null; reputation: number | null };
type MyPost = { id: string; title: string; type: string; created_at: string };
type MyListing = { id: string; title: string; kind: string; created_at: string };

export function WorkspacePanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [listings, setListings] = useState<MyListing[]>([]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const [{ data: p }, { data: ps }, { data: ls }] = await Promise.all([
          sb.from("profiles").select("display_name,reputation").eq("id", uid).single(),
          sb.from("posts").select("id,title,type,created_at").eq("author_id", uid).order("created_at", { ascending: false }).limit(20),
          sb.from("listings").select("id,title,kind,created_at").eq("author_id", uid).order("created_at", { ascending: false }).limit(20),
        ]);
        setProfile((p as Profile) ?? null);
        setPosts((ps as MyPost[]) ?? []);
        setListings((ls as MyListing[]) ?? []);
      }
    });
  }, []);

  const points = profile?.reputation ?? 0;
  const level = Math.max(1, Math.floor(points / 500) + 1);

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">工作台</h1>
            <p className="mt-2 text-sm text-muted">
              集中管理收藏资源、学习笔记、我的发布、已购内容和 AI Lab 运行结果。
            </p>
          </div>
          {SUPABASE_READY && userId ? (
            <div className="flex gap-2">
              <Badge variant="neutral">Lv.{level}</Badge>
              <Badge variant="neutral">成长值 {points.toLocaleString("zh-CN")}</Badge>
            </div>
          ) : null}
        </div>
      </Card>

      {SUPABASE_READY && userId ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">我的发布</h2>
          {posts.length === 0 && listings.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              你还没有发布内容。去<Link href="/community/feed" className="text-brand">社区广场</Link>分享经验，或在
              <Link href="/community/resource-matching" className="text-brand">资源对接</Link>发布需求。
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {posts.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
                  <span className="min-w-0 truncate text-sm">{p.title}</span>
                  <span className="ml-3 shrink-0 text-xs text-muted">{new Date(p.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
              ))}
              {listings.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
                  <span className="min-w-0 truncate text-sm">
                    <Badge variant="neutral">需求</Badge> <span className="ml-2">{l.title}</span>
                  </span>
                  <span className="ml-3 shrink-0 text-xs text-muted">{new Date(l.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6 text-sm text-muted">
          登录后，这里会显示你真实的等级、发布和学习数据。
        </Card>
      )}
    </>
  );
}
