import { test, expect } from "./fixtures/group.fixture";

test.describe("SRT-03: Grupo fechado para novas entradas", () => {
  test.fixme("SRT-03: um grupo já sorteado recusa novas entradas", async ({ invitePage }) => {
    // Habilitar após a conclusão do sorteio (It-3, SRT-03).
    await expect(invitePage.closedMessage).toBeVisible();
  });
});
