import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacidadePage from "../../app/privacidade/page";
import TermosPage from "../../app/termos/page";

describe("mobile app privacy disclosures (APP-LEG-01)", () => {
  it("covers local SecureStore storage and local wishlist copy in /privacidade", () => {
    render(<PrivacidadePage />);

    // SecureStore and local wishlist copy (LEG-APP-01)
    const secureStoreLabel = screen.getByText(/armazenamento no aparelho:/i);
    expect(secureStoreLabel).toBeDefined();
    const parentLi = secureStoreLabel.closest("li");
    expect(parentLi?.textContent).toContain("SecureStore");
    expect(parentLi?.textContent).toContain("cópia local da sua própria lista de desejos");
    expect(parentLi?.textContent).toContain("sem internet");
  });

  it("covers push notification permissions, ExpoPushToken, metadata and LGPD legal basis", () => {
    render(<PrivacidadePage />);

    // Push notifications, ExpoPushToken, and lack of PII in notification (LEG-APP-02)
    const pushLabel = screen.getByText(/notificações push opcionais:/i);
    const pushLi = pushLabel.closest("li");
    expect(pushLi?.textContent).toContain("ExpoPushToken");
    expect(pushLi?.textContent).toContain("iOS ou Android");
    expect(pushLi?.textContent).toContain("dados operacionais de entrega");
    expect(pushLi?.textContent).toContain("O texto exibido não inclui nomes, local nem resultado do sorteio");

    // LGPD legal basis (art. 7º, I e V) (LEG-APP-03)
    const lgpdLabel = screen.getByText(/base legal \(LGPD\):/i);
    const lgpdLi = lgpdLabel.closest("li");
    expect(lgpdLi?.textContent).toContain("consentimento");
    expect(lgpdLi?.textContent).toContain("execução do serviço solicitado pelo titular");
    expect(lgpdLi?.textContent).toContain("art. 7º, incisos I e V da LGPD");
  });

  it("covers push token deletion and retention rules", () => {
    render(<PrivacidadePage />);

    // Deletion when deactivated, participant removed, or 60 days (LEG-APP-04)
    const deletionLabel = screen.getByText(/exclusão dos dados de notificação:/i);
    const deletionLi = deletionLabel.closest("li");
    expect(deletionLi?.textContent).toContain(
      "silenciar avisos nos ajustes do aparelho apenas interrompe a exibição na tela sem apagar nada no servidor"
    );
    expect(deletionLi?.textContent).toContain(
      "use a opção 'Desativar avisos' na área pessoal"
    );
    expect(deletionLi?.textContent).toContain(
      "quando apagamos os dados do grupo 60 dias após o encontro"
    );
  });

  it("covers mobile app v1 without ads and without affiliate links", () => {
    render(<PrivacidadePage />);

    // App v1 no ads and no affiliate links (LEG-APP-05)
    const v1Label = screen.getByText(/versão 1 sem anúncios nem afiliados:/i);
    const v1Li = v1Label.closest("li");
    expect(v1Li?.textContent).toContain("não exibe anúncios publicitários");
    expect(v1Li?.textContent).toContain("não utiliza links de afiliado");
    expect(v1Li?.textContent).toContain("navegador externo do aparelho");
  });

  it("lists Expo as third-party processor for push notifications", () => {
    render(<PrivacidadePage />);

    // Expo delivery technical data and no personal details in payload (LEG-APP-07)
    const expoLabel = screen.getByText(/expo \(notificações push do aplicativo móvel\):/i);
    const expoLi = expoLabel.closest("li");
    expect(expoLi?.textContent).toContain("Expo");
    expect(expoLi?.textContent).toContain("dados técnicos de entrega");
    expect(expoLi?.textContent).toContain("O texto exibido não inclui nomes, local nem resultado do sorteio");
    expect(expoLi?.textContent).toContain("Pode haver transferência internacional");
  });

  it("covers mobile app rules in /termos", () => {
    render(<TermosPage />);

    // Termos mobile app and permission (LEG-APP-06)
    const appTermLabel = screen.getByText("Aplicativo móvel.");
    const appTermLi = appTermLabel.closest("li");
    expect(appTermLi?.textContent).toContain(
      "versão 1 do aplicativo não exibe anúncios nem links de afiliado"
    );
    expect(appTermLi?.textContent).toContain("dependem da sua permissão no sistema do aparelho");
  });
});
