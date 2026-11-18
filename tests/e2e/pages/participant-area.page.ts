import type { Locator, Page } from "@playwright/test";

/**
 * Área do participante (/p/g/<groupId>), aberta pelo link pessoal.
 * Cobre os blocos de HU03 (lista), HU04 (estado do sorteio) e HU05 (revelar).
 * Não usa seletor por texto de marca nem por CSS: tudo por papel ou rótulo.
 */
export class ParticipantAreaPage {
  constructor(private readonly page: Page) {}

  async open(personalUrl: string) {
    await this.page.goto(personalUrl);
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
