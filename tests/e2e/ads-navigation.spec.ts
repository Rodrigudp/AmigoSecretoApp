import { test, expect } from "./fixtures/group-factory";

test("leaving the monetized page replaces the document for the logo and footer", async ({
  page,
  groupFactory,
}) => {
  test.setTimeout(180_000);
  const group = await groupFactory.create(["QA Ana"]);
  const targets = ["/", "/sobre", "/privacidade", "/termos", "/contato"];
  for (const target of targets) {
    await page.goto(group.participants[0].personalUrl);
    await expect(page).toHaveURL(/\/p\/g\//, { timeout: 30_000 });
    await page.evaluate(() => {
      (window as Window & { __pz_sentinel?: number }).__pz_sentinel = 1;
    });
    const link =
      target === "/"
        ? page.locator('header a[href="/"]')
        : page.locator(`footer a[href="${target}"]`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${target === "/" ? "/$" : target + "$"}`));
    expect(
      await page.evaluate(() => (window as Window & { __pz_sentinel?: number }).__pz_sentinel)
    ).toBeUndefined();
    await page.goBack();
    await expect(page).toHaveURL(/\/p\/g\//);
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`${target === "/" ? "/$" : target + "$"}`));
    expect(
      await page.evaluate(() => (window as Window & { __pz_sentinel?: number }).__pz_sentinel)
    ).toBeUndefined();
  }
});
