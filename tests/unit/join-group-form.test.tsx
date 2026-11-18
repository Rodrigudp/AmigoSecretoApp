import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { JoinGroupForm } from "@/app/_components/JoinGroupForm";
import { JOIN_MESSAGES } from "@/app/_lib/join-messages";

afterEach(cleanup);

const submit = () => fireEvent.click(screen.getByRole("button", { name: /^Entrar no grupo$/ }));

describe("JoinGroupForm", () => {
  it("empty state: shows the name field and no errors", () => {
    render(
      <JoinGroupForm
        inviteToken="invite-abc"
        groupName="Família"
        resumeName={null}
        resumeHref={null}
        action={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Como você se chama/)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("error state: blocks submit and marks the field aria-invalid", () => {
    const action = vi.fn();
    render(
      <JoinGroupForm
        inviteToken="invite-abc"
        groupName="Família"
        resumeName={null}
        resumeHref={null}
        action={action}
      />
    );
    submit();
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByText(JOIN_MESSAGES.nameRequired)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/Como você se chama/));
    expect(screen.getByLabelText(/Como você se chama/).getAttribute("aria-invalid")).toBe("true");
  });

  it("loading state: disables the button and ignores a second click", async () => {
    let resolve: (v: never) => void = () => {};
    const action = vi.fn(() => new Promise((r) => (resolve = r as typeof resolve)));
    render(
      <JoinGroupForm
        inviteToken="invite-abc"
        groupName="Família"
        resumeName={null}
        resumeHref={null}
        action={action as never}
      />
    );
    fireEvent.change(screen.getByLabelText(/Como você se chama/), { target: { value: "Ana" } });
    submit();
    const busy = (await screen.findByRole("button", { name: /Entrando/ })) as HTMLButtonElement;
    expect(busy.disabled).toBe(true);
    expect(busy.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(busy);
    expect(action).toHaveBeenCalledTimes(1);
    resolve({ ok: false, message: "x" } as never);
  });

  it("success state: shows the personal link with copy and WhatsApp", async () => {
    const action = vi.fn().mockResolvedValue({
      ok: true,
      displayName: "Ana",
      personalUrl: "https://x.test/p/token-abc",
      groupId: "group-1",
    });
    render(
      <JoinGroupForm
        inviteToken="invite-abc"
        groupName="Família"
        resumeName={null}
        resumeHref={null}
        action={action}
      />
    );
    fireEvent.change(screen.getByLabelText(/Como você se chama/), { target: { value: "Ana" } });
    submit();
    await screen.findByText(/Você entrou, Ana\./);
    expect(screen.getByText(JOIN_MESSAGES.personalHint)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copiar link" })).toBeTruthy();
    const wa = screen.getByRole("link", { name: "Salvar no WhatsApp" });
    expect(wa.getAttribute("href")).toContain("https://wa.me/?text=");
    expect(decodeURIComponent(wa.getAttribute("href")!)).toContain("https://x.test/p/token-abc");
    // BUG-007: area link always uses the personal link (cookie is HttpOnly).
    expect(screen.getByRole("link", { name: "Ir para a minha área" }).getAttribute("href")).toBe(
      "https://x.test/p/token-abc"
    );
  });

  it("server failure shows the message and keeps the form", async () => {
    const action = vi.fn().mockResolvedValue({ ok: false, message: JOIN_MESSAGES.groupFull });
    render(
      <JoinGroupForm
        inviteToken="invite-abc"
        groupName="Família"
        resumeName={null}
        resumeHref={null}
        action={action}
      />
    );
    fireEvent.change(screen.getByLabelText(/Como você se chama/), { target: { value: "Ana" } });
    submit();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("completo"));
    expect(screen.getByLabelText(/Como você se chama/)).toBeTruthy();
  });

  it("resume state: offers Continuar como and Entrar com outro nome", () => {
    render(
      <JoinGroupForm
        inviteToken="invite-abc"
        groupName="Família"
        resumeName="Ana"
        resumeHref="/p/token-abc"
        action={vi.fn()}
      />
    );
    expect(screen.getByRole("link", { name: "Continuar como Ana" }).getAttribute("href")).toBe(
      "/p/token-abc"
    );
    fireEvent.click(screen.getByRole("button", { name: JOIN_MESSAGES.enterOther }));
    expect(screen.getByLabelText(/Como você se chama/)).toBeTruthy();
  });
});
