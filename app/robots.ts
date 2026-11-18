import type { MetadataRoute } from "next";
import { getAppUrl } from "./_lib/site-url";

/**
 * Allows crawling of the whole site. Token pages carry `noindex` in their own
 * metadata; blocking them in robots would hide the directive (SEO.md).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
