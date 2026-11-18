import { NextResponse, type NextRequest } from "next/server";

import { cookieNameFor, resolveParticipantByToken } from "@/app/_lib/participant-view-usecase";

const NEUTRAL_ERROR_HTML =
  '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Link inválido</title><body style="font-family: system-ui; padding: 2rem; font-size: 1.0625rem;"><p>Este link é inválido ou não está mais disponível.</p></body></html>';

function neutralError(): NextResponse {
  return new NextResponse(NEUTRAL_ERROR_HTML, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "referrer-policy": "no-referrer",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "private, no-store",
    },
  });
}

function probeResponse(target: URL): NextResponse {
  return new NextResponse(null, {
    status: 302,
    headers: {
      location: target.toString(),
      "referrer-policy": "no-referrer",
      "cache-control": "private, no-store",
    },
  });
}

/**
 * ADR-004 step 3: the probe route handler. GET /api/p/hs/<accessToken> sets the
 * per-group cookie `ptk_<groupId>` (HttpOnly, Secure, SameSite=Lax,
 * Expires=groups.expires_at) and redirects back to /p/<accessToken>?ck=1.
 * Pages cannot set cookies, so this step lives in a route handler. The static
 * headers in next.config only cover /p/:path*, so this handler sets its own.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const resolved = await resolveParticipantByToken(token);
  if (!resolved.ok) {
    return neutralError();
  }

  const backUrl = new URL(`/p/${token}?ck=1`, _request.url);
  const response = probeResponse(backUrl);
  response.cookies.set({
    name: cookieNameFor(resolved.value.groupId),
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(resolved.value.expiresAt),
  });
  return response;
}
