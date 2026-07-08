import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const matchingTypes = [
  "找货源",
  "找供应商",
  "找工厂代工",
  "找物流货代",
  "找海外仓",
  "找清关服务",
  "渠道合作",
  "拼单采购",
  "样品打样",
  "展会搭子",
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
              <Badge key={type} variant="neutral">
                {type}
              </Badge>
            ))}
          </div>
        </Card>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["采购对接", "发布目标产品、规格、预算、起订量和交期。"],
            ["供应商招募", "说明产能、认证、优势品类和可合作地区。"],
            ["服务商协作", "对接货代、清关、海外仓、拍摄、翻译和展会服务。"],
          ].map(([title, desc]) => (
            <Card key={title} className="p-5">
              <div className="text-lg font-semibold">{title}</div>
              <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
              <Button className="mt-5" variant="secondary">
                发布需求
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
