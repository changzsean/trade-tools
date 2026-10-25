# MEEKA 下一步：邮件、私有存储和备份

截至 2026-10-26，账号与资讯分别位于两个健康的 Supabase 项目。线上异地备份与恢复演练尚未完成；网站部署不会替代数据备份。

运营者本轮已选择：Brevo 发信，基础设施先使用免费额度试运行。不会升级套餐、开通付费服务或提高模型调用限额。

## 邮箱注册和密码恢复

使用会员库 `wyxgvnijcnyxsglpaorf`，不要配置到资讯库。

在 Authentication 的 URL Configuration 核对 Site URL 为 `https://meeka.com.cn`，精确允许 `https://meeka.com.cn/login` 与 `https://meeka.com.cn/reset-password`。网站已经在请求中传递这两个回跳地址，但不能替代控制台允许列表。

核对并配置已选择的 Brevo SMTP 服务，完成发件域名验证，私密填写主机、端口、账号和凭据。不要把密码或密钥发到聊天里。Supabase 默认测试发信服务限制收件人及发信量，不能据此保证任意外贸用户都能注册。

下一次用运营者指定的测试邮箱，验收注册、收信、回到本站、登录、退出、重置密码、旧密码失效与新密码登录。此轮仅做了模拟及数据库回滚验证，没有发真实邮件。

## 私有存储和备份

沿用 Vercel + Cloudflare + Supabase。建议两个独立私有 R2 桶：`meeka-private-uploads`（附件）和 `meeka-db-backups`（备份）。这是待创建方案，尚未核实已有资源，不开放公共访问。

- 上传凭据仅授权上传桶，备份凭据仅授权备份桶，通过 Vercel Secret 分开配置，浏览器不持有这些凭据。
- 数据库保存文件所属用户及对象路径，服务端鉴权后提供短期下载链接。
- 资讯后台已有 `UPLOAD_STORE_*` 和 `DB_BACKUP_STORE_*` 入口及本地恢复测试，可沿用现有每日备份 worker。
- 会员库需另配置每日导出 Auth、public 和相关私有 schema，不能只备份资讯库而遗漏会员身份和同意记录。
- 建议保留每天 7 份、每周 4 份、每月 3 份；需运营者确认后才配置生命周期。
- 配置后恢复到独立测试项目，核对账号、资料关联、资讯和同意记录，并验证跨用户文件访问隔离。

容器 `/tmp`、浏览器 localStorage 和 GitHub 源码不能替代数据库备份。

## 预算

未核实账户当前套餐，没有自行升级或开通付费资源。Vercel 官方 Pro 基础费用为每月 20 美元，另有额外用量及团队席位费用。R2 Standard 官方存储费为每 GB-month 0.015 美元，另有操作费用及免费额度；免费额度不代表绝不会产生费用。Supabase 免费项目应自行定期导出异地备份，付费备份窗口以实际套餐为准。

需要运营者给出每月基础设施总预算和模型每日金额预算，再决定是否升级。DeepSeek 仍保留原有滚动 24 小时 100 次请求上限，没有提高额度；请求数不等于文章数或金额上限。

参考（2026-10-26 核对）：
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/platform/backups
- https://vercel.com/pricing
- https://developers.cloudflare.com/r2/pricing/
