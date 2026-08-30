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

async function loadLazyProducts() {
  const originalY = window.scrollY;
  let previousHeight = 0;
  let stableRounds = 0;
  for (let i = 0; i < 12 && stableRounds < 2; i += 1) {
    window.scrollTo(0, document.body.scrollHeight);
    await wait(550);
    const height = document.body.scrollHeight;
    if (height === previousHeight) stableRounds += 1;
    else stableRounds = 0;
    previousHeight = height;
  }
  window.scrollTo(0, originalY);
}

function nextPageUrl() {
  const candidates = [...document.querySelectorAll("a[href]")].filter((link) => {
    const label = clean(`${link.textContent} ${link.getAttribute("aria-label")} ${link.getAttribute("title")} ${link.className}`, 200).toLowerCase();
    return /next|下一页|下页/.test(label);
  });
  const link = candidates.find((candidate) => {
    try { return new URL(candidate.href).origin === window.location.origin; } catch { return false; }
  });
  return link?.href ?? "";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "SCAN_PAGE") return;
  if (!isSupportedPage()) { sendResponse({ items: [], pageUrl: window.location.href, nextUrl: "" }); return; }
  (async () => {
    if (message.autoScroll) await loadLazyProducts();
    sendResponse({ items: scanCards(), pageUrl: window.location.href, nextUrl: nextPageUrl() });
  })();
  return true;
});
