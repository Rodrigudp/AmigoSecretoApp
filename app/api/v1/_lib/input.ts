import { z } from "zod";

export const pushTokenInput = z
  .object({
    expoPushToken: z
      .string()
      .max(200)
      .regex(/^Expo(?:nent)?PushToken\[[A-Za-z0-9_-]+\]$/),
  })
  .strict();

export const registerPushTokenInput = pushTokenInput.extend({
  platform: z.enum(["ios", "android"]),
});

export async function readJson(request: Request): Promise<unknown> {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return null;
  return request.json().catch(() => null);
}
