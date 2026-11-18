/* global jest, it, expect */

import { JSDOM } from "jsdom";
import { act } from "react";
import ParticipantGroup from "../../app/p/g/[groupId]";
import { api } from "./api";

jest.mock("expo-router", () => ({ useLocalSearchParams: () => ({ groupId: "group-1" }) }));
jest.mock("react-native", () => ({ View: ({ children }) => <div>{children}</div> }));
jest.mock("expo-crypto", () => ({
  randomUUID: () => "local-wish",
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: async () => "cache-key",
}));
jest.mock("expo-network", () => ({
  addNetworkStateListener: () => ({ remove() {} }),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({}));
jest.mock("./access", () => ({ readAccess: async () => "participant-test" }));
jest.mock("./api", () => ({
  useDemo: true,
  api: {
    participant: async () => ({
      view: {
        group: { name: "Grupo", exchangeDate: "2027-12-24" },
        displayName: "Ana",
        ownWishItems: [],
      },
    }),
    wishes: async () => ({ items: [] }),
    addWish: jest.fn(async (_, draft) => ({ item: { ...draft, id: "server-wish" } })),
  },
}));
jest.mock("./reveal", () => ({ RevealCard: () => null }));
jest.mock("./push", () => ({ PushOffer: () => null }));
jest.mock("./ui", () => ({
  Page: ({ children }) => <main>{children}</main>,
  Card: ({ children }) => <section>{children}</section>,
  Body: ({ children }) => <p>{children}</p>,
  Action: ({ label, run, disabled }) => (
    <button onClick={run} disabled={disabled}>
      {label}
    </button>
  ),
  Field: ({ label, onChangeText, value }) => (
    <input aria-label={label} value={value} onInput={(event) => onChangeText(event.target.value)} />
  ),
  focusTarget: () => {},
  formatDate: (date) => date,
  errorText: (error) => error.message,
}));

it("renders one saved wish and exits the form after updating the participant cache", async () => {
  const dom = new JSDOM();
  const originalWindow = globalThis.window;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  const { createRoot } = require("react-dom/client");
  const container = dom.window.document.createElement("div");
  const root = createRoot(container);
  const renderErrors = jest.spyOn(console, "error");
  const button = (label) =>
    [...container.querySelectorAll("button")].find((element) => element.textContent === label);

  try {
    await act(async () => root.render(<ParticipantGroup />));
    await act(async () => button("Adicionar presente").click());
    const title = container.querySelector('[aria-label="Nome do presente"]');
    await act(async () => {
      title.value = "Livro";
      title.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
    await act(async () => button("Salvar presente").click());

    expect(api.addWish).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Presente salvo.");
    expect(
      [...container.querySelectorAll("button")].filter(
        (element) => element.textContent === "Editar Livro"
      )
    ).toHaveLength(1);
    expect(button("Salvar presente")).toBeUndefined();
    expect(button("Salvando…")).toBeUndefined();
    expect(renderErrors.mock.calls.flat().join(" ")).not.toMatch(/two children with the same key/i);
  } finally {
    await act(async () => root.unmount());
    renderErrors.mockRestore();
    globalThis.window = originalWindow;
    delete globalThis.document;
    dom.window.close();
  }
});
