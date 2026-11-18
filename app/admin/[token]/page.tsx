import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAdminViewUseCase } from "../../_lib/admin-usecase";
import { copy } from "../../_lib/copy";
import { AdminPanel } from "../../_components/AdminPanel";
import { Card } from "../../_components/Card";
import { buttonClass } from "../../_components/Button";

export const metadata: Metadata = {
  title: copy.ADM_17,
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

async function AdminContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getAdminViewUseCase(token);

  if (!result.ok) {
    return (
      <main id="conteudo" tabIndex={-1} className="page-shell">
        <Card tone="warning" title={copy.ADM_16.title} heading="h1">
          <p className="text-base text-text">{copy.ADM_16.text}</p>
          <p className="mt-2 text-sm text-text-muted">{copy.ADM_16.help}</p>
          <div className="mt-4">
            <Link className={buttonClass("primary")} href="/">
              {copy.ADM_16.action}
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main id="conteudo" tabIndex={-1} className="page-shell page-shell--wide">
      <AdminPanel initialData={result.value} adminToken={token} />
    </main>
  );
}

export default function AdminPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense
      fallback={
        <main id="conteudo" tabIndex={-1} className="page-shell page-shell--wide" aria-busy="true">
          <Card>
            <p role="status" className="text-text-muted">
              {copy.GLB_07}
            </p>
          </Card>
        </main>
      }
    >
      <AdminContent params={params} />
    </Suspense>
  );
}
