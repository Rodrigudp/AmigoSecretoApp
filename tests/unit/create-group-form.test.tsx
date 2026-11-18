import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateGroupForm } from "@/app/_components/CreateGroupForm";
import { GROUP_MESSAGES } from "@/app/_lib/create-group-schema";

const KEY = "amigo-secreto:create-group-request-id";

beforeEach(() => window.sessionStorage.clear());
afterEach(cleanup);

function fill() {
  fireEvent.change(screen.getByLabelText(/Nome do grupo/), { target: { value: "Família Silva" } });
  fireEvent.change(screen.getByLabelText(/Valor máximo/), { target: { value: "50" } });
  fireEvent.change(screen.getByLabelText(/Data da troca/), { target: { value: "2099-12-24" } });
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: /Criar grupo/ }));

describe("CreateGroupForm", () => {
  it("empty state: shows the fields and no errors", () => {
    render(<CreateGroupForm action={vi.fn()} />);
    expect(screen.getByLabelText(/Nome do grupo/)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("error state: blocks submit and shows field messages with aria-invalid", () => {
    const action = vi.fn();
    render(<CreateGroupForm action={action} />);
    submit();
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByText(new RegExp(GROUP_MESSAGES.name))).toBeTruthy();
    expect(screen.getByLabelText(/Nome do grupo/).getAttribute("aria-invalid")).toBe("true");
  });

  it("loading state: disables the button and ignores a second click", async () => {
    let resolve: (v: never) => void = () => {};
    const action = vi.fn(() => new Promise((r) => (resolve = r as typeof resolve)));
    render(<CreateGroupForm action={action as never} />);
    fill();
    submit();
    const busy = (await screen.findByRole("button", { name: /Criando/ })) as HTMLButtonElement;
    expect(busy.disabled).toBe(true);
    expect(busy.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(busy);
    expect(action).toHaveBeenCalledTimes(1);
    resolve({ ok: false, message: "x" } as never);
  });

  it("success state: sends the stored requestId, clears it, shows invite and admin links", async () => {
    const action = vi.fn().mockResolvedValue({
      ok: true,
      inviteUrl: "https://x.test/g/invite",
      adminUrl: "https://x.test/admin/secret",
    });
    render(<CreateGroupForm action={action} />);
    fill();
    submit();
    await screen.findByText(/Grupo criado com sucesso/);

    const sent = action.mock.calls[0][0];
    expect(sent.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(window.sessionStorage.getItem(KEY)).toBeNull();

    const share = screen.getByRole("link", { name: "Compartilhar no WhatsApp" });
    expect(share.getAttribute("href")).toContain("https://wa.me/?text=");
    expect(decodeURIComponent(share.getAttribute("href")!)).toContain("https://x.test/g/invite");
    expect(
      screen.getByRole("link", { name: /Entrar no grupo como participante/ }).getAttribute("href")
    ).toBe("https://x.test/g/invite");
    expect(screen.getByText(/Atenção: seu link de organizador/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copiar convite" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Salvar no meu WhatsApp" })).toBeTruthy();
  });

  it("server failure keeps the requestId for the retry and shows the message", async () => {
    const action = vi.fn().mockResolvedValue({ ok: false, message: GROUP_MESSAGES.conflict });
    render(<CreateGroupForm action={action} />);
    fill();
    submit();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("conflitam"));
    expect(window.sessionStorage.getItem(KEY)).toBeTruthy();
  });
});
