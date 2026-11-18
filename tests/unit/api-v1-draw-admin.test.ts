// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { copy } from "../../app/_lib/copy";
import { getSharedRateLimiter } from "../../src/infrastructure/rate-limit";
import { err, ok } from "../../src/shared/result";
import { createDrawRepository } from "../../src/infrastructure/supabase/draw-repository";
import type { ServerSupabaseClient } from "../../src/infrastructure/supabase/client";

const ADMIN_TOKEN = "a".repeat(43);
const ACCESS_TOKEN = "p".repeat(43);

const mockGetAdminView = vi.fn();
const mockRemoveParticipant = vi.fn();
const mockRunDraw = vi.fn();
const mockGetMyResult = vi.fn();

vi.mock("../../src/application/get-admin-view", () => ({
  getAdminView: (...args: unknown[]) => mockGetAdminView(...args),
}));

vi.mock("../../src/application/remove-participant", () => ({
  removeParticipant: (...args: unknown[]) => mockRemoveParticipant(...args),
}));

vi.mock("../../src/application/run-draw", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/application/run-draw")>();
  return {
    ...actual,
    runDraw: (...args: unknown[]) => mockRunDraw(...args),
  };
});

vi.mock("../../src/application/get-my-result", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/application/get-my-result")>();
  return {
    ...actual,
    getMyResult: (...args: unknown[]) => mockGetMyResult(...args),
  };
});

vi.mock("../../src/infrastructure/supabase/deps", () => ({
  buildAdminDeps: () => ({}),
  buildGetMyResultDeps: () => ({}),
}));

import { GET as getAdmin, OPTIONS as optionsAdmin } from "../../app/api/v1/admin/route";
import { DELETE as deleteParticipant } from "../../app/api/v1/admin/participants/[participantId]/route";
import { POST as postDraw } from "../../app/api/v1/admin/draw/route";
import { POST as postReveal } from "../../app/api/v1/participant/reveal/route";

function makeRequest(url: string, init?: RequestInit & { ip?: string }): Request {
  const { ip, ...rest } = init ?? {};
  const headers = new Headers(rest.headers);
  if (ip) headers.set("x-real-ip", ip);
  return new Request(url, { ...rest, headers });
}

function assertV1Headers(res: Response) {
  expect(res.headers.get("cache-control")).toBe("private, no-store, max-age=0, must-revalidate");
  expect(res.headers.get("referrer-policy")).toBe("no-referrer");
  expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  expect(res.headers.get("access-control-allow-origin")).toBeNull();
}

describe("API v1 draw & admin routes (APP-API-02c)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSharedRateLimiter().reset();
  });

  it("GET /api/v1/admin returns admin view without pairs and enforces Bearer + query guard", async () => {
    const optRes = await optionsAdmin(
      makeRequest("https://papelzinho.app/api/v1/admin", { method: "OPTIONS" })
    );
    expect(optRes.status).toBe(405);

    const queryLeak = await getAdmin(
      makeRequest("https://papelzinho.app/api/v1/admin?adminToken=secret", {
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      })
    );
    expect(queryLeak.status).toBe(400);
    expect((await queryLeak.json()).error.code).toBe("INVALID_INPUT");
    assertV1Headers(queryLeak);

    const noAuth = await getAdmin(makeRequest("https://papelzinho.app/api/v1/admin"));
    expect(noAuth.status).toBe(401);
    const noAuthBody = await noAuth.json();
    expect(noAuthBody.error.code).toBe("INVALID_LINK");
    expect(noAuthBody.error.message).toBe(copy.ADM_16.text);

    const view = {
      group: {
        name: "Família Silva",
        maxValueCents: 10000,
        exchangeDate: "2026-12-24",
        location: "Casa",
      },
      inviteUrl: "https://papelzinho.app/g/inv-1",
      draw: { status: "open" },
      participantCount: 3,
      participants: [{ id: "p-1", displayName: "Ana", joinedAt: "2026-11-18T18:00:00.000Z" }],
    };
    mockGetAdminView.mockResolvedValueOnce(ok(view));

    const res = await getAdmin(
      makeRequest("https://papelzinho.app/api/v1/admin", {
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      })
    );
    expect(res.status).toBe(200);
    assertV1Headers(res);
    const body = await res.json();
    expect(body).toEqual(view);
    expect("pairs" in body).toBe(false);
    expect(mockGetAdminView).toHaveBeenCalledWith({ adminToken: ADMIN_TOKEN }, {});
  });

  it("DELETE /api/v1/admin/participants/[participantId] removes participant and maps errors", async () => {
    mockRemoveParticipant.mockResolvedValueOnce(ok({ participantCount: 2 }));
    const res = await deleteParticipant(
      makeRequest("https://papelzinho.app/api/v1/admin/participants/p-1", {
        method: "DELETE",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      }),
      { params: Promise.resolve({ participantId: "p-1" }) }
    );
    expect(res.status).toBe(200);
    assertV1Headers(res);
    expect(await res.json()).toEqual({ participantCount: 2 });

    mockRemoveParticipant.mockResolvedValueOnce(err({ code: "PARTICIPANT_NOT_FOUND" }));
    const notFound = await deleteParticipant(
      makeRequest("https://papelzinho.app/api/v1/admin/participants/p-missing", {
        method: "DELETE",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      }),
      { params: Promise.resolve({ participantId: "p-missing" }) }
    );
    expect(notFound.status).toBe(404);
    expect((await notFound.json()).error.code).toBe("PARTICIPANT_NOT_FOUND");

    mockRemoveParticipant.mockResolvedValueOnce(err({ code: "GROUP_CLOSED" }));
    const closed = await deleteParticipant(
      makeRequest("https://papelzinho.app/api/v1/admin/participants/p-1", {
        method: "DELETE",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
      }),
      { params: Promise.resolve({ participantId: "p-1" }) }
    );
    expect(closed.status).toBe(409);
    const closedBody = await closed.json();
    expect(closedBody.error.code).toBe("GROUP_CLOSED");
    expect(closedBody.error.message).toBe(copy.ADM_11);
  });

  it("POST /api/v1/admin/draw runs draw, validates optional JSON, and enforces run_draw rate limit", async () => {
    const badJson = await postDraw(
      makeRequest("https://papelzinho.app/api/v1/admin/draw", {
        method: "POST",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
        body: "{bad",
        ip: "203.0.113.10",
      })
    );
    expect(badJson.status).toBe(400);
    expect((await badJson.json()).error.code).toBe("INVALID_INPUT");

    mockRunDraw.mockResolvedValue(ok({ status: "drawn", drawnAt: "2026-11-18T19:00:00.000Z" }));
    const okRes = await postDraw(
      makeRequest("https://papelzinho.app/api/v1/admin/draw", {
        method: "POST",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
        body: JSON.stringify({ expectedParticipantCount: 3 }),
        ip: "203.0.113.10",
      })
    );
    expect(okRes.status).toBe(200);
    assertV1Headers(okRes);
    expect(await okRes.json()).toEqual({
      status: "drawn",
      drawnAt: "2026-11-18T19:00:00.000Z",
    });
    expect(mockRunDraw).toHaveBeenCalledWith(
      { adminToken: ADMIN_TOKEN, expectedParticipantCount: 3 },
      {}
    );

    // Exhaust remaining 8 requests of run_draw (limit 10 / 10 min per IP; 2 already consumed above).
    for (let i = 0; i < 8; i++) {
      const r = await postDraw(
        makeRequest("https://papelzinho.app/api/v1/admin/draw", {
          method: "POST",
          headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
          ip: "203.0.113.10",
        })
      );
      expect(r.status).toBe(200);
    }

    const limited = await postDraw(
      makeRequest("https://papelzinho.app/api/v1/admin/draw", {
        method: "POST",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
        ip: "203.0.113.10",
      })
    );
    expect(limited.status).toBe(429);
    expect((await limited.json()).error.code).toBe("RATE_LIMITED");
  });

  it("POST /api/v1/participant/reveal returns original url without affiliateUrl or productLink", async () => {
    mockGetMyResult.mockResolvedValueOnce(
      ok({
        drawVersion: 1,
        recipientName: "Bruno",
        wishItems: [
          {
            id: "w-1",
            title: "Fone",
            url: "https://www.amazon.com.br/dp/B000000001",
            note: "Preto",
            productLink: {
              href: "https://www.amazon.com.br/dp/B000000001?tag=papelzinho-20",
              affiliate: true,
              store: "amazon",
            },
          },
          {
            id: "w-2",
            title: "Caneca",
            note: null,
            productLink: { href: "https://loja.exemplo.com/caneca", affiliate: false, store: null },
          },
        ],
      })
    );

    const res = await postReveal(
      makeRequest("https://papelzinho.app/api/v1/participant/reveal", {
        method: "POST",
        headers: { authorization: `Bearer ${ACCESS_TOKEN}` },
      })
    );
    expect(res.status).toBe(200);
    assertV1Headers(res);
    const body = await res.json();
    expect(body).toEqual({
      drawVersion: 1,
      recipientName: "Bruno",
      wishItems: [
        {
          id: "w-1",
          title: "Fone",
          url: "https://www.amazon.com.br/dp/B000000001",
          note: "Preto",
        },
        {
          id: "w-2",
          title: "Caneca",
          url: "https://loja.exemplo.com/caneca",
          note: null,
        },
      ],
    });
    expect(JSON.stringify(body)).not.toMatch(/tag=papelzinho-20|productLink|affiliateUrl/);
    expect(mockGetMyResult).toHaveBeenCalledWith(
      { accessToken: ACCESS_TOKEN, includeOriginalUrl: true },
      {}
    );

    mockGetMyResult.mockResolvedValueOnce(err({ code: "DRAW_NOT_READY" }));
    const notReady = await postReveal(
      makeRequest("https://papelzinho.app/api/v1/participant/reveal", {
        method: "POST",
        headers: { authorization: `Bearer ${ACCESS_TOKEN}` },
      })
    );
    expect(notReady.status).toBe(409);
    expect((await notReady.json()).error.code).toBe("DRAW_NOT_READY");
  });
});

describe("APP-API-02c repository hooks", () => {
  it("getCurrentResult with includeOriginalUrl returns raw url without exposing affiliateUrl", async () => {
    const client = {
      from() {
        const b = {
          select: () => b,
          eq: () => b,
          is: () => b,
          maybeSingle: async () => ({
            data: {
              id: "p-ana",
              access_token_hash: "h-ana",
              removed_at: null,
              group: { id: "grp-1", status: "drawn", expires_at: "2099-01-01T00:00:00.000Z" },
              given_pairs: [
                {
                  draw: { id: "drw-1", version: 1, invalidated_at: null },
                  receiver: {
                    id: "p-bruno",
                    display_name: "Bruno",
                    removed_at: null,
                    wish_items: [
                      {
                        id: "w-1",
                        title: "Fone",
                        url: "https://www.amazon.com.br/dp/B000000001",
                        note: null,
                        affiliate_url:
                          "https://www.amazon.com.br/dp/B000000001?tag=papelzinho-20",
                        store: "amazon",
                        created_at: "2026-11-18T11:00:00.000Z",
                      },
                    ],
                  },
                },
              ],
            },
            error: null,
          }),
        };
        return b;
      },
    } as unknown as ServerSupabaseClient;

    const repo = createDrawRepository(client);
    const res = await repo.getCurrentResult(
      { participantId: "p-ana", accessTokenHash: "h-ana" },
      { includeOriginalUrl: true }
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.wishItems[0]?.url).toBe("https://www.amazon.com.br/dp/B000000001");
    }
  });
});
