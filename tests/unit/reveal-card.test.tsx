import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RevealCard } from "@/app/_components/RevealCard";
import { revealMyResultAction } from "@/app/reveal-actions";
import type { PublicGroup } from "@/src/application/ports";

let mockCookies: Record<string, string> = {};
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (mockCookies[name] ? { name, value: mockCookies[name] } : undefined),
    getAll: () => Object.entries(mockCookies).map(([name, value]) => ({ name, value })),
  }),
}));

const creds: Record<string, { participantId: string; groupId: string; displayName: string }> = {
  "hash(tok-grp-1)": { participantId: "p-1", groupId: "grp-1", displayName: "Ana" },
  "hash(tok-grp-2)": { participantId: "p-2", groupId: "grp-2", displayName: "Bia" },
};

vi.mock("@/src/infrastructure/supabase/deps", () => ({
  buildGetMyResultDeps: () => ({
    participants: {
      findActiveByHash: async (h: string) =>
        creds[h] ? { ...creds[h]!, accessTokenHash: h, expiresAt: "2099-01-01T00:00:00Z" } : null,
    },
    draws: {
      getCurrentResult: async ({ participantId }: { participantId: string }) => ({
        ok: true as const,
        value: {
          drawVersion: 1,
          recipientName: participantId === "p-1" ? "ParDoGrupo1" : "ParDoGrupo2",
          wishItems: [],
        },
      }),
    },
    tokens: { hash: (t: string) => `hash(${t})` },
  }),
}));

afterEach(() => {
  mockCookies = {};
  cleanup();
});

const drawnGroup: PublicGroup = {
  name: "Família Silva",
  maxValueCents: 5000,
  exchangeDate: "2026-12-24",
  location: "Casa da Vó Maria",
  status: "drawn",
};

describe("RevealCard & revealMyResultAction (SRT-04, DSN-04 §3)", () => {
  it("renders R0 waiting state when group is open", () => {
    render(<RevealCard group={{ ...drawnGroup, status: "open" }} />);
    expect(screen.getByRole("heading", { name: "Seu amigo secreto" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Revelar meu amigo secreto" })).toBeNull();
  });

  it("starts closed in R1, reveals R3 focusing name, and hides back to R1 focusing button", async () => {
    const action = vi.fn().mockResolvedValue({
      ok: true,
      drawVersion: 1,
      friendName: "Beatriz Lima",
      wishItems: [{ id: "w-1", title: "Fone azul", note: null, productLink: null }],
    });
    const { container } = render(<RevealCard group={drawnGroup} groupId="grp-1" action={action} />);
    expect(container.innerHTML).not.toContain("Beatriz Lima");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Revelar meu amigo secreto" }));
    });
    expect(document.activeElement).toBe(screen.getByLabelText("Você tirou Beatriz Lima"));
    expect(screen.getByRole("heading", { name: "Lista de desejos de Beatriz Lima" })).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Esconder" }));
    });
    expect(screen.queryByText("Beatriz Lima")).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Revelar meu amigo secreto" })
    );
  });

  it("renders R4 as Card danger without peach background or Revelar button, and retries", async () => {
    const action = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: "Erro ao revelar." })
      .mockResolvedValueOnce({ ok: true, drawVersion: 1, friendName: "Carlos", wishItems: [] });
    render(<RevealCard group={{ ...drawnGroup, location: null }} action={action} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Revelar meu amigo secreto" }));
    });
    const section = screen.getByRole("heading", { name: /Seu amigo secreto/ }).closest("section");
    expect(section?.getAttribute("data-tone")).toBe("danger");
    expect(section?.className).not.toContain("bg-peach");
    expect(screen.queryByRole("button", { name: "Revelar meu amigo secreto" })).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    });
    expect(screen.getByLabelText("Você tirou Carlos")).toBeTruthy();
  });

  it("isolates cookies per group and never mixes another group's cookie", async () => {
    mockCookies = { "ptk_grp-2": "tok-grp-2", "ptk_grp-1": "tok-grp-1" };
    const okRes = await revealMyResultAction({ mode: "cookie", groupId: "grp-1" });
    expect(okRes).toEqual({ ok: true, drawVersion: 1, friendName: "ParDoGrupo1", wishItems: [] });

    mockCookies = { "ptk_grp-2": "tok-grp-2" };
    expect((await revealMyResultAction({ mode: "cookie", groupId: "grp-1" })).ok).toBe(false);
    mockCookies = { "ptk_grp-1": "tok-grp-2" };
    expect((await revealMyResultAction({ mode: "cookie", groupId: "grp-1" })).ok).toBe(false);
    mockCookies = { "ptk_grp-2": "tok-grp-2" };
    const fallbackRes = await revealMyResultAction({ mode: "token", accessToken: "tok-grp-1" });
    expect(fallbackRes.ok && fallbackRes.friendName).toBe("ParDoGrupo1");
  });
});
