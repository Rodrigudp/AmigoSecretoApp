import * as SecureStore from "expo-secure-store";

const key = "papelzinho.credential";
const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export const credentials = {
  async read(): Promise<string | null> {
    if (!(await SecureStore.isAvailableAsync())) return null;
    return SecureStore.getItemAsync(key, options);
  },
  async save(token: string): Promise<void> {
    if (!(await SecureStore.isAvailableAsync())) {
      throw new Error("Secure credential storage is unavailable");
    }
    await SecureStore.setItemAsync(key, token, options);
  },
  async clear(): Promise<void> {
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync(key, options);
    }
  },
};
