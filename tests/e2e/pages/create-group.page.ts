import type { Page } from "@playwright/test";

export class CreateGroupPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/");
  }

  get groupName() {
    return this.page.getByLabel(/nome do grupo/i);
  }

  get maximumValue() {
    return this.page.getByLabel(/valor máximo/i);
  }

  get exchangeDate() {
    return this.page.getByLabel(/data da troca/i);
  }

  get location() {
    return this.page.getByLabel(/local da troca/i);
  }

  get createButton() {
    return this.page.getByRole("button", { name: /criar grupo de amigo secreto/i });
  }

  async fillForm(data: {
    name: string;
    maximumValue: string;
    exchangeDate: string;
    location?: string;
  }) {
    await this.groupName.fill(data.name);
    await this.maximumValue.fill(data.maximumValue);
    await this.exchangeDate.fill(data.exchangeDate);
    if (data.location) {
      await this.location.fill(data.location);
    }
  }

  async submit() {
    await this.createButton.click();
  }
}
