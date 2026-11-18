import * as SecureStore from "expo-secure-store";
import { credentials, type GroupAccess } from "./credentials";

jest.mock("expo-secure-store");

const storage = jest.mocked(SecureStore);
const participant: GroupAccess = { groupId: "group-1", role: "participant" };
const organizer: GroupAccess = { ...participant, role: "organizer" };
const otherGroup: GroupAccess = { ...participant, groupId: "group-2" };

beforeEach(() => {
  jest.resetAllMocks();
  storage.isAvailableAsync.mockResolvedValue(true);
});

it("stores each group and role separately in SecureStore", async () => {
  const records = new Map<string, string>();
  storage.setItemAsync.mockImplementation(async (key, token) => {
    records.set(key, token);
  });
  storage.getItemAsync.mockImplementation(async (key) => records.get(key) ?? null);
  storage.deleteItemAsync.mockImplementation(async (key) => {
    records.delete(key);
  });

  await credentials.save(participant, "demo-personal");
  await credentials.save(organizer, "demo-organizer");
  await credentials.save(otherGroup, "demo-other");
  await expect(credentials.read(participant)).resolves.toBe("demo-personal");
  await credentials.clear(participant);

  await expect(credentials.read(participant)).resolves.toBeNull();
  await expect(credentials.read(organizer)).resolves.toBe("demo-organizer");
  await expect(credentials.read(otherGroup)).resolves.toBe("demo-other");
});

it("never falls back to unprotected storage", async () => {
  storage.isAvailableAsync.mockResolvedValue(false);

  await expect(credentials.read(participant)).resolves.toBeNull();
  await expect(credentials.save(participant, "demo-token")).rejects.toThrow(
    "Secure credential storage is unavailable"
  );
  await credentials.clear(participant);

  expect(storage.getItemAsync).not.toHaveBeenCalled();
  expect(storage.setItemAsync).not.toHaveBeenCalled();
  expect(storage.deleteItemAsync).not.toHaveBeenCalled();
});
