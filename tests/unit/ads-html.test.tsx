import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ParticipantArea } from "../../app/_components/ParticipantArea";
import type { ParticipantView } from "../../src/application/ports";
vi.mock("../../app/_lib/consent", () => ({ useAdConsent: () => "granted" }));
const view: ParticipantView = {
  displayName: "Ana",
  group: {
    name: "Família",
    exchangeDate: "2026-12-24",
    maxValueCents: 5000,
    location: null,
    status: "open",
  },
  ownWishItems: [],
};
describe("disabled ads HTML", () => {
  it("contains no Google script, domain or ad slot even with consent", () => {
    vi.stubEnv("ADS_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "pub-1234567890123456");
    const html = renderToStaticMarkup(<ParticipantArea view={view} adsAllowed />);
    expect(html).not.toMatch(/<script|<ins|google|googlesyndication/i);
    vi.unstubAllEnvs();
  });
});
