import type { Page, Response } from "@playwright/test";
import { test, expect, MOBILE } from "./fixtures/group-factory";
import { AdminPanelPage } from "./pages/admin-panel.page";
import { ParticipantAreaPage } from "./pages/participant-area.page";

const NAMES = ["QA Ana", "QA Bruno", "QA Carla"];
/** Chaves de pareamento do domínio: qualquer uma entregue ao cliente é vazamento. */
const PAIR_KEY =
  /"(pairs|draws|target_?id|receiver_?id|recipient|receiver|receivers|recipients|giver|recipientName|receiverName)"\s*:/;

/** Guarda o corpo de cada resposta JSON/texto/HTML, inclusive o text/x-component das ações. */
function watch(page: Page) {
  const bodies: { method: string; body: string }[] = [];
  const reads: Promise<void>[] = [];
  page.on("response", (response: Response) => {
    const type = response.headers()["content-type"] ?? "";
    if (!/json|text|html/.test(type)) return;
    const method = response.request().method();
    reads.push(
      response
        .text()
        .then((body) => {
          bodies.push({ method, body });
        })
        .catch(() => {})
    );
  });
  return { bodies, settle: () => Promise.all(reads) };
}

test.describe("RN03 / RNF04 - o resultado nunca vaza pares (CT-08)", () => {
  test("painel, convite, respostas e área de cada pessoa não expõem pares alheios", async ({
    browser,
    groupFactory,
  }) => {
    test.setTimeout(240_000);
    const group = await groupFactory.create(NAMES);

    // 1. Painel: a lista de participantes pode aparecer no RSC; o pareamento, nunca.
    const adminContext = await browser.newContext({ viewport: MOBILE });
    const adminPage = await adminContext.newPage();
    const admin = new AdminPanelPage(adminPage);
    const panel = watch(adminPage);
    await admin.open(group.adminUrl);

    await admin.draw();
    await expect(admin.drawnBadge).toBeVisible();
    await panel.settle();
    for (const { method, body } of panel.bodies) {
      expect(body, "resposta do painel expõe chave de par").not.toMatch(PAIR_KEY);
      // A ação do sorteio não pode devolver nome nenhum: só estado e data.
      if (method === "POST") for (const name of NAMES) expect(body).not.toContain(name);
    }
    expect(await adminPage.content()).not.toMatch(PAIR_KEY);
    expect(await adminPage.locator("body").innerText()).not.toMatch(/→|->/);
    await adminContext.close();

    // 2. Área de cada pessoa: antes do clique, nem HTML, nem RSC, nem rede com outro nome.
    async function revealAndCheck(participant: { name: string; personalUrl: string }) {
      const others = NAMES.filter((name) => name !== participant.name);
      const context = await browser.newContext({ viewport: MOBILE });
      const page = await context.newPage();
      const area = new ParticipantAreaPage(page);
      const net = watch(page);

      await area.open(participant.personalUrl);
      await net.settle();
      const before = await page.content();
      const visible = await area.visibleText();
      expect(before, "HTML antes de revelar").not.toMatch(PAIR_KEY);
      for (const other of others) {
        expect(visible, `${participant.name} vê ${other} antes de revelar`).not.toContain(other);
        expect(before, `${other} no HTML antes de revelar`).not.toContain(other);
        for (const { body } of net.bodies) expect(body).not.toContain(other);
      }

      const mark = net.bodies.length;
      await area.revealButton.click();
      await expect(area.revealedPrefix).toBeVisible();
      await expect(area.resultTitle).toBeVisible();
      await net.settle();

      const after = await page.content();
      expect(after).not.toMatch(PAIR_KEY);
      const targets = others.filter((name) => after.includes(name));
      expect(targets, `${participant.name}: um só destinatário`).toHaveLength(1);
      // A resposta do Revelar pode trazer o destinatário, nunca um terceiro.
      for (const { body } of net.bodies.slice(mark)) {
        expect(body).not.toMatch(PAIR_KEY);
        expect(others.filter((name) => body.includes(name)).length).toBeLessThanOrEqual(1);
      }
      await context.close();
      return { target: targets[0], html: after };
    }

    const revealed = new Map<string, string>();
    const pages = new Map<string, string>();
    for (const participant of group.participants) {
      const { target, html } = await revealAndCheck(participant);
      revealed.set(participant.name, target);
      pages.set(participant.name, html);
    }

    expect(new Set(revealed.values()).size).toBe(NAMES.length);
    for (const [owner, html] of pages) {
      for (const [donor, target] of revealed) {
        if (donor === owner || target === owner) continue;
        expect(html, `${owner} não pode ver o par de ${donor}`).not.toContain(target);
      }
    }

    // 3. O convite fechado recusa a entrada e não mostra nome nenhum.
    const inviteContext = await browser.newContext({ viewport: MOBILE });
    const invitePage = await inviteContext.newPage();
    await invitePage.goto(group.inviteUrl);
    await expect(invitePage.getByText(/entradas est.o encerradas/i)).toBeVisible();
    const invite = await invitePage.content();
    for (const name of NAMES) expect(invite).not.toContain(name);
    await inviteContext.close();
  });
});
