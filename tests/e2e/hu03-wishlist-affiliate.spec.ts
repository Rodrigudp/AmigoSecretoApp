import { test, expect } from "./fixtures/group-factory";
import { ParticipantAreaPage } from "./pages/participant-area.page";

test("HU03 - lista funciona sem expor o token na rota do participante", async ({
  page,
  groupFactory,
}) => {
  test.setTimeout(180_000);
  const group = await groupFactory.create(["QA Ana"]);
  const { personalUrl } = group.participants[0];
  const accessToken = new URL(personalUrl).pathname.split("/").at(-1);
  if (!accessToken) throw new Error("O link pessoal deve incluir um token");

  const area = new ParticipantAreaPage(page);
  await area.open(personalUrl);
  await expect(page).toHaveURL(/\/p\/g\/[^/?]+$/);
  await expect(area.wishListTitle).toBeVisible();

  const html = await page.request.get(page.url());
  expect(html.ok()).toBe(true);
  expect(html.headers()["content-type"]).toContain("text/html");
  const htmlBody = await html.text();
  expect(htmlBody.includes(group.name)).toBe(true);
  expect(htmlBody.includes(accessToken), "O HTML não deve conter o token").toBe(false);

  const rsc = await page.request.get(page.url(), { headers: { RSC: "1" } });
  expect(rsc.ok()).toBe(true);
  expect(rsc.headers()["content-type"]).toContain("text/x-component");
  const rscBody = await rsc.text();
  expect(rscBody.includes(group.name)).toBe(true);
  expect(rscBody.includes(accessToken), "O payload RSC não deve conter o token").toBe(false);

  await area.addItemButton.click();
  await area.itemTitleField.fill("Fone de ouvido");
  await area.itemLinkField.fill("https://www.amazon.com.br/dp/B000000000");
  await page.getByRole("button", { name: "Salvar presente" }).click();
  const originalItem = page.getByRole("heading", { name: "Fone de ouvido" });
  await expect(originalItem).toBeVisible();
  await expect(area.itemList.getByText(/amazon\.com\.br/i)).toBeVisible();

  await page.getByRole("button", { name: "Editar Fone de ouvido" }).click();
  await area.itemTitleField.fill("Fone sem fio");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  const updatedItem = page.getByRole("heading", { name: "Fone sem fio" });
  await expect(updatedItem).toBeVisible();

  await page.reload();
  await expect(updatedItem).toBeVisible();
  await page.getByRole("button", { name: "Apagar Fone sem fio" }).click();
  await page.getByRole("button", { name: "Sim, apagar" }).click();
  await expect(updatedItem).toHaveCount(0);
  await page.reload();
  await expect(area.wishListTitle).toBeVisible();
  await expect(updatedItem).toHaveCount(0);
});
