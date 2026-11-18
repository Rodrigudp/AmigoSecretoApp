import { test, expect, syntheticParticipants } from "./fixtures/group.fixture";

const OPEN_INVITE = "/g/e2e-open";

test.describe("HU02 - Entrar no grupo", () => {
  test("CT-02: entrar no grupo só com o nome e receber link pessoal", async ({
    page,
    invitePage,
    personalLinkPage,
  }) => {
    const response = await invitePage.open(OPEN_INVITE);
    test.fixme(response?.status() === 404, "PAR-03 invite screen is not on this branch yet");

    expect(page.viewportSize()).toEqual({ width: 360, height: 800 });

    const startTime = Date.now();
    await invitePage.join(syntheticParticipants.first);

    await expect(personalLinkPage.heading(syntheticParticipants.first)).toBeVisible();
    await expect(personalLinkPage.personalLink).toBeVisible();
    const personalUrl = await personalLinkPage.personalLink.inputValue();
    expect(personalUrl).toContain("/p/");

    const waHref = await personalLinkPage.saveOnWhatsApp.getAttribute("href");
    expect(waHref).toMatch(/^https:\/\/wa\.me\/\?text=/);
    const message = decodeURIComponent(new URL(waHref ?? "").searchParams.get("text") ?? "");
    expect(message).toContain(personalUrl);
    expect(message).toContain("não compartilhe");
    await expect(page.getByText(/Guarde este link/)).toBeVisible();

    const personalCookies = (await page.context().cookies()).filter((cookie) =>
      cookie.name.startsWith("ptk_")
    );
    expect(personalCookies).toHaveLength(1);
    expect(personalCookies[0]?.httpOnly).toBe(true);
    expect(personalCookies[0]?.sameSite).toBe("Lax");
    expect(personalCookies[0]?.path).toBe("/");

    expect(Date.now() - startTime).toBeLessThan(30_000);
  });

  test("CT-02: convite fechado, cheio ou inválido não mostra o formulário", async ({
    page,
    invitePage,
  }) => {
    const response = await invitePage.open("/g/e2e__closed");
    test.fixme(response?.status() === 404, "PAR-03 invite screen is not on this branch yet");

    await expect(invitePage.closedMessage).toBeVisible();
    await expect(invitePage.participantName).toHaveCount(0);

    await invitePage.open("/g/e2e__full");
    await expect(invitePage.fullMessage).toBeVisible();
    await expect(invitePage.participantName).toHaveCount(0);

    await invitePage.open("/g/e2e__invalid");
    await expect(invitePage.invalidLinkMessage).toBeVisible();
    await expect(invitePage.participantName).toHaveCount(0);

    expect(page.viewportSize()?.width).toBe(360);
  });

  test.fixme("CT-02 / RN07: participante com nome repetido vira Ana 2", async ({
    invitePage,
    personalLinkPage,
  }) => {
    // The PAR-03 screen stub echoes the typed name. The "Ana 2" suffix is RN07
    // in the real join-group use case, which this screen does not call yet.
    await invitePage.open(OPEN_INVITE);
    await invitePage.join(syntheticParticipants.duplicate);
    await expect(personalLinkPage.heading(syntheticParticipants.expectedDuplicate)).toBeVisible();
  });
});
