import { test, expect } from "./fixtures/group.fixture";

test.describe("SRT-03: Grupo fechado para novas entradas", () => {
  test.fixme("SRT-03: um grupo já sorteado recusa novas entradas", async ({ invitePage }) => {
    // The draw flow is SRT-03 and is not on main. A closed group cannot be prepared here.
    await expect(invitePage.closedMessage).toBeVisible();
  });
});
