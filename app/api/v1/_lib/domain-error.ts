import type { DomainError, DomainErrorCode } from "@/src/domain/errors";
import type { Result } from "@/src/shared/result";
import { apiError, apiJson } from "./http";

/** Maps any DomainErrorCode to the corresponding API v1 error response. */
export function domainApiError(code: DomainErrorCode, message?: string): Response {
  if (code === "PRODUCT_LINK_UNAVAILABLE" || code === "OWNER_ACCESS_DENIED") {
    return apiError("INTERNAL_ERROR");
  }
  return apiError(code, message);
}

export function fromResult<T>(result: Result<T, DomainError>, status = 200): Response {
  return result.ok ? apiJson(result.value, status) : domainApiError(result.error.code);
}
