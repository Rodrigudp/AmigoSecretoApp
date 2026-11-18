import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdSlot } from "../../app/_components/AdSlot";

vi.mock("../../app/_lib/consent", () => ({ useAdConsent: () => "granted" }));
afterEach(() => {
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
});
