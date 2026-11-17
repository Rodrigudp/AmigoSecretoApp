# Amigo Secreto 🎁

Aplicativo web moderno e responsivo (mobile-first / PWA) para organização e sorteio de Amigo Secreto sem necessidade de login tradicional (autenticação baseada em capability URLs / tokens seguros).

## 🚀 Stack Tecnológica

- **Framework:** Next.js (App Router, TypeScript strict)
- **UI & Estilização:** React 19, Tailwind CSS
- **Banco de Dados:** Supabase (Postgres)
- **Qualidade & Linters:** ESLint (complexidade ciclomática $\le 10$), Prettier
- **Testes:** Vitest (unitários/integração com jsdom), Playwright (E2E mobile-first)
- **Git Hooks & Commits:** Husky, lint-staged, commitlint (Conventional Commits)

## 📋 Pré-requisitos

- **Node.js:** `>= 20.x` (recomendado `>= 22.x` / `24.x`)
- **npm:** `>= 10.x`
- **Git**

## 🛠️ Como Rodar Localmente

1. Clone o repositório e acesse a pasta:

   ```bash
   cd amigo-secreto
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   [http://localhost:3000](http://localhost:3000)

## 🧪 Scripts Disponíveis

| Comando                | Descrição                                                      |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor local de desenvolvimento                     |
| `npm run build`        | Compila a aplicação para produção                              |
| `npm run start`        | Executa o build de produção localmente                         |
| `npm run lint`         | Executa o linter ESLint com regra de complexidade $\le 10$     |
| `npm run typecheck`    | Executa verificação estrita de tipos via `tsc --noEmit`        |
| `npm run test`         | Executa a suíte de testes unitários e de integração via Vitest |
| `npm run test:watch`   | Executa Vitest em modo observador (watch)                      |
| `npm run test:e2e`     | Executa testes end-to-end com Playwright                       |
| `npm run format`       | Formata o código com Prettier                                  |
| `npm run format:check` | Verifica conformidade de formatação com Prettier               |

## 📐 Arquitetura e Diretrizes

Consulte a documentação em:

- [AGENTS.md](AGENTS.md): Regras gerais da equipe e modelo de trabalho.
- [docs/arquitetura/ARQUITETURA.md](docs/arquitetura/ARQUITETURA.md): Visão de arquitetura em camadas e Clean Architecture.
- [docs/board/BOARD.md](docs/board/BOARD.md): Quadro Kanban e andamento das iterações.
- [docs/processo/PROCESSO.md](docs/processo/PROCESSO.md): Processo de desenvolvimento, convenções de git e DoR/DoD.
