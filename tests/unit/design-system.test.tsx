import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Button } from "@/app/_components/Button";
import { Input } from "@/app/_components/Input";
import { Card } from "@/app/_components/Card";

afterEach(cleanup);

const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
const token = (name: string) => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} missing`);
  return m[1];
};
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("tokens: WCAG AA contrast", () => {
  const text: [string, string][] = [
    ["text", "surface"],
    ["text", "bg"],
    ["text-muted", "surface"],
    ["text-muted", "bg"],
    ["primary", "surface"],
    ["primary", "bg"],
    ["primary-soft-text", "primary-soft"],
    ["primary-soft-text", "primary-soft-hover"],
    ["danger", "danger-bg"],
    ["success", "success-bg"],
    ["warning", "warning-bg"],
    ["disabled", "disabled-bg"],
  ];
  it.each(text)("%s on %s >= 4.5", (fg, bg) => {
    expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });
  it("white on primary and primary-hover >= 4.5", () => {
    expect(ratio("#ffffff", token("primary"))).toBeGreaterThanOrEqual(4.5);
    expect(ratio("#ffffff", token("primary-hover"))).toBeGreaterThanOrEqual(4.5);
  });
  it.each([
    ["border", "surface"],
    ["border", "bg"],
    ["focus", "surface"],
    ["focus", "bg"],
  ])("UI %s on %s >= 3", (fg, bg) => {
    expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(3);
  });
  it("has no font size below 16px", () => {
    const sizes = [...css.matchAll(/--text-[a-z0-9]+:\s*([\d.]+)rem/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(1);
  });
});

describe("Button", () => {
  it("defaults to type=button with 48px min height", () => {
    render(<Button>Criar grupo</Button>);
    const b = screen.getByRole("button", { name: "Criar grupo" });
    expect(b.getAttribute("type")).toBe("button");
    expect(b.className).toContain("min-h-12");
  });
  it("is disabled and busy while loading", () => {
    render(<Button loading>Criando…</Button>);
    const b = screen.getByRole("button", { name: "Criando…" }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.getAttribute("aria-busy")).toBe("true");
  });
  it("supports disabled", () => {
    render(<Button disabled>Sortear</Button>);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("Input", () => {
  it("associates label and hint", () => {
    render(<Input label="Nome do grupo" hint="Até 60 letras" required />);
    const i = screen.getByLabelText(/Nome do grupo/) as HTMLInputElement;
    expect(i.getAttribute("aria-invalid")).toBeNull();
    expect(i.getAttribute("aria-describedby")).toBeTruthy();
    expect(i.required).toBe(true);
  });
  it("marks error state with aria-invalid and an alert message", () => {
    render(<Input label="Nome" error="Escreva o nome do grupo" />);
    const i = screen.getByLabelText("Nome");
    expect(i.getAttribute("aria-invalid")).toBe("true");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Escreva o nome do grupo");
    expect(i.getAttribute("aria-describedby")).toContain(alert.id);
  });
  it("supports disabled", () => {
    render(<Input label="Nome" disabled />);
    expect((screen.getByLabelText("Nome") as HTMLInputElement).disabled).toBe(true);
  });
});

describe("Card", () => {
  it("renders a titled section and a text icon for warning tone", () => {
    render(
      <Card tone="warning" title="Link do organizador">
        Não compartilhe
      </Card>
    );
    const h = screen.getByRole("heading", { name: /Link do organizador/ });
    expect(h.textContent).toContain("⚠");
    expect(h.closest("section")?.getAttribute("data-tone")).toBe("warning");
  });
});
