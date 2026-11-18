import type { GroupDetails } from "./contract";
import { formatDate, formatValue } from "./ui";

// WPP-01
export function invitationMessage(group: GroupDetails, url: string) {
  return [
    `Oi! Criei um amigo secreto no Papelzinho: *${group.name}* 🎁`,
    "",
    `Data do encontro: ${formatDate(group.exchangeDate)}`,
    `Valor máximo: ${formatValue(group.maxValueCents)}`,
    ...(group.location ? [`Local do encontro: ${group.location}`] : []),
    "",
    "Entre pelo link, só com o seu nome:",
    url,
  ].join("\n");
}

// WPP-04
export function drawMessage(group: GroupDetails) {
  return `O sorteio do amigo secreto *${group.name}* foi feito! 🎁\n\nAbra o link pessoal que você salvou ao entrar para ver quem você tirou. Não conte para ninguém!\n\nData do encontro: ${formatDate(group.exchangeDate)}`;
}
