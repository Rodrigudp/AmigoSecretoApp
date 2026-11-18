import { copy } from "./_lib/copy";
import Link from "next/link";
import { buttonClass } from "./_components/Button";
import { Card } from "./_components/Card";

export default function NotFound() {
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <Card title={copy.GLB_05} heading="h1">
        <p className="mb-4 text-text-muted">{copy.GLB_06.text}</p>
        <Link href="/" className={buttonClass()}>
          {copy.GLB_06.action}
        </Link>
      </Card>
    </main>
  );
}
