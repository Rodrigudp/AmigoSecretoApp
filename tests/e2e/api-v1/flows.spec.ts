import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { PENDING, bearer, expectError, seedGroup } from "./helpers";

test.describe("API v1 - regras de negócio nos endpoints (CT-38)", () => {
  test.fixme(true, PENDING);

  test("sorteio com 2 pessoas: NOT_ENOUGH_PARTICIPANTS; contagem divergente: DRAW_MEMBERS_CHANGED", async ({
    request,
  }) => {
    const small = await seedGroup(request, ["Ana", "Bruno"]);
    const tooFew = await request.post("/api/v1/admin/draw", {
      headers: bearer(small.adminToken),
      data: {},
    });
    await expectError(tooFew, 409, "NOT_ENOUGH_PARTICIPANTS");
    const ok = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const stale = await request.post("/api/v1/admin/draw", {
      headers: bearer(ok.adminToken),
      data: { expectedParticipantCount: 5 },
    });
    await expectError(stale, 409, "DRAW_MEMBERS_CHANGED");
  });

  test("após o sorteio: entrar e remover dão GROUP_CLOSED; repetir o sorteio mantém a versão 1", async ({
    request,
  }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const admin = bearer(seed.adminToken);
    await request.post("/api/v1/admin/draw", { headers: admin, data: {} });
    const late = await request.post("/api/v1/invite/join", {
      headers: bearer(seed.inviteToken),
      data: { displayName: "Tarde" },
    });
    await expectError(late, 409, "GROUP_CLOSED");
    const view = await (await request.get("/api/v1/admin", { headers: admin })).json();
    await expectError(
      await request.delete(`/api/v1/admin/participants/${view.participants[0].id}`, {
        headers: admin,
      }),
      409,
      "GROUP_CLOSED"
    );
    expect((await request.post("/api/v1/admin/draw", { headers: admin, data: {} })).status()).toBe(
      200
    );
    const reveal = await request.post("/api/v1/participant/reveal", {
      headers: bearer(seed.participants[0].accessToken),
    });
    expect((await reveal.json()).drawVersion).toBe(1);
  });

  test("criar grupo: mesmo requestId com dados diferentes dá IDEMPOTENCY_CONFLICT; dados inválidos dão INVALID_INPUT", async ({
    request,
  }) => {
    const data = {
      name: "Grupo A",
      maxValueCents: 1000,
      exchangeDate: "2099-12-24",
      location: null,
      requestId: randomUUID(),
    };
    expect((await request.post("/api/v1/groups", { data })).status()).toBe(201);
    await expectError(
      await request.post("/api/v1/groups", { data: { ...data, name: "Grupo B" } }),
      409,
      "IDEMPOTENCY_CONFLICT"
    );
    const fresh = { ...data, requestId: randomUUID() };
    await expectError(
      await request.post("/api/v1/groups", { data: { ...fresh, name: "<b>x</b>" } }),
      400,
      "INVALID_INPUT"
    );
    await expectError(
      await request.post("/api/v1/groups", { data: { ...fresh, maxValueCents: 0 } }),
      400,
      "INVALID_INPUT"
    );
  });
});
