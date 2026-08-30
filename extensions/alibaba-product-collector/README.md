# MEEKA Alibaba Product Collector

这是 MEEKA 的本地 Chrome 扩展 MVP，用于在 Alibaba 国际站店铺集合页采集公开商品卡片。

## 安装与使用

1. Chrome 打开 `chrome://extensions`，开启“开发者模式”。
2. 点击“加载已解压的扩展程序”，选择本目录：`extensions/alibaba-product-collector`。
3. 登录 `https://meeka.com.cn`，打开 `/product-copy/pair`，点击“配对扩展”。
4. 打开 Alibaba 店铺集合页，例如 `https://ekiy.en.alibaba.com/productlist.html`。
5. 点击扩展图标 → “自动采集全部分页” → 完成后点击“同步到 MEEKA 后台”。

## 当前边界

- 支持 `.icbu-product-card.product-item` 商品卡片、商品 ID、详情 URL、标题和缩略图。
- 自动滚动触发懒加载，最多连续处理 20 页；分页控件必须能被识别为“Next/下一页”。
- 只读取页面公开 DOM，不读取 Alibaba Cookie，不绕过验证码、登录墙或风控。
- MEEKA 只接收登录用户自己的任务；扩展保存的是短期访问令牌，可在弹窗点击“解除本机配对”。
- 同步后商品进入后台队列，当前不会自动上传图片、生成阿里商品 Schema 或自动上架。
