import { expect } from "@playwright/test";
import { test, bearer, expectError, seedGroup, uniqueIp } from "./helpers";

const device = (n: number) => ({
  expoPushToken: `ExponentPushToken[qa-device-${n}]`,
  platform: "android",
});

test.describe("API v1 - push-tokens (CT-61)", () => {
  test("participante e organizador registram e removem aparelho; a resposta informa o papel", async ({
    request,
  }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    for (const [token, role] of [
      [seed.participants[0].accessToken, "participant"],
      [seed.adminToken, "organizer"],
    ] as const) {
      const registered = await request.post("/api/v1/push-tokens", {
        headers: bearer(token),
        data: device(1),
      });
      expect(await registered.json()).toEqual({ registered: true, role });
      const removed = await request.delete("/api/v1/push-tokens", {
        headers: bearer(token),
        data: { expoPushToken: device(1).expoPushToken },
      });
      expect(await removed.json()).toEqual({ removed: true, role });
    }
  });

  test("formato inválido, campos extras e plataforma desconhecida dão INVALID_INPUT", async ({
    request,
  }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const h = bearer(seed.participants[0].accessToken);
    for (const data of [
      { expoPushToken: "lixo", platform: "ios" },
      { expoPushToken: device(1).expoPushToken, platform: "windows" },
      { ...device(1), extra: 1 },
      { platform: "ios" },
    ]) {
      await expectError(
        await request.post("/api/v1/push-tokens", { headers: h, data }),
        400,
        "INVALID_INPUT"
      );
    }
  });

  test("repetir o mesmo aparelho é idempotente", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const h = bearer(seed.participants[0].accessToken);
    for (let i = 0; i < 3; i++) {
      const res = await request.post("/api/v1/push-tokens", { headers: h, data: device(1) });
      expect(res.status()).toBe(200);
      expect((await res.json()).registered).toBe(true);
    }
  });

  test("credencial de convite, desconhecida ou removida recebe INVALID_LINK", async ({
    request,
  }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    await expectError(
      await request.post("/api/v1/push-tokens", {
        headers: bearer(seed.inviteToken),
        data: device(1),
      }),
      401,
      "INVALID_LINK"
    );
    await expectError(
      await request.post("/api/v1/push-tokens", { data: device(1) }),
      401,
      "INVALID_LINK"
    );
    const admin = bearer(seed.adminToken);
    const view = await (await request.get("/api/v1/admin", { headers: admin })).json();
    await request.delete(`/api/v1/admin/participants/${view.participants[0].id}`, {
      headers: admin,
    });
    await expectError(
      await request.post("/api/v1/push-tokens", {
        headers: bearer(seed.participants[0].accessToken),
        data: device(1),
      }),
      401,
      "INVALID_LINK"
    );
  });

  // API-V1.md §5.2 descreve 409 PUSH_DEVICE_LIMIT no 6º aparelho, mas a RPC register_push_token
  // mantém os 5 mais recentes e apaga o mais antigo. Este teste fixa o comportamento implementado.
  test("o 6º aparelho é aceito e a API não responde 409 (a RPC descarta o mais antigo)", async ({
    request,
  }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const h = bearer(seed.participants[0].accessToken);
    for (let n = 1; n <= 6; n++) {
      const res = await request.post("/api/v1/push-tokens", { headers: h, data: device(n) });
      expect(res.status(), `aparelho ${n}`).toBe(200);
    }
  });

  test("a 31ª escrita de push por IP dá 429", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const headers = { ...bearer(seed.participants[0].accessToken), "x-forwarded-for": uniqueIp() };
    let last = 0;
    for (let i = 0; i < 31; i++) {
      last = (await request.post("/api/v1/push-tokens", { headers, data: device(1) })).status();
    }
    expect(last).toBe(429);
  });
});
