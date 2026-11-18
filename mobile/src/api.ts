const previews = {
  home: {
    title: "Amigo secreto",
    message: "Abra um link do Papelzinho para acessar seu grupo no app.",
  },
  invitation: {
    title: "Convite do grupo",
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
  missing: { title: "Página não encontrada", message: "Confira o endereço ou volte ao início." },
} as const;

export type Section = keyof typeof previews;

export interface ScreenPreview {
  title: string;
  message: string;
}

// Contrato local de prévia. A integração HTTP aguarda o APP-API-01.
export interface PreviewClient {
  getScreen(section: Section): ScreenPreview;
}

export const mockApi: PreviewClient = {
  getScreen: (section) => previews[section],
};
