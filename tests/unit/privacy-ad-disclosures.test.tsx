import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacidadePage from "../../app/privacidade/page";

describe("privacy disclosures (MON-01b)", () => {
  it("covers ad technologies, opt-out choices, single ad provider, and DPO exemption", () => {
    render(<PrivacidadePage />);

    // 1. Technologies and ad personalization disclosures
    expect(screen.getByText(/web beacons/i).textContent).toContain("endereço IP");
    expect(screen.getByText(/web beacons/i).textContent).toContain("visitas anteriores");

    // 2. Ad choices links and footer revocation
    const googleOptOut = screen.getByRole("link", { name: "Configurações de anúncios do Google" });
    expect(googleOptOut.getAttribute("href")).toBe("https://adssettings.google.com");
    expect(googleOptOut.getAttribute("target")).toBe("_blank");

    const aboutAdsOptOut = screen.getByRole("link", { name: "Opções de publicidade da AboutAds" });
    expect(aboutAdsOptOut.getAttribute("href")).toBe("https://www.aboutads.info");
    expect(aboutAdsOptOut.getAttribute("target")).toBe("_blank");

    expect(screen.getByText(/revogar sua escolha/i).textContent).toContain("Cookies no rodapé");

    // 3. AdSense as sole provider
    expect(screen.getByText(/único fornecedor de anúncios/i).textContent).toContain(
      "não usamos outras redes de anúncios"
    );

    // 4. Controller contact and DPO exemption under Resolução CD/ANPD nº 2/2022
    expect(screen.getByText(/dispensado de indicar encarregado/i).textContent).toContain(
      "suporte@papelzinho.app"
    );
    expect(screen.getByText(/dispensado de indicar encarregado/i).textContent).toContain(
      "Resolução CD/ANPD nº 2/2022"
    );
  });
});
