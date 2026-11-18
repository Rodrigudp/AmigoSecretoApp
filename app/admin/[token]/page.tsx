import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAdminViewUseCase } from "../../_lib/admin-usecase";
import { APP_NAME } from "../../_lib/brand";
import { AdminPanel } from "../../_components/AdminPanel";
import { Card } from "../../_components/Card";
import { buttonClass } from "../../_components/Button";

export const metadata: Metadata = {
  title: `Painel do organizador — ${APP_NAME}`,
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

async function AdminContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getAdminViewUseCase(token);

  if (!result.ok) {
    return (
      <main id="conteudo" tabIndex={-1} className="page-shell">
        <Card tone="warning" title="Link não disponível" heading="h1">
          <p className="text-base text-text">Este link é inválido ou não está mais disponível.</p>
          <p className="mt-2 text-sm text-text-muted">
            Verifique se você copiou o endereço completo ou crie um novo grupo.
          </p>
          <div className="mt-4">
            <Link className={buttonClass("primary")} href="/">
              Criar um novo grupo
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
              Carregando painel…
            </p>
          </Card>
        </main>
      }
    >
      <AdminContent params={params} />
    </Suspense>
  );
}
