import { notFound } from "next/navigation";
import { Button } from "../../_components/Button";
import { Card } from "../../_components/Card";
import { Input } from "../../_components/Input";

// Dev-only gallery of every component state (used for screenshots). 404 in production.
export default function UiGallery() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <h1 className="page-title">Design system</h1>
      <Card title="Botões">
        <div className="flex flex-col gap-3">
          <Button>Criar grupo</Button>
          <Button variant="secondary">Copiar link</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button loading>Criando…</Button>
          <Button disabled>Realizar sorteio</Button>
        </div>
      </Card>
      <Card title="Campos">
        <div className="flex flex-col gap-4">
          <Input label="Nome do grupo" hint="Até 60 letras" required defaultValue="Família 2026" />
          <Input label="Valor máximo" error="Informe um valor maior que zero" defaultValue="0" />
          <Input label="Local" disabled defaultValue="Casa da vovó" />
        </div>
      </Card>
      <Card tone="warning" title="Link do organizador">
        Guarde este link. Não compartilhe.
      </Card>
      <Card tone="success" title="Grupo criado">
        Agora convide os amigos.
      </Card>
      <Card tone="danger" title="Algo deu errado">
        Tente de novo em instantes.
      </Card>
    </main>
  );
}
