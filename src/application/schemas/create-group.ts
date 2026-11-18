import { z } from "zod";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Input validation schema for the `create-group` use case (RF01, HU01).
 * Validates group name (1–60 chars), maxValueCents (> 0 integer),
 * exchangeDate (YYYY-MM-DD valid calendar date), location (optional ≤ 120 chars),
 * and client-generated requestId (strict UUID v4 for idempotency).
 */
export const createGroupInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome para o grupo entre 1 e 60 caracteres.")
    .max(60, "Informe um nome para o grupo entre 1 e 60 caracteres.")
    .refine((value) => !/[<>]/.test(value), "Escreva o nome sem HTML."),
  maxValueCents: z
    .number()
    .int("O valor do presente deve ser um número inteiro de centavos.")
    .positive("O valor do presente deve ser maior que zero."),
  exchangeDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "A data da troca de presentes deve estar no formato YYYY-MM-DD.")
    .refine(isValidCalendarDate, "A data da troca de presentes deve ser uma data válida do calendário."),
  location: z
    .string()
    .trim()
    .max(120, "O local da troca deve ter no máximo 120 caracteres.")
    .nullish()
    .transform((val) => (val && val.length > 0 ? val : null)),
  requestId: z
    .string()
    .regex(UUID_V4_REGEX, "Identificador de requisição deve ser um UUID v4 válido."),
});

export type CreateGroupInput = z.infer<typeof createGroupInputSchema>;
