import type { Page } from "@playwright/test";

export class PersonalLinkPage {
  constructor(private readonly page: Page) {}

  get personalLink() {
    return this.page.getByLabel(/link pessoal/i);
  }

  get copyButton() {
    return this.page.getByRole("button", { name: /copiar/i });
  }

  get saveOnWhatsApp() {
    return this.page.getByRole("link", { name: /salvar no whatsapp/i });
  }
}
