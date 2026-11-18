import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/** Área do participante (/p/<token>): lista (HU03), estado do sorteio (HU04) e Revelar (HU05). */
export class ParticipantAreaPage {
  constructor(private readonly page: Page) {}

  async open(personalUrl: string) {
    await this.page.goto(personalUrl);
    // A 1ª visita compila a rota no dev server e pode passar de 5 s; espera o h1 sair do Suspense.
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
  }

  get waitingDrawMessage(): Locator {
    return this.page.getByText(/o sorteio ainda n.o foi realizado\./i);
  }

  get drawnMessage(): Locator {
    return this.page.getByText(/o sorteio j. foi realizado\./i);
  }

  /** HU03: card da lista e formulário de item (texto provisório até o DSN-04). */
  get wishListTitle(): Locator {
    return this.page.getByRole("heading", { name: /(sua )?lista de desejos/i });
  }

  get addItemButton(): Locator {
    return this.page.getByRole("button", { name: /adicionar (item|presente)/i });
  }

  get itemTitleField(): Locator {
    return this.page.getByLabel(/^t.tulo$/i);
  }

  get itemLinkField(): Locator {
    return this.page.getByLabel(/^link( \(opcional\))?$/i);
  }

  get itemList(): Locator {
    return this.page.getByRole("list").filter({ has: this.page.getByRole("listitem") });
  }

  /** HU05: cartão do resultado. Fechado, mostra o botão; aberto, mostra o par. */
  get resultTitle(): Locator {
    return this.page.getByRole("heading", { name: /meu amigo secreto/i });
  }

  get revealButton(): Locator {
    return this.page.getByRole("button", { name: /^revelar$/i });
  }

  /** Texto visível da página inteira, para afirmar o que (não) vazou. */
  async visibleText(): Promise<string> {
    return (await this.page.locator("body").innerText()).replace(/\s+/g, " ");
  }
}
