# ACCIO WORK 知识库内容后台

这个 `content` 文件夹可以直接作为 Obsidian Vault 使用。网站展示在 `index.html`，内容维护放在这里。

## 推荐工作流

1. 在 Obsidian 里打开本项目文件夹。
2. 修改 `content/05 在线文档` 里的 Markdown。
3. 保存后运行同步脚本：

```bash
node scripts/build-docs-from-obsidian.mjs
```

4. 把更新后的 `content/`、`index.html` 推送到 GitHub。
5. Vercel 会自动重新部署。

## 内容目录

- `01 产品介绍`：ACCIO WORK 的定位、价值、适用对象。
- `02 运营生命周期`：建站、流量、询盘、转化、复购、复盘。
- `03 使用技巧`：Accio Work、智能体、指令写法、常见错误。
- `04 Skills 技能包`：每个 Skill 的适用场景、输入、输出、下载说明。
- `05 在线文档`：网站“在线文档库”的内容源。
- `06 SOP 模板`：询盘日报、客户背调、P4P 诊断、标题优化等 SOP。
- `07 工具说明`：工具箱每个工具的用途和字段说明。

## 文件规范

每篇在线文档需要保留 frontmatter：

```markdown
---
id: doc-example
title: "文档标题"
description: "文档卡片描述"
order: 1
author: "常征 Sean"
status: published
---
```

`id` 会对应网页弹窗锚点，尽量不要频繁修改。

