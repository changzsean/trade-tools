import { ProductCopyAccessGate } from "@/components/product-copy/product-copy-access-gate";
import { ProductCopyPairPanel } from "@/components/product-copy/product-copy-pair-panel";
import { getProductCopyAccessPassword, hasProductCopyAccess } from "@/lib/product-copy/access";

export const dynamic = "force-dynamic";

export default async function ProductCopyPairPage() {
  if (!(await hasProductCopyAccess())) {
    return <ProductCopyAccessGate configured={Boolean(getProductCopyAccessPassword())} />;
  }

  return <ProductCopyPairPanel />;
}
