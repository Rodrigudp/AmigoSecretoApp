// Sanitização e mascaramento estrito de tokens e dados pessoais (LGPD Art. 46 / OPS-01)

const SENSITIVE_PATH_PATTERNS = [
  { pattern: /\/(p|owner|admin|r|g)\/[a-zA-Z0-9_-]+/g, replacement: "/$1/[REDACTED]" },
  { pattern: /([?&](token|adminToken|participantToken|key|secret|password)=)[^&#\s]+/gi, replacement: "$1[REDACTED]" },
];

const SENSITIVE_KEY_NAMES = new Set([
  "token",
  "admintoken",
  "participanttoken",
  "admin_token",
  "participant_token",
  "authorization",
  "cookie",
  "password",
  "secret",
  "key",
  "email",
  "phone",
  "cpf",
]);

/**
 * Mascara rotas sensíveis e query parameters em URLs ou paths (/p/, /owner/, /admin/, /r/, /g/)
 */
export function maskSensitiveUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  let sanitized = rawUrl;
  for (const { pattern, replacement } of SENSITIVE_PATH_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

/**
 * Sanitiza recursivamente objetos, arrays e strings contra vazamentos em logs ou payloads
 */
export function sanitizeContext(data: unknown, depth = 0): unknown {
  if (depth > 5) {
    return "[MAX_DEPTH]";
  }

  if (typeof data === "string") {
    return maskSensitiveUrl(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeContext(item, depth + 1));
  }

  if (data !== null && typeof data === "object") {
    return sanitizeObject(data as Record<string, unknown>, depth);
  }

  return data;
}

function sanitizeObject(obj: Record<string, unknown>, depth: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, "");
    if (SENSITIVE_KEY_NAMES.has(normalizedKey)) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = sanitizeContext(value, depth + 1);
    }
  }

  return result;
}
