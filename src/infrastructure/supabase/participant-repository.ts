import { err, ok } from "../../shared/result";
import type { ParticipantRepository } from "../../application/ports";
import type { ServerSupabaseClient } from "./client";
import { mapRpcError } from "./rpc-error";

function notInBe02(): never {
  throw new Error("Not implemented in BE-02");
}

export function createParticipantRepository(client: ServerSupabaseClient): ParticipantRepository {
  return {
    async join(input) {
      const { data, error } = await client.rpc("join_group", {
        p_invite_token: input.inviteToken,
        p_display_name: input.displayName,
        p_access_token_hash: input.accessTokenHash,
      });
      if (error) return err(mapRpcError(error));
      const row = data?.[0];
      if (!row) return err({ code: "INVALID_INPUT" });
      return ok({
        displayName: row.display_name,
        groupId: row.group_id,
        expiresAt: row.expires_at,
      });
    },
    findActiveByHash: notInBe02,
    getView: notInBe02,
  };
}
