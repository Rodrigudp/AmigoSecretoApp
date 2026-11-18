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
    expect(screen.getByText("até R$ 50,00")).toBeTruthy();
    expect(screen.getByText("Casa da avó")).toBeTruthy();
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
});
