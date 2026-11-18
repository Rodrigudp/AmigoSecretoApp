import { test, expect, syntheticGroup } from "./fixtures/group.fixture";

test.describe("HU01 - Criar grupo de amigo secreto", () => {
  test.fixme("CT-01: criar grupo com links de convite e organizador distintos e texto do WhatsApp", async ({
    createGroupPage,
    groupSuccessPage,
  }) => {
    // Habilitar após merge de GRP-03 (PRs #15 e #16)
    const startTime = Date.now();
    await createGroupPage.open();
    await createGroupPage.fillForm(syntheticGroup);
    await createGroupPage.submit();

    await expect(groupSuccessPage.inviteLink).toBeVisible();
    await expect(groupSuccessPage.adminLink).toBeVisible();

    const inviteUrl = await groupSuccessPage.inviteLink.inputValue();
    const adminUrl = await groupSuccessPage.adminLink.inputValue();
    expect(inviteUrl).not.toEqual(adminUrl);
    expect(inviteUrl).toContain("/g/");
    expect(adminUrl).toContain("/a/");

    const waShareHref = await groupSuccessPage.shareOnWhatsApp.getAttribute("href");
    expect(waShareHref).toContain("api.whatsapp.com/send");

    const elapsedMs = Date.now() - startTime;
    expect(elapsedMs).toBeLessThan(120_000); // RNF01: < 2 min
  });
});
