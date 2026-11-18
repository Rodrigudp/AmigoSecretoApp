// Logger estruturado com proteção LGPD e integração de alertas S1 (OPS-01)
import { maskSensitiveUrl, sanitizeContext } from "./redact";
import { sendS1Alert } from "./alerts";

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

function getMinLogLevel(): number {
  const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  return LOG_LEVELS[envLevel] ?? LOG_LEVELS.info;
}

export function logMessage(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error | unknown
): void {
  const minLevel = getMinLogLevel();
  if (LOG_LEVELS[level] < minLevel) {
    return;
  }

  const sanitizedMessage = maskSensitiveUrl(message);
  const sanitizedContext = context ? sanitizeContext(context) : undefined;
  const sanitizedError = formatError(error);

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: sanitizedMessage,
    context: sanitizedContext,
    error: sanitizedError,
  };

  const isProd = process.env.NODE_ENV === "production";
  const output = isProd ? JSON.stringify(logEntry) : `[${logEntry.timestamp}] [${level.toUpperCase()}] ${sanitizedMessage}`;

  if (level === "error" || level === "critical") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }

  // Disparo automático de alerta para eventos de severidade máxima (S1)
  if (level === "critical") {
    sendS1Alert({
      title: `[S1] ${sanitizedMessage}`,
      message: sanitizedError?.message || sanitizedMessage,
      error,
      context,
    }).catch(() => {
      // Ignora falhas de rede no envio assíncrono para não interromper a execução
    });
  }
}

function formatError(error: Error | unknown): { name: string; message: string; stack?: string } | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: maskSensitiveUrl(error.message),
      stack: error.stack ? maskSensitiveUrl(error.stack) : undefined,
    };
  }

  return {
    name: "UnknownError",
    message: maskSensitiveUrl(String(error)),
  };
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => logMessage("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => logMessage("info", message, context),
  warn: (message: string, context?: Record<string, unknown>, error?: unknown) =>
    logMessage("warn", message, context, error),
  error: (message: string, context?: Record<string, unknown>, error?: unknown) =>
    logMessage("error", message, context, error),
  critical: (message: string, context?: Record<string, unknown>, error?: unknown) =>
    logMessage("critical", message, context, error),
};
