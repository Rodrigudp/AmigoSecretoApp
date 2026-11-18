import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishList } from "@/app/_components/WishList";
import { WishItem } from "@/app/_components/WishItem";
import { WishForm } from "@/app/_components/WishForm";
import type { WishItem as WishItemType } from "@/src/application/ports";

vi.mock("@/app/wish-actions", () => ({
  addWishItemAction: vi.fn(),
  updateWishItemAction: vi.fn(),
  removeWishItemAction: vi.fn(),
}));

vi.mock("@/app/wish-actions-cookie", () => ({
  addWishItemCookieAction: vi.fn(),
  updateWishItemCookieAction: vi.fn(),
  removeWishItemCookieAction: vi.fn(),
}));

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

    // Invalid url on blur
    const urlInput = screen.getByLabelText(/Link da loja/);
    fireEvent.change(urlInput, { target: { value: "http://insecure.com" } });
    fireEvent.blur(urlInput);
    expect(screen.getByText(/Use um link que comece com https:\/\//)).toBeTruthy();

    fireEvent.click(saveBtn);
    expect(screen.getByText(/Use um link que comece com https:\/\//)).toBeTruthy();
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

  it("retries failed action when clicking 'Tentar de novo' (E10)", async () => {
    const { addWishItemAction } = await import("@/app/wish-actions");
    const mockAdd = vi.mocked(addWishItemAction);
    mockAdd
      .mockResolvedValueOnce({ ok: false, message: "Erro de rede ao salvar" })
      .mockResolvedValueOnce({
        ok: true,
        output: {
          item: {
            id: "new-item",
            title: "Tênis esportivo",
            url: null,
            note: null,
            productLink: null,
          },
          warning: null,
        },
      });

    render(<WishList mode="owner" accessToken="valid-token" initialItems={[]} />);
    const addBtn = screen.getByRole("button", { name: "Adicionar presente" });
    fireEvent.click(addBtn);

    const titleInput = screen.getByLabelText(/Nome do presente/);
    fireEvent.change(titleInput, { target: { value: "Tênis esportivo" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar presente" }));

    await waitFor(() => {
      expect(screen.getByText("Erro de rede ao salvar")).toBeTruthy();
    });

    const retryBtn = screen.getByRole("button", { name: "Tentar de novo" });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledTimes(2);
      expect(screen.getByText("Tênis esportivo")).toBeTruthy();
      expect(screen.queryByText("Erro de rede ao salvar")).toBeNull();
    });
  });

  it("returns focus to add button when canceling new form", async () => {
    render(<WishList mode="owner" initialItems={[]} />);
    const addBtn = screen.getByRole("button", { name: "Adicionar presente" });
    fireEvent.click(addBtn);

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(document.activeElement?.id).toBe("wishlist-add-btn");
    });
  });

  it("uses cookie-based action when groupId is provided (BUG-SEC)", async () => {
    const { addWishItemCookieAction } = await import("@/app/wish-actions-cookie");
    const mockCookieAdd = vi.mocked(addWishItemCookieAction);
    mockCookieAdd.mockResolvedValueOnce({
      ok: true,
      output: {
        item: {
          id: "cookie-item",
          title: "Item via cookie",
          url: null,
          note: null,
          productLink: null,
        },
        warning: null,
      },
    });

    render(<WishList mode="owner" groupId="group-123" initialItems={[]} />);
    const addBtn = screen.getByRole("button", { name: "Adicionar presente" });
    fireEvent.click(addBtn);

    const titleInput = screen.getByLabelText(/Nome do presente/);
    fireEvent.change(titleInput, { target: { value: "Item via cookie" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar presente" }));

    await waitFor(() => {
      expect(mockCookieAdd).toHaveBeenCalledWith(
        "group-123",
        expect.objectContaining({
          title: "Item via cookie",
        })
      );
      expect(screen.getByText("Item via cookie")).toBeTruthy();
    });
  });
});

describe("WishItem Component", () => {
  it("renders delete confirmation inline with cancel focus (E8)", async () => {
    const handleDelete = vi.fn();
    render(<WishItem item={sampleItem1} mode="owner" onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole("button", { name: "Apagar Livro de culinária" });
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/Apagar.*Livro de culinária.*Não dá para desfazer/)).toBeTruthy();
    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    const confirmBtn = screen.getByRole("button", { name: "Sim, apagar" });

    expect(cancelBtn).toBeTruthy();
    expect(confirmBtn).toBeTruthy();

    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith(sampleItem1.id);
    });
  });

  it("exibe link direto da loja com tag de associado Amazon e nunca rota /r/ (D2)", () => {
    const amazonItem: WishItemType = {
      id: "amazon-item-1",
      title: "Kindle Paperwhite",
      url: "https://www.amazon.com.br/dp/B08N5WRWNW",
      note: "Cor preta",
      productLink: {
        href: "https://www.amazon.com.br/dp/B08N5WRWNW?tag=papelzinho20-20",
        affiliate: true,
        store: "amazon",
      },
    };

    render(<WishItem item={amazonItem} mode="owner" />);

    const storeLink = screen.getByRole("link", { name: "Ver na loja" });
    expect(storeLink.getAttribute("href")).toBe(
      "https://www.amazon.com.br/dp/B08N5WRWNW?tag=papelzinho20-20"
    );
    expect(storeLink.getAttribute("href")).not.toContain("/r/");
  });
});
