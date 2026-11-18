import "server-only";
import { copy } from "@/app/_lib/copy";
import { TOKEN_HTTP_HEADERS } from "@/app/_lib/token-page-meta";
import { logger } from "@/src/infrastructure/observability/logger";
import { extractClientIp, getSharedRateLimiter } from "@/src/infrastructure/rate-limit";

const errors = {
  INVALID_INPUT: [400, copy.HOM_16],
  INVALID_LINK: [401, copy.CNV_10.text],
  METHOD_NOT_ALLOWED: [405, "Método não permitido."],
  NOT_FOUND: [404, "Rota não encontrada."],
  PARTICIPANT_NOT_FOUND: [404, copy.ADM_11],
  WISH_ITEM_NOT_FOUND: [404, copy.WSH_23.notFound],
  IDEMPOTENCY_CONFLICT: [409, copy.HOM_15],
  GROUP_CLOSED: [409, copy.CNV_11],
  GROUP_FULL: [409, copy.CNV_12],
  WISH_LIST_FULL: [409, copy.WSH_06],
  NOT_ENOUGH_PARTICIPANTS: [409, copy.DRW_03],
  DRAW_NOT_READY: [409, copy.ARE_02],
  DRAW_MEMBERS_CHANGED: [409, copy.DRW_08.text],
  RATE_LIMITED: [429, copy.GLB_09],
  INTERNAL_ERROR: [500, copy.GLB_08],
} as const;

type ApiErrorCode = keyof typeof errors;
type CredentialKind = "none" | "inviteToken" | "accessToken" | "adminToken" | "credentialToken";
type Credential<K extends CredentialKind> = K extends "none" ? undefined : Record<K, string>;
type RouteOptions<K extends CredentialKind> = {
  auth: K;
  operation: string;
  policy?: "create_group" | "join_group" | "run_draw" | "api_v1_write";
};

const sensitiveQueryNames = new Set([
  "token",
  "accesstoken",
  "admintoken",
  "invitetoken",
  "expopushtoken",
  "key",
  "secret",
  "auth",
]);
const tokenFormat = /^[A-Za-z0-9_-]{43}$/;
const expoTokenFormat = /^Expo(?:nent)?PushToken\[/;

export function apiJson(body: unknown, status = 200): Response {
  const headers = new Headers(
    Object.fromEntries(TOKEN_HTTP_HEADERS.map(({ key, value }) => [key, value]))
  );
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(body, { status, headers });
}

export function apiError(code: ApiErrorCode, message?: string): Response {
  const [status, defaultMessage] = errors[code];
  return apiJson({ error: { code, message: message ?? defaultMessage } }, status);
}

function hasForbiddenUrlCredential(url: URL): boolean {
  if (url.username || url.password) return true;
  const parts = url.pathname.split("/").map(decodeURIComponent);
  if (parts.some(isCredentialValue)) return true;
  for (const [name, value] of url.searchParams) {
    if (
      sensitiveQueryNames.has(name.toLowerCase().replace(/[-_]/g, "")) ||
      isCredentialValue(value)
    ) {
      return true;
    }
  }
  return false;
}

function isCredentialValue(value: string): boolean {
  return tokenFormat.test(value) || expoTokenFormat.test(value);
}

export function capabilityToken(value: string | null): string | undefined {
  return value && tokenFormat.test(value) ? value : undefined;
}

function bearerToken(headers: Headers): string | undefined {
  const raw = /^Bearer +([A-Za-z0-9_-]{43})$/i.exec(headers.get("authorization") ?? "");
  return raw?.[1];
}

function invalidLink(auth: CredentialKind): Response {
  return apiError("INVALID_LINK", auth === "adminToken" ? copy.ADM_16.text : undefined);
}

/** The named field selects the use case credential. Its repository must validate that role. */
export function apiRoute<K extends CredentialKind, Args extends unknown[]>(
  options: RouteOptions<K>,
  handler: (
    request: Request,
    credential: Credential<K>,
    ...args: Args
  ) => Response | Promise<Response>
): (request: Request, ...args: Args) => Promise<Response> {
  return async (request, ...args) => {
    try {
      const rejected = checkRequest(request, options.policy);
      if (rejected) return rejected;
      if (options.auth === "none")
        return await handler(request, undefined as Credential<K>, ...args);

      const token = bearerToken(request.headers);
      if (!token) return invalidLink(options.auth);
      return await handler(request, { [options.auth]: token } as Credential<K>, ...args);
    } catch {
      logger.error("API v1 operation failed", { operation: options.operation });
      return apiError("INTERNAL_ERROR");
    }
  };
}

function checkRequest(
  request: Request,
  policy?: RouteOptions<CredentialKind>["policy"]
): Response | undefined {
  const limiter = getSharedRateLimiter();
  const ip = extractClientIp(request.headers);
  if (!limiter.check("api_v1", ip).ok) return apiError("RATE_LIMITED");
  if (request.method === "OPTIONS") return apiError("METHOD_NOT_ALLOWED");

  try {
    if (hasForbiddenUrlCredential(new URL(request.url))) return apiError("INVALID_INPUT");
  } catch {
    return apiError("INVALID_INPUT");
  }

  if (policy && !limiter.check(policy, ip).ok) return apiError("RATE_LIMITED");
}

export const apiOptions = apiRoute({ auth: "none", operation: "options" }, () =>
  apiError("METHOD_NOT_ALLOWED")
);
