import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyField } from "@/app/_components/CopyField";
import { PersonalLink } from "@/app/_components/PersonalLink";

afterEach(() => vi.restoreAllMocks());

describe("link actions", () => {
  it("announces a successful copy in the button", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<CopyField label="Link pessoal" value="https://example.com/p" copyLabel="Copiar" />);
    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "✓ Link copiado!" }).textContent).toBe(
        "✓ Link copiado!"
      )
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/p");
  });
  it("selects the link when copying fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error()) },
    });
    render(<CopyField label="Link pessoal" value="https://example.com/p" copyLabel="Copiar" />);
    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    const input = screen.getByLabelText("Link pessoal") as HTMLInputElement;
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });
  it("gives the personal area the primary action", () => {
    render(<PersonalLink displayName="Ana" personalUrl="https://example.com/p" groupId="grupo" />);
    expect(screen.getByRole("link", { name: "Ir para a minha área" }).className).toContain(
      "bg-primary text-white"
    );
    expect(screen.getByRole("link", { name: "Salvar no WhatsApp" }).className).toContain(
      "bg-primary-soft"
    );
  });
});
