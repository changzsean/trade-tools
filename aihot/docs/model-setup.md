# 模型 API 配置入口

后端已支持DeepSeek、千问及其他OpenAI兼容接口。没有密钥时可以准备部署，但不会生成摘要、评分或发布首批资讯。

根目录.env.example是配置模板。尚无.env时运行node scripts/init-env.ts，私下保存生成的管理员密码；已有.env时直接编辑。

填写LLM_BASE_URL、LLM_API_KEY、LLM_MODEL。DeepSeek基础地址为https://api.deepseek.com/v1，千问为https://dashscope.aliyuncs.com/compatible-mode/v1；模型ID使用账户中实际可用的型号。LLM_EXTRA_JSON按该服务商文档填写，不直接沿用别家的思考模式参数。

生产环境配置完毕后将COLLECT_ENABLED、MODEL_CALLS_ENABLED设为true，运行docker compose up -d --force-recreate api worker加载新配置。初次部署运行docker compose up -d --build。本机开发仍保持两个开关关闭。

密钥只交给API与worker，不提交.env，不写入VITE_*等前端可读配置。后台/admin/models查看模型与用量，/admin/settings调整预算；后台切换模型不替代服务器注入密钥。出现失败时先核对“运行”页的错误，再重试任务。

先验证/all有可核对的真实资讯，再核对精选和日报。热点榜要求同一事件的多源报道，出现资讯不保证立即形成榜单。本地预览曾采集32条真实材料，仍待模型处理；它们不在源码中，生产环境需要重新采集或单独迁移数据库。
