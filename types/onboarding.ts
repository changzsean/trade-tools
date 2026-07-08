/** 新人引导模型（产品文档 §9.3 / §6.3） */

import type { UserIdentity } from "./user";

export interface OnboardingState {
  identity?: UserIdentity;
  platforms: string[];
  industry?: string;
  goal?: string;
  introPublished: boolean;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  done: boolean;
}

/** 首页右栏新人导航五步（§6.3） */
export const NEWBIE_STEPS: Omit<OnboardingStep, "done">[] = [
  { id: 1, title: "补全身份与主营平台", description: "让推荐更准" },
  { id: 2, title: "发布个人介绍", description: "让伙伴知道你能提供什么" },
  { id: 3, title: "选择主营行业", description: "匹配课程与资源标签" },
  { id: 4, title: "提出第一个问题", description: "社区会认真回答" },
  { id: 5, title: "收藏第一个资源", description: "开始搭建你的工具箱" },
];
