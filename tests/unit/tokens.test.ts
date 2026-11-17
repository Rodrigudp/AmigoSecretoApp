// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { generate, hash, tokenService, verify } from "../../src/infrastructure/tokens";

describe("tokens utility (SEC-01)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates unique 32-byte base64url tokens of 43 characters", () => {
    const first = generate();
    const second = tokenService.generate();

    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first).not.toBe(second);
    expect(Buffer.from(first, "base64url")).toHaveLength(32);
  });

  it("hashes tokens deterministically into 64 lowercase hex characters", () => {
    const raw = generate();
    const firstHash = hash(raw);
    const secondHash = tokenService.hash(raw);

    expect(firstHash).toMatch(/^[0-9a-f]{64}$/);
    expect(firstHash).toBe(secondHash);
    expect(hash("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("verifies matching tokens and rejects mismatched tokens", () => {
    const raw = generate();
    const other = generate();
    const expectedHash = hash(raw);

    expect(verify(raw, expectedHash)).toBe(true);
    expect(tokenService.verify(raw, expectedHash)).toBe(true);
    expect(verify(other, expectedHash)).toBe(false);
  });

  it("returns false without throwing on invalid token or hash formats", () => {
    const raw = generate();
    const expectedHash = hash(raw);

    expect(verify("", expectedHash)).toBe(false);
    expect(verify(null as unknown as string, expectedHash)).toBe(false);
    expect(verify(raw, "")).toBe(false);
    expect(verify(raw, "abc")).toBe(false);
    expect(verify(raw, expectedHash.toUpperCase())).toBe(false);
    expect(verify(raw, "z".repeat(64))).toBe(false);
    expect(verify(raw, `${expectedHash}00`)).toBe(false);
    expect(verify(raw, undefined as unknown as string)).toBe(false);
  });

  it("never exposes token values in error messages or console logs", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    const raw = generate();
    const hashed = hash(raw);
    verify(raw, hashed);
    verify(raw, "invalid-hash");

    expect(() => hash("")).toThrow(TypeError);
    expect(() => hash(null as unknown as string)).toThrow(TypeError);

    try {
      hash("");
    } catch (error) {
      expect((error as Error).message).not.toContain(raw);
    }

    expect(logSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();

    const source = readFileSync(
      path.resolve(process.cwd(), "src/infrastructure/tokens.ts"),
      "utf8"
    );
    expect(source).not.toMatch(/\bconsole\./);
  });
});
