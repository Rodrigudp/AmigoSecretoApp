import { z } from "zod";

const httpUrl = z.url({ protocol: /^https?$/ });

const envSchema = z.object({
  APP_URL: httpUrl.default("https://amigo-secreto-app.vercel.app"),
  SUPABASE_URL: httpUrl,
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),
  ADS_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export function parseEnv(source: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join("."));
    throw new Error(`Missing or invalid environment variables: ${keys.join(", ")}`);
  }

  return parsed.data;
}
