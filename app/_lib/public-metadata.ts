import type { Metadata } from "next";
import { APP_NAME } from "./brand";
import { getAppUrl } from "./site-url";

/** Absolute URL of the shared social card (1200x630). */
export function socialCardUrl(origin = getAppUrl()): string {
  return `${origin}/images/og-invite-preview.png`;
}

/**
 * Metadata for indexable public pages. The canonical origin comes from APP_URL,
 * so it follows the deployed domain (RNF09) instead of a fixed host.
 */
export function publicPageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const origin = getAppUrl();
  const url = `${origin}${input.path}`;
  const image = socialCardUrl(origin);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title: input.title,
      description: input.description,
      url,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
