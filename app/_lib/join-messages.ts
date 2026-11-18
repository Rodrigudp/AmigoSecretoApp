import { copy } from "./copy";

export const JOIN_MESSAGES = {
  nameRequired: copy.CNV_07,
  nameTooLong: copy.CNV_08,
  nameHtml: copy.CNV_09,
  invalidLink: copy.CNV_10.text,
  invalidPersonal: copy.ARE_06.text,
  groupClosed: copy.CNV_11,
  groupFull: copy.CNV_12,
  rateLimited: copy.GLB_09,
  generic: copy.CNV_13,
  personalHint: copy.PES_02,
  continueAs: copy.CNV_05.resume,
  enterOther: copy.CNV_05.other,
  needPersonalLink: copy.ARE_07,
} as const;
