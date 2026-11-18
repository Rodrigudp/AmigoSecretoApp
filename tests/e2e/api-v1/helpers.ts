import { randomUUID } from "node:crypto";
import { test as base, expect, type APIRequestContext, type APIResponse } from "@playwright/test";

export const SECURITY_HEADERS = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow",
  "x-content-type-options": "nosniff",
} as const;

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export type Seed = {
  inviteToken: string;
  adminToken: string;
  participants: { name: string; accessToken: string }[];
};

/** Cria grupo e participantes pela própria API v1, com nomes sintéticos. */
export async function seedGroup(request: APIRequestContext, names: string[]): Promise<Seed> {
  const created = await request.post("/api/v1/groups", {
    data: {
      name: "Grupo QA contrato",
      maxValueCents: 5000,
      exchangeDate: "2099-12-24",
      location: null,
      requestId: randomUUID(),
    },
  });
  expect(created.status()).toBe(201);
  const { inviteToken, adminToken } = await created.json();
  const participants: Seed["participants"] = [];
  for (const name of names) {
    const joined = await request.post("/api/v1/invite/join", {
      headers: bearer(inviteToken),
      data: { displayName: name },
    });
    expect(joined.status()).toBe(201);
    participants.push({ name, accessToken: (await joined.json()).accessToken as string });
  }
  return { inviteToken, adminToken, participants };
}

/** Verifica o envelope único `{ error: { code, message } }` do contrato (API-V1.md §2). */
export async function expectError(res: APIResponse, status: number, code: string) {
  expect(res.status()).toBe(status);
  const body = await res.json();
  expect(Object.keys(body)).toEqual(["error"]);
  expect(body.error.code).toBe(code);
  expect(typeof body.error.message).toBe("string");
}

/** IP de teste exclusivo para não consumir o limite dos outros testes. */
export const uniqueIp = () => `qa-${randomUUID()}`;

/**
 * Cada teste usa um IP próprio (`x-forwarded-for`): o limite `api_v1` é de 120 req por IP em 10 min
 * e a suíte inteira passaria disso se todos compartilhassem o IP do runner.
 */
export const test = base.extend({
  request: async ({ playwright, baseURL }, provide) => {
    const context = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "x-forwarded-for": uniqueIp() },
    });
    await provide(context);
    await context.dispose();
  },
});

/** Token com o formato válido (43 caracteres) que não pertence a nenhum grupo. */
export const unknownToken = () => randomUUID().replaceAll("-", "").padEnd(43, "x");
