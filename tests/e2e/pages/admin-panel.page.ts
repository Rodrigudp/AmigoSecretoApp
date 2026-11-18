import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/** Painel do organizador (/admin/<token>); rótulos de textos.md, sem texto de marca. */
export class AdminPanelPage {
  constructor(private readonly page: Page) {}

  async open(adminUrl: string) {
    await this.page.goto(adminUrl);
    // A 1ª visita compila a rota no dev server e pode passar de 5 s.
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
  }

  get heading(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  get openBadge(): Locator {
    return this.page.getByText(/entradas abertas/i);
  }

  get drawnBadge(): Locator {
    return this.page.getByText(/sorteio (feito|realizado) em/i);
  }

  participantsTitle(count: number): Locator {
    return this.page.getByRole("heading", {
      name: new RegExp(`participantes \\(${count} de 100\\)`, "i"),
    });
  }

  participantRow(name: string): Locator {
    return this.page.getByRole("listitem").filter({ hasText: name });
  }

  get drawButton(): Locator {
    return this.page.getByRole("button", {
      name: /^(fazer o sorteio|sortear|realizar sorteio)$/i,
    });
  }

  get drawConfirmButton(): Locator {
    return this.page.getByRole("button", { name: /^(sim, sortear|confirmar sorteio|sortear)$/i });
  }

  get drawDoneNotice(): Locator {
    return this.page.getByText(/sorteio (feito|realizado)!?/i);
  }

  get drawDisabledReason(): Locator {
    return this.page.getByText(/pelo menos 3 (pessoas|participantes)/i);
  }

  /** SRT-03: dispara o sorteio e confirma, se houver uma segunda ação. */
  async draw() {
    await this.drawButton.click();
    if (await this.drawConfirmButton.isVisible().catch(() => false)) {
      await this.drawConfirmButton.click();
    }
  }
}
