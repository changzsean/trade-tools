# MEEKA 的 AI与外贸资讯栏目

按用户 2026-10-22 的最新要求，保留 MEEKA 的社区首页、成长、资源库、实验室、工作台和原有 API，新增 `/aihot`，不再用独立热点站替换整个网站。

## 页面与源码

- `/aihot`：全部动态、六个分类、关键词搜索及分页。
- `/aihot?view=hot`：多来源热点榜，进入 `/aihot/stories/:id` 查看报道。
- `/aihot?view=daily`：最新已发布日报。
- `/aihot/items/:id`：资讯摘要、筛选理由和原文入口。
- 原站顶部导航、电脑侧栏及手机导航都提供入口。
- 根目录仍为原 Next.js 网站。原来已验证的行业热点引擎完整保存在 `aihot/`；它的行业配置、管理员和发布队列继续独立使用。

栏目只通过 HTTP 读取 AIHOT 的公开发布 API，不连接数据库，不持有模型密钥，不因读者打开页面触发模型调用。页面不会把未接入后台、服务故障和已发布但无结果混为一谈。

## 部署

现有 `trade-tools-esox` 继续作为门户项目，根目录保持仓库根，构建命令保持 `npm run build`。本次没有修改正式域名和原有 Supabase 环境变量。

门户项目只需增加一个服务端变量：`AIHOT_API_BASE_URL=https://<新的AIHOT后端域名>`。填写根地址，不带 `/api` 路径；不要在门户项目放模型或数据库密钥。未配置时新栏目明确提示首批内容接入中，原站其他页面正常运行。

后台按 Vercel + Cloudflare 方向准备：Vercel 的 HTTP 容器承接 API，Daemons 运行现有 pg-boss worker；Cloudflare R2 保存附件，PostgreSQL 保存资讯、发布记录、队列和预算。Daemons 和容器运行时目前处于 Beta；Hobby 的 daemon 配额为每团队每月 10 Active CPU-hours，用尽后会暂停，且 daemon 只在生产环境运行。正式投产前必须验证账号可用性、限额与费用。

旧的 Docker 引擎依赖共享磁盘；拆到云服务之前，R2 附件读写、删除、保留期和备份/恢复适配必须完成并通过测试。Cloudflare R2 的可用状态尚未核实。当前账号只有一个处于 INACTIVE 的 Supabase 项目，尚未为热点站新建或迁移数据库。

模型 API 由用户自行配置；DeepSeek/千问兼容入口见 `aihot/docs/model-setup.md`。已有的 32 条本地原始材料尚未处理、评分或发布，不能当作公开资讯。后台接入并产生真实发布记录后，栏目自动展示内容。

## 验证与发布顺序

```sh
npm run typecheck
npm test
npm run build
cd aihot
npm ci
npm run typecheck
# DATABASE_URL 必须是可丢弃的 *_test 或 *_ci 数据库
npm test
node scripts/smoke.ts --base https://<独立热点站预览地址>
```

新增门户的本地 npm run typecheck、npm test（5 项）及 npm run build 均通过，原站主要入口与新栏目共 11 条 HTTP 检查通过。构建前发现原站搬品面板的 normalizedPayload 只被推断为 brand，补上现有 BatchItem 数据结构的类型标注后通过，运行行为未变。

根目录测试覆盖栏目筛选、来源链接、故障状态及 HTTP 边界。AIHOT 原有完整测试在整站独立版本中曾 935 项通过，smoke 通过；不能用那次结果代替新增 Next.js 栏目的构建和生产验证。

先验证分支预览中的原首页、社区、资讯列表/搜索/分页、详情、热点和日报及手机导航，再发布门户项目。先前源码上传只产生分支，不等于已经发布；正式地址仍需部署成功才能出现新栏目。

首次运行新资讯处理后台之前，按 `aihot/AGENTS.md` 确认运营主体、联系方式、使用规则及隐私说明。不得以虚构新闻或虚构评分填满栏目。

2026-10-26：门户默认使用 `order=updated` 读取公开资讯池，以本站编辑内容的 `updatedAt` 降序展示。卡片分开展示本站更新日期和来源发布日期；`order=source` 保留原有来源时间视图。后台 `/api/site/pool` 未提供 `order` 时仍按原时间线返回，不改变其他客户端。筛选、搜索和分页在排序之前执行，撤回与延迟发布规则保持有效。原来按后台 `updated_at` 统计的每日更新数不能当作当天来源发文数。

参考文档（2026-10-22 核对）：
- https://vercel.com/docs/functions/runtimes/container
- https://vercel.com/docs/daemons/limits
- https://developers.cloudflare.com/r2/pricing/
- https://supabase.com/docs/guides/database/connecting-to-postgres
