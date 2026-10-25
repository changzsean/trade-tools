// Portal smoke checks. The complete engine checks remain in aihot/scripts/smoke.ts.
const baseAt = process.argv.indexOf("--base");
const base = baseAt >= 0 ? process.argv[baseAt + 1] : "http://localhost:3000";
if (!base || !/^https?:\/\//.test(base)) throw new Error("Use --base http(s)://host");
const checks = [
  ["/", ["社区互动", 'href="/aihot"']],
  ["/community/feed", ["MEEKA"]],
  ["/resources", ["MEEKA"]],
  ["/growth", ["MEEKA"]],
  ["/terms", ["会员服务协议", "newsletter@hitacit.com"]],
  ["/privacy", ["隐私说明", "美国东部"]],
  ["/register", ["会员服务协议", "隐私说明"]],
  ["/forgot-password", ["找回密码"]],
  ["/reset-password", ["重置密码"]],
  ["/lab", ["MEEKA"]],
  ["/workspace", ["MEEKA"]],
  ["/aihot", ["AI与外贸资讯", "AI动态", "AI方法", "AI+外贸案例", "外贸动态", "市场机会", "新产品"]],
  ["/aihot?category=ai-trade", ["AI+外贸案例"]],
  ["/aihot?view=hot", ["热点榜"]],
  ["/aihot?view=daily", ["每日简报"]],
] as const;

let failed = 0;
for (const [route, expected] of checks) {
  try {
    const response = await fetch(new URL(route, base), { redirect: "error", signal: AbortSignal.timeout(15_000) });
    const html = await response.text();
    if (response.status !== 200 || expected.some(text => !html.includes(text))) throw new Error(`HTTP ${response.status} or missing page content`);
    console.log(`PASS ${route}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${route}: ${error instanceof Error ? error.message : "request failed"}`);
  }
}
if (failed) process.exitCode = 1;
else console.log("All portal smoke checks passed.");

if (process.argv.includes("--require-editorial")) {
  const index = await fetch(new URL("/aihot", base), { signal: AbortSignal.timeout(15_000) }).then(r => r.text());
  const path = index.match(/href="(\/aihot\/items\/[^"?#]+)"/)?.[1];
  if (!path) throw new Error("No published article to verify editorial reading");
  const response = await fetch(new URL(path, base), { redirect: "error", signal: AbortSignal.timeout(15_000) });
  const html = await response.text();
  if (response.status !== 200 || !html.includes("作者：meeka编辑部") || !html.includes("信息来源：")
    || html.includes("查看原文") || html.includes("编辑稿正在整理中")) throw new Error("Editorial body, byline or source footer is missing");
  console.log(`PASS ${path} editorial body, byline and source footer`);
}

export {};
