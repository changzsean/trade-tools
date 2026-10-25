import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://meeka.com.cn/" }, { url: "https://meeka.com.cn/aihot" }, { url: "https://meeka.com.cn/terms" }, { url: "https://meeka.com.cn/privacy" }];
}
