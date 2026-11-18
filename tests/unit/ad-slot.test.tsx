import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdSlot } from "../../app/_components/AdSlot";

const consent = vi.hoisted(() => ({ value: "granted" as "granted" | "denied" | "unknown" }));
vi.mock("../../app/_lib/consent", () => ({ useAdConsent: () => consent.value }));
afterEach(() => {
  consent.value = "granted";
  document.querySelectorAll('script[src*="googlesyndication"]').forEach((s) => s.remove());
});
describe("ad gates", () => {
  it.each([
    { enabled: false, adsAllowed: true },
    { enabled: true, adsAllowed: false },
  ])("renders no Google content when disallowed", (flags) => {
    const { container } = render(
      <AdSlot {...flags} client="pub-1234567890123456" slot="1234567890" />
    );
    expect(container.innerHTML).toBe("");
    expect(screen.queryByLabelText("Publicidade")).toBeNull();
    expect(document.querySelector('script[src*="googlesyndication"]')).toBeNull();
  });
  it.each(["unknown", "denied"] as const)("does not load Google without consent: %s", (value) => {
    consent.value = value;
    const { container } = render(
      <AdSlot enabled adsAllowed client="pub-1234567890123456" slot="1234567890" />
    );
    expect(container.innerHTML).toBe("");
    expect(document.querySelector('script[src*="googlesyndication"]')).toBeNull();
  });
});
