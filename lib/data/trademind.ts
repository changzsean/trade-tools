import type { CommunityPost, Question, TeamOpportunity } from "@/types/community";
import type { GrowthSummary } from "@/types/growth";
import type { Resource } from "@/types/resource";

export const growthSummary: GrowthSummary = {
  userName: "Sean",
  level: 8,
  dayInCommunity: 128,
  growthValue: 8620,
  growthTarget: 10000,
  rank: "TOP 128",
  influence: 3245,
  learningHours: 98,
  streakDays: 7,
  metrics: [
    { label: "成长值", value: "8,620", detail: "/ 10,000" },
    { label: "社区排名", value: "TOP 128", detail: "本周上升 12 名" },
    { label: "影响力", value: "3,245", detail: "来自回答与资源" },
    { label: "学习时长", value: "98 小时", detail: "累计完成 31 节" },
  ],
  tasks: [
    {
      id: "task-learn-workflow",
      title: "学习一个新能源成单工作流",
      description: "完成 AI 客户开发路径中的第 4 节",
      rewardPoints: 20,
      status: "in_progress",
      category: "learning",
    },
    {
      id: "task-discuss",
      title: "参与讨论",
      description: "在社区发布或回复一条实战内容",
      rewardPoints: 10,
      status: "open",
      category: "community",
    },
    {
      id: "task-share-resource",
      title: "分享资源",
      description: "分享一个外贸获客案例或模板",
      rewardPoints: 30,
      status: "open",
      category: "resource",
    },
    {
      id: "task-help",
      title: "帮助他人",
      description: "为他人的问题提供解答",
      rewardPoints: 15,
      status: "open",
      category: "help",
    },
  ],
  learning: {
    pathTitle: "AI 外贸业务增长实战营",
    currentLesson: "第 12 课：询盘质量判断与跟进优先级",
    progressPercent: 68,
    nextAction: "继续学习 18 分钟并完成跟进清单",
  },
};

export const resources: Resource[] = [
  {
    id: "res-001",
    slug: "ai-lead-generation-workflow",
    type: "workflow",
    title: "AI 生成高转化开发信工作流",
    subtitle: "从目标客户画像到个性化邮件的一体化 SOP",
    description:
      "适合 B2B 外贸销售团队复用的客户开发工作流，包含客户画像、痛点映射、邮件结构、跟进节奏和质量检查。",
    status: "published",
    visibility: "public",
    creator: { id: "creator-1", name: "外贸老司机", title: "10 年 B2B 增长顾问", avatarInitials: "外", verified: true },
    pricingMode: "member_only",
    priceCents: 9900,
    currency: "CNY",
    memberTierRequired: "pro",
    difficulty: "intermediate",
    tags: ["客户开发", "邮件", "B2B"],
    useCases: ["开发信", "客户画像", "跟进"],
    industryTags: ["机械", "新能源", "家居"],
    ratingAverage: 4.9,
    ratingCount: 126,
    usageCount: 1200,
    version: "1.4.0",
    durationLabel: "45 分钟",
    updatedAt: "2026-06-28",
    includedItems: ["客户画像 Prompt", "开发信评分表", "7 天跟进节奏"],
  },
  {
    id: "res-002",
    slug: "alibaba-ad-analysis",
    type: "skill",
    title: "询盘智能分析工作流",
    subtitle: "识别高价值询盘并生成销售优先级",
    description:
      "把询盘内容、买家背景、产品匹配度和历史转化数据整理为可执行优先级，减少销售团队的判断成本。",
    status: "published",
    visibility: "public",
    creator: { id: "creator-2", name: "数据增长师", title: "平台运营专家", avatarInitials: "数", verified: true },
    pricingMode: "discounted",
    priceCents: 4900,
    originalPriceCents: 9900,
    currency: "CNY",
    difficulty: "advanced",
    tags: ["询盘", "转化", "数据分析"],
    useCases: ["询盘分级", "销售协作"],
    industryTags: ["跨境平台", "汽配", "电子"],
    ratingAverage: 4.8,
    ratingCount: 88,
    usageCount: 856,
    version: "2.1.0",
    durationLabel: "30 分钟",
    updatedAt: "2026-06-25",
  },
  {
    id: "res-003",
    slug: "three-month-alibaba-growth-case",
    type: "case",
    title: "3 个月提升询盘 300%",
    subtitle: "从关键词重构到详情页转化的完整案例",
    description:
      "拆解一个真实外贸店铺如何通过 AI 关键词聚类、详情页重写和广告预算再分配提升询盘质量。",
    status: "published",
    visibility: "public",
    creator: { id: "creator-3", name: "雪雷小能手", title: "国际站操盘手", avatarInitials: "雪", verified: false },
    pricingMode: "paid",
    priceCents: 6900,
    currency: "CNY",
    difficulty: "intermediate",
    tags: ["案例", "国际站", "转化"],
    useCases: ["店铺诊断", "投放复盘"],
    industryTags: ["国际站", "工业品"],
    ratingAverage: 4.9,
    ratingCount: 64,
    usageCount: 2300,
    version: "1.0.2",
    durationLabel: "25 分钟",
    updatedAt: "2026-06-18",
  },
  {
    id: "res-004",
    slug: "international-store-agent",
    type: "agent",
    title: "国际站运营助手 Agent",
    subtitle: "面向店铺诊断、关键词建议与周报生成",
    description:
      "一个可配置的运营 Agent，用于拆解店铺数据、生成关键词机会、输出优化任务并同步到团队工作台。",
    status: "published",
    visibility: "public",
    creator: { id: "creator-4", name: "AI 实验室", title: "TradeMind 官方", avatarInitials: "AI", verified: true },
    pricingMode: "limited_free",
    priceCents: 12900,
    currency: "CNY",
    difficulty: "advanced",
    tags: ["Agent", "运营", "周报"],
    useCases: ["店铺诊断", "关键词", "团队周报"],
    industryTags: ["国际站", "跨境 B2B"],
    ratingAverage: 4.7,
    ratingCount: 45,
    usageCount: 678,
    version: "0.9.5",
    durationLabel: "可直接运行",
    updatedAt: "2026-07-01",
  },
];

export const posts: CommunityPost[] = [
  {
    id: "post-1",
    type: "case_teardown",
    authorName: "Lucy_运营达人",
    authorTitle: "运营专家",
    authorInitials: "Lu",
    title: "用 AI 优化国际站产品标题的 3 个实用技巧，亲测流量提升 60%",
    body:
      "最近用 ChatGPT + 关键词工具优化了店铺的产品标题，发现规则如果这么明显：先聚类买家搜索意图，再把核心属性放到前 60 个字符。",
    tags: ["国际站运营", "AI提效", "标题优化"],
    createdAt: "2 小时前",
    likes: 26,
    comments: 18,
    saves: 41,
    attachedResourceType: "case",
  },
  {
    id: "post-2",
    type: "team_recruitment",
    authorName: "Tom_外贸老兵",
    authorTitle: "机械设备出口",
    authorInitials: "To",
    title: "组队做 21 天 AI 运营实战营：每天交付一个可复用 SOP",
    body:
      "目标是把询盘跟进、报价、详情页和客户开发拆成可复用工作流。招募 6 位有真实业务场景的伙伴一起迭代。",
    tags: ["组队学习", "工作流", "21天挑战"],
    createdAt: "4 小时前",
    likes: 44,
    comments: 23,
    saves: 32,
  },
];

export const questions: Question[] = [
  {
    id: "q-1",
    title: "AI 生成的开发信，如何避免被客户识别？",
    tags: ["开发信", "客户沟通"],
    answers: 12,
    views: 128,
    accepted: true,
    updatedAt: "2 小时前",
  },
  {
    id: "q-2",
    title: "国际站店铺数据分析，哪些指标最重要？",
    tags: ["国际站", "数据分析"],
    answers: 4,
    views: 98,
    accepted: false,
    updatedAt: "4 小时前",
  },
  {
    id: "q-3",
    title: "有没有好用的 AI 报价模板分享？",
    tags: ["报价", "模板"],
    answers: 6,
    views: 76,
    accepted: false,
    updatedAt: "6 小时前",
  },
];

export const teamOpportunities: TeamOpportunity[] = [
  {
    id: "team-1",
    title: "新能源客户开发 Sprint",
    goal: "共同搭建 30 个目标客户画像与开发信模板",
    city: "深圳 / 远程",
    capacity: "5/8",
    duration: "14 天",
    roles: ["销售", "运营", "Prompt 设计"],
  },
  {
    id: "team-2",
    title: "国际站详情页改造小队",
    goal: "每人优化 3 个产品详情页并共创评分表",
    city: "杭州 / 远程",
    capacity: "3/6",
    duration: "21 天",
    roles: ["运营", "设计", "数据分析"],
  },
];

export async function getGrowthSummary() {
  return growthSummary;
}

export async function getFeaturedResources() {
  return resources;
}

export async function getResourceBySlug(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}

export async function getCommunityFeed() {
  return posts;
}

export async function getQuestions() {
  return questions;
}

export async function getTeamOpportunities() {
  return teamOpportunities;
}
