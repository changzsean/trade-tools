# MEEKA 部署方案

用户最新决定：保留原 MEEKA 门户，在 /aihot 增加 AI与外贸资讯栏目。根目录是原 Next.js 网站，热点引擎位于 aihot/。不再用整站热点站替换社区首页，也不购买 AWS 服务器。

部署方向为 Vercel（门户、独立 API 和常驻 Daemons）+ Cloudflare（域名解析及私有 R2 附件）+ 托管 PostgreSQL。Daemons 和 HTTP 容器处于 Beta，Hobby daemon 每团队每月 10 Active CPU-hours，额度用尽会暂停，daemon 不支持预览环境。

共享磁盘到 R2 的适配仍在本地验证，尚未包含在本次门户接入提交中；当前引擎的生产部署依旧依赖原 Docker 共享数据目录。后台部署需等 R2 存储、数据库、模型 API 与备份恢复验证齐备后进行。API 与模型密钥只在独立后台项目，门户只配置 AIHOT_API_BASE_URL。

详细接入、状态及验收要求见仓库根目录 docs/aihot-integration.md。旧版完整测试 935 项和 smoke 曾通过；新增门户栏目必须单独验证构建与上线地址。

参考：https://vercel.com/docs/daemons/limits 、https://vercel.com/docs/functions/runtimes/container 、https://developers.cloudflare.com/r2/pricing/ 。
