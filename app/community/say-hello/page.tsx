import { AppShell } from "@/components/app-shell/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Meeka } from "@/components/meeka/meeka";
import { SayHelloComposer } from "@/components/community/say-hello-composer";

/** 自我介绍（博客式信息流）—— 参考 Say Hello 空间：一条条成员自我介绍帖 */

type Intro = {
  id: string;
  name: string;
  initials: string;
  headline: string;
  city: string;
  product: string;
  market: string;
  offer: string;
  seeking: string;
  tags: string[];
  createdAt: string;
  likes: number;
  comments: number;
};

const INTROS: Intro[] = [
  {
    id: "intro-1",
    name: "常征 Sean",
    initials: "常",
    headline: "MEEKA 主理人 · 国际站操盘 8 年",
    city: "深圳",
    product: "工业设备配件、新能源周边",
    market: "欧洲、北美 B2B",
    offer: "AI 询盘复盘、P4P 诊断、外贸增长方法论",
    seeking: "想一起打磨 Skills 的运营与业务伙伴",
    tags: ["国际站", "AI提效", "新能源"],
    createdAt: "2 天前",
    likes: 48,
    comments: 12,
  },
  {
    id: "intro-2",
    name: "Lucy 运营达人",
    initials: "Lu",
    headline: "国际站运营 · 关键词与详情页",
    city: "杭州",
    product: "家居用品、宠物用品",
    market: "北美、澳洲",
    offer: "关键词聚类、标题重写、详情页转化经验",
    seeking: "AI 开发信工作流的实战案例",
    tags: ["运营", "详情页", "关键词"],
    createdAt: "3 天前",
    likes: 33,
    comments: 8,
  },
  {
    id: "intro-3",
    name: "阿杰 Kevin",
    initials: "Ke",
    headline: "外贸业务员 · 入行 1 年",
    city: "宁波",
    product: "汽配、五金工具",
    market: "中东、东南亚",
    offer: "一线跟进的真实反馈，愿意做 Skills 试用",
    seeking: "询盘分级和报价跟进的模板",
    tags: ["新人成长", "汽配", "跟进"],
    createdAt: "5 天前",
    likes: 21,
    comments: 6,
  },
];

export default function SayHelloPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        {/* 页头 */}
        <Card className="flex flex-wrap items-center gap-4 p-6">
          <Meeka state="cheer" size={72} alt="Meeka 欢迎" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">自我介绍 · Say Hello</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              到这里发一条自我介绍，让社区认识你——你做什么产品、主打哪个市场、能提供什么、正在找什么。
              介绍越具体，越容易被对的人看到、被推荐给对的资源。
            </p>
          </div>
        </Card>

        {/* 模板发布框 */}
        <SayHelloComposer />

        {/* 信息流 */}
        <div className="space-y-4">
          {INTROS.map((it) => (
            <Card key={it.id} className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {it.initials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{it.name}</span>
                    <Badge variant="neutral">{it.city}</Badge>
                    <span className="text-xs text-muted">{it.createdAt}</span>
                  </div>
                  <div className="text-sm text-muted">{it.headline}</div>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <IntroRow label="主营产品" value={it.product} />
                <IntroRow label="主打市场" value={it.market} />
                <IntroRow label="我能提供" value={it.offer} />
                <IntroRow label="正在寻找" value={it.seeking} />
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {it.tags.map((t) => (
                  <Badge key={t} variant="neutral"># {t}</Badge>
                ))}
              </div>
              <div className="mt-4 flex gap-5 text-sm text-muted">
                <span>👍 {it.likes}</span>
                <span>💬 欢迎 {it.comments}</span>
                <span>🤝 想认识</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function IntroRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted p-3">
      <dt className="text-xs font-semibold text-brand">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-foreground">{value}</dd>
    </div>
  );
}
