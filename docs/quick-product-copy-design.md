# 快速搬品：Alibaba 店铺集合页批量采集设计

## 目标

在 Alibaba 国际站店铺集合页（例如 `https://ekiy.en.alibaba.com/productlist.html`）点击一次“采集本店铺商品”，将当前店铺可见及后续分页商品加入 MEEKA 后台的采集任务，去重后生成待审核商品草稿。

第一阶段只采集用户有权使用的公开商品信息，不绕过登录、验证码、风控或反爬机制；最终发布仍由用户确认。

## 页面适配规则

参考安装包中可观察到的页面识别规则，Alibaba 国际站集合页适配如下：

| 项目 | 规则 |
| --- | --- |
| 允许主机 | `*.en.alibaba.com`、`*.fm.alibaba.com`、`*.trustpass.alibaba.com` |
| 允许路径 | `/productlist.html`、`/featureproductlist.html`、`/search/product` |
| 商品卡片 | `.icbu-product-card.product-item` |
| 商品 ID | 卡片属性 `data-id` |
| 详情页 URL | `https://www.alibaba.com/product-detail/_${data-id}.html` |
| 去重键 | `sourcePlatform + sourceProductId`，其次使用规范化详情 URL |

页面结构可能变化，因此选择器放在平台适配器中，不能散落在业务代码里。

## 用户流程

1. 用户打开目标店铺产品集合页。
2. 浏览器扩展识别为 Alibaba 店铺集合页，显示“采集本店铺商品”。
3. 用户选择“当前页”或“全部分页/自动滚动”。
4. 扩展扫描商品卡片，提取商品 ID、详情链接、卡片标题和缩略图，实时去重。
5. 扩展将采集任务和商品 ID 批量发送到 `meeka.com.cn`，后台显示进度。
6. 后台按队列读取详情页公开信息，保存为“待审核”，失败项可重试。
7. 用户批量编辑标题、描述、关键词、类目、价格、MOQ、SKU 和图片授权状态。
8. 后续接入阿里类目 Schema、图片中心和草稿接口，生成阿里国际站草稿；正式上架必须再次确认。

## 推荐架构

```text
Alibaba 店铺集合页
        │ DOM 扫描 / 翻页 / 去重
        ▼
Chrome 扩展采集器
        │ HTTPS 批量上传（一次任务一个 runId）
        ▼
MEEKA 批量采集 API
        │ 入库、去重、队列、重试
        ▼
后台采集任务 + 待审核商品
        │ 用户编辑与合规确认
        ▼
Alibaba 类目 Schema → 图片中心 → 商品草稿 → 人工发布
```

## 后台数据模型

### `product_copy_runs`

- `id`：采集任务 ID
- `user_id`：MEEKA 用户
- `source_platform`：`alibaba`
- `source_store_url`：店铺集合页
- `status`：`created / scanning / queued / processing / completed / failed`
- `total_count / success_count / failed_count`
- `created_at / updated_at`

### `product_copy_items`

- `run_id`
- `source_product_id`
- `source_url`
- `source_title / source_image_url`
- `raw_payload`：采集到的原始公开字段，保留来源和时间
- `normalized_payload`：转换后的编辑数据
- `status`：`queued / fetched / needs_review / draft_ready / published / failed`
- `error_message`

### `product_drafts`

- `item_id`
- `title / description / keywords`
- `category_id / attributes / sku`
- `price / moq / handling_time / shipping_template_id`
- `image_assets`
- `rights_confirmed`
- `publish_status`

## API 草案

```text
POST /api/product-copy/runs
创建采集任务，返回 runId

POST /api/product-copy/runs/:runId/items
批量上传商品 ID 和详情链接，幂等去重

GET /api/product-copy/runs/:runId
查询任务进度

GET /api/product-copy/items?runId=:runId
读取待审核商品

PATCH /api/product-copy/items/:itemId
编辑标题、描述、关键词、类目和授权确认

POST /api/product-copy/items/:itemId/alibaba-draft
仅提交阿里国际站草稿，不自动上架
```

## 关键安全边界

- 扩展不读取或上传 Alibaba Cookie、密码、App Secret。
- 后台接口使用短期配对码或登录态，不把长期密钥放入扩展。
- 对目标页面的请求不自动绕过验证码、登录墙或安全验证。
- 图片和详情文字默认标记为“待授权/待改写”，没有授权确认不能进入发布队列。
- 每个商品保留来源 URL、来源商品 ID、抓取时间和处理日志，便于审计与删除。
- 同一任务支持取消、失败重试和重复提交幂等。

## MVP 取舍

先实现 Alibaba 集合页的“当前页批量采集 + 后台入库 + 去重 + 进度展示”，再实现自动翻页和详情字段队列。这样即使目标页面的分页组件改版，也不会影响后台数据和发品流程。

## 当前实现状态

- 已实现：Chrome 扩展、商品卡片 DOM 扫描、懒加载自动滚动、最多 20 页连续采集、商品 ID 去重、MEEKA 批量入库 API、登录用户配对页。
- 需上线前执行：在 Supabase SQL Editor 执行 `supabase/migrations/202608300001_product_copy.sql`，并在 Vercel 配置 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
- 当前未实现：详情页逐个抓取、图片中心上传、类目 Schema 转换、阿里草稿/正式发布。扩展识别不到“下一页”控件时会安全停止在当前页已加载商品。
