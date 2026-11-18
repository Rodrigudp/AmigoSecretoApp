import { test, expect } from "./fixtures/group-factory";
import { AdminPanelPage } from "./pages/admin-panel.page";
import { ParticipantAreaPage } from "./pages/participant-area.page";

const MOBILE = { width: 360, height: 800 };
const NAMES = ["QA Ana", "QA Bruno", "QA Carla"];

test.describe("HU04 - sorteio pelo painel (CT-04)", () => {
  test("painel mostra a contagem e o mínimo de 3 participantes antes do sorteio", async ({
    browser,
    groupFactory,
  }) => {
    test.setTimeout(180_000);
    const group = await groupFactory.create(NAMES);

    const context = await browser.newContext({ viewport: MOBILE });
    const page = await context.newPage();
    const admin = new AdminPanelPage(page);
    await admin.open(group.adminUrl);

    await expect(admin.heading).toHaveText(group.name);
    await expect(admin.openBadge).toBeVisible();
    await expect(admin.participantsTitle(NAMES.length)).toBeVisible();
    for (const name of NAMES) await expect(admin.participantRow(name)).toBeVisible();
    await expect(admin.drawDisabledReason).toHaveCount(0);
    expect(page.viewportSize()).toEqual(MOBILE);

    const area = new ParticipantAreaPage(page);
    await area.open(group.participants[0].personalUrl);
    await expect(area.waitingDrawMessage).toBeVisible();
    await expect(area.resultTitle).toHaveCount(0);

    await context.close();
  });

  test.fixme("organizador sorteia e vê só a confirmação, sem pares; menos de 3 é recusado", async ({
    browser,
    groupFactory,
  }) => {
    // Depende do SRT-03 (sorteio pelo painel), ainda não está na main.
    test.setTimeout(180_000);
    const group = await groupFactory.create(NAMES);

    const context = await browser.newContext({ viewport: MOBILE });
    const page = await context.newPage();
    const admin = new AdminPanelPage(page);
    await admin.open(group.adminUrl);

    await admin.draw();
    await expect(admin.drawnBadge).toBeVisible();
    await expect(admin.drawDoneNotice).toBeVisible();
    await expect(admin.drawButton).toHaveCount(0);

    const panelText = await page.locator("body").innerText();
    expect(panelText).not.toMatch(/→|->/);

    await context.close();
  });
});
