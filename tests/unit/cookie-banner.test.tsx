import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieBanner } from "../../app/_components/CookieBanner";
import { Footer } from "../../app/_components/Footer";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

import { usePathname } from "next/navigation";
const mockUsePathname = vi.mocked(usePathname);

describe("CookieBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUsePathname.mockReturnValue("/");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not render when adsEnabled is false", () => {
    render(<CookieBanner adsEnabled={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the banner on a public route when ads are enabled", () => {
    render(<CookieBanner adsEnabled={true} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
  });

  it.each([
    "/g",
    "/g/invite",
    "/p",
    "/p/personal",
    "/p/g/group-id",
    "/admin/token",
    "/owner",
    "/r/item-id",
  ])("does not render on %s", (path) => {
    mockUsePathname.mockReturnValue(path);
    render(<CookieBanner adsEnabled />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders on /sobre (public route)", () => {
    mockUsePathname.mockReturnValue("/sobre");
    render(<CookieBanner adsEnabled={true} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("stores 'granted' and hides the banner when user clicks accept", () => {
    const { rerender } = render(<CookieBanner adsEnabled={true} />);
    const acceptBtn = screen.getByText("Aceitar");
    fireEvent.click(acceptBtn);
    expect(localStorage.getItem("pz_ad_consent")).toBe("granted");
    // Re-render to check the banner disappears
    rerender(<CookieBanner adsEnabled={true} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("stores 'denied' and hides the banner when user clicks decline", () => {
    const { rerender } = render(<CookieBanner adsEnabled={true} />);
    const declineBtn = screen.getByText("Recusar");
    fireEvent.click(declineBtn);
    expect(localStorage.getItem("pz_ad_consent")).toBe("denied");
    rerender(<CookieBanner adsEnabled={true} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("both buttons have equal visual weight (same classes)", () => {
    render(<CookieBanner adsEnabled={true} />);
    const acceptBtn = screen.getByText("Aceitar");
    const declineBtn = screen.getByText("Recusar");
    expect(acceptBtn.className).toBe(declineBtn.className);
  });

  it("does not render any script tag for Google", () => {
    render(<CookieBanner adsEnabled={true} />);
    expect(document.querySelector('script[src*="google"], iframe[src*="google"]')).toBeNull();
    expect(document.cookie).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Recusar" }));
    expect(document.querySelector('script[src*="google"], iframe[src*="google"]')).toBeNull();
    expect(document.cookie).toBe("");
  });

  it("does not set any cookie (only localStorage)", () => {
    render(<CookieBanner adsEnabled={true} />);
    fireEvent.click(screen.getByText("Aceitar"));
    expect(document.cookie).toBe("");
  });

  it("restores the prompt through the footer and leaves consent unknown", () => {
    localStorage.setItem("pz_ad_consent", "denied");
    render(
      <>
        <Footer adsEnabled />
        <CookieBanner adsEnabled />
      </>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cookies" }));
    expect(localStorage.getItem("pz_ad_consent")).toBeNull();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("does not show cookie controls with the flag off, even with a saved choice", () => {
    localStorage.setItem("pz_ad_consent", "granted");
    render(<Footer adsEnabled={false} />);
    expect(screen.queryByRole("button", { name: "Cookies" })).toBeNull();
  });

  it("reports a failure when the browser refuses to save the revocation", () => {
    localStorage.setItem("pz_ad_consent", "granted");
    const blocked = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    render(<Footer adsEnabled />);
    fireEvent.click(screen.getByRole("button", { name: "Cookies" }));
    expect(screen.getByRole("alert")).toBeTruthy();
  });
});
