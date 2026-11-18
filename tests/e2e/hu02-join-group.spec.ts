import { test, expect, syntheticGroup, syntheticParticipants } from "./fixtures/group.fixture";
import { InvitePage } from "./pages/invite.page";
import { PersonalLinkPage } from "./pages/personal-link.page";
import type { CreateGroupPage } from "./pages/create-group.page";
import type { GroupSuccessPage } from "./pages/group-success.page";

async function createInvite(createGroupPage: CreateGroupPage, groupSuccessPage: GroupSuccessPage) {
  const group = { ...syntheticGroup, name: `Grupo ${crypto.randomUUID().slice(0, 8)}` };
  await createGroupPage.open();
  await createGroupPage.fillForm(group);
  await createGroupPage.submit();
  await expect(groupSuccessPage.inviteLink).toBeVisible();
  const inviteUrl = await groupSuccessPage.inviteLink.inputValue();
  return { group, inviteUrl };
}

test.describe("HU02 - Entrar no grupo", () => {
  test("CT-02: entrar no grupo só com o nome e receber link pessoal", async ({
    page,
    createGroupPage,
    groupSuccessPage,
    invitePage,
    personalLinkPage,
  }) => {
    test.setTimeout(90_000);
    expect(page.viewportSize()).toEqual({ width: 360, height: 800 });

    const { inviteUrl } = await createInvite(createGroupPage, groupSuccessPage);
    const startTime = Date.now();
    await invitePage.open(inviteUrl);
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
    const joinElapsedMs = Date.now() - startTime;
    expect(joinElapsedMs).toBeLessThan(30_000);
    test.info().annotations.push({ type: "rnf01-entrar-ms", description: String(joinElapsedMs) });
    console.log(`RNF01 entrar no grupo: ${joinElapsedMs} ms (limite 30000 ms)`);
  });

  test("CT-02 / RN07: participante com nome repetido vira Ana 2", async ({
    browser,
    createGroupPage,
    groupSuccessPage,
  }) => {
    test.setTimeout(90_000);
    const { inviteUrl } = await createInvite(createGroupPage, groupSuccessPage);

    const first = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const firstPage = await first.newPage();
    const firstInvite = new InvitePage(firstPage);
    const firstPersonal = new PersonalLinkPage(firstPage);
    await firstInvite.open(inviteUrl);
    await firstInvite.join(syntheticParticipants.first);
    await expect(firstPersonal.heading(syntheticParticipants.first)).toBeVisible();
    await first.close();

    const second = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const secondPage = await second.newPage();
    const secondInvite = new InvitePage(secondPage);
    const secondPersonal = new PersonalLinkPage(secondPage);
    await secondInvite.open(inviteUrl);
    await secondInvite.join(syntheticParticipants.duplicate);
    await expect(secondPersonal.heading(syntheticParticipants.expectedDuplicate)).toBeVisible();
    await second.close();
  });

  test("CT-02: link inválido não mostra o formulário", async ({ page, invitePage }) => {
    test.setTimeout(60_000);
    await invitePage.open(`/g/nao-existe-${crypto.randomUUID()}`);
    await expect(invitePage.invalidLinkMessage).toBeVisible();
    await expect(invitePage.participantName).toHaveCount(0);
    expect(page.viewportSize()?.width).toBe(360);
  });

  test.fixme("CT-02: grupo sorteado recusa entrada", async () => {
    // Needs a drawn group. The draw is SRT-03 and is not on main.
  });

  test.fixme("CT-02: grupo cheio recusa entrada", async () => {
    // Needs 100 active participants (RN09). Out of scope for this card.
  });
});
