import { describe, expect, it } from "vitest";
import {
  AmazonAffiliateAdapter,
  MercadoLivreAffiliateAdapter,
  CompositeAffiliateLinkService,
} from "../../src/infrastructure/affiliates/affiliate-adapters";

describe("AmazonAffiliateAdapter", () => {
  const adapter = new AmazonAffiliateAdapter({ associateTag: "papelzinho20-20" });

  it("identifica e converte URLs de produtos na amazon.com.br com /dp/<ASIN>", () => {
    const url = "https://www.amazon.com.br/dp/B08N5WRWNW";
    expect(adapter.supports(url)).toBe(true);

    const res = adapter.convert(url);
    expect(res).not.toBeNull();
    expect(res?.store).toBe("amazon");
    expect(res?.affiliateUrl).toContain("tag=papelzinho20-20");
    expect(res?.affiliateUrl).toContain("/dp/B08N5WRWNW");
  });

  it("identifica e converte URLs com /gp/product/<ASIN>", () => {
    const url = "https://amazon.com.br/gp/product/B08N5WRWNW?ref=xyz";
    expect(adapter.supports(url)).toBe(true);

    const res = adapter.convert(url);
    expect(res).not.toBeNull();
    expect(res?.store).toBe("amazon");
    expect(res?.affiliateUrl).toContain("tag=papelzinho20-20");
  });

  it("substitui tag de associado de terceiro pela tag oficial", () => {
    const url = "https://www.amazon.com.br/dp/B08N5WRWNW?tag=outra-tag-20";
    const res = adapter.convert(url);
    expect(res?.affiliateUrl).toContain("tag=papelzinho20-20");
    expect(res?.affiliateUrl).not.toContain("outra-tag-20");
  });

  it("rejeita páginas que não são de produto específico (sem ASIN de 10 caracteres)", () => {
    expect(adapter.supports("https://www.amazon.com.br/s?k=livros")).toBe(false);
    expect(adapter.supports("https://www.amazon.com.br/")).toBe(false);
    expect(adapter.convert("https://www.amazon.com.br/s?k=livros")).toBeNull();
  });

  it("rejeita domínios que não sejam amazon.com.br (ex: amazon.com ou encurtadores amzn.to)", () => {
    expect(adapter.supports("https://www.amazon.com/dp/B08N5WRWNW")).toBe(false);
    expect(adapter.supports("https://amzn.to/3xyz")).toBe(false);
  });
});

describe("MercadoLivreAffiliateAdapter", () => {
  const adapter = new MercadoLivreAffiliateAdapter();

  it("reconhece URLs do Mercado Livre mas devolve null em modo passthrough (PEN-04)", () => {
    const url = "https://produto.mercadolivre.com.br/MLB-123456-produto";
    expect(adapter.supports(url)).toBe(true);
    expect(adapter.convert()).toBeNull();
  });
});

describe("CompositeAffiliateLinkService", () => {
  const service = new CompositeAffiliateLinkService({ amazonTag: "papelzinho20-20" });

  it("converte link elegível da Amazon", async () => {
    const res = await service.convert("https://www.amazon.com.br/dp/B08N5WRWNW");
    expect(res).not.toBeNull();
    expect(res?.store).toBe("amazon");
    expect(res?.affiliateUrl).toContain("tag=papelzinho20-20");
  });

  it("devolve null para link comum de outra loja", async () => {
    const res = await service.convert("https://loja-qualquer.com.br/produto/123");
    expect(res).toBeNull();
  });

  it("canRedirect aceita apenas lojas parceiras em https", () => {
    expect(service.canRedirect("https://www.amazon.com.br/dp/B08N5WRWNW")).toBe(true);
    expect(service.canRedirect("https://produto.mercadolivre.com.br/MLB-123")).toBe(true);
    expect(service.canRedirect("https://outro-site.com")).toBe(false);
    expect(service.canRedirect("http://www.amazon.com.br/dp/B08N5WRWNW")).toBe(false);
  });
});
