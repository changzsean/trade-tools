# 站内编辑稿

详情页展示可独立阅读的中文编辑稿，作者为“meeka编辑部”，底部保留发布者、原文作者（有记录时）和原文链接。来源事实与编辑部观察、实践建议分开表述。这不改变任何信源的 `site_fulltext` 或 `syndicate_fulltext` 权限。

后续稿件在原有写作步骤中一并生成：`bodyZh` 保存在分析回执对应的 `analyses.output.editorialBody` 中，摘要仍供列表使用。没有新增付费调用，仍使用原有回执和每天 100 次请求上限；正文更长会增加每次写作的输出 token。读者访问只读已发布内容，不调用模型。

首批人工核对稿在 `2026-10-23.json`，通过现有 `editorial_overrides.fields.editorialBody` 保存，包含材料版本号。对源材料的更新会使旧稿失效；撤回和仅摘要权限优先，不能通过编辑稿绕过。

需要重新导入时，在后台环境使用已有的私密环境配置运行：

```bash
node --env-file-if-exists=.env scripts/import-editorial.ts site/editorial/2026-10-23.json
```

脚本调用正常的 `overrideFields`，检查当前材料版本与编辑版本并写审计记录。导入前应逐篇审阅稿件；不要把来源整篇翻译、转载成编辑部原创。普通文本仅解释标题、段落和列表，HTML、图片和 Markdown 链接不执行。
