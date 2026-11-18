// Sanitização e mascaramento estrito de tokens e dados pessoais (LGPD Art. 46 / OPS-01)

/**
 * Padrões de substituição para strings, paths e URLs sensíveis.
 */
const SENSITIVE_TEXT_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  // 1. URLs de webhook com tokens/secrets (Discord, Slack, Telegram)
  {
    pattern:
      /https:\/\/(?:discord(?:app)?\.com\/api\/webhooks\/|hooks\.slack\.com\/services\/|api\.telegram\.org\/bot)[^\s"'<>]+/gi,
    replacement: "[REDACTED_WEBHOOK_URL]",
  },
  // 2. /api/p/hs/[token] ou /p/hs/[token] (healthshake / participant handshake)
  {
    pattern: /((\/api)?\/p\/hs\/)[^/?#\s"'<>]+/gi,
    replacement: "$1[REDACTED]",
  },
  // 3. /p/[token], /admin/[token], /owner/[token], /r/[token], /g/[token] (e versões sob /api/)
  // O negative lookahead (?!hs\/) evita conflito com /p/hs/
  {
    pattern: /((\/api)?\/(p|owner|admin|r|g)\/)(?!hs\/)[^/?#\s"'<>]+/gi,
    replacement: "$1[REDACTED]",
  },
  // 4. Cabeçalhos ou strings com Bearer <token>
  {
    pattern: /(Bearer\s+)[^\s"',;]+/gi,
    replacement: "$1[REDACTED]",
  },
  {
    pattern: /Expo(?:nent)?PushToken\[[^\]\r\n]+\]/gi,
    replacement: "[REDACTED_EXPO_PUSH_TOKEN]",
  },
  // 5. Cookies de participante: ptk_<groupId>=<token>
  {
    pattern: /(ptk_[a-zA-Z0-9_-]+=)[^\s"',;]+/gi,
    replacement: "$1[REDACTED]",
  },
  // 6. Query parameters sensíveis (?token=..., &accessToken=..., etc.)
  {
    pattern:
      /([?&](?:token|adminToken|participantToken|accessToken|inviteToken|rawToken|ownerToken|key|secret|password|auth|apiKey)=)[^&#\s]+/gi,
    replacement: "$1[REDACTED]",
  },
];

/**
 * Substrings em nomes de chaves que indicam credencial ou segredo (sempre redatadas)
 */
const ALWAYS_REDACTED_SUBSTRINGS = [
  "token",
  "secret",
  "key",
  "password",
  "auth",
  "cookie",
  "email",
  "phone",
  "cpf",
  "webhook",
  "forwarded",
  "ptk",
];

/**
 * Nomes de chaves de dados pessoais ou conteúdo privado (LGPD Art. 46)
 */
const PII_FIELD_NAMES = new Set([
  "displayname",
  "recipientname",
  "participantname",
  "username",
  "user",
  "recipient",
  "participant",
  "name",
  "url",
  "note",
  "title",
  "prompt",
  "raw",
]);

function isIpKey(normalizedKey: string): boolean {
  return (
    normalizedKey === "ip" ||
    normalizedKey === "clientip" ||
    normalizedKey === "remoteip" ||
    normalizedKey === "userip"
  );
}

function isCredentialKey(normalizedKey: string): boolean {
  if (isIpKey(normalizedKey)) {
    return true;
  }
  for (const sub of ALWAYS_REDACTED_SUBSTRINGS) {
    if (normalizedKey.includes(sub)) {
      return true;
    }
  }
  return false;
}

function isPiiKey(normalizedKey: string): boolean {
  return PII_FIELD_NAMES.has(normalizedKey);
}

/**
 * Mascara rotas sensíveis, tokens em path, headers, cookies e query parameters em strings/URLs
 */
export function maskSensitiveUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  let sanitized = rawUrl;
  for (const { pattern, replacement } of SENSITIVE_TEXT_REPLACEMENTS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

function sanitizePrimitiveOrError(data: unknown): unknown | null {
  if (
    data === null ||
    data === undefined ||
    typeof data === "number" ||
    typeof data === "boolean"
  ) {
    return data;
  }
  if (typeof data === "string") {
    return maskSensitiveUrl(data);
  }
  if (data instanceof Error) {
    return {
      name: data.name,
      message: maskSensitiveUrl(data.message),
      stack: data.stack ? maskSensitiveUrl(data.stack) : undefined,
    };
  }
  return null;
}

/**
 * Sanitiza recursivamente objetos, arrays, erros e strings contra vazamentos em logs ou payloads
 */
export function sanitizeContext(data: unknown, depth = 0): unknown {
  if (depth > 5) {
    return "[MAX_DEPTH]";
  }

  const primitive = sanitizePrimitiveOrError(data);
  if (primitive !== null) {
    return primitive;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeContext(item, depth + 1));
  }

  if (typeof data === "object") {
    return sanitizeObject(data as Record<string, unknown>, depth);
  }

  return String(data);
}

function sanitizeObject(obj: Record<string, unknown>, depth: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, "");

    if (isCredentialKey(normalizedKey)) {
      result[key] = "[REDACTED]";
    } else if (isPiiKey(normalizedKey)) {
      if (value !== null && typeof value === "object") {
        result[key] = sanitizeContext(value, depth + 1);
      } else {
        result[key] = "[REDACTED]";
      }
    } else {
      result[key] = sanitizeContext(value, depth + 1);
    }
  }

  return result;
}
