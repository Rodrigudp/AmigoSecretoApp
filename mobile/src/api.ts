const previews = {
  home: {
    title: "Meus grupos", // APP-01
    message:
      "Você ainda não tem grupos neste aparelho. Crie um grupo ou abra um convite que recebeu.", // APP-02
  },
  create: { title: "Criar grupo", message: "Em breve, você poderá criar um grupo pelo app." },
  invitation: {
    title: "Você foi convidado",
    message: "Em breve, você poderá entrar no grupo por aqui.",
  },
  participant: {
    title: "Área do participante",
    message: "Em breve, você poderá acompanhar seu amigo secreto por aqui.",
  },
  organizer: {
    title: "Painel do organizador",
    message: "Em breve, você poderá organizar seu grupo por aqui.",
  },
  missing: {
    title: "Página não encontrada",
    message: "Confira o endereço ou volte a Meus grupos.",
  },
} as const;

export type Section = keyof typeof previews;

export interface ScreenPreview {
  title: string;
  message: string;
}

// Temporary preview contract until APP-API-01.
export interface PreviewClient {
  getScreen(section: Section): ScreenPreview;
}

export const mockApi: PreviewClient = {
  getScreen: (section) => previews[section],
};
