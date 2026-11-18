import { z } from "zod";

export type UrlValidationFailure =
  | "invalid_url"
  | "insecure_url"
  | "unsupported_scheme"
  | "url_too_long";

export type NormalizeUrlResult =
  | { ok: true; url: string }
  | { ok: false; code: UrlValidationFailure };

function checkBasicScheme(trimmed: string): UrlValidationFailure | null {
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("http://")) return "insecure_url";
  const unsupported = ["javascript:", "data:", "file:", "ftp:", "mailto:"];
  if (unsupported.some((s) => lower.startsWith(s))) {
    return "unsupported_scheme";
  }
  return null;
}

function isReservedIpv4(octets: number[]): boolean {
  if (octets.some((o) => o > 255)) return true;
  return true; // Any IPv4 literal host is rejected per spec
}

function isIpv6Reserved(cleanHost: string): boolean {
  const prefixes = ["fc", "fd", "fe8", "fe9", "fea", "feb"];
  return prefixes.some((p) => cleanHost.startsWith(p)) || true;
}

function stripHostDotsAndBrackets(host: string): string {
  const unbracketed = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
  return unbracketed.replace(/^\.+|\.+$/g, "");
}

function isReservedOrPrivateHost(host: string): boolean {
  const cleanHost = stripHostDotsAndBrackets(host);

  if (cleanHost === "localhost" || cleanHost === "0.0.0.0" || cleanHost === "::1" || cleanHost === "") {
    return true;
  }
  if (cleanHost.includes(":")) {
    return isIpv6Reserved(cleanHost.toLowerCase());
  }
  const match = cleanHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (match) {
    return isReservedIpv4([Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]);
  }
  return false;
}

function validateHostname(hostname: string): boolean {
  const trimmedDotHost = hostname.replace(/^\.+|\.+$/g, "");
  if (!trimmedDotHost.includes(".")) return false;
  if (hostname.includes("xn--") || /[^\x20-\x7E]/.test(hostname)) return false;
  return !isReservedOrPrivateHost(hostname);
}

function validateUrlComponents(parsed: URL): boolean {
  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;
  if (parsed.port && parsed.port !== "443" && parsed.port !== "") return false;
  return validateHostname(parsed.hostname.toLowerCase());
}

/**
 * URL normalization and security validation (LST-01 §5 / AMEACAS AM-05).
 * Enforces:
 * - Scheme: strictly https:
 * - Trailing/leading dot bypass defense (.localhost, 127.0.0.1.)
 * - Length check: checked AFTER URL resolution and percent-encoding
 * - Disallow userinfo, non-443 ports, punycode (xn--), IP literals, reserved/private ranges
 */
export function normalizeUrl(rawUrl: string): NormalizeUrlResult {
  const trimmed = rawUrl.trim();

  const basicFailure = checkBasicScheme(trimmed);
  if (basicFailure) {
    return { ok: false, code: basicFailure };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, code: "invalid_url" };
  }

  if (!validateUrlComponents(parsed)) {
    return { ok: false, code: parsed.protocol !== "https:" ? "insecure_url" : "invalid_url" };
  }

  parsed.hash = "";
  const finalUrl = parsed.toString();

  // Check 2048 length limit AFTER URL normalization and percent-encoding (SEC review)
  if (finalUrl.length > 2048) {
    return { ok: false, code: "url_too_long" };
  }

  return { ok: true, url: finalUrl };
}

export const wishFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Informe o título do presente.")
    .max(120, "O título deve ter no máximo 120 caracteres."),
  url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : val))
    .refine(
      (val) => {
        if (val === null) return true;
        const norm = normalizeUrl(val);
        return norm.ok;
      },
      { message: "Informe um link válido que comece com https://." }
    ),
  note: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : val))
    .refine((val) => val === null || val.length <= 500, {
      message: "A observação deve ter no máximo 500 caracteres.",
    }),
});

export const addWishItemInputSchema = z.object({
  accessToken: z.string().trim().min(1, "Token de acesso obrigatório."),
  title: z
    .string()
    .trim()
    .min(1, "Informe o título do presente.")
    .max(120, "O título deve ter no máximo 120 caracteres."),
  url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .default(null)
    .transform((val) => (val === "" || val === undefined ? null : val))
    .refine(
      (val) => {
        if (val === null) return true;
        const norm = normalizeUrl(val);
        return norm.ok;
      },
      { message: "Informe um link válido que comece com https://." }
    ),
  note: z
    .string()
    .trim()
    .nullable()
    .optional()
    .default(null)
    .transform((val) => (val === "" || val === undefined ? null : val))
    .refine((val) => val === null || val.length <= 500, {
      message: "A observação deve ter no máximo 500 caracteres.",
    }),
});

export const updateWishItemInputSchema = z.object({
  accessToken: z.string().trim().min(1, "Token de acesso obrigatório."),
  itemId: z.string().trim().uuid("Identificador do item inválido."),
  title: z
    .string()
    .trim()
    .min(1, "Informe o título do presente.")
    .max(120, "O título deve ter no máximo 120 caracteres."),
  url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .default(null)
    .transform((val) => (val === "" || val === undefined ? null : val))
    .refine(
      (val) => {
        if (val === null) return true;
        const norm = normalizeUrl(val);
        return norm.ok;
      },
      { message: "Informe um link válido que comece com https://." }
    ),
  note: z
    .string()
    .trim()
    .nullable()
    .optional()
    .default(null)
    .transform((val) => (val === "" || val === undefined ? null : val))
    .refine((val) => val === null || val.length <= 500, {
      message: "A observação deve ter no máximo 500 caracteres.",
    }),
});

export const removeWishItemInputSchema = z.object({
  accessToken: z.string().trim().min(1, "Token de acesso obrigatório."),
  itemId: z.string().trim().uuid("Identificador do item inválido."),
});

export const listWishItemsInputSchema = z.object({
  accessToken: z.string().trim().min(1, "Token de acesso obrigatório."),
});

export type WishFieldsInput = z.input<typeof wishFieldsSchema>;
export type AddWishItemInput = z.input<typeof addWishItemInputSchema>;
export type UpdateWishItemInput = z.input<typeof updateWishItemInputSchema>;
export type RemoveWishItemInput = z.input<typeof removeWishItemInputSchema>;
export type ListWishItemsInput = z.input<typeof listWishItemsInputSchema>;
