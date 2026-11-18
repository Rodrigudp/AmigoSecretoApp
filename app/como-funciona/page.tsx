import Link from "next/link";
import { Card } from "../_components/Card";
import { buttonClass } from "../_components/Button";
import { JsonLd } from "../_components/JsonLd";
import { APP_NAME } from "../_lib/brand";
import { publicPageMetadata } from "../_lib/public-metadata";
import { getAppUrl } from "../_lib/site-url";

export const metadata = publicPageMetadata({
  title: "Como funciona o amigo secreto — Papelzinho",
  description:
    "Veja como criar seu grupo, enviar o convite e participar do sorteio de amigo secreto pelo Papelzinho.",
  path: "/como-funciona",
});

const STEPS = [
  "O organizador cria o grupo e guarda o link de organizador.",
  "Compartilha apenas o convite.",
  "Cada pessoa entra com o nome e guarda o link pessoal.",
  "Com pelo menos três pessoas, o organizador faz o sorteio. Cada pessoa abre o próprio resultado.",
];

const FAQ = [
  {
    question: "Preciso de cadastro?",
    answer: "Não. Basta entrar pelo convite com o seu nome.",
  },
  {
    question: "Quantas pessoas podem participar?",
    answer: "O grupo aceita até 100 pessoas. Para fazer o sorteio, precisa de pelo menos três.",
  },
  {
    question: "O organizador vê os pares?",
    answer: "Não. O painel não mostra os pares.",
  },
  {
    question: "Posso entrar depois do sorteio?",
    answer: "Não. O grupo fecha para novas entradas.",
  },
  {
    question: "Como volto para a minha área?",
    answer: "Guarde o link pessoal.",
  },
];

export default function ComoFuncionaPage() {
  const origin = getAppUrl();

  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Como funciona o amigo secreto — Papelzinho",
          url: `${origin}/como-funciona`,
          inLanguage: "pt-BR",
          isPartOf: { "@type": "WebSite", name: APP_NAME, url: origin },
        }}
      />

      <header className="flex flex-col gap-4">
        <h1 className="page-title">Como funciona o amigo secreto</h1>
        <p className="max-w-xl font-accent text-xl leading-snug text-text-muted">
          Crie o grupo, envie o convite e faça o sorteio. Cada pessoa entra só com o nome.
        </p>
      </header>

      <ol aria-label="Passo a passo" className="flex flex-col gap-3">
        {STEPS.map((step, index) => (
          <li key={step} className="paper-panel flex items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-note font-semibold">
              {index + 1}
            </span>
            <span className="min-w-0 pt-1">{step}</span>
          </li>
        ))}
      </ol>

      <Card tone="warning" title="Atenção: links privados">
        <p>
          Não compartilhe esses links. O link de organizador permite alterar o grupo; o link pessoal
          dá acesso à sua área e ao seu resultado.
        </p>
      </Card>

      <section className="flex flex-col gap-4" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-bold tracking-tight">
          Perguntas frequentes
        </h2>
        {FAQ.map((item) => (
          <div key={item.question} className="flex flex-col gap-1">
            <h3 className="font-semibold">{item.question}</h3>
            <p className="text-text-muted">{item.answer}</p>
          </div>
        ))}
      </section>

      <div>
        <Link href="/" className={buttonClass("primary")}>
          Criar grupo
        </Link>
      </div>
    </main>
  );
}
