import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sendS1Alert,
  sendTestAlert,
  formatTelegramPayload,
  clearDebounceCacheForTesting,
} from "@/src/infrastructure/observability/alerts";

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: DiscordEmbedField[];
}

interface DiscordWebhookPayload {
  content: string;
  embeds: DiscordEmbed[];
}

describe("S1 Alerts & Webhook Dispatch (OPS-01)", () => {
  const originalEnv = process.env.ALERT_WEBHOOK_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.ALERT_WEBHOOK_URL;
    clearDebounceCacheForTesting();
  });

  afterEach(() => {
    process.env.ALERT_WEBHOOK_URL = originalEnv;
  });

  it("returns sent=false gracefully when ALERT_WEBHOOK_URL is not configured", async () => {
    const result = await sendS1Alert({
      title: "Falha de teste",
      message: "Mensagem de erro",
    });

    expect(result.sent).toBe(false);
    expect(result.reason).toBe("ALERT_WEBHOOK_URL_NOT_CONFIGURED");
    expect(result.provider).toBe("none");
  });

  it("dispatches Discord webhook payload correctly with redaction and color", async () => {
    let capturedBody: string | undefined;
    let capturedSignal: AbortSignal | null | undefined;

    vi.spyOn(global, "fetch").mockImplementationOnce(async (_url, options) => {
      capturedBody = options?.body as string;
      capturedSignal = options?.signal;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const result = await sendS1Alert({
      title: "Erro Crítico em /api/p/hs/secret_token_123",
      message: "Falha ao consultar /p/secret_raw_token",
      context: {
        user: "Carlos",
        accessToken: "secret-token-to-mask",
        ip: "10.0.0.1",
        debugTag: "safe-tag",
      },
      webhookUrl: "https://discord.com/api/webhooks/123/xyz",
      isTest: true,
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("discord");
    expect(capturedSignal).toBeDefined();

    const parsed = JSON.parse(capturedBody!) as DiscordWebhookPayload;
    expect(parsed.content).toContain("[TESTE OPS-01]");
    expect(parsed.embeds[0].title).toBe("Erro Crítico em /api/p/hs/[REDACTED]");
    expect(parsed.embeds[0].description).toBe("Falha ao consultar /p/[REDACTED]");
    expect(parsed.embeds[0].color).toBe(0x34d399);

    const contextField = parsed.embeds[0].fields.find((f) => f.name === "Contexto");
    expect(contextField).toBeDefined();
    expect(contextField?.value).toContain('"[REDACTED]"');
    expect(contextField?.value).not.toContain("Carlos");
    expect(contextField?.value).not.toContain("secret-token-to-mask");
    expect(contextField?.value).toContain("safe-tag");
  });

  it("formats Telegram payload safely with HTML escaping to prevent parse errors", () => {
    const payload = formatTelegramPayload(
      "Erro <Crítico> & [Importante] _teste_",
      "Falha em /p/hs/token_123 *não* resolvido!",
      "production",
      "2026-11-18T14:00:00Z"
    );

    expect(payload.parse_mode).toBe("HTML");
    expect(payload.text).toContain("&lt;Crítico&gt;");
    expect(payload.text).toContain("&amp;");
    expect(payload.text).toContain("🚨 <b>");
  });

  it("dispatches Telegram webhook payload correctly", async () => {
    let capturedBody: string | undefined;

    vi.spyOn(global, "fetch").mockImplementationOnce(async (_url, options) => {
      capturedBody = options?.body as string;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const result = await sendS1Alert({
      title: "Falha no Telegram",
      message: "Mensagem <de teste>",
      webhookUrl: "https://api.telegram.org/bot12345/sendMessage",
      isTest: false,
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("telegram");

    const parsed = JSON.parse(capturedBody!);
    expect(parsed.parse_mode).toBe("HTML");
    expect(parsed.text).toContain("&lt;de teste&gt;");
  });

  it("dispatches Slack webhook payload correctly", async () => {
    let capturedBody: string | undefined;

    vi.spyOn(global, "fetch").mockImplementationOnce(async (_url, options) => {
      capturedBody = options?.body as string;
      return new Response(null, { status: 200 });
    });

    const result = await sendS1Alert({
      title: "Alerta Slack",
      message: "Aviso de indisponibilidade",
      webhookUrl: "https://hooks.slack.com/services/T00/B00/X00",
      isTest: false,
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("slack");

    const parsed = JSON.parse(capturedBody!);
    expect(parsed.text).toContain("🚨 [S1 CRÍTICO] Alerta Slack");
  });

  it("throttles repeated non-test alerts within 5-minute debounce window", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const first = await sendS1Alert({
      title: "Erro Repetido",
      message: "Falha intermitente",
      webhookUrl: "https://discord.com/api/webhooks/123/xyz",
      isTest: false,
    });
    expect(first.sent).toBe(true);

    // Segundo envio imediato deve ser throttled
    const second = await sendS1Alert({
      title: "Erro Repetido",
      message: "Falha intermitente",
      webhookUrl: "https://discord.com/api/webhooks/123/xyz",
      isTest: false,
    });
    expect(second.sent).toBe(false);
    expect(second.reason).toBe("ALERT_THROTTLED_RECENTLY");
  });

  it("dispatches test alert via sendTestAlert() successfully", async () => {
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => {
      return new Response(null, { status: 204 });
    });

    const result = await sendTestAlert("https://discord.com/api/webhooks/999/test");
    expect(result.sent).toBe(true);
    expect(result.statusCode).toBe(204);
  });
});
