import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAdminViewUseCase } from "../../_lib/admin-usecase";
import { AdminPanel } from "../../_components/AdminPanel";
import { Card } from "../../_components/Card";
import { buttonClass } from "../../_components/Button";

export const metadata: Metadata = {
  title: "Painel do Organizador — Amigo Secreto",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

async function AdminContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getAdminViewUseCase(token);

  if (!result.ok) {
    return (
      <main className="mx-auto flex max-w-lg flex-col gap-6 py-8 px-4">
        <header><h1 className="text-xl font-bold sm:text-2xl text-danger">Link não disponível</h1></header>
        <Card tone="danger">
          <p className="text-base text-text">Este link é inválido ou não está mais disponível.</p>
          <p className="mt-2 text-sm text-text-muted">Verifique se você copiou o endereço completo ou crie um novo grupo.</p>
          <div className="mt-4"><Link className={buttonClass("primary")} href="/">Criar um novo grupo</Link></div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8 px-4">
      <AdminPanel initialData={result.value} adminToken={token} />
    </main>
  );
}

export default function AdminPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<main className="mx-auto flex max-w-2xl flex-col gap-4 py-8 px-4" aria-busy="true"><div className="h-8 w-48 animate-pulse rounded-lg bg-surface-muted" /><div className="h-40 w-full animate-pulse rounded-2xl bg-surface-muted" /></main>}>
      <AdminContent params={params} />
    </Suspense>
  );
}
