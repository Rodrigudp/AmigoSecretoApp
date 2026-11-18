import { expect } from "@playwright/test";
import { test, bearer, expectError, seedGroup, unknownToken, type Seed } from "./helpers";

type Kind = "invite" | "participant" | "admin";

const ENDPOINTS: { role: Kind; method: string; path: string; data?: object }[] = [
  { role: "invite", method: "GET", path: "/api/v1/invite" },
  { role: "invite", method: "POST", path: "/api/v1/invite/join", data: { displayName: "Zed" } },
  { role: "participant", method: "GET", path: "/api/v1/participant" },
  { role: "participant", method: "GET", path: "/api/v1/participant/wishes" },
  { role: "participant", method: "POST", path: "/api/v1/participant/reveal" },
  { role: "admin", method: "GET", path: "/api/v1/admin" },
  { role: "admin", method: "POST", path: "/api/v1/admin/draw", data: {} },
];

test.describe("API v1 - credencial por tipo (CT-35)", () => {
  let seed: Seed;
  test.beforeEach(async ({ request }) => {
    seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
  });

  const tokenOf = (kind: Kind) =>
    kind === "invite"
      ? seed.inviteToken
      : kind === "admin"
        ? seed.adminToken
        : seed.participants[0].accessToken;

  for (const ep of ENDPOINTS) {
    for (const wrong of (["invite", "participant", "admin"] as const).filter(
      (k) => k !== ep.role
    )) {
      test(`${ep.method} ${ep.path} recusa credencial de ${wrong} com INVALID_LINK`, async ({
        request,
      }) => {
        const res = await request.fetch(ep.path, {
          method: ep.method,
          headers: bearer(tokenOf(wrong)),
          data: ep.data,
        });
        await expectError(res, 401, "INVALID_LINK");
      });
    }

    test(`${ep.method} ${ep.path} recusa credencial ausente, mal formada, desconhecida e de outro papel com a mesma resposta`, async ({
      request,
    }) => {
      const send = (headers: Record<string, string>) =>
        request.fetch(ep.path, { method: ep.method, headers, data: ep.data });
      const wrong = (["invite", "participant", "admin"] as const).find((k) => k !== ep.role)!;
      const responses = await Promise.all([
        send({}),
        send({ Authorization: "Bearer " }),
        send(bearer("curto")),
        send(bearer(unknownToken())),
        send(bearer(tokenOf(wrong))),
      ]);
      for (const res of responses) await expectError(res, 401, "INVALID_LINK");
      // ADR-002: a recusa é a mesma, sem revelar se o grupo existe nem o papel do token.
      const bodies = await Promise.all(responses.map((res) => res.json()));
      for (const body of bodies) expect(body).toEqual(bodies[0]);
    });
  }

  test("resumo de Meus grupos aceita participante ou organizador e informa o papel", async ({
    request,
  }) => {
    const asParticipant = await request.get("/api/v1/my-groups/summary", {
      headers: bearer(tokenOf("participant")),
    });
    expect((await asParticipant.json()).role).toBe("participant");
    const asOrganizer = await request.get("/api/v1/my-groups/summary", {
      headers: bearer(tokenOf("admin")),
    });
    expect((await asOrganizer.json()).role).toBe("organizer");
    await expectError(
      await request.get("/api/v1/my-groups/summary", { headers: bearer(tokenOf("invite")) }),
      401,
      "INVALID_LINK"
    );
  });

  test("token em query string é recusado com INVALID_INPUT, mesmo válido", async ({ request }) => {
    for (const key of [
      "token",
      "accessToken",
      "adminToken",
      "inviteToken",
      "expoPushToken",
      "key",
      "secret",
      "auth",
    ]) {
      const res = await request.get(`/api/v1/participant?${key}=${tokenOf("participant")}`, {
        headers: bearer(tokenOf("participant")),
      });
      await expectError(res, 400, "INVALID_INPUT");
    }
  });

  test("participante removido perde o acesso (401)", async ({ request }) => {
    const fresh = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const view = await (
      await request.get("/api/v1/admin", { headers: bearer(fresh.adminToken) })
    ).json();
    const removed = await request.delete(`/api/v1/admin/participants/${view.participants[0].id}`, {
      headers: bearer(fresh.adminToken),
    });
    expect(removed.status()).toBe(200);
    const res = await request.get("/api/v1/participant", {
      headers: bearer(fresh.participants[0].accessToken),
    });
    await expectError(res, 401, "INVALID_LINK");
  });
});
