function isSupportedPage() {
  const path = window.location.pathname;
  const host = window.location.hostname;
  return [".en.alibaba.com", ".fm.alibaba.com", ".trustpass.alibaba.com"].some((suffix) => host.endsWith(suffix))
    && ["/productlist.html", "/featureproductlist.html", "/search/product"].includes(path);
}

function clean(value, max = 500) {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function productIdFromUrl(href) {
  const match = href.match(/(?:_|product-detail\/)([0-9]{5,})/i);
  return match?.[1] ?? "";
}

function scanCards() {
  const items = new Map();
  for (const card of document.querySelectorAll(".icbu-product-card.product-item")) {
    const id = clean(card.getAttribute("data-id"), 128);
    const link = card.querySelector("a[href*='product-detail'], a[href]");
    const href = link?.href ?? (id ? `https://www.alibaba.com/product-detail/_${id}.html` : "");
    const sourceProductId = id || productIdFromUrl(href);
    if (!sourceProductId || !href) continue;
    const image = card.querySelector("img[src], img[data-src]");
    const title = clean(card.querySelector("h1,h2,h3,[class*='title'],[class*='name']")?.textContent || link?.textContent);
    items.set(sourceProductId, {
      sourceProductId,
      sourceUrl: href,
      sourceTitle: title,
      sourceImageUrl: image?.getAttribute("src") || image?.getAttribute("data-src") || "",
      rawPayload: { pageUrl: window.location.href, collectedAt: new Date().toISOString() },
    });
  }
  return [...items.values()];
}

async function wait(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }

function reportProgress(payload) {
  chrome.runtime.sendMessage({ type: "PAGE_PROGRESS", ...payload }).catch(() => undefined);
}

async function loadLazyProducts() {
  const originalY = window.scrollY;
  let previousHeight = 0;
  let stableRounds = 0;
  for (let i = 0; i < 12 && stableRounds < 2; i += 1) {
    window.scrollTo(0, document.body.scrollHeight);
    await wait(550);
    const height = document.body.scrollHeight;
    reportProgress({
      stage: `正在滚动加载第 ${i + 1} 轮（页面高度 ${height}px）…`,
      scrollRound: i + 1,
      pageHeight: height,
    });
    if (height === previousHeight) stableRounds += 1;
    else stableRounds = 0;
    previousHeight = height;
  }
  window.scrollTo(0, originalY);
}

function pageNumberFromUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    for (const key of ["page", "pageNo", "pageNum", "currentPage", "pageIndex"]) {
      const value = Number(parsed.searchParams.get(key));
      if (Number.isFinite(value) && value > 0) return value;
    }
  } catch { /* ignore malformed candidate URLs */ }
  return 0;
}

function currentPageNumber() {
  const fromUrl = pageNumberFromUrl(window.location.href);
  if (fromUrl) return fromUrl;
  const current = document.querySelector("[aria-current='page'], .pagination .active, [class*='pagination'] [class*='active']");
  const match = clean(current?.textContent).match(/^\d+$/);
  return match ? Number(match[0]) : 1;
}

function candidatePageNumber(element, href) {
  for (const attribute of ["data-page", "data-pageno", "data-page-num", "data-page-number"]) {
    const value = Number(element.getAttribute(attribute));
    if (Number.isFinite(value) && value > 0) return value;
  }
  const fromUrl = pageNumberFromUrl(href);
  if (fromUrl) return fromUrl;
  const match = clean(element.textContent).match(/^\d+$/);
  return match ? Number(match[0]) : 0;
}

function nextPageUrl() {
  const currentPage = currentPageNumber();
  const candidates = [...document.querySelectorAll("a[href], [role='link'][href], button, [role='button']")]
    .map((element) => {
      const childLink = element.querySelector?.("a[href]");
      const href = element.getAttribute("href") || element.getAttribute("data-href") || element.getAttribute("data-url") || childLink?.getAttribute("href") || "";
      const label = clean(`${element.textContent} ${element.getAttribute("aria-label")} ${element.getAttribute("title")} ${element.getAttribute("data-spm-anchor-id")} ${element.className}`, 300).toLowerCase();
      const paginationAncestor = element.closest("[class*='pagination'], [class*='pager'], nav, ul");
      const disabled = element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true" || /disabled|disable/.test(label);
      const page = candidatePageNumber(element, href);
      return { element, href, label, page, inPagination: Boolean(paginationAncestor), disabled };
    })
    .filter((candidate) => {
      if (candidate.disabled || !candidate.href || candidate.href.startsWith("javascript:")) return false;
      try {
        const parsed = new URL(candidate.href, window.location.href);
        return parsed.protocol === "https:" && parsed.hostname.endsWith(".alibaba.com") && ["/productlist.html", "/featureproductlist.html", "/search/product"].includes(parsed.pathname);
      } catch { return false; }
    })
    .map((candidate) => {
      let score = 0;
      if (/next|下一页|下页|nextpage|next-page/.test(candidate.label)) score += 100;
      if (candidate.inPagination) score += 30;
      if (candidate.page === currentPage + 1) score += 80;
      else if (candidate.page > currentPage) score += 20;
      if (pageNumberFromUrl(candidate.href)) score += 10;
      return { ...candidate, score };
    })
    .filter((candidate) => candidate.page === currentPage + 1 || /next|下一页|下页|nextpage|next-page/.test(candidate.label))
    .sort((left, right) => right.score - left.score);

  return candidates[0]?.href ? new URL(candidates[0].href, window.location.href).toString() : "";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "SCAN_PAGE") return;
  if (!isSupportedPage()) { sendResponse({ items: [], pageUrl: window.location.href, nextUrl: "" }); return; }
  (async () => {
    reportProgress({ stage: "正在检查商品卡片…" });
    if (message.autoScroll) await loadLazyProducts();
    reportProgress({ stage: "正在解析当前页商品信息…" });
    sendResponse({ items: scanCards(), pageUrl: window.location.href, nextUrl: nextPageUrl() });
  })();
  return true;
});
