import { test, expect, syntheticGroup } from "./fixtures/group.fixture";

test.describe("HU01 - Criar grupo de amigo secreto", () => {
  test("CT-01: criar grupo com links de convite e organizador distintos e texto do WhatsApp", async ({
    page,
    createGroupPage,
    groupSuccessPage,
  }) => {
    test.setTimeout(90_000);
    expect(page.viewportSize()).toEqual({ width: 360, height: 800 });

    const startTime = Date.now();
    await createGroupPage.open();
    await createGroupPage.fillForm(syntheticGroup);
    await createGroupPage.submit();

    await expect(groupSuccessPage.inviteLink).toBeVisible();
    await expect(groupSuccessPage.adminLink).toBeVisible();
    await expect(groupSuccessPage.adminSecrecyWarning).toBeVisible();

    const inviteUrl = await groupSuccessPage.inviteLink.inputValue();
    const adminUrl = await groupSuccessPage.adminLink.inputValue();
    expect(inviteUrl).not.toEqual(adminUrl);
    expect(inviteUrl).toContain("/g/");
    expect(adminUrl).toContain("/admin/");
    await expect(groupSuccessPage.joinAsParticipant).toHaveAttribute("href", inviteUrl);

    const waShareHref = await groupSuccessPage.shareOnWhatsApp.getAttribute("href");
    expect(waShareHref).toMatch(/^https:\/\/wa\.me\/\?text=/);
    const message = decodeURIComponent(new URL(waShareHref ?? "").searchParams.get("text") ?? "");
    expect(message).toContain(`*${syntheticGroup.name}*`);
    expect(message).toContain("24/12/2099");
    expect(message).toContain("Valor máximo: R$ 50,00");
    expect(message).toContain("Local de teste");
    expect(message).toContain(inviteUrl);

    const elapsedMs = Date.now() - startTime;
    expect(elapsedMs).toBeLessThan(120_000);
    test.info().annotations.push({ type: "rnf01-criar-grupo-ms", description: String(elapsedMs) });
    console.log(`RNF01 criar grupo: ${elapsedMs} ms (limite 120000 ms)`);
  });
});
