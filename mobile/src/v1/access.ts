import * as SecureStore from "expo-secure-store";
import { credentials, type GroupAccess } from "../credentials";
import { api, useDemo } from "./api";
import type { Role, Summary } from "./contract";

const indexKey = "papelzinho.groups";
const secureOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const preview = new Map<string, { access: GroupAccess; token: string }>();
let writes = Promise.resolve();

const key = (value: GroupAccess) => `${value.role}:${value.groupId}`;

export async function listAccess(): Promise<GroupAccess[]> {
  if (useDemo) return [...preview.values()].map(({ access }) => access);
  if (!(await SecureStore.isAvailableAsync())) return [];
  const data: unknown = JSON.parse((await SecureStore.getItemAsync(indexKey, secureOptions)) ?? "[]");
  return Array.isArray(data) ? data.filter(isGroupAccess) : [];
}

function isGroupAccess(value: unknown): value is GroupAccess {
  if (typeof value !== "object" || value === null) return false;
  const { groupId, role } = value as Partial<GroupAccess>;
  return typeof groupId === "string" && /^[a-zA-Z0-9_-]+$/.test(groupId) &&
    (role === "participant" || role === "organizer");
}

export function readAccess(access: GroupAccess): Promise<string | null> {
  return useDemo ? Promise.resolve(preview.get(key(access))?.token ?? null) : credentials.read(access);
}

export function saveAccess(summary: Pick<Summary, "groupId" | "role">, token: string): Promise<void> {
  const access = { groupId: summary.groupId, role: summary.role };
  if (!isGroupAccess(access)) return Promise.reject(new Error("Acesso inválido."));
  if (useDemo) {
    preview.set(key(access), { access, token });
    return Promise.resolve();
  }

  const write = writes.then(async () => {
    const existing = await listAccess();
    if (!existing.some((item) => key(item) === key(access))) {
      await SecureStore.setItemAsync(indexKey, JSON.stringify([...existing, access]), secureOptions);
    }
    await credentials.save(access, token);
  });
  writes = write.catch(() => {});
  return write;
}

export async function acceptAccess(role: Role, token: string): Promise<Summary> {
  const summary = await api.summary(token);
  if (summary.role !== role) throw new Error("Este link não está disponível.");
  await saveAccess(summary, token);
  return summary;
}
