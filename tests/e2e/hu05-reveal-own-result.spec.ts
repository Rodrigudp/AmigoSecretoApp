import { test, expect, MOBILE } from "./fixtures/group-factory";
import { AdminPanelPage } from "./pages/admin-panel.page";
import { ParticipantAreaPage } from "./pages/participant-area.page";

const NAMES = ["QA Ana", "QA Bruno", "QA Carla"];

test.describe("HU05 - revelar o próprio resultado (CT-05)", () => {
  test("resultado começa escondido e revela só o destinatário do titular", async ({
    browser,
    groupFactory,
  }) => {
    test.setTimeout(240_000);
    const group = await groupFactory.create(NAMES);

    const adminContext = await browser.newContext({ viewport: MOBILE });
    const admin = new AdminPanelPage(await adminContext.newPage());
    await admin.open(group.adminUrl);
    await admin.draw();
    await expect(admin.drawnBadge).toBeVisible();
    await adminContext.close();

    const participant = group.participants[0];
    const context = await browser.newContext({ viewport: MOBILE });
    const page = await context.newPage();
    const area = new ParticipantAreaPage(page);
    await area.open(participant.personalUrl);

    await expect(area.drawnMessage).toBeVisible();
    await expect(area.resultTitle).toBeVisible();
    const hidden = await area.visibleText();
    for (const other of NAMES.filter((name) => name !== participant.name)) {
      expect(hidden).not.toContain(other);
    }

    await area.revealButton.click();
    await expect(area.revealedPrefix).toBeVisible();
    const revealedText = await area.visibleText();
    const targets = NAMES.filter(
      (name) => name !== participant.name && revealedText.includes(name)
    );
    expect(targets).toHaveLength(1);

    await expect(area.wishListTitle).toBeVisible();
    await context.close();
  });
});
