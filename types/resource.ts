export type ResourceType =
  | "course"
  | "doc"
  | "skill"
  | "workflow"
  | "prompt"
  | "agent"
  | "template"
  | "playbook"
  | "case"
  | "tool"
  | "bundle";

export type PricingMode =
  | "free"
  | "paid"
  | "member_only"
  | "limited_free"
  | "discounted"
  | "coupon_required"
  | "bundle_included"
  | "enterprise_only";

export interface CreatorProfile {
  id: string;
  name: string;
  title: string;
  avatarInitials: string;
  verified: boolean;
}

export interface Resource {
  id: string;
  slug: string;
  type: ResourceType;
  title: string;
  subtitle: string;
  description: string;
  status: "draft" | "in_review" | "published" | "archived";
  visibility: "public" | "unlisted" | "private" | "team";
  creator: CreatorProfile;
  pricingMode: PricingMode;
  priceCents: number;
  originalPriceCents?: number;
  currency: "CNY" | "USD";
  memberTierRequired?: "pro" | "team" | "enterprise";
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  useCases: string[];
  industryTags: string[];
  ratingAverage: number;
  ratingCount: number;
  usageCount: number;
  version: string;
  durationLabel: string;
  updatedAt: string;
  includedItems?: string[];
}

export interface ResourceEntitlement {
  canView: boolean;
  canUse: boolean;
  canDownload: boolean;
  canRemix: boolean;
  reason:
    | "free"
    | "purchase"
    | "membership"
    | "team"
    | "bundle"
    | "coupon"
    | "limited_free"
    | "owner"
    | "admin"
    | "denied";
}
