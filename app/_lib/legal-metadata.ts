import type { Metadata } from "next";
import { APP_NAME } from "./brand";
import { getAppUrl } from "./site-url";

/** Metadata for public legal pages: absolute canonical from APP_URL, indexable (RNF09, AdSense). */
export function legalMetadata(input: {
  title: string;
  path: string;
  description: string;
}): Metadata {
  const url = `${getAppUrl()}${input.path}`;
  const title = `${input.title} — ${APP_NAME}`;
  return {
    title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title,
      description: input.description,
      url,
    },
  };
}
