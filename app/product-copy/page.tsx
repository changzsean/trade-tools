import { AppShell } from "@/components/app-shell/app-shell";
import { ProductCopyAccessGate } from "@/components/product-copy/product-copy-access-gate";
import { ProductCopyPanel } from "@/components/product-copy/product-copy-panel";
import { getProductCopyAccessPassword, hasProductCopyAccess } from "@/lib/product-copy/access";

export const dynamic = "force-dynamic";

export default async function ProductCopyPage() {
  const hasAccess = await hasProductCopyAccess();

  return (
    <AppShell>
      {hasAccess ? <ProductCopyPanel /> : <ProductCopyAccessGate configured={Boolean(getProductCopyAccessPassword())} />}
    </AppShell>
  );
}
