import { z } from "zod";

// Shared by the client form (fast feedback) and the server action (authoritative check).
// Messages come from docs/features/grupos.md §5.
export const GROUP_MESSAGES = {
  name: "Informe um nome para o grupo entre 1 e 60 caracteres.",
  maxValue: "O valor do presente deve ser maior que zero.",
  exchangeDate: "A data da troca de presentes deve ser uma data futura.",
  location: "O local da troca deve ter no máximo 120 caracteres.",
  conflict:
    "Os dados enviados conflitam com uma criação anterior. Recarregue a página para criar um novo grupo.",
  rateLimited: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  generic: "Não foi possível criar o grupo agora. Confira os dados e tente de novo.",
} as const;

/** "50", "50,5", "R$ 1.250,50" -> cents; null when it is not a number. */
export function parseMoneyToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!/\d/.test(cleaned)) return null;
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

/** Today's calendar date (YYYY-MM-DD) in America/Sao_Paulo. */
export function todayInSaoPaulo(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

const isFutureDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && value > todayInSaoPaulo();

const createGroupSchema = z
  .object({
    name: z.string().trim().min(1, GROUP_MESSAGES.name).max(60, GROUP_MESSAGES.name),
    maxValue: z.string().refine((v) => (parseMoneyToCents(v) ?? 0) > 0, GROUP_MESSAGES.maxValue),
    exchangeDate: z.string().refine(isFutureDate, GROUP_MESSAGES.exchangeDate),
    location: z.string().trim().max(120, GROUP_MESSAGES.location),
    requestId: z.uuid({ version: "v4" }),
  })
  .transform((d) => ({
    name: d.name,
    maxValueCents: parseMoneyToCents(d.maxValue) as number,
    exchangeDate: d.exchangeDate,
    location: d.location === "" ? null : d.location,
    requestId: d.requestId,
  }));

export type CreateGroupInput = z.input<typeof createGroupSchema>;
export type CreateGroupData = z.output<typeof createGroupSchema>;
export type FieldName = "name" | "maxValue" | "exchangeDate" | "location";
export type FieldErrors = Partial<Record<FieldName, string>>;

export type ValidationResult =
  { ok: true; data: CreateGroupData } | { ok: false; errors: FieldErrors };

const FIELDS: readonly string[] = ["name", "maxValue", "exchangeDate", "location"];

export function validateCreateGroup(input: CreateGroupInput): ValidationResult {
  const parsed = createGroupSchema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[0]);
    if (FIELDS.includes(field) && !errors[field as FieldName]) {
      errors[field as FieldName] = issue.message;
    }
  }
  return { ok: false, errors };
}
