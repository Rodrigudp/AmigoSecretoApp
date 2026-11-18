import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

/** REL-02: texto que o Rodrigo precisa substituir antes do go-live. */
const MARKER = "A PREENCHER PELO RODRIGO";
const PUBLIC_PAGES = ["/", "/sobre", "/privacidade", "/termos", "/contato"];

/** Todos os fontes de app/, para o marcador não passar por um .tsx esquecido. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(tsx?|jsx?|mdx?|html)$/.test(entry.name) ? [path] : [];
  });
}

test.describe("REL-02 - nenhum texto pendente do Rodrigo no release", () => {
  test("app/ não contém 'A PREENCHER PELO RODRIGO'", () => {
    const hits = sourceFiles(join(process.cwd(), "app")).filter((file) =>
      readFileSync(file, "utf8").includes(MARKER)
    );
    expect(hits, `substitua o texto pendente em: ${hits.join(", ")}`).toEqual([]);
  });

  test("páginas públicas não servem 'A PREENCHER PELO RODRIGO'", async ({ page }) => {
    for (const path of PUBLIC_PAGES) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      expect(await page.content(), path).not.toContain(MARKER);
    }
  });
});
