# MEEKA AI与外贸资讯栏目

当前架构（2026-10-26）：GitHub 保存源码；Vercel 的 `trade-tools-esox` 提供原网站及 `/aihot`，`meeka-aihot-backend` 的 API 容器和 daemon worker 负责采集、模型处理和发布。资讯保存在 Supabase 项目 `nuchdxuebtcgzzsvbbkb`；原会员及社区保存在 `wyxgvnijcnyxsglpaorf`，本轮已恢复。没有把两个库混为一个。

## 读者入口

- `/aihot` 默认按本站编辑更新时间排列，显示本站更新和来源发布时间。
- `?order=source` 切回原时间线排序；分类、检索与分页保留排序。
- `?view=hot` 展示多来源热点；`?view=daily` 展示最新日报。
- `/aihot/items/:id` 在站内阅读编辑部独立整理的中文稿，作者为 meeka编辑部，底部保留原始来源链接。不是未经授权照搬完整第三方原文。
- 电脑导航、侧栏及手机导航保留原网站栏目并提供资讯入口。

主站只通过服务端变量 `AIHOT_API_BASE_URL=https://meeka-aihot-backend.vercel.app` 读取公开 API。主站不持有资讯数据库/模型密钥，读者访问不触发模型。

## 更新与部署

信源抓取间隔与发布额度由后台控制；页面每 5 分钟检查已发布更新，切回页面也会检查，支持立即刷新。不要把页面检查频率当作新闻生成频率。

后台 `/api/site/pool?order=updated` 按编辑内容更新时间排序；不提供 order 时保留原有 timeline 排序。查询和分页经过同一 publication 读取层，撤回和延迟发布规则不变。

后台 release `20261026-site-updates1` 已运行。主站的会员库保持原有 URL 与公开客户端 key；不要把 DeepSeek key 或资讯数据库 URI 放进 NEXT_PUBLIC 变量。

Cloudflare R2 的私有上传及异地备份尚未核实开通，不能写成已经接入。临时磁盘与浏览器 localStorage 不是备份。实际配置方案见 `production-storage-plan.md`。

## 本轮验证

主站 typecheck、6 项测试、生产构建及线上 15 个入口与编辑稿 smoke 通过。资讯后台 typecheck、947 项数据库/接口测试通过；框架网页构建及 Chromium/WebKit 60 项测试通过。

完整现状、上线版本、剩余问题和验证限制见 `launch-audit-20261026.md`。会员协议与隐私已由运营者确认并发布；真实邮件收发、文件隔离和线上备份恢复仍需验收。
