import { test as base, expect } from "@playwright/test";
import { CreateGroupPage } from "../pages/create-group.page";
import { GroupSuccessPage } from "../pages/group-success.page";
import { InvitePage } from "../pages/invite.page";
import { PersonalLinkPage } from "../pages/personal-link.page";

export const MOBILE = { width: 360, height: 800 };

export type CreatedParticipant = { name: string; personalUrl: string };

export type CreatedGroup = {
  name: string;
  inviteUrl: string;
  adminUrl: string;
  participants: CreatedParticipant[];
};

export type GroupFactory = {
  /** Cria um grupo de verdade (Supabase local do CI) e inscreve os nomes dados. */
  create: (names: string[]) => Promise<CreatedGroup>;
};

type Fixtures = { groupFactory: GroupFactory };

export const test = base.extend<Fixtures>({
  groupFactory: async ({ browser }, provide) => {
    const create: GroupFactory["create"] = async (names) => {
      const groupName = `Grupo QA ${crypto.randomUUID().slice(0, 8)}`;
      const group = {
        name: groupName,
        maximumValue: "50,00",
        exchangeDate: "2099-12-24",
        location: "Local de teste",
      };

      const organizer = await browser.newContext({ viewport: MOBILE });
      const organizerPage = await organizer.newPage();
      const createPage = new CreateGroupPage(organizerPage);
      const successPage = new GroupSuccessPage(organizerPage);
      await createPage.open();
      await createPage.fillForm(group);
      await createPage.submit();
      await expect(successPage.inviteLink).toBeVisible();
      const inviteUrl = await successPage.inviteLink.inputValue();
      const adminUrl = await successPage.adminLink.inputValue();
      await organizer.close();

      const participants: CreatedParticipant[] = [];
      for (const name of names) {
        const context = await browser.newContext({ viewport: MOBILE });
        const page = await context.newPage();
        const invite = new InvitePage(page);
        const personal = new PersonalLinkPage(page);
        await invite.open(inviteUrl);
        await invite.join(name);
        await expect(personal.personalLink).toBeVisible();
        participants.push({ name, personalUrl: await personal.personalLink.inputValue() });
        await context.close();
      }

      return { name: groupName, inviteUrl, adminUrl, participants };
    };

    await provide({ create });
  },
});

export { expect } from "@playwright/test";
