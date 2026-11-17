import { err, ok, type Result } from "../shared/result";
import type { DomainError } from "../domain/errors";
import type {
  Clock,
  GroupRepository,
  TokenService,
} from "./ports";
import {
  createGroupInputSchema,
  type CreateGroupInput,
} from "./schemas/create-group";

export type { CreateGroupInput };

export type CreateGroupOutput = {
  inviteUrl: string;
  adminUrl: string;
};

export type CreateGroupDeps = {
  groups: GroupRepository;
  tokens: TokenService;
  clock: Clock;
  appUrl: string;
};

/**
 * Returns today's date formatted as YYYY-MM-DD in the America/Sao_Paulo timezone.
 */
export function getTodayInSaoPaulo(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Computes group expiration date (exchangeDate + 60 days, RN08) in ISO 8601 UTC.
 */
export function calculateGroupExpiresAt(exchangeDate: string): string {
  const [year, month, day] = exchangeDate.split("-").map(Number);
  const expiryDate = new Date(Date.UTC(year, month - 1, day + 60, 23, 59, 59, 999));
  return expiryDate.toISOString();
}

/**
 * RF01, RF02, HU01: Creates a new secret santa group or handles idempotent retries.
 *
 * 1. Validates input schema (name 1–60, maxValueCents > 0, valid calendar date, location ≤ 120, requestId UUID v4).
 * 2. Checks that exchangeDate is strictly posterior to today in America/Sao_Paulo using the injected clock.
 * 3. Generates capability tokens (invite_token and admin_token) via TokenService.
 * 4. Calculates data expiration (exchangeDate + 60 days, RN08).
 * 5. Delegates persistence and idempotency logic (lock and admin token rotation) to GroupRepository.
 * 6. Returns mounted inviteUrl and adminUrl based on APP_URL.
 */
export async function createGroup(
  input: unknown,
  deps: CreateGroupDeps
): Promise<Result<CreateGroupOutput, DomainError>> {
  const parsed = createGroupInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: "INVALID_INPUT" });
  }

  const todayInSaoPaulo = getTodayInSaoPaulo(deps.clock.now());
  if (parsed.data.exchangeDate <= todayInSaoPaulo) {
    return err({ code: "INVALID_INPUT" });
  }

  const inviteToken = deps.tokens.generate();
  const adminToken = deps.tokens.generate();
  const adminTokenHash = deps.tokens.hash(adminToken);
  const expiresAt = calculateGroupExpiresAt(parsed.data.exchangeDate);

  const created = await deps.groups.createOrRotateAdminToken({
    name: parsed.data.name,
    maxValueCents: parsed.data.maxValueCents,
    exchangeDate: parsed.data.exchangeDate,
    location: parsed.data.location,
    inviteToken,
    adminTokenHash,
    requestId: parsed.data.requestId,
    expiresAt,
  });

  if (!created.ok) {
    return err(created.error);
  }

  const baseUrl = deps.appUrl.replace(/\/+$/, "");
  return ok({
    inviteUrl: `${baseUrl}/g/${created.value.inviteToken}`,
    adminUrl: `${baseUrl}/admin/${adminToken}`,
  });
}
