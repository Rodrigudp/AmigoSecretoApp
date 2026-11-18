import { test, expect } from "./fixtures/group-factory";
import { ParticipantAreaPage } from "./pages/participant-area.page";

const MOBILE = { width: 360, height: 800 };

test.describe("HU03 - lista de desejos (CT-03)", () => {
  test.fixme("participante adiciona desejo, o item aparece no topo e o link é aceito", async ({
    browser,
    groupFactory,
  }) => {
    // Depende do LST-02/LST-04 (lista na área do participante), ainda não está na main.
    test.setTimeout(180_000);
    const group = await groupFactory.create(["QA Ana"]);

    const context = await browser.newContext({ viewport: MOBILE });
    const page = await context.newPage();
    const area = new ParticipantAreaPage(page);
    await area.open(group.participants[0].personalUrl);

    await expect(area.wishListTitle).toBeVisible();
    await area.addItemButton.click();
    await area.itemTitleField.fill("Fone de ouvido");
    await area.itemLinkField.fill("https://www.amazon.com.br/dp/B000000000");
    await expect(area.itemList.getByText("Fone de ouvido")).toBeVisible();
    await expect(area.itemList.getByText(/amazon\.com\.br/i)).toBeVisible();

    await context.close();
  });
});
