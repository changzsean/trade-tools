const MAX_PAGES = 20;
const state = { active: false, tabId: null, startUrl: "", items: {}, pageCount: 0 };
let scanInFlight = false;

function supportedStorePage(url) {
  try {
    const parsed = new URL(url);
    return [".en.alibaba.com", ".fm.alibaba.com", ".trustpass.alibaba.com"].some((suffix) => parsed.hostname.endsWith(suffix))
      && ["/productlist.html", "/featureproductlist.html", "/search/product"].includes(parsed.pathname);
  } catch {
    return false;
  }
}

async function saveStatus(status, extra = {}) {
  const collectorStatus = {
    status,
    pageCount: state.pageCount,
    itemCount: Object.keys(state.items).length,
    pageLimit: MAX_PAGES,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
  await chrome.storage.local.set({ collectorStatus });
  chrome.runtime.sendMessage({ type: "COLLECTOR_STATUS", collectorStatus }).catch(() => undefined);
}

async function finish() {
  state.active = false;
  const items = Object.values(state.items);
  await chrome.storage.local.set({ lastScan: { sourceStoreUrl: state.startUrl, items, pageCount: state.pageCount, savedAt: new Date().toISOString() } });
  await saveStatus("complete", { sourceStoreUrl: state.startUrl, stage: "采集完成，可同步到 MEEKA 后台" });
}

async function scanTab() {
  if (!state.active || state.tabId === null || scanInFlight) return;
  scanInFlight = true;
  try {
    const currentPage = state.pageCount + 1;
    await saveStatus("scanning", { currentPage, stage: `正在加载第 ${currentPage} 页，触发懒加载…` });
    const result = await chrome.tabs.sendMessage(state.tabId, { type: "SCAN_PAGE", autoScroll: true });
    state.pageCount += 1;
    for (const item of result?.items ?? []) state.items[item.sourceProductId] = item;
    await saveStatus("scanning", {
      currentPage,
      currentPageUrl: result?.pageUrl ?? "",
      stage: `第 ${currentPage} 页完成，已识别 ${Object.keys(state.items).length} 个商品，正在判断下一页…`,
    });
    const nextUrl = typeof result?.nextUrl === "string" ? result.nextUrl : "";
    if (!nextUrl || nextUrl === result.pageUrl || state.pageCount >= MAX_PAGES) return finish();
    await saveStatus("scanning", { currentPage: currentPage + 1, stage: `准备打开第 ${currentPage + 1} 页…` });
    await chrome.tabs.update(state.tabId, { url: nextUrl });
  } catch (error) {
    state.active = false;
    await saveStatus("error", { stage: "采集中断", error: error instanceof Error ? error.message : "页面扫描失败" });
  } finally {
    scanInFlight = false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "START_AUTO_SCAN") {
    const tab = message.tab;
    if (!tab?.id || !supportedStorePage(tab.url ?? "")) {
      sendResponse({ ok: false, error: "请先打开 Alibaba 国际站店铺产品集合页" });
      return;
    }
    state.active = true;
    state.tabId = tab.id;
    state.startUrl = tab.url;
    state.items = {};
    state.pageCount = 0;
    saveStatus("scanning", { sourceStoreUrl: state.startUrl }).then(() => scanTab());
    sendResponse({ ok: true });
    return;
  }

  if (message?.type === "GET_STATUS") {
    chrome.storage.local.get(["collectorStatus", "lastScan"]).then((data) => sendResponse({ ok: true, ...data }));
    return true;
  }

  if (message?.type === "PAGE_PROGRESS") {
    if (state.active && sender.tab?.id === state.tabId) {
      saveStatus("scanning", {
        currentPage: state.pageCount + 1,
        currentPageUrl: sender.tab.url ?? state.startUrl,
        stage: message.stage || `正在处理第 ${state.pageCount + 1} 页…`,
        scrollRound: message.scrollRound,
        pageHeight: message.pageHeight,
      });
    }
    return;
  }

  if (message?.type === "PAIR_ACCESS_TOKEN") {
    const token = typeof message.accessToken === "string" ? message.accessToken.trim() : "";
    if (!token) { sendResponse({ ok: false, error: "缺少访问令牌" }); return; }
    chrome.storage.local.set({ supabaseAccessToken: token }).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message?.type === "CLEAR_PAIR") {
    chrome.storage.local.remove("supabaseAccessToken").then(() => sendResponse({ ok: true }));
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (state.active && state.tabId === tabId && changeInfo.status === "complete") scanTab();
});
