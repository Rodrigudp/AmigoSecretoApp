import "server-only";
import { cookies } from "next/headers";

export function personalCookieName(groupId: string): string {
  return `ptk_${groupId}`;
}

export async function readPersonalCookie(groupId: string): Promise<string | undefined> {
  const store = await cookies();
  return store.get(personalCookieName(groupId))?.value;
}

/**
 * Sets `ptk_<groupId>` as HttpOnly / Secure / SameSite=Lax / Path=/
 * with Expires = groups.expires_at (PAR-01, ADR-004).
 * Secure is skipped on plain http so local smoke still works.
 */
export async function setPersonalCookie(input: {
  groupId: string;
  accessToken: string;
  expiresAt: string;
}): Promise<void> {
  const store = await cookies();
  const secure = !(process.env.APP_URL ?? "").startsWith("http://");
  store.set(personalCookieName(input.groupId), input.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: new Date(input.expiresAt),
  });
}
