// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import { getAppUrl } from "../../app/_lib/site-url";
import { publicPageMetadata, socialCardUrl } from "../../app/_lib/public-metadata";

afterEach(() => vi.unstubAllEnvs());

describe("public page metadata", () => {
  it("builds canonical and Open Graph from APP_URL", () => {
    vi.stubEnv("APP_URL", "https://papelzinho.smartsolutionsbr.com.br");
    const metadata = publicPageMetadata({
      title: "Amigo secreto online — Papelzinho",
      description: "Organize seu amigo secreto sem cadastro e sem senha.",
      path: "/",
    });

    expect(metadata.title).toBe("Amigo secreto online — Papelzinho");
    expect(metadata.description).toBe("Organize seu amigo secreto sem cadastro e sem senha.");
    expect(metadata.alternates?.canonical).toBe("https://papelzinho.smartsolutionsbr.com.br/");
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "https://papelzinho.smartsolutionsbr.com.br/",
      images: [
        {
          url: "https://papelzinho.smartsolutionsbr.com.br/images/og-invite-preview.png",
          width: 1200,
          height: 630,
        },
      ],
    });
  });

  it("strips a trailing slash from APP_URL", () => {
    vi.stubEnv("APP_URL", "https://papelzinho.app/");
    expect(getAppUrl()).toBe("https://papelzinho.app");
    expect(socialCardUrl()).toBe("https://papelzinho.app/images/og-invite-preview.png");
  });
});

describe("sitemap", () => {
  it("lists only the public pages on the APP_URL origin", () => {
    const origin = getAppUrl();

    expect(sitemap().map((entry) => entry.url)).toEqual([`${origin}/`, `${origin}/como-funciona`]);
  });

  it("never lists token routes", () => {
    const urls = sitemap()
      .map((entry) => entry.url)
      .join("\n");

    expect(urls).not.toMatch(/\/g\//);
    expect(urls).not.toMatch(/\/p\//);
    expect(urls).not.toMatch(/\/admin\//);
  });
});

describe("robots", () => {
  it("allows crawling and points to the sitemap", () => {
    const result = robots();

    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe(`${getAppUrl()}/sitemap.xml`);
  });
});
