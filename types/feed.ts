/** 首页信息流模型（产品文档 §6.2 / §6.5） */

import type { UserSummary } from "./user";

export type FeedItemType = "question" | "answer" | "case" | "resource" | "matching" | "growth";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  summary: string;
  author: UserSummary;
  tags: string[];
  stats: {
    upvotes: number;
    comments: number;
    saves: number;
  };
  createdAt: string;
}

export type MatchingCategory =
  | "sourcing"
  | "supplier"
  | "logistics"
  | "warehouse"
  | "partner"
  | "service"
  | "channel"
  | "sample";

export interface MatchingRequest {
  id: string;
  category: MatchingCategory;
  title: string;
  description: string;
  region?: string;
  industry?: string;
  budget?: string;
  deadline?: string;
  contactMethod: string;
  status: "open" | "matched" | "closed";
}
