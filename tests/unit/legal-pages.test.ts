import { describe, expect, it } from "vitest";
import { copy } from "../../app/_lib/copy";
import { legalMetadata } from "../../app/_lib/legal-metadata";
import { getAppUrl } from "../../app/_lib/site-url";
import { metadata as sobre } from "../../app/sobre/page";
import { metadata as privacidade } from "../../app/privacidade/page";
import { metadata as termos } from "../../app/termos/page";
import { metadata as contato } from "../../app/contato/page";

const CONTACT = "suporte@papelzinho.app";

function allText(section: { heading: string; blocks: readonly unknown[] }): string {
  return JSON.stringify(section);
}

describe("paginas legais (MON-01-APP)", () => {
  it("publica as quatro rotas com canonical absoluto a partir de APP_URL", () => {
    const origin = getAppUrl();
    expect(sobre.alternates?.canonical).toBe(`${origin}/sobre`);
    expect(privacidade.alternates?.canonical).toBe(`${origin}/privacidade`);
    expect(termos.alternates?.canonical).toBe(`${origin}/termos`);
    expect(contato.alternates?.canonical).toBe(`${origin}/contato`);
  });

  it("nao marca as paginas como noindex", () => {
    for (const meta of [sobre, privacidade, termos, contato]) {
      expect(meta.robots).toBeUndefined();
    }
  });

  it("nao repete a marca quando o titulo ja a contem", () => {
    expect(sobre.title).toBe("Sobre o Papelzinho");
    expect(legalMetadata({ title: "Sobre o Papelzinho", path: "/s", description: "d" }).title).toBe(
      "Sobre o Papelzinho"
    );
  });

  it("usa o nome do app no titulo", () => {
    expect(privacidade.title).toBe(`${copy.LEG.privacidade.title} — Papelzinho`);
  });

  it("gera canonical e titulo pelo helper", () => {
    const meta = legalMetadata({ title: "Teste", path: "/teste", description: "d" });
    expect(meta.title).toBe("Teste — Papelzinho");
    expect(meta.description).toBe("d");
  });

  it("mostra controlador e contato reais (PEN-01/02)", () => {
    expect(allText(copy.LEG.privacidade.sections[0])).toContain("Rodrigo Del Padre");
    expect(allText(copy.LEG.privacidade.sections[0])).toContain(CONTACT);
    expect(allText(copy.LEG.contato.sections[0])).toContain(CONTACT);
  });

  it("nao deixa placeholders de template no texto", () => {
    const serialized = JSON.stringify(copy.LEG);
    expect(serialized).not.toContain("{{");
    expect(serialized).not.toContain("[DOMÍNIO]");
  });

  it("registra a retencao decidida: contadores anonimos sobrevivem ao expurgo", () => {
    const retencao = JSON.stringify(copy.LEG.privacidade.sections);
    expect(retencao).toContain("contadores anônimos");
    expect(retencao).toContain("60 dias");
  });

  it("cada pagina tem titulo e pelo menos uma secao", () => {
    for (const page of [copy.LEG.sobre, copy.LEG.privacidade, copy.LEG.termos, copy.LEG.contato]) {
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.sections.length).toBeGreaterThan(0);
    }
  });
});
