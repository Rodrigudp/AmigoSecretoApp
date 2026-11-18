import { describe, it, expect } from "vitest";
import { maskSensitiveUrl, sanitizeContext } from "@/src/infrastructure/observability/redact";

describe("Observability Redaction (OPS-01 / LGPD Art. 46)", () => {
  it("masks participant tokens in /p/[token] URL paths", () => {
    const raw = "https://papelzinho.app/p/abc123xyz_token";
    expect(maskSensitiveUrl(raw)).toBe("https://papelzinho.app/p/[REDACTED]");
  });

  it("masks admin tokens in /admin/[token] URL paths", () => {
    const raw = "/admin/sec-admin-token-789";
    expect(maskSensitiveUrl(raw)).toBe("/admin/[REDACTED]");
  });

  it("masks owner tokens in /owner/[token] URL paths", () => {
    const raw = "https://papelzinho.app/owner/owner-token-999?query=1";
    expect(maskSensitiveUrl(raw)).toBe("https://papelzinho.app/owner/[REDACTED]?query=1");
  });

  it("masks redirect tokens in /r/[token] and /g/[token] URL paths", () => {
    expect(maskSensitiveUrl("/r/item-token-123")).toBe("/r/[REDACTED]");
    expect(maskSensitiveUrl("/g/group-token-456")).toBe("/g/[REDACTED]");
  });

  it("masks sensitive query parameters in URLs", () => {
    const url = "https://papelzinho.app/api?token=secret123&other=safe&adminToken=abc";
    const masked = maskSensitiveUrl(url);
    expect(masked).toContain("token=[REDACTED]");
    expect(masked).toContain("adminToken=[REDACTED]");
    expect(masked).toContain("other=safe");
  });

  it("sanitizes sensitive keys in complex context objects", () => {
    const context = {
      user: "Rodrigo",
      email: "rodrigo@example.com",
      token: "secret-token",
      admin_token: "admin-secret",
      nested: {
        authorization: "Bearer 12345",
        participant_token: "ptk-123",
        safeValue: 42,
        url: "https://papelzinho.app/p/secret-token",
      },
    };

    const sanitized = sanitizeContext(context) as Record<string, unknown>;
    expect(sanitized.user).toBe("Rodrigo");
    expect(sanitized.email).toBe("[REDACTED]");
    expect(sanitized.token).toBe("[REDACTED]");
    expect(sanitized.admin_token).toBe("[REDACTED]");

    const nested = sanitized.nested as Record<string, unknown>;
    expect(nested.authorization).toBe("[REDACTED]");
    expect(nested.participant_token).toBe("[REDACTED]");
    expect(nested.safeValue).toBe(42);
    expect(nested.url).toBe("https://papelzinho.app/p/[REDACTED]");
  });
});
