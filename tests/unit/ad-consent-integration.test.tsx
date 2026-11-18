import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdSlot } from "../../app/_components/AdSlot";
import { setAdConsent } from "../../app/_lib/consent";

const googleScripts = () => document.querySelectorAll('script[src*="googlesyndication"]');
class VisibleObserver {
  observe() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = "";
  thresholds = [];
  constructor(private callback: IntersectionObserverCallback) {}
}
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("IntersectionObserver", VisibleObserver);
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  document.querySelectorAll('script[src*="googlesyndication"]').forEach((node) => node.remove());
});
describe("AdSlot with real consent", () => {
  it("loads nothing before consent or after refusal and loads after explicit grant", async () => {
    render(<AdSlot enabled adsAllowed client="pub-1234567890123456" slot="1234567890" />);
    expect(googleScripts()).toHaveLength(0);
    expect(document.cookie).toBe("");
    act(() => {
      setAdConsent("denied");
    });
    expect(googleScripts()).toHaveLength(0);
    expect(document.cookie).toBe("");
    act(() => {
      setAdConsent("granted");
    });
    await waitFor(() => expect(googleScripts()).toHaveLength(1));
    const remove = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    act(() => {
      expect(setAdConsent("unknown")).toBe(true);
    });
    await waitFor(() => expect(googleScripts()).toHaveLength(0));
    cleanup();
    render(<AdSlot enabled adsAllowed client="pub-1234567890123456" slot="1234567890" />);
    expect(googleScripts()).toHaveLength(0);
    expect(document.cookie).toBe("");
    remove.mockRestore();
  });
});
