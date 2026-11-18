import { describe, expect, it } from "vitest";
import {
  GROUP_MESSAGES,
  parseMoneyToCents,
  todayInSaoPaulo,
  validateCreateGroup,
} from "@/app/_lib/create-group-schema";
import { buildInviteMessage, whatsappUrl } from "@/app/_lib/whatsapp";

const REQUEST_ID = "3b241101-e2bb-4255-8caf-4136c566a962";
const valid = {
  name: "  Família Silva  ",
  maxValue: "50,00",
  exchangeDate: "2099-12-24",
  location: "",
  requestId: REQUEST_ID,
};

describe("parseMoneyToCents", () => {
  it.each([
    ["50", 5000],
    ["50,00", 5000],
    ["R$ 1.250,50", 125050],
    ["0,99", 99],
  ])("%s -> %i", (raw, cents) => expect(parseMoneyToCents(raw)).toBe(cents));
  it("returns null without digits", () => expect(parseMoneyToCents("abc")).toBeNull());
});

describe("validateCreateGroup", () => {
  it("normalizes valid input", () => {
    const r = validateCreateGroup(valid);
    expect(r).toEqual({
      ok: true,
      data: {
        name: "Família Silva",
        maxValueCents: 5000,
        exchangeDate: "2099-12-24",
        location: null,
        requestId: REQUEST_ID,
      },
    });
  });
  it("reports the spec messages per field", () => {
    const r = validateCreateGroup({
      name: " ",
      maxValue: "0",
      exchangeDate: todayInSaoPaulo(),
      location: "x".repeat(121),
      requestId: REQUEST_ID,
    });
    expect(r).toEqual({
      ok: false,
      errors: {
        name: GROUP_MESSAGES.name,
        maxValue: GROUP_MESSAGES.maxValue,
        exchangeDate: GROUP_MESSAGES.exchangeDate,
        location: GROUP_MESSAGES.location,
      },
    });
  });
  it("rejects a name longer than 60 and a non-v4 requestId", () => {
    expect(validateCreateGroup({ ...valid, name: "a".repeat(61) }).ok).toBe(false);
    expect(validateCreateGroup({ ...valid, requestId: "not-a-uuid" }).ok).toBe(false);
  });
});

describe("WhatsApp share", () => {
  it("builds the template and encodes it", () => {
    const text = buildInviteMessage(
      { name: "Família Silva", maxValueCents: 5000, exchangeDate: "2026-12-24", location: null },
      "https://x.test/g/abc"
    );
    expect(text).toContain("*Família Silva*");
    expect(text).toContain("Data da troca: 24/12/2026");
    expect(text).toContain("até R$ 50,00");
    expect(text).toContain("Local: Não informado");
    const url = whatsappUrl(text);
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(url.slice("https://wa.me/?text=".length))).toBe(text);
  });
});
