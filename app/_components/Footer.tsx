"use client";


import { useState } from "react";
import { copy } from "../_lib/copy";
import { useAdConsent, setAdConsent } from "../_lib/consent";

function CookiePreferences() {
  const consent = useAdConsent();
  const [failed, setFailed] = useState(false);
  if (consent === "unknown") return null;

  return (
    <>
      <li aria-hidden="true" className="select-none text-text-muted/60">
        ·
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            if (!setAdConsent("unknown")) {
              setFailed(true);
              return;
            }
            // Unload any advertising code that already ran in this document.
            if (consent === "granted") window.location.reload();
          }}
          className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
        >
          {copy.FTR_10}
        </button>
        {failed && <p role="alert">{copy.CKB_06}</p>}
      </li>
    </>
  );
}

export function Footer({ adsEnabled }: { adsEnabled?: boolean }) {
  return (
    <footer
      aria-label={copy.FTR_02}
      className="mt-auto border-t border-line py-8 text-sm text-text-muted"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 text-center sm:flex-row sm:px-8 sm:text-left">
        <p>{copy.FTR_03}</p>
        <nav aria-label={copy.FTR_02}>
          <ul className="flex flex-wrap items-center justify-center gap-x-2">
            <li>
              <a
                href="/sobre"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.about}
              </a>
            </li>
            <li aria-hidden="true" className="select-none text-text-muted/60">
              ·
            </li>
            <li>
              <a
                href="/privacidade"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.privacy}
              </a>
            </li>
            <li aria-hidden="true" className="select-none text-text-muted/60">
              ·
            </li>
            <li>
              <a
                href="/termos"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.terms}
              </a>
            </li>
            <li aria-hidden="true" className="select-none text-text-muted/60">
              ·
            </li>
            <li>
              <a
                href="/contato"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.contact}
              </a>
            </li>
            {adsEnabled && <CookiePreferences />}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
