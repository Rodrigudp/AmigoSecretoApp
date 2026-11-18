import { afterEach, describe, expect, it, vi } from "vitest";
import { consentGiven, setAdConsent } from "../../app/_lib/consent";

const storageKey = "pz_ad_consent";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("ad consent storage", () => {
  it.each([
    [null, false],
    ["granted", true],
    ["denied", false],
    ["invalid", false],
  ])("reports stored value %s as consent=%s", (value, expected) => {
    if (value !== null) localStorage.setItem(storageKey, value);
    expect(consentGiven()).toBe(expected);
  });

  it("persists both choices and removes the choice on reset", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    setAdConsent("granted");
    expect(localStorage.getItem(storageKey)).toBe("granted");
    setAdConsent("denied");
    expect(localStorage.getItem(storageKey)).toBe("denied");
    setAdConsent("unknown");
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(document.cookie).toBe("");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("leaves consent blocked when localStorage is unavailable", () => {
    const throwSecurityError = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(throwSecurityError);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(throwSecurityError);
    expect(() => setAdConsent("granted")).not.toThrow();
    expect(consentGiven()).toBe(false);
  });
});
