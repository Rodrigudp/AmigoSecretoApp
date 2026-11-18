import Link from "next/link";
import { buttonClass } from "./_components/Button";
import { Card } from "./_components/Card";

export default function NotFound() {
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <Card title="Página não encontrada" heading="h1">
        <p className="mb-4 text-text-muted">Confira o endereço ou volte para a página inicial.</p>
        <Link href="/" className={buttonClass()}>
          Voltar ao início
        </Link>
      </Card>
    </main>
  );
}
