import { NextRequest, NextResponse } from "next/server";
import { resolveProductLink } from "@/src/application/resolve-product-link";
import { recordAffiliateClick } from "@/src/application/record-affiliate-click";
import {
  buildWishItemRepository,
  buildEventAppendService,
} from "@/src/infrastructure/supabase/deps";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const recentClicks = new Map<string, number>();

function isRedirectEnabled(): boolean {
  return process.env.AFFILIATE_REDIRECT_ENABLED === "true";
}

function isDuplicateClick(itemId: string): boolean {
  const now = Date.now();
  const last = recentClicks.get(itemId);
  if (last && now - last < 60_000) {
    return true;
  }
  recentClicks.set(itemId, now);

  if (recentClicks.size > 1000) {
    for (const [key, timestamp] of recentClicks.entries()) {
      if (now - timestamp >= 60_000) {
        recentClicks.delete(key);
      }
    }
  }

  return false;
}

async function tryRecordClick(itemId: string, isAffiliate: boolean, request: NextRequest) {
  const purpose = request.headers.get("sec-purpose") || request.headers.get("purpose");
  const isPrefetch = purpose?.includes("prefetch");

  if (!isAffiliate || isPrefetch || isDuplicateClick(itemId)) {
    return;
  }

  try {
    const wishItems = buildWishItemRepository();
    const events = buildEventAppendService();
    await recordAffiliateClick({ itemId }, { wishItems, events });
  } catch {
    // Falha de métrica não interrompe redirecionamento
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // Decisão D2: redirect fica desligado por flag no MVP para evitar risco contratual com a Amazon
  if (!isRedirectEnabled()) {
    return new NextResponse("Redirecionamento desabilitado", { status: 404 });
  }

  const { itemId } = await params;

  if (!itemId || !UUID_REGEX.test(itemId)) {
    return new NextResponse("Item não encontrado", { status: 404 });
  }

  try {
    const wishItems = buildWishItemRepository();
    const res = await resolveProductLink({ itemId }, { wishItems });

    if (!res.ok) {
      return new NextResponse("Este link não está mais disponível", { status: 404 });
    }

    const { destinationUrl, isAffiliate } = res.value;
    await tryRecordClick(itemId, isAffiliate, request);

    const headers = new Headers();
    headers.set("Location", destinationUrl);
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Robots-Tag", "noindex, nofollow");

    return new NextResponse(null, {
      status: 302,
      headers,
    });
  } catch {
    return new NextResponse("Erro interno ao processar redirecionamento", { status: 500 });
  }
}
