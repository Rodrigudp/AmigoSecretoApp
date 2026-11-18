import type { Page } from "@playwright/test";

export class GroupSuccessPage {
  constructor(private readonly page: Page) {}

  get inviteLink() {
    return this.page.getByLabel(/link do convite/i);
  }

  get adminLink() {
    return this.page.getByLabel(/link de (organizador|administrador)/i);
  }

  get shareOnWhatsApp() {
    return this.page.getByRole("link", { name: /compartilhar no whatsapp/i });
  }

  get joinAsParticipant() {
    return this.page.getByRole("link", { name: /entrar no grupo como participante/i });
  }

  get saveAdminOnWhatsApp() {
    return this.page.getByRole("link", { name: /salvar no meu whatsapp/i });
  }

  get goToAdmin() {
    return this.page.getByRole("link", { name: /ir para o painel do organizador/i });
  }
}
