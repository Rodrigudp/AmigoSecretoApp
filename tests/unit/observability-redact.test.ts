import { describe, it, expect } from "vitest";
import { maskSensitiveUrl, sanitizeContext } from "@/src/infrastructure/observability/redact";

interface NestedTestResult {
  group: {
    participant: {
      name: string;
      token: string;
    };
  };
  items: Array<{ token: string; valid?: boolean; url?: string }>;
}

describe("Observability Redaction (OPS-01 / LGPD Art. 46)", () => {
  describe("Path & URL Masking", () => {
    it("masks participant handshake path in /api/p/hs/[token] and /p/hs/[token]", () => {
      const apiHsUrl = "https://papelzinho.app/api/p/hs/secret_token_12345";
      expect(maskSensitiveUrl(apiHsUrl)).toBe("https://papelzinho.app/api/p/hs/[REDACTED]");

      const relativeHs = "/p/hs/raw_token_xyz999?query=true";
      expect(maskSensitiveUrl(relativeHs)).toBe("/p/hs/[REDACTED]?query=true");
    });

    it("masks participant tokens in /p/[token] and /api/p/[token]", () => {
      const raw = "https://papelzinho.app/p/abc123xyz_token";
      expect(maskSensitiveUrl(raw)).toBe("https://papelzinho.app/p/[REDACTED]");

      const apiRaw = "https://papelzinho.app/api/p/participant-token-555";
      expect(maskSensitiveUrl(apiRaw)).toBe("https://papelzinho.app/api/p/[REDACTED]");
    });

    it("masks admin tokens in /admin/[token] and /api/admin/[token]", () => {
      expect(maskSensitiveUrl("/admin/sec-admin-token-789")).toBe("/admin/[REDACTED]");
      expect(maskSensitiveUrl("/api/admin/admin_key_abc")).toBe("/api/admin/[REDACTED]");
    });

    it("masks owner tokens in /owner/[token]", () => {
      const raw = "https://papelzinho.app/owner/owner-token-999?query=1";
      expect(maskSensitiveUrl(raw)).toBe("https://papelzinho.app/owner/[REDACTED]?query=1");
    });

    it("masks redirect and group tokens in /r/[token] and /g/[token]", () => {
      expect(maskSensitiveUrl("/r/item-token-123")).toBe("/r/[REDACTED]");
      expect(maskSensitiveUrl("/g/group-token-456")).toBe("/g/[REDACTED]");
    });

    it("masks tokens containing dots, hyphens, and percent-encoded chars", () => {
      const raw = "/p/token.with.dots-and_underscores%20encoded";
      expect(maskSensitiveUrl(raw)).toBe("/p/[REDACTED]");
    });

    it("masks Bearer tokens in headers or log lines", () => {
      const logLine = "Failed request with header Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.secret";
      expect(maskSensitiveUrl(logLine)).toBe("Failed request with header Authorization: Bearer [REDACTED]");
    });

    it("masks ptk_ participant cookies", () => {
      const cookieHeader = "Cookie: ptk_d8a2b5e1-8890=secret_cookie_token_999; session=active";
      expect(maskSensitiveUrl(cookieHeader)).toBe("Cookie: ptk_d8a2b5e1-8890=[REDACTED]; session=active");
    });

    it("masks sensitive webhook URLs (Discord, Slack, Telegram)", () => {
      const discord = "Alert sent to https://discord.com/api/webhooks/123456789/abcdef-secret-token successfully";
      expect(maskSensitiveUrl(discord)).toBe("Alert sent to [REDACTED_WEBHOOK_URL] successfully");

      const slack = "Hook: https://hooks.slack.com/services/T00/B00/X00 secret";
      expect(maskSensitiveUrl(slack)).toBe("Hook: [REDACTED_WEBHOOK_URL] secret");

      const telegram = "Telegram endpoint: https://api.telegram.org/bot12345:ABCDEF/sendMessage";
      expect(maskSensitiveUrl(telegram)).toBe("Telegram endpoint: [REDACTED_WEBHOOK_URL]");
    });

    it("masks sensitive query parameters in URLs", () => {
      const url = "https://papelzinho.app/api?token=secret123&other=safe&adminToken=abc&accessToken=xyz&inviteToken=inv123";
      const masked = maskSensitiveUrl(url);
      expect(masked).toContain("token=[REDACTED]");
      expect(masked).toContain("adminToken=[REDACTED]");
      expect(masked).toContain("accessToken=[REDACTED]");
      expect(masked).toContain("inviteToken=[REDACTED]");
      expect(masked).toContain("other=safe");
    });
  });

  describe("Context & Object Sanitization", () => {
    it("redacts PII and credential keys (user, name, displayName, recipientName, ip, email, tokens)", () => {
      const context = {
        user: "Rodrigo",
        name: "Carlos",
        displayName: "Ana Banana",
        recipientName: "Bruno",
        email: "rodrigo@example.com",
        phone: "+5511999999999",
        cpf: "123.456.789-00",
        accessToken: "access-token-123",
        inviteToken: "invite-token-456",
        rawToken: "raw-token-789",
        ownerToken: "owner-token-000",
        serviceRoleKey: "service-key-xyz",
        webhookUrl: "https://discord.com/api/webhooks/123/abc",
        alertWebhookUrl: "https://hooks.slack.com/services/123",
        ip: "203.0.113.195",
        clientIp: "198.51.100.2",
        "set-cookie": "secret-cookie",
        "x-forwarded-for": "192.0.2.1",
        title: "Grupo da Família",
        note: "Quero uma camisa M",
        safeMeta: "ops_check",
        attempt: 3,
      };

      const sanitized = sanitizeContext(context) as Record<string, unknown>;

      expect(sanitized.user).toBe("[REDACTED]");
      expect(sanitized.name).toBe("[REDACTED]");
      expect(sanitized.displayName).toBe("[REDACTED]");
      expect(sanitized.recipientName).toBe("[REDACTED]");
      expect(sanitized.email).toBe("[REDACTED]");
      expect(sanitized.phone).toBe("[REDACTED]");
      expect(sanitized.cpf).toBe("[REDACTED]");
      expect(sanitized.accessToken).toBe("[REDACTED]");
      expect(sanitized.inviteToken).toBe("[REDACTED]");
      expect(sanitized.rawToken).toBe("[REDACTED]");
      expect(sanitized.ownerToken).toBe("[REDACTED]");
      expect(sanitized.serviceRoleKey).toBe("[REDACTED]");
      expect(sanitized.webhookUrl).toBe("[REDACTED]");
      expect(sanitized.alertWebhookUrl).toBe("[REDACTED]");
      expect(sanitized.ip).toBe("[REDACTED]");
      expect(sanitized.clientIp).toBe("[REDACTED]");
      expect(sanitized["set-cookie"]).toBe("[REDACTED]");
      expect(sanitized["x-forwarded-for"]).toBe("[REDACTED]");
      expect(sanitized.title).toBe("[REDACTED]");
      expect(sanitized.note).toBe("[REDACTED]");

      // Chaves técnicas não-sensíveis devem ser preservadas
      expect(sanitized.safeMeta).toBe("ops_check");
      expect(sanitized.attempt).toBe(3);
    });

    it("sanitizes nested objects and arrays recursively", () => {
      const nested = {
        group: {
          participant: {
            name: "Maria",
            token: "ptk_secret",
          },
        },
        items: [
          { token: "tok1", valid: true },
          { token: "tok2", url: "https://papelzinho.app/p/hs/token_in_array" },
        ],
      };

      const result = sanitizeContext(nested) as NestedTestResult;
      expect(result.group.participant.name).toBe("[REDACTED]");
      expect(result.group.participant.token).toBe("[REDACTED]");
      expect(result.items[0].token).toBe("[REDACTED]");
      expect(result.items[0].valid).toBe(true);
      expect(result.items[1].token).toBe("[REDACTED]");
      expect(result.items[1].url).toBe("[REDACTED]");
    });

    it("handles Error instances safely", () => {
      const err = new Error("Failed connecting to /api/p/hs/token_in_error_message");
      const sanitized = sanitizeContext(err) as { name: string; message: string };

      expect(sanitized.name).toBe("Error");
      expect(sanitized.message).toBe("Failed connecting to /api/p/hs/[REDACTED]");
    });

    it("prevents call stack overflow on deep objects", () => {
      let deep: Record<string, unknown> = { leaf: "value" };
      for (let i = 0; i < 10; i++) {
        deep = { child: deep };
      }

      const sanitized = sanitizeContext(deep);
      expect(JSON.stringify(sanitized)).toContain("[MAX_DEPTH]");
    });
  });
});
