import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { resolveProductLink, isAllowedRedirectUrl } from "../../src/application/resolve-product-link";
import { recordAffiliateClick } from "../../src/application/record-affiliate-click";
import type { WishItemRepository } from "../../src/application/ports";

vi.mock("server-only", () => ({}));

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
    const mockWishRepo: Pick<WishItemRepository, "getLinkForRedirect"> = {
      getLinkForRedirect: vi.fn().mockResolvedValue({
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
    const mockWishRepo: Pick<WishItemRepository, "getLinkForRedirect"> = {
      getLinkForRedirect: vi.fn().mockResolvedValue({
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
    const mockWishRepo: Pick<WishItemRepository, "getLinkForRedirect"> = {
      getLinkForRedirect: vi.fn().mockResolvedValue({
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
    const mockWishRepo: Pick<WishItemRepository, "getLinkForRedirect"> = {
      getLinkForRedirect: vi.fn().mockResolvedValue({
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

describe("Route /r/[itemId] flag behavior (D2)", () => {
  const originalEnv = process.env.AFFILIATE_REDIRECT_ENABLED;

  beforeEach(() => {
    delete process.env.AFFILIATE_REDIRECT_ENABLED;
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
  });

  afterEach(() => {
    process.env.AFFILIATE_REDIRECT_ENABLED = originalEnv;
    vi.unstubAllEnvs();
  });

  it("retorna 404 por padrão quando AFFILIATE_REDIRECT_ENABLED está ausente ou false", async () => {
    const { GET: getRedirectRoute } = await import("../../app/r/[itemId]/route");
    const { NextRequest } = await import("next/server");

    const req = new NextRequest("http://localhost:3000/r/11111111-1111-4111-8111-111111111111");
    const res = await getRedirectRoute(req, {
      params: Promise.resolve({ itemId: "11111111-1111-4111-8111-111111111111" }),
    });

    expect(res.status).toBe(404);
  });
});
