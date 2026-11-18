import type { Metadata } from "next";
import { APP_NAME } from "./brand";
import { getAppUrl } from "./site-url";

/** Meta robots for any URL that carries a capability token (grupos.md §6.2). */
export const TOKEN_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  noarchive: true,
};

export const TOKEN_HTTP_HEADERS: { key: string; value: string }[] = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
];

/** Absolute URL of the invite Open Graph image (grupos.md §6.1). */
export function inviteOgImageUrl(origin = getAppUrl()): string {
  return `${origin}/images/og-invite-preview.png`;
}

/** Open Graph + Twitter card for `/g/[inviteToken]` (RNF09). */
export function inviteOpenGraphMetadata(input: {
  groupName: string;
  inviteToken: string;
  origin?: string;
}): Metadata {
  const origin = input.origin ?? getAppUrl();
  const title = `${input.groupName} — ${APP_NAME}`;
  const inviteDescription = `Você foi convidado para o amigo secreto '${input.groupName}'.`;
  const description = `${inviteDescription} Toque para entrar e montar sua lista de presentes!`;
  const url = `${origin}/g/${encodeURIComponent(input.inviteToken)}`;
  const image = inviteOgImageUrl(origin);

  return {
    title,
    description,
    robots: TOKEN_ROBOTS,
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: inviteDescription,
      images: [image],
    },
  };
}

/** Neutral metadata when the invite token is invalid (still noindex). */
export function invalidInviteMetadata(): Metadata {
  return {
    title: APP_NAME,
    description: "Este link é inválido ou não está mais disponível.",
    robots: TOKEN_ROBOTS,
  };
}

/** Shared robots/no-referrer metadata for personal and admin token pages. */
export function tokenOnlyMetadata(title: string): Metadata {
  return {
    title: `${title} — ${APP_NAME}`,
    robots: TOKEN_ROBOTS,
    referrer: "no-referrer",
  };
}
