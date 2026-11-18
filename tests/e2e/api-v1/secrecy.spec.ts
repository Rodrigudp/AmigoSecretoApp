import { expect } from "@playwright/test";
import { test, bearer, seedGroup } from "./helpers";

const PAIR_KEYS =
  /"(giver|giver_id|receiver|receiver_id|recipient|receiverName|pairs|assignments|draw_results)"/i;

test.describe("API v1 - sigilo dos pares (CT-36, RN03/RNF04)", () => {
  test("nenhuma resposta lista pares; reveal devolve só o próprio par", async ({ request }) => {
    const names = ["Ana", "Bruno", "Carla", "Diego"];
    const seed = await seedGroup(request, names);
    const admin = bearer(seed.adminToken);
    const collected: string[] = [];

    const early = await request.post("/api/v1/participant/reveal", {
      headers: bearer(seed.participants[0].accessToken),
    });
    expect(early.status()).toBe(409);
    expect((await early.json()).error.code).toBe("DRAW_NOT_READY");

    const drawn = await request.post("/api/v1/admin/draw", {
      headers: admin,
      data: { expectedParticipantCount: 4 },
    });
    expect(drawn.status()).toBe(200);
    collected.push(await drawn.text());
    collected.push(await (await request.get("/api/v1/admin", { headers: admin })).text());

    const recipients: string[] = [];
    for (const person of seed.participants) {
      const h = bearer(person.accessToken);
      for (const path of [
        "/api/v1/participant",
        "/api/v1/participant/wishes",
        "/api/v1/my-groups/summary",
      ]) {
        collected.push(await (await request.get(path, { headers: h })).text());
      }
      const reveal = await request.post("/api/v1/participant/reveal", { headers: h });
      expect(reveal.status()).toBe(200);
      const body = await reveal.json();
      expect(Object.keys(body).sort()).toEqual(["drawVersion", "recipientName", "wishItems"]);
      expect(body.recipientName).not.toBe(person.name);
      recipients.push(body.recipientName);
    }
    expect([...recipients].sort()).toEqual([...names].sort());
    for (const text of collected) expect(text).not.toMatch(PAIR_KEYS);
  });

  test("lista de desejos na API não expõe link de afiliado (APP-MON-01)", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const h = bearer(seed.participants[0].accessToken);
    const added = await request.post("/api/v1/participant/wishes", {
      headers: h,
      data: { title: "Livro", url: "https://www.amazon.com.br/dp/B000000000", note: null },
    });
    expect(added.status()).toBe(201);
    const text = await (await request.get("/api/v1/participant/wishes", { headers: h })).text();
    expect(text).not.toMatch(/affiliateUrl|productLink|tag=/);
    expect(JSON.parse(text).items[0]).toEqual({
      id: expect.any(String),
      title: "Livro",
      url: "https://www.amazon.com.br/dp/B000000000",
      note: null,
    });
  });
});
