import { describe, expect, it } from "vitest";
import { copy } from "../../app/_lib/copy";

const CONTACT = "suporte@papelzinho.app";

describe("textos das paginas legais (MON-01-APP)", () => {
  it("mostra controlador e contato reais (PEN-01/02)", () => {
    expect(JSON.stringify(copy.LEG.privacidade.sections[0])).toContain("Rodrigo Del Padre");
    expect(JSON.stringify(copy.LEG.contato.sections[0])).toContain(CONTACT);
  });

  it("nao deixa placeholders de template no texto", () => {
    const serialized = JSON.stringify(copy.LEG);
    expect(serialized).not.toContain("{{");
    expect(serialized).not.toContain("[DOMÍNIO]");
  });

  it("exibe no Sobre a mesma declaração literal da Amazon usada na lista", () => {
    const funding = copy.LEG.sobre.sections.find(
      (section) => section.heading === "Como o site se mantém"
    );
    expect(funding?.blocks).toContainEqual({ p: copy.WSH_20 });
    expect(copy.WSH_20).toBe(
      "Como participante do Programa de Associados da Amazon, sou remunerado pelas compras qualificadas efetuadas"
    );
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
