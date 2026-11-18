import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type { AdminGroup, GroupRepository, TokenService } from "./ports";
import {
  getAdminViewInputSchema,
  type GetAdminViewInput,
} from "./schemas/admin";

export type { GetAdminViewInput };

export type GetAdminViewDeps = {
  groups: GroupRepository;
  tokens: TokenService;
  appUrl?: string;
};

/**
 * RF06: Admin views group management panel via capability token (ADR-002, GRP-05).
 *
 * 1. Validates input schema (non-empty admin token).
 * 2. Hashes the admin token with SHA-256 (SEC-01).
 * 3. Resolves the admin scope. Invalid, unknown or expired token returns INVALID_LINK
 *    without leaking group existence (ADR-002, RNF03).
 * 4. Retrieves the admin view with active participants and draw state.
 * 5. Returns AdminGroup with inviteUrl normalized against appUrl if needed.
 */
export async function getAdminView(
  input: unknown,
  deps: GetAdminViewDeps
): Promise<Result<AdminGroup, DomainError>> {
  const parsed = getAdminViewInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const adminTokenHash = deps.tokens.hash(parsed.data.adminToken);
  const adminScope = await deps.groups.findAdminByHash(adminTokenHash);
  if (!adminScope) {
    return err({ code: "INVALID_LINK" });
  }

  const result = await deps.groups.getAdminView(adminScope);
  if (!result.ok) {
    return err(result.error);
  }

  let inviteUrl = result.value.inviteUrl;
  if (deps.appUrl && !inviteUrl.startsWith("http://") && !inviteUrl.startsWith("https://")) {
    const baseUrl = deps.appUrl.replace(/\/+$/, "");
    inviteUrl = `${baseUrl}${inviteUrl.startsWith("/") ? "" : "/"}${inviteUrl}`;
  }

  return ok({
    ...result.value,
    inviteUrl,
  });
}
