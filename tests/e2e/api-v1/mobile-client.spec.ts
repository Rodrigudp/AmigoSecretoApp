import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import { createHttpApi } from "../../../mobile/src/v1/client";
import { test, uniqueIp } from "./helpers";

const PRODUCTION = "https://papelzinho.app";

/**
 * O cliente HTTP do app (`mobile/src/v1/client.ts`) usa a URL de produção fixa e o Expo Web não
 * guarda credenciais (SecureStore indisponível). Por isso o fluxo "live" roda aqui: o mesmo código
 * do app, com a URL de produção trocada pelo Next local e um IP exclusivo por teste.
 */
function appClient(baseURL: string) {
  const ip = uniqueIp();
  return createHttpApi((url, options) => {
    const headers = new Headers(options.headers);
    headers.set("x-forwarded-for", ip);
    return fetch(url.replace(PRODUCTION, baseURL), { ...options, headers });
  });
}

test.describe("Cliente do app contra a API v1 real (APP-QA-02)", () => {
  test("criar → convite → 3 entradas → lista → sortear → revelar → desativar avisos", async ({
    baseURL,
  }) => {
    const app = appClient(baseURL!);
    const created = await app.create({
      name: "Grupo QA app",
      maxValueCents: 5000,
      exchangeDate: "2099-12-24",
      location: "Casa de teste",
      requestId: randomUUID(),
    });

    const invitation = await app.invitation(created.inviteToken);
    expect(invitation.group.status).toBe("open");
    expect(invitation.isFull).toBe(false);

    const names = ["Ana", "Bruno", "Carla"];
    const people = [];
    for (const name of names) {
      const joined = await app.join(created.inviteToken, name);
      expect(joined.displayName).toBe(name);
      people.push(joined);
    }

    const ana = people[0].accessToken;
    const { item } = await app.addWish(ana, {
      title: "Livro",
      url: "https://www.amazon.com.br/dp/B000000000",
      note: null,
    });
    await app.updateWish(ana, item.id, { title: "Livro de receitas", url: null, note: null });
    expect((await app.wishes(ana)).items.map((wish) => wish.title)).toEqual(["Livro de receitas"]);
    expect((await app.participant(ana)).view.ownWishItems).toHaveLength(1);

    expect((await app.summary(ana)).role).toBe("participant");
    expect((await app.summary(created.adminToken)).role).toBe("organizer");
    const admin = await app.admin(created.adminToken);
    expect(admin.participantCount).toBe(3);

    const token = "ExponentPushToken[qa-app-client]";
    expect(await app.registerPush(ana, { expoPushToken: token, platform: "android" })).toEqual({
      registered: true,
      role: "participant",
    });

    const drawn = await app.draw(created.adminToken, 3);
    expect(drawn.status).toBe("drawn");
    expect((await app.admin(created.adminToken)).draw.status).toBe("drawn");

    const recipients: string[] = [];
    for (const [index, person] of people.entries()) {
      const reveal = await app.reveal(person.accessToken);
      expect(reveal.recipientName).not.toBe(names[index]);
      recipients.push(reveal.recipientName);
    }
    expect([...recipients].sort()).toEqual([...names].sort());

    expect(await app.revokePush(ana, token)).toEqual({ removed: true, role: "participant" });
  });

  test("erros da API chegam ao app como ApiError com o código do contrato", async ({ baseURL }) => {
    const app = appClient(baseURL!);
    await expect(app.summary("A".repeat(43))).rejects.toMatchObject({ code: "INVALID_LINK" });
    await expect(app.invitation("curto")).rejects.toMatchObject({ code: "INVALID_LINK" });
    await expect(
      app.create({
        name: "",
        maxValueCents: 0,
        exchangeDate: "2000-01-01",
        location: null,
        requestId: randomUUID(),
      })
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});
