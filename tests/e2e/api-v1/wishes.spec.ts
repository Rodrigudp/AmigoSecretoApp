import { expect } from "@playwright/test";
import { test, bearer, expectError, seedGroup, uniqueIp } from "./helpers";

test.describe("API v1 - lista de desejos (CT-60)", () => {
  test("CRUD devolve só id, title, url e note, sem link de afiliado", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const h = bearer(seed.participants[0].accessToken);
    const original = "https://www.amazon.com.br/dp/B000000000";

    const added = await request.post("/api/v1/participant/wishes", {
      headers: h,
      data: { title: "Livro", url: `${original}?tag=afiliado-20`, note: "Capa dura" },
    });
    expect(added.status()).toBe(201);
    const { item } = await added.json();
    expect(Object.keys(item).sort()).toEqual(["id", "note", "title", "url"]);
    expect(item.url).toBe(original);

    const edited = await request.patch(`/api/v1/participant/wishes/${item.id}`, {
      headers: h,
      data: { title: "Livro de receitas", url: null, note: null },
    });
    expect(edited.status()).toBe(200);
    expect((await edited.json()).item).toEqual({
      id: item.id,
      title: "Livro de receitas",
      url: null,
      note: null,
    });

    const listed = await (await request.get("/api/v1/participant/wishes", { headers: h })).text();
    expect(listed).not.toMatch(/affiliateUrl|productLink|tag=/);
    expect(JSON.parse(listed).items).toHaveLength(1);

    const removed = await request.delete(`/api/v1/participant/wishes/${item.id}`, { headers: h });
    expect(await removed.json()).toEqual({ id: item.id });
    expect(
      (await (await request.get("/api/v1/participant/wishes", { headers: h })).json()).items
    ).toEqual([]);
  });

  test("dados inválidos são recusados com INVALID_INPUT", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const h = bearer(seed.participants[0].accessToken);
    for (const data of [
      {},
      { title: "" },
      { title: "x", url: "http://exemplo.com/produto" },
      { title: "x", url: "javascript:alert(1)" },
      { title: "x", extra: true },
    ]) {
      await expectError(
        await request.post("/api/v1/participant/wishes", { headers: h, data }),
        400,
        "INVALID_INPUT"
      );
    }
  });

  test("21º item dá WISH_LIST_FULL; item de outra pessoa dá WISH_ITEM_NOT_FOUND", async ({
    request,
  }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const [ana, bruno] = seed.participants.map((p) => bearer(p.accessToken));
    let firstId = "";
    for (let i = 0; i < 20; i++) {
      const res = await request.post("/api/v1/participant/wishes", {
        headers: ana,
        data: { title: `Item ${i}` },
      });
      expect(res.status()).toBe(201);
      if (i === 0) firstId = (await res.json()).item.id;
    }
    await expectError(
      await request.post("/api/v1/participant/wishes", { headers: ana, data: { title: "21" } }),
      409,
      "WISH_LIST_FULL"
    );
    await expectError(
      await request.delete(`/api/v1/participant/wishes/${firstId}`, { headers: bruno }),
      404,
      "WISH_ITEM_NOT_FOUND"
    );
    await expectError(
      await request.patch(`/api/v1/participant/wishes/${firstId}`, {
        headers: bruno,
        data: { title: "roubado" },
      }),
      404,
      "WISH_ITEM_NOT_FOUND"
    );
  });

  test("a lista de um participante não aparece para outro", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const [ana, bruno] = seed.participants.map((p) => bearer(p.accessToken));
    await request.post("/api/v1/participant/wishes", {
      headers: ana,
      data: { title: "Só da Ana" },
    });
    const text = await (await request.get("/api/v1/participant/wishes", { headers: bruno })).text();
    expect(text).not.toContain("Só da Ana");
  });

  test("a 31ª escrita por IP em 10 min dá 429 RATE_LIMITED (api_v1_write)", async ({ request }) => {
    const seed = await seedGroup(request, ["Ana", "Bruno", "Carla"]);
    const headers = { ...bearer(seed.participants[0].accessToken), "x-forwarded-for": uniqueIp() };
    const statuses: number[] = [];
    for (let i = 0; i < 31; i++) {
      statuses.push(
        (
          await request.post("/api/v1/participant/wishes", {
            headers,
            data: { title: `Item ${i}` },
          })
        ).status()
      );
    }
    expect(statuses.slice(0, 30)).not.toContain(429);
    expect(statuses[30]).toBe(429);
  });
});
