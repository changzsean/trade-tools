# MEEKA 上线方案

建议：GitHub 保存源码，一台云服务器通过现有 Docker Compose 运行整站。初期网站、API、采集 worker、PostgreSQL 放在一起，Caddy 提供 HTTPS。原 Vercel 项目保留，等新站验证完成后再切换 meeka.com.cn。

## 两种方案

| 方案 | 运行方式 | 适用情况 |
|---|---|---|
| 推荐：整站 Docker | 云服务器运行现有 web、api、worker、PostgreSQL、Caddy | 与仓库现成部署方式一致，维护入口少 |
| 保留 Vercel 网页 | Vercel 运行网页，云服务器运行 API、worker、PostgreSQL | 有明确的 Vercel 前端需求，接受额外的适配与跨服务配置 |

当前 Vercel 是 Hobby；其 Cron 每个任务最低每日一次，不能直接承接本应用的常驻队列 worker。升级 Cron 频率也不能替代现有 worker 的运行方式。

## 推荐资源与费用

建议起步使用 Linux x86_64、2 vCPU、4 GB 内存、80 GB SSD，Ubuntu LTS。4 GB 是初期部署建议，尚未做生产容量测试；后续按内存、队列积压和磁盘增长决定扩容。

2026-10-22核对的两个标准价参考：

- AWS Lightsail：带公网IPv4的4 GB Linux套餐为24美元/月，2 vCPU、80 GB SSD。地区优先考虑新加坡，购买时核对该地区实际可选套餐和价格。
- DigitalOcean Basic Regular：2 vCPU、4 GiB、80 GiB SSD标准价24美元/月。

服务器和少量异地备份可先按约30美元/月规划，这是预算建议，不是服务商完整账单报价；模型API、税费、额外存储和超额流量另计。API由用户自行配置，先设预算并小批量跑通，再扩大信源。

来源：
- https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-bundles.html
- https://www.digitalocean.com/pricing/droplets
- https://vercel.com/docs/cron-jobs/usage-and-pricing

## 实施顺序

1. 用户选择服务商、确认月费并创建服务器。提供服务器IP和已配置SSH别名，不发送密码或私钥。
2. 部署现有Docker服务；生成后端管理员与签名密钥，数据库仅在内部网络开放。先使用临时域名验证HTTPS、管理登录、资讯接口与队列。
3. 按.env.example和docs/model-setup.md填写模型API，启用采集与模型开关。处理第一批真实资讯，检查摘要、原文日期和分类，再观察精选、热点与日报。
4. 配置数据库及附件的异地备份，并做一次恢复验证。
5. 用户确认使用规则和隐私说明后，将meeka.com.cn切向已验证的新站；保留原Vercel部署供回退。

## 上线验收

- /all有真实资讯，原文链接和发布日期可核对；没有材料时明确说明状态。
- 精选与多源热点由实际处理结果生成，不承诺每个时段都必有热点。
- 采集与队列可持续运行，预算与错误可在后台核对。
- npm run typecheck、npm test、构建和smoke通过；生产地址再运行smoke。
- 备份可恢复，运营主体和联系方式已填写并由用户确认。

当前尚未购买或创建云服务器，也未切换正式域名。
