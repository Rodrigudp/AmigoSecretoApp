import { z } from "zod";

/**
 * Input schema for the `join-group` use case (RF03).
 * Name: 1-40 characters after trim, plain text (no HTML markup),
 * matching PAR-01 and CONTRATOS.md.
 */
export const joinGroupInputSchema = z.object({
  inviteToken: z.string().trim().min(1).max(200),
  displayName: z
    .string()
    .trim()
    .min(1, "Informe como você se chama.")
    .max(40, "Use no máximo 40 caracteres.")
    .refine((value) => !/[<>]/.test(value), "Escreva o nome sem HTML."),
});

export type JoinGroupInput = z.infer<typeof joinGroupInputSchema>;
