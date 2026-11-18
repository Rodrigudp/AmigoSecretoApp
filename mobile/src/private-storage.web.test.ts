import { privateStorage } from "./private-storage.web";

const priorWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const priorMode = process.env.EXPO_PUBLIC_MOBILE_API;
const priorOrigin = process.env.EXPO_PUBLIC_API_URL;
const records = new Map<string, string>();

beforeEach(() => {
  records.clear();
  process.env.EXPO_PUBLIC_MOBILE_API = "live";
  process.env.EXPO_PUBLIC_API_URL = "http://127.0.0.1:3000";
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { hostname: "localhost" },
      sessionStorage: {
        getItem: (key: string) => records.get(key) ?? null,
        setItem: (key: string, value: string) => records.set(key, value),
        removeItem: (key: string) => records.delete(key),
      },
    },
  });
});

afterEach(() => {
  if (priorWindow) Object.defineProperty(globalThis, "window", priorWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (priorMode === undefined) delete process.env.EXPO_PUBLIC_MOBILE_API;
  else process.env.EXPO_PUBLIC_MOBILE_API = priorMode;
  if (priorOrigin === undefined) delete process.env.EXPO_PUBLIC_API_URL;
  else process.env.EXPO_PUBLIC_API_URL = priorOrigin;
});

it("saves a test credential for this browser session and isolates local API origins", async () => {
  await privateStorage.write("access", "fixture");
  await expect(privateStorage.read("access")).resolves.toBe("fixture");
  process.env.EXPO_PUBLIC_API_URL = "http://127.0.0.1:3100";
  await expect(privateStorage.read("access")).resolves.toBeNull();
  process.env.EXPO_PUBLIC_API_URL = "http://127.0.0.1:3000";
  await privateStorage.remove("access");
  expect(records.size).toBe(0);
});

it("refuses to save any credentials when the target is production", async () => {
  process.env.EXPO_PUBLIC_API_URL = "https://papelzinho.app";
  await expect(privateStorage.write("access", "fixture")).rejects.toThrow("unavailable");
  expect(records.size).toBe(0);
});
