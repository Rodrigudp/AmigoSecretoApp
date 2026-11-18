import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacidadePage from "../../app/privacidade/page";
import TermosPage from "../../app/termos/page";

describe("mobile app privacy disclosures (APP-LEG-01)", () => {
  it("covers local SecureStore storage and local wishlist copy in /privacidade", () => {
    render(<PrivacidadePage />);

    // SecureStore and local wishlist copy
    const secureStoreLabel = screen.getByText(/armazenamento no aparelho \(SecureStore\):/i);
    expect(secureStoreLabel).toBeDefined();
    const parentLi = secureStoreLabel.closest("li");
    expect(parentLi?.textContent).toContain("SecureStore");
    expect(parentLi?.textContent).toContain("cópia local da sua própria lista de desejos");
  });

  it("covers push notification permissions, ExpoPushToken, metadata and LGPD legal basis", () => {
    render(<PrivacidadePage />);

    // Push notifications, ExpoPushToken, and lack of PII in notification
    const pushLabel = screen.getByText(/notificações push opcionais:/i);
    const pushLi = pushLabel.closest("li");
    expect(pushLi?.textContent).toContain("ExpoPushToken");
    expect(pushLi?.textContent).toContain("iOS ou Android");
    expect(pushLi?.textContent).toContain("Não enviamos nome de pessoas, grupos ou resultados");

    // LGPD legal basis (art. 7º, I e V)
    const lgpdLabel = screen.getByText(/base legal \(LGPD\):/i);
    const lgpdLi = lgpdLabel.closest("li");
    expect(lgpdLi?.textContent).toContain("consentimento");
    expect(lgpdLi?.textContent).toContain("execução do serviço solicitado pelo titular");
    expect(lgpdLi?.textContent).toContain("art. 7º, incisos I e V da LGPD");
  });

  it("covers push token deletion and retention rules", () => {
    render(<PrivacidadePage />);

    // Deletion when deactivated, participant removed, or 60 days
    const deletionLabel = screen.getByText(/exclusão dos dados de notificação:/i);
    const deletionLi = deletionLabel.closest("li");
    expect(deletionLi?.textContent).toContain("quando você desativa as notificações no aparelho");
    expect(deletionLi?.textContent).toContain("quando você sai ou é removido do grupo");
    expect(deletionLi?.textContent).toContain("60 dias após a data do encontro");
  });

  it("covers mobile app v1 without ads and without affiliate links", () => {
    render(<PrivacidadePage />);

    // App v1 no ads and no affiliate links
    const v1Label = screen.getByText(/versão 1 sem anúncios nem afiliados:/i);
    const v1Li = v1Label.closest("li");
    expect(v1Li?.textContent).toContain("não exibe anúncios publicitários");
    expect(v1Li?.textContent).toContain("não utiliza links de afiliado");
    expect(v1Li?.textContent).toContain("navegador externo do aparelho");
  });

  it("lists Expo as third-party processor for push notifications", () => {
    render(<PrivacidadePage />);

    const expoLabel = screen.getByText(/expo \(notificações push do aplicativo móvel\):/i);
    const expoLi = expoLabel.closest("li");
    expect(expoLi?.textContent).toContain("Expo");
    expect(expoLi?.textContent).toContain("Pode haver transferência internacional");
  });

  it("covers mobile app rules in /termos", () => {
    render(<TermosPage />);

    const appTermLabel = screen.getByText("Aplicativo móvel.");
    const appTermLi = appTermLabel.closest("li");
    expect(appTermLi?.textContent).toContain("versão 1 do aplicativo não exibe anúncios nem links de afiliado");
    expect(appTermLi?.textContent).toContain("Notificações no aplicativo são opcionais");
  });
});
