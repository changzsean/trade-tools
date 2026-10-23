# MEEKA 资讯后台（独立 Vercel 项目）

主站继续使用仓库根目录的 Next.js 门户。这里的部署配置只属于独立项目 `meeka-aihot-backend`，不能复制到仓库根目录，也不能覆盖门户的构建设置。

## 生成部署包

在完整的仓库 checkout 中执行 `python3 aihot/cloud/build-deploy.py`。生成的 `aihot/cloud/dist` 只有 API、worker 和运行所需源码，不包含真实 `.env`、密钥、依赖目录或数据库文件。在该目录关联已有后台项目，然后执行 Vercel CLI 的生产部署。不要新建收费资源；后台使用已有 Supabase 项目。

容器采用 Node.js 24、PostgreSQL 客户端、公开的 Supabase CA。API 启动 `scripts/cloud-api.ts`，daemon 启动 `scripts/cloud-worker.ts`。两个入口共用非阻塞数据库初始化锁；迁移完成后导入信源，限制 Supabase 浏览器角色访问后台表。数据库连接统一使用 `verify-full`。

## 环境变量

仅在后台项目 Production 中保存 `DATABASE_URL`、`LLM_API_KEY`、`ADMIN_PASSWORD`、`SESSION_SECRET`、`IMG_PROXY_SIGN_SECRET` 为 Secret。不要放进前端或代码仓库。

DeepSeek 配置为 `LLM_BASE_URL=https://api.deepseek.com/v1`、`LLM_MODEL=deepseek-flash`、`LLM_EXTRA_JSON={"thinking":{"type":"disabled"}}`、`LLM_VISION=false`。`NODE_EXTRA_CA_CERTS=/app/certs/supabase-root.crt` 需要在项目环境变量中设置，确保 API 和 daemon 都载入公开 CA。站点地址是 `SITE_URL=https://meeka.com.cn`。本次试运行通过数据库的 `llm` 预算行共用每日 100 次调用熔断，其他付费服务停用；这是请求数量限制，不是金额上限。

`COLLECT_ENABLED`、`MODEL_CALLS_ENABLED` 在本地测试时必须为 `false`。线上在完成预算配置后才打开。飞书与 IndexNow 开关保持关闭。

主站仅需服务端的 `AIHOT_API_BASE_URL` 指向后台根地址。不要把模型或数据库密钥配置到主站。生产接口仍受 Vercel 登录保护时，必须先由运营者明确授权相应访问设置，再接入主站。

## 私有上传原件

`UPLOAD_STORE_ENDPOINT`、`UPLOAD_STORE_BUCKET`、`UPLOAD_STORE_ACCESS_KEY_ID`、`UPLOAD_STORE_SECRET_ACCESS_KEY` 接入兼容 S3 的私有存储（如 R2），区域默认 `auto`。两个密钥保存为 Secret，bucket 不公开。云端入口强制 `UPLOAD_STORE_REQUIRED=true`，未配置时截图、二维码等上传操作返回错误，禁止写入临时容器磁盘。资讯入库本身不依赖这些上传功能。当前尚未配置 R2，不能声称文件上传或云端备份已完成。

## 验证与故障排查

运行 `node --test tests/cloud-config.standalone.test.ts tests/stored-files.standalone.test.ts` 和 `tsc -p tsconfig.cloud.json`。存储测试只连接本地假服务。

构建 READY 后仍要检查 `/api/health`、未登录管理请求的 401、`heartbeat.worker`、公开资讯接口和实际采集回执。启动失败时，`settings` 中 `cloud-startup.*` 仅记录错误代码、迁移文件名及时间，不保存连接字符串或驱动原始报错。不要把历史错误记录当成当前运行状态，需比较心跳时间。

2026-10-23 修复：迁移 0055 因锁等待留下无效索引；在确认 publications 为空后重建该索引，未改写历史迁移。初始化锁改用 `pg_try_advisory_lock`，避免等待锁的事务快照阻塞并发建索引。worker 的 `SELF_SIGNED_CERT_IN_CHAIN` 通过加载 Supabase CA 并启用证书、主机名校验修复。

CA 来源：Supabase 官方 Studio 的 `ssl:certificate_url` 配置，公开下载地址 `https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt`，有效期至 2031-04-26。该文件是公开证书，不含私钥。
