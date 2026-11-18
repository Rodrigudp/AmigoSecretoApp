import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendS1Alert, sendTestAlert } from "@/src/infrastructure/observability/alerts";

describe("S1 Alerts & Webhook Dispatch (OPS-01)", () => {
  const originalEnv = process.env.ALERT_WEBHOOK_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.ALERT_WEBHOOK_URL;
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

  it("dispatches Discord webhook payload correctly when URL matches Discord", async () => {
    let capturedBody: string | undefined;

    vi.spyOn(global, "fetch").mockImplementationOnce(async (_url, options) => {
      capturedBody = options?.body as string;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const result = await sendS1Alert({
      title: "Erro Crítico em /p/abc123token",
      message: "Falha de conexão com banco de dados",
      webhookUrl: "https://discord.com/api/webhooks/123/xyz",
      isTest: true,
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("discord");
    expect(capturedBody).toBeDefined();

    const parsed = JSON.parse(capturedBody!);
    expect(parsed.content).toContain("[TESTE OPS-01]");
    expect(parsed.embeds[0].title).toBe("Erro Crítico em /p/[REDACTED]");
    expect(parsed.embeds[0].color).toBe(0x34d399); // Verde para teste
  });

  it("dispatches Generic webhook payload when URL is a custom endpoint", async () => {
    let capturedBody: string | undefined;

    vi.spyOn(global, "fetch").mockImplementationOnce(async (_url, options) => {
      capturedBody = options?.body as string;
      return new Response(JSON.stringify({ status: "received" }), { status: 200 });
    });

    const result = await sendS1Alert({
      title: "Alerta Geral",
      message: "Falha no sorteio de pares",
      webhookUrl: "https://alerts.empresa.com/webhook",
      isTest: false,
    });

    expect(result.sent).toBe(true);
    expect(result.provider).toBe("generic");

    const parsed = JSON.parse(capturedBody!);
    expect(parsed.severity).toBe("S1");
    expect(parsed.title).toBe("Alerta Geral");
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
