import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishList } from "@/app/_components/WishList";
import { WishItem } from "@/app/_components/WishItem";
import { WishForm } from "@/app/_components/WishForm";
import type { WishItem as WishItemType } from "@/src/application/ports";

const sampleItem1: WishItemType = {
  id: "item-1",
  title: "Livro de culinária",
  url: "https://www.amazon.com.br/dp/123",
  note: "Edição capa dura",
  productLink: {
    href: "https://www.amazon.com.br/dp/123?tag=test-20",
    affiliate: true,
    store: "amazon",
  },
};

const sampleItem2: WishItemType = {
  id: "item-2",
  title: "Camiseta preta",
  url: null,
  note: null,
  productLink: null,
};

describe("WishList Component", () => {
  it("renders empty state (E2) with add button", () => {
    render(<WishList mode="owner" initialItems={[]} />);
    expect(screen.getByRole("heading", { name: "Lista de desejos" })).toBeTruthy();
    expect(screen.getByText("0 de 20 presentes")).toBeTruthy();
    expect(
      screen.getByText("Sua lista está vazia. Adicione ideias de presente para quem tirar você.")
    ).toBeTruthy();
    const addBtn = screen.getByRole("button", { name: "Adicionar presente" });
    expect(addBtn).toBeTruthy();
    expect((addBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it("renders items with counter and affiliate badge (E3)", () => {
    render(<WishList mode="owner" initialItems={[sampleItem1, sampleItem2]} />);
    expect(screen.getByText("2 de 20 presentes")).toBeTruthy();
    expect(screen.getByText("Livro de culinária")).toBeTruthy();
    expect(screen.getByText("Edição capa dura")).toBeTruthy();
    expect(screen.getByText("Camiseta preta")).toBeTruthy();
    expect(screen.getByText("Link de afiliado · amazon.com.br")).toBeTruthy();
    expect(screen.getByText(/Como participante do Programa de Associados da Amazon/)).toBeTruthy();
  });

  it("opens inline new form (E4) and hides add button", () => {
    render(<WishList mode="owner" initialItems={[sampleItem1]} />);
    const addBtn = screen.getByRole("button", { name: "Adicionar presente" });
    fireEvent.click(addBtn);

    expect(screen.getByRole("heading", { name: "Novo presente" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Adicionar presente" })).toBeNull();
  });

  it("validates form fields and shows field errors (E6)", async () => {
    const handleSave = vi.fn();
    render(<WishForm onSave={handleSave} onCancel={vi.fn()} />);

    const saveBtn = screen.getByRole("button", { name: "Salvar presente" });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/Escreva o nome do presente/)).toBeTruthy();
    expect(handleSave).not.toHaveBeenCalled();

    // Invalid url
    const urlInput = screen.getByLabelText(/Link da loja/);
    fireEvent.change(urlInput, { target: { value: "http://insecure.com" } });
    fireEvent.click(saveBtn);
    expect(
      screen.getByText(/Use um link que comece com https:\/\//)
    ).toBeTruthy();
  });

  it("shows limit reached state when count is 20 (E9)", () => {
    const items20: WishItemType[] = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      title: `Presente ${i + 1}`,
      url: null,
      note: null,
      productLink: null,
    }));

    render(<WishList mode="owner" initialItems={items20} />);
    expect(screen.getByText("20 de 20 presentes")).toBeTruthy();
    const addBtn = screen.getByRole("button", { name: "Adicionar presente" });
    expect((addBtn as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.getByText("Você chegou a 20 presentes. Apague um para adicionar outro.")
    ).toBeTruthy();
  });

  it("renders reader mode correctly (E11)", () => {
    render(<WishList mode="reader" recipientName="Carlos" initialItems={[sampleItem1]} />);
    expect(screen.getByRole("heading", { name: "Lista de desejos de Carlos" })).toBeTruthy();
    expect(screen.getByText("Livro de culinária")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Adicionar presente" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Apagar" })).toBeNull();
    expect(screen.getByRole("link", { name: "Ver na loja" })).toBeTruthy();
  });

  it("shows reader empty state when recipient has no items (E11)", () => {
    render(<WishList mode="reader" recipientName="Carlos" initialItems={[]} />);
    expect(screen.getByText("Esta pessoa ainda não adicionou desejos.")).toBeTruthy();
  });
});

describe("WishItem Component", () => {
  it("renders delete confirmation inline with cancel focus (E8)", async () => {
    const handleDelete = vi.fn();
    render(<WishItem item={sampleItem1} mode="owner" onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole("button", { name: "Apagar Livro de culinária" });
    fireEvent.click(deleteBtn);

    expect(
      screen.getByText(/Apagar.*Livro de culinária.*Não dá para desfazer/)
    ).toBeTruthy();
    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    const confirmBtn = screen.getByRole("button", { name: "Sim, apagar" });

    expect(cancelBtn).toBeTruthy();
    expect(confirmBtn).toBeTruthy();

    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith(sampleItem1.id);
    });
  });
});
