import { randomBytes } from "node:crypto";
import { ok } from "@/src/shared/result";
import type { Result } from "@/src/shared/result";
import type { DomainError } from "@/src/domain/errors";
import type { CreateGroupData } from "./create-group-schema";

export type CreateGroupOutput = { inviteUrl: string; adminUrl: string };

// TODO(GRP-02): replace the body with the real `create-group` use case (one-line swap).
// Stub typed by CONTRATOS.md: it persists nothing and the links it returns do not work.
export async function createGroupUseCase(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _input: CreateGroupData
): Promise<Result<CreateGroupOutput, DomainError>> {
  const origin = process.env.APP_URL ?? "https://amigo-secreto-app.vercel.app";
  const token = () => randomBytes(32).toString("base64url");
  return ok({ inviteUrl: `${origin}/g/${token()}`, adminUrl: `${origin}/admin/${token()}` });
}
