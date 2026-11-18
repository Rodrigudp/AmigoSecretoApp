import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "./_lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  applicationName: APP_NAME,
  description: "Organize seu amigo secreto em 2 minutos, sem cadastro e sem senha.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-10 focus:rounded-lg focus:bg-surface focus:p-3"
        >
          Pular para o conteúdo
        </a>
        <header className="border-b border-line">
          <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center px-5 sm:px-8">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 rounded-md font-bold tracking-tight"
            >
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 -rotate-6 place-items-center rounded-lg border border-[#e6bb56] bg-note text-sm font-bold text-text"
              >
                P
              </span>
              {APP_NAME}
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
