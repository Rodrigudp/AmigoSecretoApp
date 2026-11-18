import { describe, expect, it, vi } from "vitest";
import { resolveProductLink, isAllowedRedirectUrl } from "../../src/application/resolve-product-link";
import { recordAffiliateClick } from "../../src/application/record-affiliate-click";
import type { WishItemRepository } from "../../src/application/ports";

describe("isAllowedRedirectUrl", () => {
  it("permite domínios autorizados da Amazon e Mercado Livre com https", () => {
    expect(isAllowedRedirectUrl("https://www.amazon.com.br/dp/B08N5WRWNW")).toBe(true);
    expect(isAllowedRedirectUrl("https://amazon.com.br/dp/B08N5WRWNW")).toBe(true);
    expect(isAllowedRedirectUrl("https://produto.mercadolivre.com.br/MLB-123")).toBe(true);
  });

  it("rejeita esquemas não-https e domínios arbitrários (anti open-redirect)", () => {
    expect(isAllowedRedirectUrl("http://www.amazon.com.br/dp/123")).toBe(false);
    expect(isAllowedRedirectUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedRedirectUrl("https://site-malicioso.com")).toBe(false);
    expect(isAllowedRedirectUrl("https://amazon.com.br.atacante.com/dp/123")).toBe(false);
  });
});

describe("resolveProductLink", () => {
  it("retorna a URL de destino de um item existente autorizado", async () => {
    const mockWishRepo: Pick<WishItemRepository, "getVisibleLink"> = {
      getVisibleLink: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          groupId: "group-123",
          url: "https://www.amazon.com.br/dp/B08N5WRWNW",
          affiliateUrl: "https://www.amazon.com.br/dp/B08N5WRWNW?tag=papelzinho20-20",
        },
      }),
    };

    const res = await resolveProductLink(
      { itemId: "item-123" },
      { wishItems: mockWishRepo }
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.groupId).toBe("group-123");
      expect(res.value.destinationUrl).toBe(
        "https://www.amazon.com.br/dp/B08N5WRWNW?tag=papelzinho20-20"
      );
      expect(res.value.isAffiliate).toBe(true);
    }
  });

  it("retorna erro quando o item não tem link de produto ou URL não é permitida", async () => {
    const mockWishRepo: Pick<WishItemRepository, "getVisibleLink"> = {
      getVisibleLink: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          groupId: "group-123",
          url: "https://site-estranho.com/produto",
          affiliateUrl: null,
        },
      }),
    };

    const res = await resolveProductLink(
      { itemId: "item-123" },
      { wishItems: mockWishRepo }
    );

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("PRODUCT_LINK_UNAVAILABLE");
    }
  });
});

describe("recordAffiliateClick", () => {
  it("grava evento affiliate_click com apenas groupId e type (RNF05, sem dados pessoais)", async () => {
    const appendSpy = vi.fn().mockResolvedValue(undefined);
    const mockWishRepo: Pick<WishItemRepository, "getVisibleLink"> = {
      getVisibleLink: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          groupId: "group-123",
          url: "https://www.amazon.com.br/dp/B08N5WRWNW",
          affiliateUrl: "https://www.amazon.com.br/dp/B08N5WRWNW?tag=papelzinho20-20",
        },
      }),
    };

    const res = await recordAffiliateClick(
      { itemId: "item-123" },
      { wishItems: mockWishRepo, events: { append: appendSpy } }
    );

    expect(res.ok).toBe(true);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledWith({
      groupId: "group-123",
      type: "affiliate_click",
    });
  });

  it("não grava evento se o link não for de afiliado", async () => {
    const appendSpy = vi.fn().mockResolvedValue(undefined);
    const mockWishRepo: Pick<WishItemRepository, "getVisibleLink"> = {
      getVisibleLink: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          groupId: "group-123",
          url: "https://www.amazon.com.br/dp/B08N5WRWNW",
          affiliateUrl: null,
        },
      }),
    };

    const res = await recordAffiliateClick(
      { itemId: "item-123" },
      { wishItems: mockWishRepo, events: { append: appendSpy } }
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.recorded).toBe(false);
    }
    expect(appendSpy).not.toHaveBeenCalled();
  });
});
