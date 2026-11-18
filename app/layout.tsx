import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { copy } from "./_lib/copy";
import { APP_NAME } from "./_lib/brand";
import { Footer } from "./_components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.GLB_04,
  applicationName: APP_NAME,
  other: { "google-adsense-account": "ca-pub-2752974850416759" },
  description: copy.GLB_03,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-10 focus:rounded-lg focus:bg-surface focus:p-3"
        >
          {copy.GLB_01}
        </a>
        <header className="border-b border-line">
          <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center px-5 sm:px-8">
            <Link href="/" className="inline-flex min-h-11 max-w-full items-center rounded-md">
              <Image
                src="/brand/papelzinho-logo.png"
                alt={copy.GLB_02}
                width={1000}
                height={194}
                className="h-auto w-44 max-w-full sm:w-52"
                priority
              />
            </Link>
          </div>
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
