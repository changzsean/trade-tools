const statusEl = document.getElementById("status");
const scanButton = document.getElementById("scan");
const syncButton = document.getElementById("sync");

function show(text, className = "") { statusEl.textContent = text; statusEl.className = `status ${className}`; }

async function currentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function refreshStatus() {
  const result = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  const status = result?.collectorStatus;
  const scan = result?.lastScan;
  if (status?.status === "scanning") show(`采集中：第 ${status.pageCount ?? 0} 页，已识别 ${status.itemCount ?? 0} 个商品`);
  else if (status?.status === "error") show(status.error || "采集失败", "error");
  else if (scan?.items?.length) show(`已准备 ${scan.items.length} 个商品，可同步到后台`, "ok");
  else show("请在 Alibaba 店铺集合页开始采集");
}

scanButton.addEventListener("click", async () => {
  scanButton.disabled = true;
  const tab = await currentTab();
  const result = await chrome.runtime.sendMessage({ type: "START_AUTO_SCAN", tab: { id: tab?.id, url: tab?.url } });
  if (!result?.ok) show(result?.error || "无法开始采集", "error");
  else show("已开始采集，页面会自动处理后续分页");
  window.setTimeout(() => { scanButton.disabled = false; }, 1200);
});

syncButton.addEventListener("click", async () => {
  syncButton.disabled = true;
  try {
    const data = await chrome.storage.local.get(["lastScan", "supabaseAccessToken"]);
    if (!data.supabaseAccessToken) throw new Error("请先打开 MEEKA /product-copy/pair 完成配对");
    if (!data.lastScan?.items?.length) throw new Error("还没有采集结果");
    const response = await fetch("https://meeka.com.cn/api/product-copy/runs", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${data.supabaseAccessToken}` },
      body: JSON.stringify({ sourceStoreUrl: data.lastScan.sourceStoreUrl, items: data.lastScan.items }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "同步失败");
    show(`同步成功：${result.acceptedCount} 个商品已进入后台任务 ${result.runId}`, "ok");
  } catch (error) { show(error instanceof Error ? error.message : "同步失败", "error"); }
  syncButton.disabled = false;
});

document.getElementById("clear").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "CLEAR_PAIR" });
  show("已解除本机配对");
});

refreshStatus().catch(() => show("扩展状态读取失败", "error"));
