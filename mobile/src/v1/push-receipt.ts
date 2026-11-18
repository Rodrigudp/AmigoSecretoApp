import { CryptoDigestAlgorithm, digestStringAsync } from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { useDemo } from "./api";

const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const demo = new Map<string, string>();

export const makeReceiptKey = async (credential: string) =>
  `papelzinho.push.${await digestStringAsync(CryptoDigestAlgorithm.SHA256, credential)}`;

export function readReceipt(key: string) {
  return useDemo ? Promise.resolve(demo.get(key) ?? null) : SecureStore.getItemAsync(key, options);
}

export async function saveReceipt(key: string, token: string) {
  if (useDemo) demo.set(key, token);
  else await SecureStore.setItemAsync(key, token, options);
}

export async function clearReceipt(key: string) {
  if (useDemo) demo.delete(key);
  else await SecureStore.deleteItemAsync(key, options);
}
