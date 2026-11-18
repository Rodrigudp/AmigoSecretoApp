import type { ReactNode } from "react";
import { copy } from "../_lib/copy";

export type LegalItem = string | { readonly label: string; readonly text: string };

export type LegalBlock =
  | { readonly p: string }
  | { readonly ul: readonly LegalItem[] }
  | { readonly ol: readonly LegalItem[] };

export type LegalSection = { readonly heading: string; readonly blocks: readonly LegalBlock[] };

type LegalDocumentProps = {
  title: string;
  sections: readonly LegalSection[];
  updated?: boolean;
  children?: ReactNode;
};

function Text({ value }: { value: string }) {
  return <>{value}</>;
}

function Item({ item }: { item: LegalItem }) {
  if (typeof item === "string") {
    return (
      <li>
        <Text value={item} />
      </li>
    );
  }
  return (
    <li>
      <strong className="font-semibold">{item.label}</strong> <Text value={item.text} />
    </li>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ("p" in block) {
    return (
      <p className="leading-7">
        <Text value={block.p} />
      </p>
    );
  }
  if ("ul" in block) {
    return (
      <ul className="list-disc space-y-2 pl-6 leading-7">
        {block.ul.map((item, index) => (
          <Item key={index} item={item} />
        ))}
      </ul>
    );
  }
  return (
    <ol className="list-decimal space-y-2 pl-6 leading-7">
      {block.ol.map((item, index) => (
        <Item key={index} item={item} />
      ))}
    </ol>
  );
}

/** Static legal/institutional page in the Notion-style paper panel (MON-01-APP). */
export function LegalDocument({ title, sections, updated = false, children }: LegalDocumentProps) {
  return (
    <main id="conteudo" tabIndex={-1} className="page-shell">
      <article className="paper-panel flex flex-col gap-6 [overflow-wrap:anywhere]">
        <header className="flex flex-col gap-2">
          <h1 className="page-title">{title}</h1>
          {updated ? (
            <p className="text-sm text-text-muted">
              {copy.LEG.updatedLabel} {copy.LEG.updated}
            </p>
          ) : null}
        </header>
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </section>
        ))}
        {children}
      </article>
    </main>
  );
}
