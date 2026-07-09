import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListingsBoard } from "@/components/community/listings-board";

const matchingTypes = [
  "找货源", "找供应商", "找工厂代工", "找物流货代", "找海外仓",
  "找清关服务", "渠道合作", "拼单采购", "样品打样", "展会搭子",
];

export default function ResourceMatchingPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold tracking-tight">资源对接</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            面向外贸业务的协作型资源广场。发布找货源、找供应商、找物流、找海外仓、渠道合作和拼单采购需求，让社区从内容互动走向真实业务协作。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {matchingTypes.map((type) => (
              <Badge key={type} variant="neutral">{type}</Badge>
            ))}
          </div>
        </Card>
        <ListingsBoard />
      </div>
    </AppShell>
  );
}
