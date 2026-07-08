"use client";

/**
 * 新人引导（产品文档 §9.3）— 六步向导，IP: meeka-profile
 * 身份 → 平台 → 行业 → 目标 → 个人介绍 → 推荐路径
 */

import Link from "next/link";
import { useState } from "react";
import { Meeka } from "@/components/meeka/meeka";
import type { OnboardingState } from "@/types/onboarding";

const IDENTITIES = [
  { value: "boss", label: "外贸老板", desc: "降本增效 · 增长方向" },
  { value: "operator", label: "运营", desc: "国际站 · 数据复盘" },
  { value: "sales", label: "业务员", desc: "开发信 · 成交技巧" },
  { value: "service", label: "服务商", desc: "找客户 · 资源对接" },
  { value: "learner", label: "学习者", desc: "系统学习 AI 外贸" },
] as const;

const PLATFORMS = ["国际站", "独立站", "Amazon", "TikTok", "其他"];
const INDUSTRIES = ["机械设备", "消费电子", "新能源", "家居建材", "纺织服装", "汽配", "美妆个护", "其他"];

const STEPS = ["选择身份", "主营平台", "主营行业", "当前目标", "个人介绍", "学习路径"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<OnboardingState>({ platforms: [], introPublished: false });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <Meeka state="profile" size={72} alt="Meeka 向导" />
          <div>
            <h1 className="text-xl font-semibold">完善资料，我会为你定制学习路线。</h1>
            <p className="mt-1 text-sm text-muted">
              第 {step + 1} / {STEPS.length} 步 · {STEPS[step]}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-white p-6 md:p-8">
          {step === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {IDENTITIES.map((it) => (
                <button
                  key={it.value}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, identity: it.value }))}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    state.identity === it.value
                      ? "border-brand bg-brand-soft"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <div className="text-sm font-semibold">{it.label}</div>
                  <div className="mt-1 text-xs text-muted">{it.desc}</div>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="flex flex-wrap gap-2.5">
              {PLATFORMS.map((p) => {
                const active = state.platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        platforms: active ? s.platforms.filter((x) => x !== p) : [...s.platforms, p],
                      }))
                    }
                    className={`h-10 rounded-lg border px-4 text-sm font-medium ${
                      active ? "border-brand bg-brand-soft text-brand" : "border-border text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-wrap gap-2.5">
              {INDUSTRIES.map((it) => (
                <button
                  key={it}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, industry: it }))}
                  className={`h-10 rounded-lg border px-4 text-sm font-medium ${
                    state.industry === it ? "border-brand bg-brand-soft text-brand" : "border-border text-slate-600"
                  }`}
                >
                  {it}
                </button>
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <label className="text-sm font-medium" htmlFor="goal">最近 90 天最想解决什么？</label>
              <textarea
                id="goal"
                rows={4}
                value={state.goal ?? ""}
                onChange={(e) => setState((s) => ({ ...s, goal: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-brand"
                placeholder="例：直通车花费高但询盘少，想跑通 AI 询盘分级和开发信工作流……"
              />
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <p className="text-sm text-muted">
                发一条个人介绍，让伙伴知道你是谁、做什么、能提供什么、正在找什么。
              </p>
              <textarea
                rows={5}
                className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-brand"
                placeholder={"大家好，我是……\n主营产品/市场：\n我能提供：\n正在寻找："}
              />
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={state.introPublished}
                  onChange={(e) => setState((s) => ({ ...s, introPublished: e.target.checked }))}
                />
                写好了，帮我发布到社区
              </label>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="text-center">
              <Meeka state="success" size={160} className="mx-auto" alt="Meeka 完成" />
              <h2 className="mt-4 text-lg font-semibold">太棒了，你的学习路径已生成！</h2>
              <p className="mt-1 text-sm text-muted">
                根据你的身份和目标，推荐从「AI 外贸业务增长实战营」第一章开始。
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/growth"
                  className="flex h-10 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:opacity-90"
                >
                  查看我的成长路径
                </Link>
                <Link
                  href="/"
                  className="flex h-10 items-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-surface-muted"
                >
                  先逛逛社区
                </Link>
              </div>
            </div>
          ) : null}

          {step < 5 ? (
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-slate-600 disabled:opacity-40"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={next}
                className="h-9 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:opacity-90"
              >
                {step === 4 ? "完成" : "下一步"}
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          随时可以跳过，稍后在<Link href="/workspace" className="text-brand hover:underline">个人中心</Link>继续完成。
        </p>
      </div>
    </div>
  );
}
