import { copy } from "./copy";

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
    copy.WPP_01.intro(details.name),
    "",
    `${copy.WPP_01.date}: ${formatDateBr(details.exchangeDate)}`,
    `${copy.WPP_01.value}: R$ ${formatBrl(details.maxValueCents)}`,
    ...(details.location ? [`${copy.WPP_01.location}: ${details.location}`] : []),
    "",
    copy.WPP_01.action,
    inviteUrl,
  ].join("\n");
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildAdminMessage(adminUrl: string): string {
  return `${copy.WPP_03}\n${adminUrl}`;
}

/** Message for saving the personal link (docs/features/participantes.md §2). */
export function buildPersonalLinkMessage(personalUrl: string): string {
  return `${copy.WPP_02}\n${personalUrl}`;
}
/** Message template for announcing the completed draw (docs/features/textos.md §8, WPP-04). */
export function buildDrawNoticeMessage(
  details: Pick<ShareDetails, "name" | "exchangeDate">
): string {
  return [
    copy.WPP_04.title(details.name),
    "",
    copy.WPP_04.text,
    "",
    `${copy.WPP_04.date}: ${formatDateBr(details.exchangeDate)}`,
  ].join("\n");
}
