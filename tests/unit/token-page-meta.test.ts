// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TOKEN_HTTP_HEADERS,
  TOKEN_ROBOTS,
  inviteOgImageUrl,
  inviteOpenGraphMetadata,
  invalidInviteMetadata,
  tokenOnlyMetadata,
} from "@/app/_lib/token-page-meta";
import { getAppUrl } from "@/app/_lib/site-url";
import { TOKEN_ROUTE_SOURCES } from "@/app/_lib/token-paths";

describe("token-page-meta (GRP-04, RNF09)", () => {
  it("builds invite Open Graph with group name, description, image 1200x630 and real origin", () => {
    const origin = "https://amigo-secreto-app-five.vercel.app";
    const meta = inviteOpenGraphMetadata({
      groupName: "Família Silva",
      inviteToken: "tok/abc",
      origin,
    });

    expect(meta.title).toBe("Família Silva — Papelzinho");
    expect(meta.openGraph?.siteName).toBe("Papelzinho");
    expect(meta.description).toContain("Família Silva");
    expect(meta.description).toBe(
      "Você foi convidado para o amigo secreto 'Família Silva'. Toque para entrar e dizer o seu nome."
    );
    expect(meta.description).not.toContain("lista de presentes");
    expect(meta.robots).toEqual(TOKEN_ROBOTS);
    expect(meta.openGraph?.url).toBe(`${origin}/g/tok%2Fabc`);
    expect(meta.openGraph?.images).toEqual([
      { url: `${origin}/images/og-invite-preview.png`, width: 1200, height: 630 },
    ]);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("marks invalid invites and token-only pages as noindex/nofollow/noarchive", () => {
    expect(invalidInviteMetadata().robots).toEqual({
      index: false,
      follow: false,
      noarchive: true,
    });
    expect(tokenOnlyMetadata("Área").robots).toEqual(TOKEN_ROBOTS);
  });

  it("exposes the HTTP headers from grupos.md §6.2", () => {
    expect(TOKEN_HTTP_HEADERS).toEqual([
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
    ]);
    expect([...TOKEN_ROUTE_SOURCES]).toEqual(["/g/:path*", "/p/:path*", "/admin/:path*"]);
  });

  it("serves a 1200x630 PNG at the spec path", () => {
    const file = readFileSync(join(process.cwd(), "public/images/og-invite-preview.png"));
    expect(file.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
    // IHDR width/height
    expect(file.readUInt32BE(16)).toBe(1200);
    expect(file.readUInt32BE(20)).toBe(630);
    expect(inviteOgImageUrl(getAppUrl())).toMatch(/\/images\/og-invite-preview\.png$/);
  });
});
