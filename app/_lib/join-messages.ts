/** User-facing copy from docs/features/participantes.md. */
export const JOIN_MESSAGES = {
  nameRequired: "Informe como você se chama.",
  nameTooLong: "Use no máximo 40 caracteres.",
  nameHtml: "Escreva o nome sem HTML.",
  invalidLink: "Este link é inválido ou não está mais disponível.",
  invalidPersonal:
    "Este link é inválido ou não está mais disponível. Peça um novo link ao organizador.",
  groupClosed: "O sorteio já foi realizado. As entradas estão encerradas.",
  groupFull: "Este grupo já está completo (100 pessoas).",
  rateLimited: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  generic: "Não foi possível entrar no grupo agora. Tente de novo em instantes.",
  personalHint:
    "Guarde este link. É por ele que você verá quem tirou e a sua lista. Não compartilhe.",
  continueAs: (name: string) => `Continuar como ${name}`,
  enterOther: "Entrar com outro nome",
  needPersonalLink: "Abra o seu link pessoal para acessar esta área.",
} as const;
