/** 用户模型（产品文档 §5.4 / §12.2） */

export type UserRole = "member" | "creator" | "admin";

export type UserIdentity = "boss" | "operator" | "sales" | "service" | "learner";

export interface UserSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
  level: number;
  role: UserRole;
}

export interface UserProfile extends UserSummary {
  identity: UserIdentity;
  platforms: string[]; // 国际站 / 独立站 / Amazon / TikTok / 其他
  industry?: string;
  goal?: string;
  growthPoints: number;
  streakDays: number;
  createdAt: string;
}
