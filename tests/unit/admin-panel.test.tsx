import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AdminPanel } from "@/app/_components/AdminPanel";
import type { AdminGroup } from "@/src/application/ports";

afterEach(cleanup);

const sampleData: AdminGroup = {
  group: {
    name: "Natal da Família",
    maxValueCents: 5000,
    exchangeDate: "2026-12-25",
    location: "Casa da Tia Ju",
  },
  inviteUrl: "https://amigo-secreto-app-five.vercel.app/g/convite-123",
  draw: { status: "open" },
  participantCount: 0,
  participants: [],
};

describe("AdminPanel UI (GRP-05)", () => {
  it("renders empty state with group details and disabled draw button", () => {
    render(<AdminPanel initialData={sampleData} adminToken="adm-123" />);
    expect(screen.getByText("Natal da Família")).toBeTruthy();
    expect(screen.getByText("Entradas abertas")).toBeTruthy();
    expect(screen.queryByText("Em breve")).toBeNull();
    expect(screen.getByText("25/12/2026")).toBeTruthy();
    expect(screen.getByText("Valor máximo")).toBeTruthy();
    expect(screen.getByText("Envie o convite para quem vai participar.")).toBeTruthy();
    expect(
      screen.getByText(
        "Quando todos tiverem entrado, faça o sorteio. Cada pessoa vê só quem tirou."
      )
    ).toBeTruthy();
    expect(screen.getByText(/Ninguém entrou ainda/)).toBeTruthy();
    expect(screen.getByText("Para sortear, precisa de pelo menos 3 pessoas.")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Fazer o sorteio" }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it("enables draw with 3+ participants (S2), confirms inline focusing Cancelar (S3), and completes draw (S5)", async () => {
    const dataWithParticipants: AdminGroup = {
      ...sampleData,
      participantCount: 3,
      participants: [
        { id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" },
        { id: "p-2", displayName: "Bruno", joinedAt: "2026-11-17T11:00:00Z" },
        { id: "p-3", displayName: "Carla", joinedAt: "2026-11-17T12:00:00Z" },
      ],
    };
    const drawAction = vi.fn().mockResolvedValue({ ok: true, drawnAt: "2026-11-18T15:00:00Z" });
    const { container } = render(
      <AdminPanel initialData={dataWithParticipants} adminToken="adm-123" drawAction={drawAction} />
    );
    expect(screen.getByText("Participantes (3 de 100)")).toBeTruthy();
    expect(screen.getByText("Ana")).toBeTruthy();
    const drawBtn = screen.getByRole("button", { name: "Fazer o sorteio" }) as HTMLButtonElement;
    expect(drawBtn.disabled).toBe(false);

    fireEvent.click(drawBtn);
    expect(screen.getByText("Fazer o sorteio agora?")).toBeTruthy();
    expect(screen.getByText(/3 pessoas vão participar\./)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancelar" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sim, fazer o sorteio" }));
    });
    expect(drawAction).toHaveBeenCalledWith("adm-123", 3);
    expect(screen.getByText(/✓ Sorteio feito em/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Avisar o grupo no WhatsApp" })).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/giverId|receiverId/);
  });

  it("handles S6 draw error and S7 DRAW_MEMBERS_CHANGED reload prompt", async () => {
    const dataWithParticipants: AdminGroup = {
      ...sampleData,
      participantCount: 3,
      participants: [
        { id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" },
        { id: "p-2", displayName: "Bruno", joinedAt: "2026-11-17T11:00:00Z" },
        { id: "p-3", displayName: "Carla", joinedAt: "2026-11-17T12:00:00Z" },
      ],
    };
    const onReload = vi.fn();
    const drawAction = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: "Não foi possível concluir o sorteio." })
      .mockResolvedValueOnce({ ok: false, code: "DRAW_MEMBERS_CHANGED" });
    render(
      <AdminPanel
        initialData={dataWithParticipants}
        adminToken="adm-123"
        drawAction={drawAction}
        onReload={onReload}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Fazer o sorteio" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sim, fazer o sorteio" }));
    });
    expect(screen.getByText(/Não foi possível concluir o sorteio\./)).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sim, fazer o sorteio" }));
    });
    expect(screen.getByText(/O número de pessoas mudou\./)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Atualizar a página" }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("asks for confirmation before removing a participant and cancels properly", () => {
    const dataWithParticipant: AdminGroup = {
      ...sampleData,
      participantCount: 1,
      participants: [{ id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" }],
    };
    render(<AdminPanel initialData={dataWithParticipant} adminToken="adm-123" />);
    fireEvent.click(screen.getByRole("button", { name: "Remover Ana" }));
    expect(screen.getByText(/Remover Ana\?/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByText(/Remover Ana\?/)).toBeNull();
  });

  it("removes participant on confirmation and updates participant count", async () => {
    const dataWithParticipant: AdminGroup = {
      ...sampleData,
      participantCount: 1,
      participants: [{ id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" }],
    };
    const actionMock = vi.fn().mockResolvedValue({ ok: true, participantCount: 0 });
    render(
      <AdminPanel initialData={dataWithParticipant} adminToken="adm-123" action={actionMock} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover Ana" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sim, remover" }));
    });
    expect(actionMock).toHaveBeenCalledWith("adm-123", "p-1");
    expect(screen.queryByText("Ana")).toBeNull();
    expect(screen.getByText("Participantes (0 de 100)")).toBeTruthy();
  });

  it("renders drawn state without remove button and with drawn badge", () => {
    const drawnData: AdminGroup = {
      ...sampleData,
      draw: { status: "drawn", drawnAt: "2026-11-17T18:00:00Z" },
      participantCount: 3,
      participants: [{ id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" }],
    };
    render(<AdminPanel initialData={drawnData} adminToken="adm-123" />);
    expect(screen.getByText(/^Sorteio feito em/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Remover/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Fazer o sorteio" })).toBeNull();
    expect(screen.getByText(/✓ Sorteio feito em/)).toBeTruthy();
  });
});
