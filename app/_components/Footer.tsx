import Link from "next/link";
import { copy } from "../_lib/copy";

export function Footer() {
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
              <Link
                href="/sobre"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.about}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none text-text-muted/60">
              ·
            </li>
            <li>
              <Link
                href="/privacidade"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.privacy}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none text-text-muted/60">
              ·
            </li>
            <li>
              <Link
                href="/termos"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.terms}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none text-text-muted/60">
              ·
            </li>
            <li>
              <Link
                href="/contato"
                className="inline-flex min-h-11 items-center px-1 underline hover:text-text"
              >
                {copy.FTR_01.contact}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
