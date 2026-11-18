// @vitest-environment node
import { describe, expect, it } from "vitest";
import { mapRpcError } from "../../src/infrastructure/supabase/rpc-error";

describe("mapRpcError", () => {
  it("maps RPC codes and falls back to INVALID_INPUT", () => {
    expect(mapRpcError({ message: "IDEMPOTENCY_CONFLICT" }).code).toBe("IDEMPOTENCY_CONFLICT");
    expect(mapRpcError({ message: "GROUP_FULL" }).code).toBe("GROUP_FULL");
    expect(mapRpcError({ message: "GROUP_CLOSED" }).code).toBe("GROUP_CLOSED");
    expect(mapRpcError({ message: "INVALID_LINK" }).code).toBe("INVALID_LINK");
    expect(mapRpcError({ message: "NOT_ENOUGH_PARTICIPANTS" }).code).toBe(
      "NOT_ENOUGH_PARTICIPANTS"
    );
    expect(mapRpcError({ message: "DRAW_MEMBERS_CHANGED" }).code).toBe("DRAW_MEMBERS_CHANGED");
    expect(mapRpcError({ message: "DRAW_NOT_READY" }).code).toBe("DRAW_NOT_READY");
    expect(mapRpcError({ message: "INVALID_NAME" }).code).toBe("INVALID_INPUT");
    expect(mapRpcError({ message: "unexpected" }).code).toBe("INVALID_INPUT");
    expect(mapRpcError({}).code).toBe("INVALID_INPUT");
  });
});
