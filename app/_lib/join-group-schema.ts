import { z } from "zod";
import { JOIN_MESSAGES } from "./join-messages";

/** Shared by the client form and the server action (PAR-01 / CONTRATOS.md). */
export const joinGroupFormSchema = z.object({
  inviteToken: z.string().trim().min(1).max(200),
  displayName: z
    .string()
    .trim()
    .min(1, JOIN_MESSAGES.nameRequired)
    .max(40, JOIN_MESSAGES.nameTooLong)
    .refine((value) => !/[<>]/.test(value), JOIN_MESSAGES.nameHtml),
});

export type JoinGroupFormInput = z.infer<typeof joinGroupFormSchema>;
export type JoinFieldErrors = Partial<Record<"displayName", string>>;

export type JoinValidationResult =
  { ok: true; data: JoinGroupFormInput } | { ok: false; errors: JoinFieldErrors };

export function validateJoinGroup(input: {
  inviteToken: string;
  displayName: string;
}): JoinValidationResult {
  const parsed = joinGroupFormSchema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors: JoinFieldErrors = {};
  for (const issue of parsed.error.issues) {
    if (issue.path[0] === "displayName" && !errors.displayName) {
      errors.displayName = issue.message;
    }
  }
  return { ok: false, errors };
}
