import { privateStorage } from "./private-storage";

export interface GroupAccess {
  groupId: string;
  role: "organizer" | "participant";
}

function credentialKey({ groupId, role }: GroupAccess): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(groupId)) throw new Error("Invalid group identifier");
  return `papelzinho.credential.${role}.${groupId}`;
}

export const credentials = {
  async read(access: GroupAccess): Promise<string | null> {
    if (!(await privateStorage.isAvailable())) return null;
    return privateStorage.read(credentialKey(access));
  },
  async save(access: GroupAccess, token: string): Promise<void> {
    if (!(await privateStorage.isAvailable())) {
      throw new Error("Secure credential storage is unavailable");
    }
    await privateStorage.write(credentialKey(access), token);
  },
  async clear(access: GroupAccess): Promise<void> {
    if (await privateStorage.isAvailable()) {
      await privateStorage.remove(credentialKey(access));
    }
  },
};
