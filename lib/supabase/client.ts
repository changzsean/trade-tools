"use client";

/**
 * Supabase 浏览器客户端（单例）
 * 用于登录、注册、发帖、提问、上传等前端直连操作。
 * 环境变量在 .env.local（本地）和 Vercel Environment Variables（线上）。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** 是否已配置后端（缺失时页面以“演示模式”降级，不报错） */
export const SUPABASE_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_READY) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cached;
}
