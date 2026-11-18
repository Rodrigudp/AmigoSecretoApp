import * as SecureStore from "expo-secure-store";

const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export const privateStorage = {
  isAvailable: () => SecureStore.isAvailableAsync(),
  read: (key: string) => SecureStore.getItemAsync(key, options),
  write: (key: string, value: string) => SecureStore.setItemAsync(key, value, options),
  remove: (key: string) => SecureStore.deleteItemAsync(key, options),
};
