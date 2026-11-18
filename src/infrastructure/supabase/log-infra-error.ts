type InfraErrorFields = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function field(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Logs infrastructure / PostgREST failures without tokens, hashes, or personal data.
 * Safe for production logs (RNF03 / SEC note on BE-03).
 */
export function logInfraError(operation: string, error: InfraErrorFields | null | undefined): void {
  const parts = [
    `op=${operation}`,
    `code=${field(error?.code, "n/a")}`,
    `message=${field(error?.message, "unknown")}`,
  ];
  const details = error?.details?.trim();
  const hint = error?.hint?.trim();
  if (details) parts.push(`details=${details}`);
  if (hint) parts.push(`hint=${hint}`);
  console.error(`[infra] ${parts.join(" ")}`);
}
