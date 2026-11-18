import { describe, expect, it } from "vitest";
import { normalizeUrl } from "../../src/application/schemas/wish-item";

describe("normalizeUrl (LST-01 §5 / AMEACAS AM-05)", () => {
  it("aceita URLs HTTPS válidas com portas implícitas", () => {
    const res = normalizeUrl("https://www.amazon.com.br/dp/B08N5WRWNW");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.url).toBe("https://www.amazon.com.br/dp/B08N5WRWNW");
    }
  });

  it("aceita porta explícita 443", () => {
    const res = normalizeUrl("https://loja.com.br:443/item");
    expect(res.ok).toBe(true);
  });

  it("remove fragmento (#...) antes de retornar", () => {
    const res = normalizeUrl("https://exemplo.com/produto#detalhes");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.url).toBe("https://exemplo.com/produto");
    }
  });

  it("rejeita esquemas inseguros (http://)", () => {
    const res = normalizeUrl("http://inseguro.com/item");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("insecure_url");
    }
  });

  it("rejeita esquemas não suportados (javascript:, data:, file:, ftp:, mailto:)", () => {
    expect(normalizeUrl("javascript:alert(1)").ok).toBe(false);
    expect(normalizeUrl("data:text/html,payload").ok).toBe(false);
    expect(normalizeUrl("file:///etc/passwd").ok).toBe(false);
    expect(normalizeUrl("ftp://ftp.example.com").ok).toBe(false);
    expect(normalizeUrl("mailto:teste@exemplo.com").ok).toBe(false);
  });

  it("rejeita credenciais de usuário (user:pass@)", () => {
    const res = normalizeUrl("https://admin:secreto@loja.com/item");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("invalid_url");
    }
  });

  it("rejeita portas diferentes de 443", () => {
    const res = normalizeUrl("https://loja.com:8443/item");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("invalid_url");
    }
  });

  it("rejeita localhost e IPs reservados/privados (0.0.0.0, 127., 10., 192.168., 169.254., fc00::, fe80::)", () => {
    expect(normalizeUrl("https://localhost/item").ok).toBe(false);
    expect(normalizeUrl("https://0.0.0.0/item").ok).toBe(false);
    expect(normalizeUrl("https://127.0.0.1/item").ok).toBe(false);
    expect(normalizeUrl("https://10.0.0.1/item").ok).toBe(false);
    expect(normalizeUrl("https://192.168.1.1/item").ok).toBe(false);
    expect(normalizeUrl("https://169.254.169.254/latest/meta-data/").ok).toBe(false);
    expect(normalizeUrl("https://[::1]/item").ok).toBe(false);
    expect(normalizeUrl("https://[fc00::1]/item").ok).toBe(false);
    expect(normalizeUrl("https://[fe80::1]/item").ok).toBe(false);
  });

  it("rejeita host sem ponto", () => {
    expect(normalizeUrl("https://promo/item").ok).toBe(false);
  });

  it("rejeita punycode e caracteres homógrafos não-ASCII", () => {
    expect(normalizeUrl("https://xn--amazn-7qa.com/item").ok).toBe(false);
    expect(normalizeUrl("https://аmazon.com/item").ok).toBe(false); // cirílico
  });

  it("rejeita URL acima de 2048 caracteres", () => {
    const longUrl = "https://loja.com/" + "a".repeat(2040);
    const res = normalizeUrl(longUrl);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("url_too_long");
    }
  });
});
