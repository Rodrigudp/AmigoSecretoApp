import { test, expect } from "@playwright/test";
import { PENDING, SECURITY_HEADERS, bearer, expectError, seedGroup, uniqueIp } from "./helpers";

test.describe("API v1 - headers, CORS e rate limit (CT-37)", () => {
  test.fixme(true, PENDING);

  test("sucesso e erro levam os 4 headers de segurança e nenhum CORS", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const ok = await request.get("/api/v1/admin", { headers: bearer(seed.adminToken) });
    const bad = await request.get("/api/v1/admin", { headers: bearer("desconhecido") });
    for (const res of [ok, bad]) {
      for (const [name, value] of Object.entries(SECURITY_HEADERS))
        expect(res.headers()[name], name).toBe(value);
      expect(res.headers()["access-control-allow-origin"]).toBeUndefined();
    }
  });

  test("OPTIONS (preflight cross-origin) é recusado com 403 ou 405", async ({ request }) => {
    const res = await request.fetch("/api/v1/participant", {
      method: "OPTIONS",
      headers: { Origin: "https://example.com", "Access-Control-Request-Method": "GET" },
    });
    expect([403, 405]).toContain(res.status());
    expect(res.headers()["access-control-allow-origin"]).toBeUndefined();
  });

  test("a 121ª requisição em 10 min por IP devolve 429 RATE_LIMITED com headers de segurança", async ({
    request,
  }) => {
    const headers = { ...bearer("desconhecido"), "x-forwarded-for": uniqueIp() };
    let limited;
    for (let i = 0; i < 125 && !limited; i++) {
      const res = await request.get("/api/v1/invite", { headers });
      if (res.status() === 429) limited = res;
    }
    expect(limited, "esperava 429 antes de 125 chamadas").toBeDefined();
    await expectError(limited!, 429, "RATE_LIMITED");
    expect(limited!.headers()["cache-control"]).toBe(SECURITY_HEADERS["cache-control"]);
  });

  test("a 31ª tentativa de entrar por IP devolve 429 (join_group)", async ({ request }) => {
    const seed = await seedGroup(request, []);
    const headers = { ...bearer(seed.inviteToken), "x-forwarded-for": uniqueIp() };
    let last = 0;
    for (let i = 0; i < 31; i++) {
      last = (
        await request.post("/api/v1/invite/join", { headers, data: { displayName: `P${i}` } })
      ).status();
    }
    expect(last).toBe(429);
  });
});
