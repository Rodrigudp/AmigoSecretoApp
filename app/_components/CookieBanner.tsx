"use client";

import { usePathname } from "next/navigation";
import { useAdConsent, setAdConsent } from "../_lib/consent";
import { copy } from "../_lib/copy";

/** Route prefixes where ads (and therefore the banner) are forbidden (ADR-004). */
const TOKEN_PREFIXES = ["/g", "/p", "/admin", "/owner", "/r"];

function isTokenRoute(pathname: string): boolean {
  return TOKEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * LGPD / RNF05 cookie-consent banner for Google AdSense.
 *
 * Rules:
 * - Only renders when `ADS_ENABLED=true` (env injected as prop).
 * - Hidden on token routes (/g/, /p/, /admin, /owner) per ADR-004.
 * - Hidden once the user accepts or declines.
 * - Choice stored in localStorage (`pz_ad_consent`), never sent to the server.
 * - Revocable via "Cookies" link in footer (resets to 'unknown').
 * - Both "Aceitar" and "Recusar" have equal visual weight (same button style).
 */
export function CookieBanner({ adsEnabled }: { adsEnabled: boolean }) {
  const consent = useAdConsent();
  const pathname = usePathname();

  // Don't render if ads are off, choice already made, or on a token route.
  if (!adsEnabled || consent !== "unknown" || isTokenRoute(pathname)) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label={copy.CKB_01}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface px-5 py-4 shadow-lg sm:px-8"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="flex-1 text-sm text-text">
          {copy.CKB_02}{" "}
          <a href="/privacidade" className="underline">
            {copy.CKB_05}
          </a>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setAdConsent("granted")}
            className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-5 py-2 text-sm font-medium text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            {copy.CKB_03}
          </button>
          <button
            type="button"
            onClick={() => setAdConsent("denied")}
            className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-5 py-2 text-sm font-medium text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            {copy.CKB_04}
          </button>
        </div>
      </div>
    </div>
  );
}
