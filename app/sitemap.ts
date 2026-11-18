import type { MetadataRoute } from "next";
import { getAppUrl } from "./_lib/site-url";

/**
 * Public canonical URLs only. Token routes (/g, /p, /admin) stay out because
 * they are `noindex` (SEO.md). Origin comes from APP_URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getAppUrl();

  return [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/como-funciona`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
