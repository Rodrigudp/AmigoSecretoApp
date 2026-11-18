import { NextRequest, NextResponse } from "next/server";
import { sendTestAlert } from "@/src/infrastructure/observability/alerts";

export async function POST(request: NextRequest) {
  // Verificação de autenticação para evitar abuso do endpoint
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (process.env.NODE_ENV === "production" && (!expectedKey || token !== expectedKey)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let customWebhookUrl: string | undefined;
  try {
    const body = await request.json();
    if (typeof body.webhookUrl === "string") {
      customWebhookUrl = body.webhookUrl;
    }
  } catch {
    // Corpo vazio ou inválido é aceito (usa process.env.ALERT_WEBHOOK_URL)
  }

  const result = await sendTestAlert(customWebhookUrl);

  return NextResponse.json(
    {
      success: result.sent,
      result,
    },
    {
      status: result.sent ? 200 : 502,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
