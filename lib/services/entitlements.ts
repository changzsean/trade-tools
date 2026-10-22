import type { Resource, ResourceEntitlement } from "@/types/resource";

export function resolveResourceEntitlement(resource: Resource): ResourceEntitlement {
  if (resource.pricingMode === "free") {
    return { canView: true, canUse: true, canDownload: true, canRemix: true, reason: "free" };
  }

  if (resource.pricingMode === "limited_free") {
    return { canView: true, canUse: true, canDownload: false, canRemix: true, reason: "limited_free" };
  }

  if (resource.pricingMode === "member_only") {
    return { canView: true, canUse: false, canDownload: false, canRemix: false, reason: "membership" };
  }

  return { canView: true, canUse: false, canDownload: false, canRemix: false, reason: "purchase" };
}
