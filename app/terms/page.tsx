import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell/app-shell";

export const metadata: Metadata = { title: "会员服务协议 | MEEKA", alternates: { canonical: "https://meeka.com.cn/terms" } };

export default function TermsPage() {
  return <AppShell><article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-white p-6 leading-8 md:p-10">
    <header><h1 className="text-2xl font-semibold">会员服务协议</h1><p className="mt-2 text-sm text-muted">版本：2026-10-26 · 运营主体：meka编辑部</p></header>
    <section><h2 className="text-lg font-semibold">服务范围</h2><p>MEEKA 为工厂、外贸公司的业务员和负责人提供资讯阅读、免费的邮箱会员账号、个人公开资料和会员社区。成长功能和资源目录尚属预览的部分会明确标注；未接入的功能不构成收费权益或交付承诺。</p></section>
    <section><h2 className="text-lg font-semibold">资讯与工具</h2><p>资讯栏目发布 meeka编辑部 独立整理的中文编辑稿，保留原始来源链接及日期。阅读信息和使用工具输出时，请核验适用条件及最新变化；涉及交易、合规或专业决策时，寻求适当专业支持。</p></section>
    <section><h2 className="text-lg font-semibold">账号与社区内容</h2><p>请妥善保管账号，不冒用他人身份。发布内容时应具备必要权利，避免公开客户名单、商业秘密、个人敏感信息或无权传播的材料。运营者可处理侵权、垃圾信息、违法内容和明显虚假内容。</p></section>
    <section><h2 className="text-lg font-semibold">资料处理与账号注销</h2><p>资料用途、可见范围、托管地区和保留安排见<Link className="text-brand underline" href="/privacy">隐私说明</Link>。如需访问、更正、导出资料或申请注销，请通过下方邮箱联系；处理前会核实请求者身份。暂不提供自助注销，不承诺尚未实现的自动删除或恢复能力。</p></section>
    <section><h2 className="text-lg font-semibold">联系与更新</h2><p>服务及数据相关问题请联系 <a className="text-brand underline" href="mailto:newsletter@hitacit.com">newsletter@hitacit.com</a>。协议调整时会更新本页版本；账号注册时保存同意的版本和时间。</p></section>
  </article></AppShell>;
}
