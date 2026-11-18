import { NextRequest, NextResponse } from "next/server";
import { recordAffiliateClick } from "@/src/application/record-affiliate-click";
import {
  buildWishItemRepository,
  buildEventAppendService,
} from "@/src/infrastructure/supabase/deps";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    let itemId: string | null = null;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      itemId = body?.itemId;
    } else {
      const text = await request.text();
      try {
        const body = JSON.parse(text);
        itemId = body?.itemId;
      } catch {
        // Beacon pode enviar texto simples ou form-data
      }
    }

    if (!itemId || !UUID_REGEX.test(itemId)) {
      return new NextResponse(null, { status: 400 });
    }

    const wishItems = buildWishItemRepository();
    const events = buildEventAppendService();

    await recordAffiliateClick({ itemId }, { wishItems, events });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
