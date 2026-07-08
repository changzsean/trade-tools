import { Badge } from "@/components/ui/badge";
import type { PricingMode } from "@/types/resource";

const labels: Record<PricingMode, string> = {
  free: "免费",
  paid: "付费",
  member_only: "会员",
  limited_free: "限免",
  discounted: "折扣",
  coupon_required: "优惠券",
  bundle_included: "套装",
  enterprise_only: "企业",
};

export function PricingModeBadge({ mode }: { mode: PricingMode }) {
  const variant = mode === "free" || mode === "limited_free" ? "success" : mode === "discounted" ? "warning" : "default";
  return <Badge variant={variant}>{labels[mode]}</Badge>;
}
