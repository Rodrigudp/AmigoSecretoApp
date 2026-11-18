import { test, expect, MOBILE } from "./fixtures/group-factory";
import { AdminPanelPage } from "./pages/admin-panel.page";
import { ParticipantAreaPage } from "./pages/participant-area.page";

const NAMES = ["QA Ana", "QA Bruno", "QA Carla"];

test.describe("RN03 / RNF04 - o resultado nunca vaza pares (CT-08)", () => {
  test.fixme("painel, convite, respostas e área de cada pessoa não expõem pares alheios", async ({
    browser,
    groupFactory,
  }) => {
    // Depende do SRT-03 (sorteio pelo painel), ainda não está na main.
    test.setTimeout(240_000);
    const group = await groupFactory.create(NAMES);

    // 1. Nenhuma resposta disparada pelo sorteio carrega nome de participante.
    const adminContext = await browser.newContext({ viewport: MOBILE });
    const adminPage = await adminContext.newPage();
    const admin = new AdminPanelPage(adminPage);
    await admin.open(group.adminUrl);

    const drawResponses: string[] = [];
    adminPage.on("response", async (response) => {
      const type = response.headers()["content-type"] ?? "";
      if (!/json|text|html/.test(type)) return;
      await response
        .text()
        .then((body) => drawResponses.push(body))
        .catch(() => {});
    });

    await admin.draw();
    await expect(admin.drawnBadge).toBeVisible();
    for (const body of drawResponses) for (const name of NAMES) expect(body).not.toContain(name);
    expect(await adminPage.content()).not.toMatch(
      /"(pairs|draws|target_id|targetId|receiver)"\s*:/
    );
    await adminContext.close();

    // 2. Cada área só revela o próprio par, e só depois do clique.
    const revealed = new Map<string, string>();
    const texts = new Map<string, string>();

    for (const participant of group.participants) {
      const context = await browser.newContext({ viewport: MOBILE });
      const page = await context.newPage();
      const area = new ParticipantAreaPage(page);
      await area.open(participant.personalUrl);

      const before = await area.visibleText();
      const others = NAMES.filter((name) => name !== participant.name);
      for (const other of others) expect(before).not.toContain(other);

      await area.revealButton.click();
      await expect(area.resultTitle).toBeVisible();

      const after = await area.visibleText();
      const targets = NAMES.filter((name) => name !== participant.name && after.includes(name));
      expect(targets).toHaveLength(1);
      revealed.set(participant.name, targets[0]);
      texts.set(participant.name, after);
      await context.close();
    }

    expect(new Set(revealed.values()).size).toBe(NAMES.length);
    for (const [owner, text] of texts) {
      for (const [donor, target] of revealed) {
        if (donor === owner) continue;
        expect(text, `${owner} não pode ver o par de ${donor}`).not.toContain(target);
      }
    }

    // 3. O convite fechado recusa a entrada e não mostra nome nenhum.
    const inviteContext = await browser.newContext({ viewport: MOBILE });
    const invitePage = await inviteContext.newPage();
    await invitePage.goto(group.inviteUrl);
    await expect(invitePage.getByText(/entradas est.o encerradas/i)).toBeVisible();
    const inviteText = await invitePage.locator("body").innerText();
    for (const name of NAMES) expect(inviteText).not.toContain(name);
    await inviteContext.close();
  });
});
