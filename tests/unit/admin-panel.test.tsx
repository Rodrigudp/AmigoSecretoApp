import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AdminPanel } from "@/app/_components/AdminPanel";
import type { AdminGroup } from "@/src/application/ports";

afterEach(cleanup);

const sampleData: AdminGroup = {
  group: { name: "Natal da Família", maxValueCents: 5000, exchangeDate: "2026-12-25", location: "Casa da Tia Ju" },
  inviteUrl: "https://amigo-secreto-app-five.vercel.app/g/convite-123",
  draw: { status: "open" },
  participantCount: 0,
  participants: [],
};

describe("AdminPanel (GRP-05)", () => {
  it("renders empty state with group details and disabled draw button", () => {
    render(<AdminPanel initialData={sampleData} adminToken="adm-123" />);
    expect(screen.getByText("Natal da Família")).toBeTruthy();
    expect(screen.getByText("Aberto para inscrições")).toBeTruthy();
    expect(screen.getByText("25/12/2026")).toBeTruthy();
    expect(screen.getByText(/Nenhum participante entrou ainda/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Realizar Sorteio" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders active participants list and enables draw when count >= 3", () => {
    const dataWithParticipants: AdminGroup = {
      ...sampleData,
      participantCount: 3,
      participants: [
        { id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" },
        { id: "p-2", displayName: "Bruno", joinedAt: "2026-11-17T11:00:00Z" },
        { id: "p-3", displayName: "Carla", joinedAt: "2026-11-17T12:00:00Z" },
      ],
    };
    render(<AdminPanel initialData={dataWithParticipants} adminToken="adm-123" />);
    expect(screen.getByText("Participantes (3 de 100)")).toBeTruthy();
    expect(screen.getByText("Ana")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Realizar Sorteio" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("asks for confirmation before removing a participant and cancels properly", () => {
    const dataWithParticipant: AdminGroup = {
      ...sampleData,
      participantCount: 1,
      participants: [{ id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" }],
    };
    render(<AdminPanel initialData={dataWithParticipant} adminToken="adm-123" />);
    fireEvent.click(screen.getByRole("button", { name: "Remover Ana" }));
    expect(screen.getByText(/Tem certeza que deseja remover Ana\?/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByText(/Tem certeza que deseja remover Ana\?/)).toBeNull();
  });

  it("removes participant on confirmation and updates participant count", async () => {
    const dataWithParticipant: AdminGroup = {
      ...sampleData,
      participantCount: 1,
      participants: [{ id: "p-1", displayName: "Ana", joinedAt: "2026-11-17T10:00:00Z" }],
    };
    const actionMock = vi.fn().mockResolvedValue({ ok: true, participantCount: 0 });
    render(<AdminPanel initialData={dataWithParticipant} adminToken="adm-123" action={actionMock} />);
    fireEvent.click(screen.getByRole("button", { name: "Remover Ana" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Confirmar remoção" }));
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
    expect(screen.getByText(/Sorteio Realizado em/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Remover/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Realizar Sorteio" })).toBeNull();
    expect(screen.getByText(/Sorteio realizado!/)).toBeTruthy();
  });
});
