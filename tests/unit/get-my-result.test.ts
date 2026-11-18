// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { getMyResult, type GetMyResultDeps } from "../../src/application/get-my-result";
import { createDrawRepository } from "../../src/infrastructure/supabase/draw-repository";
import type { ServerSupabaseClient } from "../../src/infrastructure/supabase/client";
import { err, ok } from "../../src/shared/result";

function makeDeps(overrides: Partial<GetMyResultDeps> = {}): GetMyResultDeps {
  return {
    participants: {
      findActiveByHash: async (hash) =>
        hash === "hash(ptk-ana)"
          ? {
              participantId: "p-ana",
              accessTokenHash: hash,
              groupId: "grp-1",
              displayName: "Ana",
              expiresAt: "2099-01-01T00:00:00.000Z",
            }
          : null,
    },
    draws: {
      getCurrentResult: async () =>
        ok({
          drawVersion: 1,
          recipientName: "Bruno",
          wishItems: [{ id: "w-1", title: "Livro", note: null, productLink: null }],
        }),
    },
    tokens: {
      hash: (token) => `hash(${token})`,
    },
    events: {
      append: vi.fn(async () => {}),
    },
    ...overrides,
  };
}

describe("get-my-result use case (RF09, RN02, RN03, HU05, SRT-04)", () => {
  it("returns only the token owner's recipient and wishItems and records result_revealed without personal data", async () => {
    const appendSpy = vi.fn(async () => {});
    const getResultSpy = vi.fn(async () =>
      ok({
        drawVersion: 1,
        recipientName: "Bruno",
        wishItems: [{ id: "w-1", title: "Livro", note: null, productLink: null }],
      })
    );
    const deps = makeDeps({
      draws: { getCurrentResult: getResultSpy },
      events: { append: appendSpy },
    });

    const result = await getMyResult({ accessToken: "ptk-ana", expectedGroupId: "grp-1" }, deps);
    expect(result).toEqual(
      ok({
        drawVersion: 1,
        recipientName: "Bruno",
        wishItems: [{ id: "w-1", title: "Livro", note: null, productLink: null }],
      })
    );
    expect(getResultSpy).toHaveBeenCalledWith({
      participantId: "p-ana",
      accessTokenHash: "hash(ptk-ana)",
    });
    expect(appendSpy).toHaveBeenCalledWith({ groupId: "grp-1", type: "result_revealed" });
    expect(JSON.stringify(appendSpy.mock.calls)).not.toMatch(/p-ana|Bruno|ptk-ana/);
  });

  it("rejects with INVALID_LINK when expectedGroupId does not match the token's group", async () => {
    const deps = makeDeps();
    expect(
      await getMyResult({ accessToken: "ptk-ana", expectedGroupId: "grp-other" }, deps)
    ).toEqual(err({ code: "INVALID_LINK" }));
  });

  it("returns DRAW_NOT_READY when group is open and does not emit result_revealed", async () => {
    const appendSpy = vi.fn(async () => {});
    const deps = makeDeps({
      draws: { getCurrentResult: async () => err({ code: "DRAW_NOT_READY" }) },
      events: { append: appendSpy },
    });

    expect(await getMyResult({ accessToken: "ptk-ana" }, deps)).toEqual(
      err({ code: "DRAW_NOT_READY" })
    );
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it("returns INVALID_LINK for unknown token and INVALID_INPUT for empty token", async () => {
    const deps = makeDeps();
    expect(await getMyResult({ accessToken: "   " }, deps)).toEqual(err({ code: "INVALID_INPUT" }));
    expect(await getMyResult({ accessToken: "unknown" }, deps)).toEqual(
      err({ code: "INVALID_LINK" })
    );
  });

  it("reads credential, active draw, pair and recipient wish list in a single snapshot query and ignores invalidated draws", async () => {
    const fromSpy = vi.fn();
    let currentData: unknown = {
      id: "p-ana",
      access_token_hash: "h-ana",
      removed_at: null,
      group: { id: "grp-1", status: "drawn", expires_at: "2099-01-01T00:00:00.000Z" },
      given_pairs: [
        {
          draw: { id: "drw-1", version: 1, invalidated_at: "2026-11-18T10:00:00.000Z" },
          receiver: { id: "p-old", display_name: "Antigo", removed_at: null, wish_items: [] },
        },
        {
          draw: { id: "drw-2", version: 2, invalidated_at: null },
          receiver: {
            id: "p-bruno",
            display_name: "Bruno",
            removed_at: null,
            wish_items: [
              {
                id: "w-1",
                title: "Caneca",
                url: "https://loja.exemplo.com/caneca",
                note: "Azul",
                affiliate_url: null,
                store: null,
                created_at: "2026-11-18T11:00:00.000Z",
              },
            ],
          },
        },
      ],
    };

    const filters: Record<string, string> = {};
    const client = {
      from(table: string) {
        fromSpy(table);
        const builder = {
          select: () => builder,
          eq: (col: string, val: string) => {
            filters[col] = val;
            return builder;
          },
          is: () => builder,
          maybeSingle: async () => ({ data: currentData, error: null }),
        };
        return builder;
      },
    } as unknown as ServerSupabaseClient;

    const repo = createDrawRepository(client);
    const res = await repo.getCurrentResult({
      participantId: "p-ana",
      accessTokenHash: "h-ana",
    });

    expect(fromSpy).toHaveBeenCalledTimes(1);
    expect(fromSpy).toHaveBeenCalledWith("participants");
    expect(filters).toEqual({ id: "p-ana", access_token_hash: "h-ana" });
    expect(res).toEqual(
      ok({
        drawVersion: 2,
        recipientName: "Bruno",
        wishItems: [
          {
            id: "w-1",
            title: "Caneca",
            note: "Azul",
            productLink: { href: "https://loja.exemplo.com/caneca", affiliate: false, store: null },
          },
        ],
      })
    );
    if (res.ok) {
      expect("url" in res.value.wishItems[0]!).toBe(false);
    }

    currentData = {
      ...(currentData as Record<string, unknown>),
      given_pairs: [
        {
          draw: { id: "drw-1", version: 1, invalidated_at: "2026-11-18T10:00:00.000Z" },
          receiver: { id: "p-old", display_name: "Antigo", removed_at: null, wish_items: [] },
        },
      ],
    };
    expect(
      await repo.getCurrentResult({ participantId: "p-ana", accessTokenHash: "h-ana" })
    ).toEqual(err({ code: "DRAW_NOT_READY" }));
  });
});
