import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const SHOTS = "docs/qa/prints-app-web";
const shot = (page: Page, name: string) => page.screenshot({ path: `${SHOTS}/${name}.png` });
const heading = (page: Page, text: string | RegExp) =>
  page.getByText(text, { exact: typeof text === "string" }).first();

async function joinAs(page: Page, inviteToken: string, name: string) {
  await page.goto(`/g/${inviteToken}`);
  await expect(heading(page, "Você foi convidado")).toBeVisible({ timeout: 60_000 });
  await page.getByLabel("Como você se chama?").fill(name);
  await page.getByRole("button", { name: "Entrar no grupo" }).click();
  await expect(heading(page, `Você entrou, ${name}!`)).toBeVisible({ timeout: 30_000 });
}

test.describe("Expo Web live contra Next e Supabase locais (APP-FE-03, APP-QA-02)", () => {
  test.setTimeout(420_000);

  test("criar → recarregar → painel → 3 entradas em abas → lista → sortear → revelar", async ({
    page: organizer,
    context,
  }) => {
    mkdirSync(SHOTS, { recursive: true });
    const groupName = `QA app web ${Date.now()}`;
    const apiOrigins = new Set<string>();
    context.on("request", (request) => {
      if (request.url().includes("/api/v1/")) apiOrigins.add(new URL(request.url()).origin);
    });
    const calls: string[] = [];
    context.on("response", async (response) => {
      const url = new URL(response.url());
      if (!url.pathname.startsWith("/api/v1/")) return;
      const body = response.status() >= 400 ? await response.text().catch(() => "") : "";
      const code = /"code":"([A-Z_]+)"/.exec(body)?.[1] ?? "";
      calls.push(`${response.request().method()} ${url.pathname.replace(/[A-Za-z0-9_-]{36,}/g, ":id")} ${response.status()} ${code}`);
    });
    test.info().attach("api-calls", { body: "", contentType: "text/plain" });
    let inviteToken = "";
    organizer.on("response", async (response) => {
      if (response.url().endsWith("/api/v1/groups") && response.request().method() === "POST") {
        inviteToken = (await response.json()).inviteToken;
      }
    });

    // 1. Criar grupo
    await organizer.goto("/");
    await expect(heading(organizer, "Meus grupos")).toBeVisible({ timeout: 120_000 });
    await expect(organizer.getByText(/Você ainda não tem grupos neste aparelho/)).toBeVisible();
    await shot(organizer, "01-meus-grupos-vazio");

    await organizer.getByRole("button", { name: "Criar grupo" }).click();
    await organizer.getByLabel("Nome do grupo").fill(groupName);
    await organizer.getByLabel("Valor máximo do presente (R$)").fill("50,00");
    await organizer.getByLabel("Data do encontro").fill("24/12/2099");
    await organizer.getByLabel(/Local do encontro/).fill("Casa de teste");
    await shot(organizer, "02-criar-grupo-preenchido");
    await organizer.getByRole("button", { name: "Criar grupo" }).click();
    await expect(heading(organizer, "Grupo criado")).toBeVisible({ timeout: 30_000 });
    await shot(organizer, "03-grupo-criado");
    expect(inviteToken).toHaveLength(43);

    // A credencial fica só no sessionStorage desta aba, nunca na URL.
    const keys = await organizer.evaluate(() => Object.keys(window.sessionStorage));
    expect(keys.some((key) => key.includes("papelzinho.credential.organizer."))).toBe(true);
    expect(organizer.url()).not.toMatch(/[A-Za-z0-9_-]{43}/);

    // 2. Recarregar a mesma aba e reabrir o painel por Meus grupos
    // A URL continua em /create: recarregar volta ao formulário vazio, mas o acesso fica salvo.
    await organizer.reload();
    await expect(heading(organizer, "Criar grupo")).toBeVisible({ timeout: 90_000 });
    await shot(organizer, "03b-recarregou-em-create");
    await organizer.getByRole("link", { name: /Meus grupos/ }).click();
    await expect(organizer.getByText(groupName)).toBeVisible({ timeout: 30_000 });
    await expect(organizer.getByText(/Organizador · Entradas abertas/)).toBeVisible();
    await shot(organizer, "04-meus-grupos-apos-recarregar");
    await organizer.getByRole("button", { name: "Abrir o painel" }).click();
    await expect(heading(organizer, "Painel do organizador")).toBeVisible({ timeout: 30_000 });
    await expect(organizer.getByText("Participantes (0 de 100)")).toBeVisible();
    await shot(organizer, "05-painel-sem-participantes");

    // 3. Três pessoas entram, cada uma em uma aba (sessionStorage próprio)
    const names = ["Ana", "Bruno", "Carla"];
    const tabs: Record<string, Page> = {};
    for (const name of names) {
      const tab = await context.newPage();
      tabs[name] = tab;
      await joinAs(tab, inviteToken, name);
      if (name === "Ana") await shot(tab, "06-entrou-no-grupo");
      await tab.getByRole("button", { name: "Ir para a minha área" }).click();
      // Antes do sorteio a área explica a espera e ainda não oferece o botão de revelar.
      await expect(tab.getByRole("button", { name: "Adicionar presente" })).toBeVisible({
        timeout: 30_000,
      });
      await expect(tab.getByText(/Quando o organizador fizer o sorteio/)).toBeVisible();
      await expect(tab.getByRole("button", { name: "Revelar meu amigo secreto" })).toHaveCount(0);
    }
    await shot(tabs.Ana, "07-area-do-participante");

    // 4. Lista de desejos (Ana)
    const ana = tabs.Ana;
    await ana.getByRole("button", { name: "Adicionar presente" }).click();
    await ana.getByLabel("Nome do presente").fill("Livro de receitas");
    await ana.getByLabel("Observação (opcional)").fill("Capa dura");
    await shot(ana, "08-novo-presente");
    await ana.getByRole("button", { name: "Salvar presente" }).click();
    await ana.waitForTimeout(8000);
    console.log("API CALLS:
" + calls.join("
"));
    console.log("ANA BODY:
" + (await ana.locator("body").innerText()).slice(0, 900));
    await expect(ana.getByText("Presente salvo.")).toBeVisible({ timeout: 30_000 });
    await expect(ana.getByText("Livro de receitas").first()).toBeVisible();
    await shot(ana, "09-lista-com-presente");

    // 5. Sortear pelo painel (aba do organizador, recarregada para ler os 3 participantes)
    await organizer.reload();
    await expect(organizer.getByText("Participantes (3 de 100)")).toBeVisible({ timeout: 30_000 });
    await shot(organizer, "10-painel-com-3-participantes");
    await organizer.getByRole("button", { name: "Fazer o sorteio" }).click();
    await expect(heading(organizer, "Fazer o sorteio agora?")).toBeVisible();
    await shot(organizer, "11-confirmar-sorteio");
    await organizer.getByRole("button", { name: "Sim, fazer o sorteio" }).click();
    await expect(heading(organizer, "Sorteio feito")).toBeVisible({ timeout: 30_000 });
    await shot(organizer, "12-sorteio-feito");
    // O painel nunca mostra quem tirou quem.
    const panelText = await organizer.locator("body").innerText();
    expect(panelText).not.toMatch(/tirou|→|->/i);

    // 6. Cada pessoa revela o próprio par
    const recipients: string[] = [];
    for (const name of names) {
      const tab = tabs[name];
      await tab.reload();
      const reveal = tab.getByRole("button", { name: "Revelar meu amigo secreto" });
      await expect(reveal).toBeVisible({ timeout: 90_000 });
      // Antes de revelar, nenhum nome alheio aparece na tela.
      const before = await tab.locator("body").innerText();
      for (const other of names.filter((n) => n !== name)) expect(before).not.toContain(other);
      if (name === "Ana") await shot(tab, "13-revelar-fechado");
      await reveal.click();
      const label = await tab
        .getByLabel(/^Você tirou /)
        .first()
        .getAttribute("aria-label");
      const recipient = label!.replace("Você tirou ", "");
      expect(names).toContain(recipient);
      expect(recipient).not.toBe(name);
      recipients.push(recipient);
      if (name === "Ana") await shot(tab, "14-revelado");
    }
    expect([...recipients].sort()).toEqual([...names].sort());

    // 7. Avisos: no Expo Web não há token de aparelho, então a oferta não aparece (só em nativo).
    await expect(tabs.Ana.getByRole("button", { name: "Desativar avisos" })).toHaveCount(0);

    // Todas as chamadas foram para a origem do Expo (proxy do Metro), nunca para produção.
    expect([...apiOrigins]).toEqual(["http://localhost:8081"]);

    // Uma aba nova não herda nenhum acesso.
    const fresh = await context.newPage();
    await fresh.goto("/");
    await expect(fresh.getByText(/Você ainda não tem grupos neste aparelho/)).toBeVisible({
      timeout: 60_000,
    });
  });
});
