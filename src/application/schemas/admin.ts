import { z } from "zod";

/**
 * Input schema for `get-admin-view` (RF06, GRP-05).
 */
export const getAdminViewInputSchema = z.object({
  adminToken: z.string().trim().min(1, "INVALID_LINK").max(200),
});

export type GetAdminViewInput = z.infer<typeof getAdminViewInputSchema>;

/**
 * Input schema for `remove-participant` (RF07, RN06, GRP-05).
 */
export const removeParticipantInputSchema = z.object({
  adminToken: z.string().trim().min(1, "INVALID_LINK").max(200),
  participantId: z.string().trim().min(1, "INVALID_INPUT").max(100),
});

export type RemoveParticipantInput = z.infer<typeof removeParticipantInputSchema>;

/**
 * Input schema for `run-draw` (RF08, HU04, SRT-03).
 */
export const runDrawInputSchema = z.object({
  adminToken: z.string().trim().min(1, "INVALID_LINK").max(200),
  expectedParticipantCount: z.number().int().nonnegative().optional(),
});

export type RunDrawInput = z.infer<typeof runDrawInputSchema>;
