import { test, expect, syntheticParticipants } from "./fixtures/group.fixture";

test.describe("HU02 - Entrar no grupo", () => {
  test.fixme("CT-02: entrar no grupo só com o nome e receber link pessoal", async ({
    invitePage,
    personalLinkPage,
  }) => {
    // Habilitar após merge de PAR-03
    const startTime = Date.now();
    await invitePage.join(syntheticParticipants.first);

    await expect(personalLinkPage.personalLink).toBeVisible();
    const personalUrl = await personalLinkPage.personalLink.inputValue();
    expect(personalUrl).toContain("/p/");

    const elapsedMs = Date.now() - startTime;
    expect(elapsedMs).toBeLessThan(30_000); // RNF01: < 30 s
  });

  test.fixme("CT-02 / RN07: participante com nome repetido vira Ana 2", async ({
    invitePage,
    personalLinkPage,
  }) => {
    // Habilitar após merge de PAR-03
    await invitePage.join(syntheticParticipants.duplicate);
    await expect(personalLinkPage.personalLink).toBeVisible();
  });
});
