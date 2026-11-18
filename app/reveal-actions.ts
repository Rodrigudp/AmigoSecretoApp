"use server";

import { cookies } from "next/headers";
import { getMyResult } from "@/src/application/get-my-result";
import type { RevealedWishItem } from "@/src/application/ports";
import type { DomainErrorCode } from "@/src/domain/errors";
import { copy } from "./_lib/copy";
import { cookieNameFor } from "./_lib/participant-view-usecase";

export type RevealAuthInput =
  { mode: "cookie"; groupId: string } | { mode: "token"; accessToken: string };

export type RevealResultOutput =
  | { ok: true; drawVersion: number; friendName: string; wishItems: RevealedWishItem[] }
  | { ok: false; code?: DomainErrorCode; message: string };

async function resolveAuthContext(input: RevealAuthInput) {
  if (input.mode === "cookie") {
    const groupId = input.groupId.trim();
    if (!groupId) return null;
    const accessToken = (await cookies()).get(cookieNameFor(groupId))?.value?.trim();
    return accessToken ? { accessToken, expectedGroupId: groupId } : null;
  }
  const accessToken = input.accessToken.trim();
  return accessToken ? { accessToken } : null;
}

export async function revealMyResultAction(input: RevealAuthInput): Promise<RevealResultOutput> {
  try {
    const auth = await resolveAuthContext(input);
    if (!auth) return { ok: false, code: "INVALID_LINK", message: copy.ARE_06.text };
    const { buildGetMyResultDeps } = await import("@/src/infrastructure/supabase/deps");
    const result = await getMyResult(auth, buildGetMyResultDeps());
    if (!result.ok) {
      const message = result.error.code === "INVALID_LINK" ? copy.ARE_06.text : copy.REV_06.error;
      return { ok: false, code: result.error.code, message };
    }
    const { drawVersion, recipientName: friendName, wishItems } = result.value;
    return { ok: true, drawVersion, friendName, wishItems };
  } catch {
    return { ok: false, message: copy.GLB_08 };
  }
}
