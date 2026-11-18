import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

const SHOTS = "docs/qa/prints-app-web";

test.describe("Expo Web live contra Next e Supabase locais (APP-FE-03)", () => {
  test("criar grupo, recarregar a aba e reabrir o painel por Meus grupos", async ({
    page,
    context,
  }) => {
    mkdirSync(SHOTS, { recursive: true });
    const groupName = `QA app web ${Date.now()}`;
    const apiCalls: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/v1/")) apiCalls.push(new URL(request.url()).origin);
    });

    await page.goto("/");
    await expect(page.getByText("Meus grupos", { exact: true }).first()).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByText(/Você ainda não tem grupos neste aparelho/)).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/01-meus-grupos-vazio.png` });

    await page.getByRole("button", { name: "Criar grupo" }).click();
    await page.getByLabel("Nome do grupo").fill(groupName);
    await page.getByLabel("Valor máximo do presente (R$)").fill("50,00");
    await page.getByLabel("Data do encontro").fill("24/12/2099");
    await page.getByLabel(/Local do encontro/).fill("Casa de teste");
    await page.screenshot({ path: `${SHOTS}/02-criar-grupo-preenchido.png` });
    await page.getByRole("button", { name: "Criar grupo" }).click();

    await expect(page.getByText("Grupo criado", { exact: true }).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.screenshot({ path: `${SHOTS}/03-grupo-criado.png` });

    // A credencial fica só no sessionStorage desta aba, nunca na URL.
    const stored = await page.evaluate(() => Object.keys(window.sessionStorage));
    expect(stored.some((key) => key.includes("papelzinho.credential.organizer."))).toBe(true);
    expect(page.url()).not.toMatch(/[A-Za-z0-9_-]{43}/);

    await page.reload();
    await expect(page.getByText("Meus grupos", { exact: true }).first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText(groupName)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Organizador · Entradas abertas/)).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/04-meus-grupos-apos-recarregar.png` });

    await page.getByRole("button", { name: "Abrir o painel" }).click();
    await expect(page.getByText("Painel do organizador", { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(groupName).first()).toBeVisible();
    await expect(page.getByText(/Participantes/).first()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/05-painel-do-organizador.png` });

    // Todas as chamadas foram para a origem do Expo (proxy do Metro), não para produção.
    expect(apiCalls.length).toBeGreaterThan(0);
    expect(new Set(apiCalls)).toEqual(new Set(["http://localhost:8081"]));

    // Outra aba (sessionStorage próprio) não herda o acesso.
    const other = await context.newPage();
    await other.goto("/");
    await expect(other.getByText(/Você ainda não tem grupos neste aparelho/)).toBeVisible({
      timeout: 60_000,
    });
  });
});
