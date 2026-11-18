import type { DomainError, DomainErrorCode } from "../../domain/errors";

const RPC_CODES: readonly DomainErrorCode[] = [
  "IDEMPOTENCY_CONFLICT",
  "INVALID_LINK",
  "GROUP_CLOSED",
  "GROUP_FULL",
  "INVALID_INPUT",
];

/** Maps PostgREST/RPC P0001 message codes to domain errors. */
export function mapRpcError(error: { message?: string }): DomainError {
  const message = error.message?.trim() ?? "";
  for (const code of RPC_CODES) {
    if (message === code || message.includes(code)) return { code };
  }
  if (message.includes("INVALID_NAME")) return { code: "INVALID_INPUT" };
  return { code: "INVALID_INPUT" };
}
