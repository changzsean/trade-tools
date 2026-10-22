window.addEventListener("message", (event) => {
  if (event.source !== window || event.origin !== window.location.origin) return;
  if (event.data?.type !== "MEEKA_PRODUCT_COPY_PAIR" || typeof event.data.accessToken !== "string") return;
  chrome.runtime.sendMessage({ type: "PAIR_ACCESS_TOKEN", accessToken: event.data.accessToken }, (result) => {
    window.postMessage({ type: "MEEKA_PRODUCT_COPY_PAIR_RESULT", ok: Boolean(result?.ok), error: result?.error }, window.location.origin);
  });
});
