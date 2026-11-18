import type { Page } from "@playwright/test";

export class InvitePage {
  constructor(private readonly page: Page) {}

  async open(inviteUrl: string) {
    await this.page.goto(inviteUrl);
  }

  get participantName() {
    return this.page.getByLabel(/como você se chama/i);
  }

  get joinButton() {
    return this.page.getByRole("button", { name: /^entrar$/i });
  }

  get closedMessage() {
    return this.page.getByText(/o sorteio já foi realizado\. as entradas estão encerradas\./i);
  }

  get fullMessage() {
    return this.page.getByText(/este grupo já está completo \(100 pessoas\)\./i);
  }

  get invalidLinkMessage() {
    return this.page.getByText(/este link é inválido ou não está mais disponível\./i);
  }

  async join(name: string) {
    await this.participantName.fill(name);
    await this.joinButton.click();
  }
}
