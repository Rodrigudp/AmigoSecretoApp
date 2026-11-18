import { localWebApiEnabled } from "./v1/api-origin";

function storage() {
  if (typeof window === "undefined" || process.env.EXPO_PUBLIC_MOBILE_API !== "live") return null;
  if (!localWebApiEnabled(__DEV__, window.location.hostname, process.env.EXPO_PUBLIC_API_URL))
    return null;
  return window.sessionStorage;
}

const scopedKey = (key: string) => `papelzinho.dev:${process.env.EXPO_PUBLIC_API_URL}:${key}`;

export const privateStorage = {
  isAvailable: async () => storage() !== null,
  read: async (key: string) => storage()?.getItem(scopedKey(key)) ?? null,
  async write(key: string, value: string) {
    const session = storage();
    if (!session) throw new Error("Local web credential storage is unavailable");
    session.setItem(scopedKey(key), value);
  },
  async remove(key: string) {
    storage()?.removeItem(scopedKey(key));
  },
};
