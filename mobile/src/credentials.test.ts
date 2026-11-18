import * as SecureStore from "expo-secure-store";
import { credentials } from "./credentials";

jest.mock("expo-secure-store");

const storage = jest.mocked(SecureStore);

beforeEach(() => {
  jest.resetAllMocks();
  storage.isAvailableAsync.mockResolvedValue(true);
});

it("uses SecureStore to save, read and remove the credential", async () => {
  storage.getItemAsync.mockResolvedValue("demo-token");

  await credentials.save("demo-token");
  await expect(credentials.read()).resolves.toBe("demo-token");
  await credentials.clear();

  const key = "papelzinho.credential";
  expect(storage.setItemAsync).toHaveBeenCalledWith(key, "demo-token", expect.any(Object));
  expect(storage.getItemAsync).toHaveBeenCalledWith(key, expect.any(Object));
  expect(storage.deleteItemAsync).toHaveBeenCalledWith(key, expect.any(Object));
});

it("never falls back to unprotected storage", async () => {
  storage.isAvailableAsync.mockResolvedValue(false);

  await expect(credentials.read()).resolves.toBeNull();
  await expect(credentials.save("demo-token")).rejects.toThrow(
    "Secure credential storage is unavailable"
  );
  await credentials.clear();

  expect(storage.getItemAsync).not.toHaveBeenCalled();
  expect(storage.setItemAsync).not.toHaveBeenCalled();
  expect(storage.deleteItemAsync).not.toHaveBeenCalled();
});
