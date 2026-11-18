import { describe, expect, it } from "vitest";
import { copy } from "../../app/_lib/copy";

const PENDING = "A PREENCHER PELO RODRIGO";

describe("textos das paginas legais (MON-01-APP)", () => {
  it("mantem o marcador de pendencia nas paginas que dependem do Rodrigo", () => {
    expect(JSON.stringify(copy.LEG.privacidade.sections[0])).toContain(PENDING);
    expect(JSON.stringify(copy.LEG.contato.sections[0])).toContain(PENDING);
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
