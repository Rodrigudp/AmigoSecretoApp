export type ShareDetails = {
  name: string;
  maxValueCents: number;
  exchangeDate: string;
  location: string | null;
};

/** "2026-12-24" -> "24/12/2026" */
export function formatDateBr(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function formatBrl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Message template from docs/features/grupos.md §3.1. */
export function buildInviteMessage(details: ShareDetails, inviteUrl: string): string {
  return [
    `Oi pessoal! Criei nosso grupo de Amigo Secreto: *${details.name}*! 🎁🎄`,
    "",
    `Data da troca: ${formatDateBr(details.exchangeDate)}`,
    `Valor sugerido: até R$ ${formatBrl(details.maxValueCents)}`,
    `Local: ${details.location ?? "Não informado"}`,
    "",
    "Toque no link abaixo para entrar só com seu nome e montar sua lista de desejos:",
    inviteUrl,
  ].join("\n");
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildAdminMessage(adminUrl: string): string {
  return `Meu link de organizador do Amigo Secreto (guarde, não compartilhe):\n${adminUrl}`;
}

/** Message for saving the personal link (docs/features/participantes.md §2). */
export function buildPersonalLinkMessage(personalUrl: string): string {
  return `Meu link pessoal do Amigo Secreto (guarde, não compartilhe):\n${personalUrl}`;
}
