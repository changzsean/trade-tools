import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell/app-shell";

export const metadata: Metadata = { title: "隐私说明 | MEEKA", alternates: { canonical: "https://meeka.com.cn/privacy" } };

export default function PrivacyPage() {
  return <AppShell><article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-white p-6 leading-8 md:p-10">
    <header><h1 className="text-2xl font-semibold">隐私说明</h1><p className="mt-2 text-sm text-muted">版本：2026-10-26 · 运营主体：meka编辑部</p></header>
    <section><h2 className="text-lg font-semibold">账号与公开资料</h2><p>邮箱与认证凭据由 Supabase Auth 处理，用于注册、验证、登录和密码恢复，网站业务表不保存明文密码。用户名、显示名、头像链接、个人简介、角色和注册时的协议同意记录保存在会员数据库。用户名、显示名、简介、头像及内容署名可能被其他用户或访客看见；认证邮箱不通过公开资料接口展示。</p></section>
    <section><h2 className="text-lg font-semibold">内容与工具资料</h2><p>帖子、问答、需求及评论按照所在板块的访问范围展示；私人收藏只允许所属账号读取。搬品工具等功能按实际页面提示保存运行资料；仅存于浏览器的资料在清理浏览器或换设备后可能丢失。注册不会默认订阅营销邮件。</p></section>
    <section><h2 className="text-lg font-semibold">会话与模型服务</h2><p>认证会话保存在浏览器中。托管服务处理基础访问和错误记录，用于运行及安全排查。新闻编辑后台使用 DeepSeek 处理采集的公开资料；会员工具若向模型服务发送业务内容，会在实际使用前说明服务商及传输范围。</p></section>
    <section><h2 className="text-lg font-semibold">托管服务和地区</h2><p>会员数据库及认证由 Supabase 托管，当前区域为美国东部；网站由 Vercel 托管，可能涉及跨境数据处理。Cloudflare 的具体职责以实际启用资源为准；尚未启用的 R2 存储不构成持久化或备份保障。</p></section>
    <section><h2 className="text-lg font-semibold">保留、更正、导出和删除</h2><p>账号资料拟保留至用户请求注销或服务终止。请通过联系邮箱申请访问、更正、导出或删除资料，我们会先核实身份。删除时需评估关联业务、公开内容、法定保留要求及备份保留周期。当前尚无自助注销入口、固定处理时限或完整备份保留方案，不作自动删除或恢复保证。</p></section>
    <section><h2 className="text-lg font-semibold">联系我们</h2><p>数据相关问题请联系 <a className="text-brand underline" href="mailto:newsletter@hitacit.com">newsletter@hitacit.com</a>。相关服务范围见<Link className="text-brand underline" href="/terms">会员服务协议</Link>。</p></section>
  </article></AppShell>;
}
