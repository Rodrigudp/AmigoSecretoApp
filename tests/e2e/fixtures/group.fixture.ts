import { test as base } from "@playwright/test";
import { CreateGroupPage } from "../pages/create-group.page";
import { GroupSuccessPage } from "../pages/group-success.page";
import { InvitePage } from "../pages/invite.page";
import { PersonalLinkPage } from "../pages/personal-link.page";

type Fixtures = {
  createGroupPage: CreateGroupPage;
  groupSuccessPage: GroupSuccessPage;
  invitePage: InvitePage;
  personalLinkPage: PersonalLinkPage;
};

export const syntheticGroup = {
  name: "Grupo de teste",
  maximumValue: "50,00",
  exchangeDate: "2099-12-24",
  location: "Local de teste",
};

export const syntheticParticipants = { first: "Ana", duplicate: "Ana", expectedDuplicate: "Ana 2" };

export const test = base.extend<Fixtures>({
  createGroupPage: async ({ page }, provide) => {
    await provide(new CreateGroupPage(page));
  },
  groupSuccessPage: async ({ page }, provide) => {
    await provide(new GroupSuccessPage(page));
  },
  invitePage: async ({ page }, provide) => {
    await provide(new InvitePage(page));
  },
  personalLinkPage: async ({ page }, provide) => {
    await provide(new PersonalLinkPage(page));
  },
});
export { expect } from "@playwright/test";
