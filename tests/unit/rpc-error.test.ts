// @vitest-environment node
import { describe, expect, it } from "vitest";
import { mapRpcError } from "../../src/infrastructure/supabase/rpc-error";

describe("mapRpcError", () => {
  it("maps RPC codes and falls back to INVALID_INPUT", () => {
    expect(mapRpcError({ message: "IDEMPOTENCY_CONFLICT" }).code).toBe("IDEMPOTENCY_CONFLICT");
    expect(mapRpcError({ message: "GROUP_FULL" }).code).toBe("GROUP_FULL");
    expect(mapRpcError({ message: "INVALID_NAME" }).code).toBe("INVALID_INPUT");
    expect(mapRpcError({ message: "other" }).code).toBe("INVALID_INPUT");
  });
});
