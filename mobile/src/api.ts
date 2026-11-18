const previews = {
  home: {
    title: "Meus grupos", // APP-01
    message:
      "Você ainda não tem grupos neste aparelho. Crie um grupo ou abra um convite que recebeu.", // APP-02
  },
  create: {
    title: "Criar grupo", // HOM-09
    message: "Em breve, você poderá criar um grupo pelo app.", // APP-19
  },
  invitation: {
    title: "Você foi convidado", // CNV-01
    message: "Em breve, você poderá entrar no grupo por aqui.", // APP-20
  },
  participant: {
    title: "Área do participante", // APP-21
    message: "Em breve, você poderá ver quem tirou e editar sua lista de desejos aqui.", // APP-22
  },
  organizer: {
    title: "Painel do organizador", // ADM-01
    message: "Em breve, você poderá organizar seu grupo por aqui.", // APP-23
  },
  missing: {
    title: "Página não encontrada", // GLB-05
    message: "Confira o endereço ou volte a Meus grupos.", // APP-24
  },
} as const;

export type Section = keyof typeof previews;
export type ScreenPreview = { title: string; message: string };

// Temporary preview contract until APP-API-01.
export interface PreviewClient {
  getScreen(section: Section): ScreenPreview;
}

export const mockApi: PreviewClient = {
  getScreen: (section) => previews[section],
};
