// 这个行业的分类体系：类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 换行业时：类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题（几个类别可以共用一节，按这里的顺序排）；guide 告诉结构抽取模型这一类收什么、
 * 和相邻类别的边界在哪（总的归类原则写在 prompts/structure.md 里）。
 * commentary 标出评论类（教程、观点）：日报写过的事又有评论类的后续报道，只占一行快讯（报道它的信源够多时除外）。
 * 没归上类的资料在日报里放进第一个 key 为 industry 的类别所在的节（没有就放最后一节）。
 * tagColor 是飞书推送卡片里跟在标题后面的这一类小标签的颜色（飞书 text_tag 的颜色名）。
 * feedLabel 是分类 RSS 标题里的名字（不写就用 label）。公开接口、RSS 和 MCP 里要把一类并进另一类发布，写在站点设置里（site/site.ts 的 PUBLIC_CATEGORIES）。
 */
export const CATEGORIES = [
  {
    "key": "ai-models",
    "tagColor": "indigo",
    "label": "AI动态",
    "section": "AI新动态与趋势",
    "guide": "AI模型、研究、评测、能力与价格变化，以及AI行业经营与趋势。独立AI新闻不要求关联外贸；工具发布归新产品，可照做的方法归AI方法。"
  },
  {
    "key": "tip",
    "tagColor": "green",
    "label": "AI方法",
    "section": "AI方法与实践",
    "guide": "可以复用的AI提示词、工作流、自动化与实测教程。泛AI方法也收；真实外贸业务的实施复盘优先归AI+外贸案例。观点须有新事实、因果或可复用框架。",
    "commentary": true
  },
  {
    "key": "ai-trade",
    "tagColor": "turquoise",
    "label": "AI+外贸案例",
    "section": "AI+外贸落地案例",
    "guide": "AI在获客、客户研究、询盘、报价、翻译、营销、选品、跟单与售后中的实际实施或试验复盘。须有具体业务任务及做法或结果；纯工具发布归新产品，未实施的通用教程归AI方法。"
  },
  {
    "key": "industry",
    "tagColor": "orange",
    "label": "外贸动态",
    "section": "外贸动态与趋势",
    "guide": "进出口数据、贸易政策、关税、海关、认证、物流、汇率、贸易救济与跨境平台规则的变化或有证据的趋势。不要求含AI，保留生效日期、适用国家和商品范围。明确的新增需求或准入机会归市场机会。"
  },
  {
    "key": "opportunity",
    "tagColor": "purple",
    "label": "市场机会",
    "section": "市场与品类机会",
    "guide": "有来源数据、采购需求、市场准入或渠道变化支持的市场与品类机会。区分需求信号与确定订单、贸易额与利润；保留时间、国家、品类、样本及风险，禁止赚钱保证。"
  },
  {
    "key": "ai-products",
    "tagColor": "violet",
    "label": "新产品",
    "section": "新产品与工具",
    "guide": "可使用的AI工具或重大功能更新，以及面向进出口的实体新品、品类创新与跨境服务。实体新品需有用途、目标市场或渠道证据；普通商品目录、促销和招商稿不等于新品机会。"
  }
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/**
 * 这个行业最受关注的一类发布（AI 行业是新模型）：日报报头的“N 个新模型”、改分类后修订已出的报告都按它数。
 * category 是类别，tag 是标签，两者都对上才算；unit 接在数字后面。
 * 没有这样一类的行业设成 null，报头就不显示这个数。
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = { category: "ai-models", tag: "模型发布", unit: "个新模型" };

/** 周报月报的总述可以直接写、不必在报道里找到出处的行业通用词（小写）。站名会自动算进去。 */
export const PLAIN_TERMS: readonly string[] = ["ai", "api", "llm", "gpu", "agi", "ceo", "ipo", "外贸", "进出口", "跨境电商", "关税", "海关", "物流", "询盘", "选品", "crm", "hs", "fob", "cif", "rcep", "wto"];

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["model_release", "product_launch", "tool_or_prompt", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "产品更新", "模型发布", "论文/研究", "开源/仓库", "教程/实践", "现象/趋势", "大佬观点", "评测/基准", "安全/对齐", "行业动态", "政策/监管",
  "非AI/通用工具", "其他", "外贸案例", "市场机会", "新品发布",
] as const;

/** 可选的主题标签。 */
export const TOPIC_TAGS = [
  "Agent", "编码", "推理", "多模态", "语音", "视频", "图像生成", "RAG", "端侧", "数据/训练", "搜索", "部署/工程", "开源生态", "具身智能", "MCP/工具调用", "AI外贸", "客户开发", "客户研究", "询盘报价", "多语言营销", "独立站", "跨境电商", "选品", "关税合规", "物流供应链", "进出口数据", "市场准入", "新兴市场", "产品创新",
] as const;

/** 可选的实体标签（公司、机构、平台）。 */
export const ENTITY_TAGS = ["OpenAI", "Anthropic", "DeepSeek", "DeepMind", "Google", "Meta", "Microsoft", "xAI", "Hugging Face", "GitHub", "arXiv", "商务部", "海关总署", "WTO", "Shopify", "Amazon", "阿里国际站"] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  "教程/玩法": "教程/实践", "技巧/最佳实践": "教程/实践", "合作/生态": "行业动态", "融资/收购": "行业动态", "公司动态": "行业动态",
  合作: "行业动态", 生态: "行业动态", 融资: "行业动态", 收购: "行业动态", 投资: "行业动态", 并购: "行业动态",
  政策: "政策/监管", 监管: "政策/监管", 法规: "政策/监管", 安全: "安全/对齐", 对齐: "安全/对齐",
  论文: "论文/研究", 研究: "论文/研究", paper: "论文/研究", papers: "论文/研究",
  "open-source": "开源/仓库", 开源: "开源/仓库", 仓库: "开源/仓库", repo: "开源/仓库",
  教程: "教程/实践", 玩法: "教程/实践", 指南: "教程/实践", 技巧: "教程/实践", 最佳实践: "教程/实践", 实践: "教程/实践",
  案例: "外贸案例", "AI+外贸": "AI外贸", 获客: "客户开发", 新品: "新品发布", 商机: "市场机会",
  产品: "产品更新", 更新: "产品更新", 发布: "产品更新", 模型: "模型发布", 趋势: "现象/趋势", 现象: "现象/趋势", 观点: "现象/趋势",
  视频生成: "视频", 非ai: "非AI/通用工具", "non-ai": "非AI/通用工具", 通用工具: "非AI/通用工具", 工程工具: "非AI/通用工具",
  安全扫描: "非AI/通用工具", devops: "非AI/通用工具", 行业: "行业动态", 动态: "行业动态",
};

// ── 公司与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 公司主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * aliases 给结构抽取模型看；orgNames 是这家公司发消息时开头用的组织名（公司、实验室、团队），
 * 在它自己的主题页上读者知道说的是谁，可以省去；otherNames 是公司的其他称呼（官方账号名、子品牌）。
 * 所有这些名字都用来认出说的是哪家公司，比如把事实的主体对到发布方。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  mofcom: {"name":"商务部","displayTag":"商务部","aliases":["商务部","MOFCOM","Ministry of Commerce of China"]},
  customs: {"name":"海关总署","displayTag":"海关总署","aliases":["海关总署","GACC","General Administration of Customs"]},
  wto: {"name":"WTO","displayTag":"WTO","aliases":["WTO","世界贸易组织","World Trade Organization"]},
  shopify: {"name":"Shopify","displayTag":"Shopify","aliases":["Shopify"]},
  amazon: {"name":"Amazon","displayTag":"Amazon","aliases":["Amazon","亚马逊","AWS"]},
  alibaba: {"name":"阿里国际站","displayTag":"阿里国际站","aliases":["Alibaba.com","阿里国际站","阿里巴巴国际站"]},
  "world-labs": { name: "World Labs", displayTag: null, aliases: ["World Labs"] },
  "thinking-machines": { name: "Thinking Machines Lab", displayTag: null, aliases: ["Thinking Machines"] },
  amd: { name: "AMD", displayTag: null, aliases: ["AMD", "Advanced Micro Devices"] },
  openai: { name: "OpenAI", displayTag: "OpenAI", aliases: ["OpenAI", "ChatGPT", "Sora", "Codex", "GPT"], orgNames: ["OpenAI"], otherNames: ["OpenAI Developers"] },
  anthropic: { name: "Anthropic", displayTag: "Anthropic", aliases: ["Anthropic", "Claude"], orgNames: ["Anthropic"], otherNames: ["Claude Code"] },
  google: { name: "Google", displayTag: "Google", aliases: ["Google", "DeepMind", "Gemini", "谷歌"], orgNames: ["Google DeepMind", "Google Research", "Google", "DeepMind", "谷歌"], otherNames: ["Google AI", "Google Labs", "Google Cloud"] },
  deepseek: { name: "DeepSeek", displayTag: "DeepSeek", aliases: ["DeepSeek", "深度求索"], orgNames: ["DeepSeek", "深度求索"] },
  qwen: { name: "千问 Qwen", displayTag: null, aliases: ["Qwen", "通义", "阿里"], orgNames: ["通义千问", "通义实验室", "阿里巴巴", "阿里云", "阿里", "Qwen Team", "Qwen", "Alibaba"], otherNames: ["千问", "千问APP", "Alibaba Cloud"] },
  kimi: { name: "Kimi / 月之暗面", displayTag: null, aliases: ["Kimi", "月之暗面", "Moonshot"], orgNames: ["Moonshot AI", "月之暗面", "Kimi"] },
  minimax: { name: "MiniMax", displayTag: null, aliases: ["MiniMax", "海螺"], orgNames: ["MiniMax", "稀宇科技"] },
  zhipu: { name: "智谱 GLM", displayTag: null, aliases: ["智谱", "GLM", "Z.ai"], orgNames: ["智谱AI", "智谱", "Zhipu AI", "Z.ai"], otherNames: ["Zhipu"] },
  xai: { name: "xAI", displayTag: "xAI", aliases: ["xAI", "Grok"], orgNames: ["SpaceX Super Intelligence", "SpaceXAI", "SpaceXSI", "xAI"], otherNames: ["Grok Bot"] },
  meta: { name: "Meta", displayTag: "Meta", aliases: ["Meta", "Llama"], orgNames: ["Meta Superintelligence Labs", "Meta AI", "Meta"], otherNames: ["AI at Meta", "Muse"] },
  microsoft: { name: "Microsoft", displayTag: "Microsoft", aliases: ["Microsoft", "微软", "Copilot"], orgNames: ["Microsoft Research", "Microsoft AI", "Microsoft", "微软"] },
  nvidia: { name: "NVIDIA", displayTag: null, aliases: ["NVIDIA", "英伟达"], orgNames: ["NVIDIA", "英伟达"] },
  "hugging-face": { name: "Hugging Face", displayTag: "Hugging Face", aliases: ["Hugging Face"], orgNames: ["Hugging Face", "HuggingFace"] },
  cursor: { name: "Cursor", displayTag: null, aliases: ["Cursor", "Anysphere"], orgNames: ["Cursor"] },
  openrouter: { name: "OpenRouter", displayTag: null, aliases: ["OpenRouter"], orgNames: ["OpenRouter"] },
};

/**
 * 身份词典：摘要和标题里出现的公司，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型张冠李戴）。
 * 行业没有这个问题时可以留空数组。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "mofcom", name: "商务部", patterns: [/商务部|\bmofcom\b|Ministry of Commerce of China/i] },
  { id: "customs", name: "海关总署", patterns: [/海关总署|\bgacc\b|General Administration of Customs/i] },
  { id: "wto", name: "WTO", patterns: [/\bwto\b|世界贸易组织|World Trade Organization/i] },
  { id: "shopify", name: "Shopify", patterns: [/\bshopify\b/i] },
  { id: "alibaba", name: "阿里国际站", patterns: [/alibaba\.com|阿里(巴巴)?国际站/i] },
  { id: "openai", name: "OpenAI", patterns: [/openai|chatgpt|\bgpt-?[o\d]|\bsora\b|\bcodex\b/i] },
  { id: "anthropic", name: "Anthropic", patterns: [/anthropic|\bclaude\b/i, /\b(?:opus|sonnet|haiku)\s*\d+(?:[.\-]\d+)*\b/i, /\bfable\s*\d+(?:[.\-]\d+)*\b|\bmythos\b/i] },
  { id: "google", name: "Google / Gemini", patterns: [/google|deepmind|\bgemini\b|notebooklm|\bveo\s?\d|\bAlphaFold\b|\bAMIE\b/i] },
  { id: "deepseek", name: "DeepSeek", patterns: [/deepseek|深度求索/i] },
  { id: "xai", name: "xAI / Grok", patterns: [/\bxai\b|\bgrok\b/i] },
  { id: "meta", name: "Meta / Llama", patterns: [/\bMeta\b/, /\bmeta\s?ai\b|\bllama\b/i] },
  { id: "microsoft", name: "Microsoft / Copilot", patterns: [/microsoft|copilot|微软/i] },
  { id: "nvidia", name: "NVIDIA", patterns: [/nvidia|英伟达|\bnemotron\b|\bnemo\b|\bblackwell\b|\brubin(?:\s+ultra)?\b|\bcuda\b/i] },
  { id: "qwen", name: "千问 Qwen", patterns: [/\bqwen|通义|千问/i] },
  { id: "hugging-face", name: "Hugging Face", patterns: [/hugging\s?face/i] },
  { id: "cursor", name: "Cursor", patterns: [/\bCursor\b/] },
  { id: "kimi", name: "Kimi / 月之暗面", patterns: [/\bkimi\b|月之暗面|\bmoonshot\s?ai\b/i] },
  { id: "openrouter", name: "OpenRouter", patterns: [/openrouter/i] },
  { id: "minimax", name: "MiniMax", patterns: [/minimax/i] },
  { id: "zhipu", name: "智谱 GLM", patterns: [/智谱|\bglm-?[4-9]/i] },
  { id: "hunyuan", name: "腾讯混元", patterns: [/混元|hunyuan/i] },
  { id: "doubao", name: "字节豆包", patterns: [/豆包|doubao|字节跳动|bytedance/i] },
  { id: "mistral", name: "Mistral", patterns: [/mistral/i] },
  { id: "perplexity", name: "Perplexity", patterns: [/\bPerplexity\b/] },
  { id: "runway", name: "Runway", patterns: [/\brunway\b/i] },
  { id: "suno", name: "Suno", patterns: [/\bsuno\b/i] },
  { id: "midjourney", name: "Midjourney", patterns: [/midjourney/i] },
  { id: "stability-ai", name: "Stability AI", patterns: [/stability\s?ai/i] },
  { id: "elevenlabs", name: "ElevenLabs", patterns: [/eleven\s?labs/i] },
  { id: "vllm", name: "vLLM", patterns: [/\bvllm\b/i] },
  { id: "ollama", name: "Ollama", patterns: [/\bollama\b/i] },
  { id: "windsurf", name: "Windsurf", patterns: [/windsurf/i] },
  { id: "devin", name: "Devin", patterns: [/\bdevin\b/i] },
  { id: "manus", name: "Manus", patterns: [/\bmanus\b/i] },
  { id: "apple", name: "Apple AI", patterns: [/\bapple\s?(intelligence|silicon|ai)\b|苹果(智能|\s?AI)/i] },
  { id: "amazon", name: "Amazon / AWS", patterns: [/amazon|\baws\b|亚马逊/i] },
  { id: "baidu", name: "百度文心", patterns: [/百度|baidu|文心|\bernie\s?bot\b/i] },
];

/** 这些域名上的文章，发布方就是对应的公司（托管平台如 GitHub、arXiv 不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "mofcom", domains: ["mofcom.gov.cn"] },
  { entityId: "customs", domains: ["customs.gov.cn"] },
  { entityId: "wto", domains: ["wto.org"] },
  { entityId: "shopify", domains: ["shopify.com"] },
  { entityId: "amazon", domains: ["aboutamazon.com"] },
  { entityId: "alibaba", domains: ["alibaba.com"] },
  { entityId: "openai", domains: ["openai.com"] },
  { entityId: "anthropic", domains: ["anthropic.com", "claude.com"] },
  { entityId: "google", domains: ["deepmind.google", "ai.google", "blog.google"] },
  { entityId: "deepseek", domains: ["deepseek.com"] },
  { entityId: "xai", domains: ["x.ai"] },
  { entityId: "meta", domains: ["ai.meta.com"] },
  { entityId: "microsoft", domains: ["microsoft.com"] },
  { entityId: "nvidia", domains: ["nvidia.com"] },
  { entityId: "qwen", domains: ["qwen.ai"] },
  { entityId: "cursor", domains: ["cursor.com"] },
  { entityId: "openrouter", domains: ["openrouter.ai"] },
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "meta", pattern: /@AIatMeta\b/i },
  { entityId: "zhipu", pattern: /\bZhipu(?:\s+AI\b|['’]s\b)/i },
];
