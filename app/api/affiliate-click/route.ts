import { NextRequest, NextResponse } from "next/server";
import { recordAffiliateClick } from "@/src/application/record-affiliate-click";
import {
  buildWishItemRepository,
  buildEventAppendService,
} from "@/src/infrastructure/supabase/deps";
import {
  extractClientIp,
  getSharedRateLimiter,
} from "@/src/infrastructure/rate-limit";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const recentClicks = new Map<string, number>();

function isDuplicateClick(key: string): boolean {
  const now = Date.now();
  const last = recentClicks.get(key);
  if (last && now - last < 60_000) {
    return true;
  }
  return false;
}

function registerClick(key: string): void {
  const now = Date.now();
  recentClicks.set(key, now);

  if (recentClicks.size > 1000) {
    for (const [k, timestamp] of recentClicks.entries()) {
      if (now - timestamp >= 60_000) {
        recentClicks.delete(k);
      }
    }
  }
}

async function extractItemId(request: NextRequest): Promise<string | null> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    return body?.itemId ?? null;
  }
  const text = await request.text().catch(() => "");
  try {
    const body = JSON.parse(text);
    return body?.itemId ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const itemId = await extractItemId(request);

    if (!itemId || !UUID_REGEX.test(itemId)) {
      return new NextResponse(null, { status: 400 });
    }

    const clientIp = extractClientIp(request.headers);
    const rateLimitRes = getSharedRateLimiter().check("affiliate_click", clientIp);
    if (!rateLimitRes.ok) {
      return new NextResponse(null, { status: 429 });
    }

    const dedupeKey = `${clientIp}:${itemId}`;
    if (isDuplicateClick(dedupeKey)) {
      return new NextResponse(null, { status: 204 });
    }

    const wishItems = buildWishItemRepository();
    const events = buildEventAppendService();

    const result = await recordAffiliateClick({ itemId }, { wishItems, events });
    if (!result.ok) {
      return new NextResponse(null, { status: 404 });
    }

    registerClick(dedupeKey);
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
