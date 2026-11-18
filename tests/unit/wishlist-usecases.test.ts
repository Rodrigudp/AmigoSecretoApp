import { describe, expect, it, beforeEach } from "vitest";
import { err, ok } from "../../src/shared/result";
import { addWishItem, type AddWishItemDeps } from "../../src/application/add-wish-item";
import { updateWishItem, type UpdateWishItemDeps } from "../../src/application/update-wish-item";
import { removeWishItem, type RemoveWishItemDeps } from "../../src/application/remove-wish-item";
import { listWishItems, type ListWishItemsDeps } from "../../src/application/list-wish-items";
import type {
  AccessScope,
  AffiliateLinkService,
  ParticipantRepository,
  ProductLink,
  RepositoryResult,
  StoredWishFields,
  TokenService,
  WishItem,
  WishItemId,
  WishItemRepository,
} from "../../src/application/ports";

class InMemoryParticipantRepo implements Partial<ParticipantRepository> {
  activeParticipants = new Map<
    string,
    AccessScope & { groupId: string; displayName: string; expiresAt: string }
  >();

  async findActiveByHash(hash: string) {
    return this.activeParticipants.get(hash) ?? null;
  }
}

class InMemoryWishItemRepo implements WishItemRepository {
  items: (WishItem & { participantId: string; affiliateUrl: string | null })[] = [];

  async listOwn(access: AccessScope): RepositoryResult<WishItem[]> {
    const list = this.items
      .filter((i) => i.participantId === access.participantId)
      .map((item) => {
        const copy: WishItem = {
          id: item.id,
          title: item.title,
          url: item.url,
          note: item.note,
          productLink: item.productLink,
        };
        return copy;
      });
    return ok(list);
  }

  async addOwn(access: AccessScope, item: StoredWishFields): RepositoryResult<WishItem> {
    const ownCount = this.items.filter((i) => i.participantId === access.participantId).length;
    if (ownCount >= 20) {
      return err({ code: "WISH_LIST_FULL" });
    }
    const productLink: ProductLink | null =
      item.affiliateUrl && item.store
        ? { href: item.affiliateUrl, affiliate: true, store: item.store }
        : item.url
        ? { href: item.url, affiliate: false, store: null }
        : null;

    const created: WishItem & { participantId: string; affiliateUrl: string | null } = {
      id: `00000000-0000-4000-8000-${String(this.items.length + 1).padStart(12, "0")}`,
      participantId: access.participantId,
      title: item.title,
      url: item.url,
      note: item.note,
      affiliateUrl: item.affiliateUrl,
      productLink,
    };
    this.items.push(created);
    return ok({
      id: created.id,
      title: created.title,
      url: created.url,
      note: created.note,
      productLink: created.productLink,
    });
  }

  async updateOwn(
    access: AccessScope,
    itemId: WishItemId,
    item: StoredWishFields
  ): RepositoryResult<WishItem> {
    const index = this.items.findIndex(
      (i) => i.id === itemId && i.participantId === access.participantId
    );
    if (index === -1) {
      return err({ code: "WISH_ITEM_NOT_FOUND" });
    }
    const existing = this.items[index];
    const productLink: ProductLink | null =
      item.affiliateUrl && item.store
        ? { href: item.affiliateUrl, affiliate: true, store: item.store }
        : item.url
        ? { href: item.url, affiliate: false, store: null }
        : null;

    const updated = {
      ...existing,
      title: item.title,
      url: item.url,
      note: item.note,
      affiliateUrl: item.affiliateUrl,
      productLink,
    };
    this.items[index] = updated;
    return ok({
      id: updated.id,
      title: updated.title,
      url: updated.url,
      note: updated.note,
      productLink: updated.productLink,
    });
  }

  async deleteOwn(access: AccessScope, itemId: WishItemId): RepositoryResult<{ id: WishItemId }> {
    const index = this.items.findIndex(
      (i) => i.id === itemId && i.participantId === access.participantId
    );
    if (index === -1) {
      return err({ code: "WISH_ITEM_NOT_FOUND" });
    }
    this.items.splice(index, 1);
    return ok({ id: itemId });
  }

  async getVisibleLink(
    access: AccessScope,
    itemId: WishItemId
  ): RepositoryResult<{
    groupId: string;
    url: string;
    affiliateUrl: string | null;
  }> {
    const item = this.items.find((i) => i.id === itemId && i.participantId === access.participantId);
    if (!item || !item.url) {
      return err({ code: "PRODUCT_LINK_UNAVAILABLE" });
    }
    return ok({
      groupId: "g-1",
      url: item.url,
      affiliateUrl: item.affiliateUrl,
    });
  }
}

class FakeTokenService implements TokenService {
  generate() {
    return "fake-raw-token";
  }
  hash(token: string) {
    return `hash-${token}`;
  }
}

type TestDeps = AddWishItemDeps & UpdateWishItemDeps & RemoveWishItemDeps & ListWishItemsDeps;

describe("Wishlist Use Cases (LST-02)", () => {
  let tokens: FakeTokenService;
  let participantRepo: InMemoryParticipantRepo;
  let wishRepo: InMemoryWishItemRepo;
  let deps: TestDeps;
  const validToken = "my-personal-token";

  beforeEach(() => {
    tokens = new FakeTokenService();
    participantRepo = new InMemoryParticipantRepo();
    wishRepo = new InMemoryWishItemRepo();

    const tokenHash = tokens.hash(validToken);
    participantRepo.activeParticipants.set(tokenHash, {
      participantId: "part-123",
      accessTokenHash: tokenHash,
      displayName: "João",
      groupId: "group-abc",
      expiresAt: "2026-12-31T23:59:59Z",
    });

    const fakeAffiliate: AffiliateLinkService = {
      async convert(url: string) {
        if (url.includes("amazon.com.br")) {
          return { affiliateUrl: `${url}?tag=meu-amigo-20`, store: "amazon" as const };
        }
        return null;
      },
      canRedirect(dest: string) {
        return dest.startsWith("https://");
      },
    };

    deps = {
      participants: participantRepo as unknown as ParticipantRepository,
      wishItems: wishRepo,
      tokens,
      affiliate: fakeAffiliate,
    };
  });

  describe("addWishItem", () => {
    it("adiciona item com título, nota e link válido com conversão de afiliado", async () => {
      const res = await addWishItem(
        {
          accessToken: validToken,
          title: "Livro de TypeScript",
          url: "https://www.amazon.com.br/dp/1234567890",
          note: "Edição capa dura",
        },
        deps
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.item.title).toBe("Livro de TypeScript");
        expect(res.value.item.note).toBe("Edição capa dura");
        expect(res.value.item.productLink?.affiliate).toBe(true);
        expect(res.value.warning).toBeNull();
      }
    });

    it("adiciona item com link comum quando não for loja afiliada", async () => {
      const res = await addWishItem(
        {
          accessToken: validToken,
          title: "Camiseta",
          url: "https://minhaloja.com.br/produto",
          note: null,
        },
        deps
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.item.productLink?.affiliate).toBe(false);
        expect(res.value.warning).toBe("AFFILIATE_UNAVAILABLE");
      }
    });

    it("adiciona item apenas com título (sem URL e sem nota)", async () => {
      const res = await addWishItem(
        {
          accessToken: validToken,
          title: "Café especial",
        },
        deps
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.item.title).toBe("Café especial");
        expect(res.value.item.url).toBeNull();
        expect(res.value.item.productLink).toBeNull();
      }
    });

    it("recusa título vazio", async () => {
      const res = await addWishItem(
        {
          accessToken: validToken,
          title: "   ",
        },
        deps
      );

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_INPUT");
      }
    });

    it("recusa URL maliciosa (javascript:, http:, IP literal)", async () => {
      const resJs = await addWishItem(
        {
          accessToken: validToken,
          title: "Ataque",
          url: "javascript:alert(1)",
        },
        deps
      );
      expect(resJs.ok).toBe(false);

      const resHttp = await addWishItem(
        {
          accessToken: validToken,
          title: "Inseguro",
          url: "http://inseguro.com/item",
        },
        deps
      );
      expect(resHttp.ok).toBe(false);

      const resIp = await addWishItem(
        {
          accessToken: validToken,
          title: "IP",
          url: "https://192.168.1.1/item",
        },
        deps
      );
      expect(resIp.ok).toBe(false);
    });

    it("recusa token inválido com INVALID_LINK", async () => {
      const res = await addWishItem(
        {
          accessToken: "token-desconhecido",
          title: "Presente",
        },
        deps
      );

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_LINK");
      }
    });

    it("respeita o limite de 20 itens retornando WISH_LIST_FULL", async () => {
      for (let i = 0; i < 20; i++) {
        const r = await addWishItem(
          {
            accessToken: validToken,
            title: `Item ${i + 1}`,
          },
          deps
        );
        expect(r.ok).toBe(true);
      }

      // 21º item deve falhar
      const res21 = await addWishItem(
        {
          accessToken: validToken,
          title: "Item 21 que estoura limite",
        },
        deps
      );

      expect(res21.ok).toBe(false);
      if (!res21.ok) {
        expect(res21.error.code).toBe("WISH_LIST_FULL");
      }
    });
  });

  describe("listWishItems", () => {
    it("lista os itens do participante", async () => {
      await addWishItem({ accessToken: validToken, title: "Item 1" }, deps);
      await addWishItem({ accessToken: validToken, title: "Item 2" }, deps);

      const res = await listWishItems({ accessToken: validToken }, deps);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.length).toBe(2);
      }
    });

    it("recusa token inválido", async () => {
      const res = await listWishItems({ accessToken: "invalido" }, deps);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_LINK");
      }
    });
  });

  describe("updateWishItem", () => {
    it("atualiza título e URL de um item existente", async () => {
      const added = await addWishItem({ accessToken: validToken, title: "Original" }, deps);
      if (!added.ok) throw new Error("Falha ao adicionar");
      const targetId = added.value.item.id;

      const res = await updateWishItem(
        {
          accessToken: validToken,
          itemId: targetId,
          title: "Título Atualizado",
          url: "https://www.amazon.com.br/dp/9999999999",
          note: "Nova nota",
        },
        deps
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.item.title).toBe("Título Atualizado");
        expect(res.value.item.note).toBe("Nova nota");
        expect(res.value.item.productLink?.affiliate).toBe(true);
      }
    });

    it("retorna WISH_ITEM_NOT_FOUND para item inexistente", async () => {
      const res = await updateWishItem(
        {
          accessToken: validToken,
          itemId: "00000000-0000-0000-0000-000000000000",
          title: "Título",
        },
        deps
      );

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("WISH_ITEM_NOT_FOUND");
      }
    });
  });

  describe("removeWishItem", () => {
    it("remove fisicamente um item existente", async () => {
      const added = await addWishItem({ accessToken: validToken, title: "Item p/ remover" }, deps);
      if (!added.ok) throw new Error("Falha ao adicionar");
      const targetId = added.value.item.id;

      const res = await removeWishItem(
        {
          accessToken: validToken,
          itemId: targetId,
        },
        deps
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.id).toBe(targetId);
      }

      const listAfter = await listWishItems({ accessToken: validToken }, deps);
      if (listAfter.ok) {
        expect(listAfter.value.some((i) => i.id === targetId)).toBe(false);
      }
    });

    it("retorna WISH_ITEM_NOT_FOUND se tentar remover item já removido", async () => {
      const res = await removeWishItem(
        {
          accessToken: validToken,
          itemId: "00000000-0000-0000-0000-000000000000",
        },
        deps
      );

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("WISH_ITEM_NOT_FOUND");
      }
    });
  });
});
