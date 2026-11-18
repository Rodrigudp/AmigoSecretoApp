import * as SecureStore from "expo-secure-store";

export interface GroupAccess {
  groupId: string;
  role: "organizer" | "participant";
}

const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

function credentialKey({ groupId, role }: GroupAccess): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(groupId)) throw new Error("Invalid group identifier");
  return `papelzinho.credential.${role}.${groupId}`;
}

export const credentials = {
  async read(access: GroupAccess): Promise<string | null> {
    if (!(await SecureStore.isAvailableAsync())) return null;
    return SecureStore.getItemAsync(credentialKey(access), options);
  },
  async save(access: GroupAccess, token: string): Promise<void> {
    if (!(await SecureStore.isAvailableAsync())) {
      throw new Error("Secure credential storage is unavailable");
    }
    await SecureStore.setItemAsync(credentialKey(access), token, options);
  },
  async clear(access: GroupAccess): Promise<void> {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync(credentialKey(access), options);
    }
  },
};
