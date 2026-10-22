const statusEl = document.getElementById("status");
const scanButton = document.getElementById("scan");
const syncButton = document.getElementById("sync");
const statusTitleEl = document.getElementById("status-title");
const statusStageEl = document.getElementById("status-stage");
const statusPageEl = document.getElementById("status-page");
const statusItemsEl = document.getElementById("status-items");
const statusProgressEl = document.getElementById("status-progress");
const statusPercentEl = document.getElementById("status-percent");
const statusUpdatedEl = document.getElementById("status-updated");

function show(text, className = "") {
  statusTitleEl.textContent = text;
  statusStageEl.textContent = "";
  statusPageEl.textContent = "—";
  statusItemsEl.textContent = "—";
  statusPercentEl.textContent = "";
  statusProgressEl.style.width = "0%";
  statusUpdatedEl.textContent = "";
  statusEl.className = `status ${className}`;
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `最近更新 ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

function renderStatus(status, scan) {
  const currentStatus = status?.status;
  const pageCount = Number(status?.pageCount ?? scan?.pageCount ?? 0);
  const itemCount = Number(status?.itemCount ?? scan?.items?.length ?? 0);
  const pageLimit = Number(status?.pageLimit ?? 20);
  const currentPage = Number(status?.currentPage ?? pageCount);
  const progress = currentStatus === "complete" ? 100 : Math.min(96, Math.max(currentPage, pageCount) / pageLimit * 100);

  statusEl.className = `status ${currentStatus === "complete" ? "ok" : currentStatus === "error" ? "error" : ""}`;
  statusTitleEl.textContent = currentStatus === "scanning" ? "正在采集" : currentStatus === "complete" ? "采集完成" : currentStatus === "error" ? "采集失败" : itemCount ? "已有采集结果" : "等待开始采集";
  statusStageEl.textContent = status?.stage || (currentStatus === "error" ? status?.error || "请重试" : itemCount ? "可同步到 MEEKA 后台" : "请在 Alibaba 店铺集合页开始采集");
  statusPageEl.textContent = currentStatus === "scanning" ? `${currentPage}/${pageLimit}` : `${pageCount}`;
  statusItemsEl.textContent = `${itemCount}`;
  statusProgressEl.style.width = `${Math.max(0, progress)}%`;
  statusPercentEl.textContent = currentStatus === "scanning" ? `${Math.round(progress)}%` : currentStatus === "complete" ? "100%" : "";
  statusUpdatedEl.textContent = formatTime(status?.updatedAt || scan?.savedAt);
  scanButton.disabled = currentStatus === "scanning";
}

async function currentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function refreshStatus() {
  const result = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  renderStatus(result?.collectorStatus, result?.lastScan);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "COLLECTOR_STATUS") renderStatus(message.collectorStatus, null);
});

scanButton.addEventListener("click", async () => {
  scanButton.disabled = true;
  const tab = await currentTab();
  const result = await chrome.runtime.sendMessage({ type: "START_AUTO_SCAN", tab: { id: tab?.id, url: tab?.url } });
  if (!result?.ok) show(result?.error || "无法开始采集", "error");
  else refreshStatus().catch(() => undefined);
  window.setTimeout(() => refreshStatus().catch(() => undefined), 1200);
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
window.setInterval(() => refreshStatus().catch(() => undefined), 1000);
