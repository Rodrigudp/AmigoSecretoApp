import type { DomainErrorCode } from "@/src/domain/errors";
import { apiError } from "./http";

/** Maps any DomainErrorCode to the corresponding API v1 error response. */
export function domainApiError(code: DomainErrorCode, message?: string): Response {
  if (code === "PRODUCT_LINK_UNAVAILABLE" || code === "OWNER_ACCESS_DENIED") {
    return apiError("INTERNAL_ERROR");
  }
  return apiError(code, message);
}
