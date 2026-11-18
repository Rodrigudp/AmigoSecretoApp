// Sistema de Alertas S1 e Notificações (OPS-01 / MANUTENCAO.md §2)
import { maskSensitiveUrl, sanitizeContext } from "./redact";

export interface S1AlertParams {
  title: string;
  message: string;
  error?: Error | unknown;
  context?: Record<string, unknown>;
  webhookUrl?: string;
  isTest?: boolean;
}

export interface AlertResult {
  sent: boolean;
  reason?: string;
  statusCode?: number;
  provider?: "discord" | "slack" | "telegram" | "generic" | "none";
}

// Cache em memória para debounce de alertas repetidos (janela de 5 minutos)
const recentAlerts = new Map<string, number>();
const DEBOUNCE_WINDOW_MS = 5 * 60 * 1000;

export function clearDebounceCacheForTesting(): void {
  recentAlerts.clear();
}

function pruneAndCheckThrottle(alertKey: string, now: number, isTest?: boolean): boolean {
  for (const [key, timestamp] of recentAlerts.entries()) {
    if (now - timestamp > DEBOUNCE_WINDOW_MS) {
      recentAlerts.delete(key);
    }
  }

  if (isTest) {
    return false;
  }

  const lastSent = recentAlerts.get(alertKey);
  return Boolean(lastSent && now - lastSent < DEBOUNCE_WINDOW_MS);
}

async function dispatchPayload(
  url: string,
  payload: Record<string, unknown>,
  provider: "discord" | "slack" | "telegram" | "generic"
): Promise<AlertResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return { sent: true, statusCode: response.status, provider };
    }

    return {
      sent: false,
      statusCode: response.status,
      reason: `HTTP_ERROR_${response.status}`,
      provider,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { sent: false, reason: errorMsg, provider };
  }
}

export async function sendS1Alert(params: S1AlertParams): Promise<AlertResult> {
  const url = params.webhookUrl || process.env.ALERT_WEBHOOK_URL;
  if (!url) {
    return { sent: false, reason: "ALERT_WEBHOOK_URL_NOT_CONFIGURED", provider: "none" };
  }

  const alertKey = `${params.title}:${params.message}`;
  const now = Date.now();

  if (pruneAndCheckThrottle(alertKey, now, params.isTest)) {
    return { sent: false, reason: "ALERT_THROTTLED_RECENTLY", provider: "none" };
  }

  const provider = detectProvider(url);
  const payload = buildAlertPayload(params, provider);
  const result = await dispatchPayload(url, payload, provider);

  if (result.sent && !params.isTest) {
    recentAlerts.set(alertKey, now);
  }

  return result;
}

export async function sendTestAlert(webhookUrl?: string): Promise<AlertResult> {
  return sendS1Alert({
    title: "[TESTE OPS-01] Verificação do Sistema de Alertas Papelzinho",
    message: "Este é um disparo de teste do sistema de alertas S1. Nenhuma ação corretiva é necessária.",
    context: {
      app: "papelzinho",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      checkedEndpoint: "https://papelzinho.app/api/health",
    },
    webhookUrl,
    isTest: true,
  });
}

function detectProvider(url: string): "discord" | "slack" | "telegram" | "generic" {
  if (url.includes("discord.com/api/webhooks")) {
    return "discord";
  }
  if (url.includes("hooks.slack.com")) {
    return "slack";
  }
  if (url.includes("api.telegram.org")) {
    return "telegram";
  }
  return "generic";
}

function buildAlertPayload(
  params: S1AlertParams,
  provider: "discord" | "slack" | "telegram" | "generic"
): Record<string, unknown> {
  const sanitizedTitle = maskSensitiveUrl(params.title);
  const sanitizedMessage = maskSensitiveUrl(params.message);
  const sanitizedContext = params.context ? sanitizeContext(params.context) : undefined;
  const envName = process.env.NODE_ENV || "production";
  const now = new Date().toISOString();

  if (provider === "discord") {
    return formatDiscordPayload(sanitizedTitle, sanitizedMessage, envName, now, params.isTest, sanitizedContext);
  }
  if (provider === "slack") {
    return formatSlackPayload(sanitizedTitle, sanitizedMessage, envName, now, params.isTest);
  }
  if (provider === "telegram") {
    return formatTelegramPayload(sanitizedTitle, sanitizedMessage, envName, now);
  }

  return {
    event: "s1_alert",
    severity: params.isTest ? "TEST" : "S1",
    title: sanitizedTitle,
    message: sanitizedMessage,
    environment: envName,
    timestamp: now,
    context: sanitizedContext,
  };
}

function formatDiscordPayload(
  title: string,
  message: string,
  env: string,
  timestamp: string,
  isTest?: boolean,
  context?: unknown
): Record<string, unknown> {
  const color = isTest ? 0x34d399 : 0xef4444; // Verde para teste, vermelho para S1
  const badge = isTest ? "🟢 [TESTE OPS-01]" : "🚨 [S1 CRÍTICO]";

  return {
    content: `${badge} **${title}**`,
    embeds: [
      {
        title,
        description: message,
        color,
        fields: [
          { name: "Ambiente", value: env, inline: true },
          { name: "Horário (UTC)", value: timestamp, inline: true },
          ...(context ? [{ name: "Contexto", value: JSON.stringify(context).slice(0, 1000) }] : []),
        ],
        footer: { text: "Papelzinho Observability (OPS-01)" },
        timestamp,
      },
    ],
  };
}

function formatSlackPayload(
  title: string,
  message: string,
  env: string,
  timestamp: string,
  isTest?: boolean
): Record<string, unknown> {
  const badge = isTest ? "🟢 [TESTE OPS-01]" : "🚨 [S1 CRÍTICO]";
  return {
    text: `${badge} ${title}\n${message}\nAmbiente: ${env} | ${timestamp}`,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatTelegramPayload(
  title: string,
  message: string,
  env: string,
  timestamp: string
): Record<string, unknown> {
  return {
    text: `🚨 <b>${escapeHtml(title)}</b>\n\n${escapeHtml(message)}\n\n<b>Ambiente:</b> ${escapeHtml(env)}\n<b>Horário:</b> ${escapeHtml(timestamp)}`,
    parse_mode: "HTML",
  };
}
