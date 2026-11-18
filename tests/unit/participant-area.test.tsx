import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParticipantArea } from "@/app/_components/ParticipantArea";
import type { ParticipantView } from "@/src/application/ports";

const view: ParticipantView = {
  displayName: "Ana",
  group: {
    name: "Família",
    exchangeDate: "2026-12-24",
    maxValueCents: 5000,
    location: "Casa da avó",
    status: "open",
  },
  ownWishItems: [],
};

describe("participant group details", () => {
  it("shows date, value and location", () => {
    render(<ParticipantArea view={view} adsAllowed={true} />);
    expect(screen.getByText("24/12/2026")).toBeTruthy();
    expect(screen.getByText("Valor máximo")).toBeTruthy();
    expect(screen.getByText("até R$ 50,00")).toBeTruthy();
    expect(screen.getByText("Casa da avó")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Adicionar presente" }) as HTMLButtonElement).disabled
    ).toBe(false);
  });
  it("omits a location when absent and keeps ads disabled in fallback", () => {
    const { container } = render(
      <ParticipantArea
        view={{ ...view, group: { ...view.group, location: null } }}
        adsAllowed={false}
      />
    );
    expect(screen.queryByText("Local")).toBeNull();
    expect(container.querySelector('[data-ads-allowed="false"]')).toBeTruthy();
  });
  it("renders RevealCard closed after the draw without serializing any pair or accessToken", () => {
    const { container } = render(
      <ParticipantArea
        view={{ ...view, group: { ...view.group, status: "drawn" } }}
        adsAllowed={true}
        groupId="grp-123"
      />
    );
    expect(screen.getByRole("heading", { name: "Lista de desejos" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Seu amigo secreto" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Revelar meu amigo secreto" })).toBeTruthy();
    expect(container.innerHTML).not.toContain("accessToken");
    expect(
      (screen.getByRole("button", { name: "Adicionar presente" }) as HTMLButtonElement).disabled
    ).toBe(false);
  });
});
