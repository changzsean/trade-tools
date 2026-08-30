import { createHmac, timingSafeEqual } from "node:crypto";

export const ALIBABA_STATE_COOKIE = "alibaba_oauth_state";
export const ALIBABA_SESSION_COOKIE = "alibaba_session";
export const ALIBABA_CALLBACK_PATH = "/api/alibaba/oauth/callback";

type StringMap = Record<string, string>;

export type AlibabaToken = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  account_id?: string;
  account_platform?: string;
  country?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

export function publicBaseUrl(): string {
  return (process.env.ALIBABA_PUBLIC_BASE_URL ?? "https://meeka.com.cn").replace(/\/$/, "");
}

export function alibabaCallbackUrl(): string {
  return `${publicBaseUrl()}${ALIBABA_CALLBACK_PATH}`;
}

export function buildAlibabaAuthorizeUrl(state: string): string {
  const appKey = requiredEnv("ALIBABA_APP_KEY");
  // This app is registered as an ICBU/IOP app. Its App Key is recognized by
  // the IOP authorization gateway; the generic oauth.alibaba.com endpoint
  // returns param-appkey.not.exists for this app type.
  const endpoint = process.env.ALIBABA_OAUTH_AUTHORIZE_URL ?? "https://open-api.alibaba.com/oauth/authorize";
  const url = new URL(endpoint);

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", appKey);
  url.searchParams.set("redirect_uri", alibabaCallbackUrl());
  url.searchParams.set("state", state);
  url.searchParams.set("view", "web");
  url.searchParams.set("sp", "icbu");
  // Alibaba's ICBU OAuth flow can return to the account selector without
  // issuing a code when the existing browser session is only partially
  // authenticated. The documented force_login flag makes the user complete
  // a fresh seller login before showing the authorization page.
  if (process.env.ALIBABA_FORCE_LOGIN !== "false") {
    url.searchParams.set("force_login", "true");
  }
  if (process.env.ALIBABA_FORCE_AUTH === "true") {
    url.searchParams.set("force_auth", "true");
  }
  return url.toString();
}

function signIopRequest(method: string, params: StringMap, appSecret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");
  return createHmac("sha256", appSecret).update(`${method}${payload}`, "utf8").digest("hex").toUpperCase();
}

export async function callAlibabaIop(method: string, session: string, input: Record<string, string>): Promise<Record<string, unknown>> {
  const appKey = requiredEnv("ALIBABA_APP_KEY");
  const appSecret = requiredEnv("ALIBABA_APP_SECRET");
  const endpoint = process.env.ALIBABA_API_ENDPOINT ?? "https://eco.taobao.com/router/rest";
  const params: StringMap = {
    app_key: appKey,
    format: "json",
    method,
    session,
    sign_method: "hmac",
    timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    v: "2.0",
    ...input,
  };
  const body = new URLSearchParams({ ...params, sign: signIopRequest(method, params, appSecret) });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
    cache: "no-store",
  });
  const parsed = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) throw new Error(`Alibaba API returned HTTP ${response.status}`);
  if (!parsed) throw new Error("Alibaba API returned an unreadable response");
  return parsed;
}

export async function exchangeAlibabaCode(code: string): Promise<AlibabaToken> {
  const appKey = requiredEnv("ALIBABA_APP_KEY");
  const appSecret = requiredEnv("ALIBABA_APP_SECRET");
  const endpoint = process.env.ALIBABA_TOKEN_ENDPOINT ?? "https://open-api.alibaba.com/rest/auth/token/create";
  const method = process.env.ALIBABA_TOKEN_METHOD ?? "/auth/token/create";

  const params: StringMap = {
    app_key: appKey,
    code,
    language: "en_US",
    sign_method: "sha256",
    simplify: "true",
    timestamp: Date.now().toString(),
  };
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("sign", signIopRequest(method, params, appSecret));

  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) throw new Error(`Alibaba token exchange failed with HTTP ${response.status}`);

  const token = body?.access_token;
  if (typeof token !== "string" || !token) {
    const codeValue = typeof body?.code === "string" || typeof body?.code === "number" ? body.code : "unknown";
    throw new Error(`Alibaba token exchange returned no access token (code: ${codeValue})`);
  }

  return {
    access_token: token,
    refresh_token: typeof body?.refresh_token === "string" ? body.refresh_token : undefined,
    expires_in: typeof body?.expires_in === "number" ? body.expires_in : undefined,
    refresh_expires_in: typeof body?.refresh_expires_in === "number" ? body.refresh_expires_in : undefined,
    account_id: typeof body?.account_id === "string" ? body.account_id : undefined,
    account_platform: typeof body?.account_platform === "string" ? body.account_platform : undefined,
    country: typeof body?.country === "string" ? body.country : undefined,
  };
}

export function sameSecret(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function requiredAlibabaCookieSecret(): string {
  return requiredEnv("ALIBABA_TOKEN_COOKIE_SECRET");
}
