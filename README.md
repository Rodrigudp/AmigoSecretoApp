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
- **Docker Desktop** ou **Podman** (necessário para executar o Supabase local via CLI)

## 🛠️ Como Rodar Localmente

1. Clone o repositório e acesse a pasta:

   ```bash
   cd amigo-secreto
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o arquivo de ambiente:

   ```bash
   cp .env.example .env.local
   ```

   Defina `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em `.env.local`. Para links locais, use `APP_URL=http://localhost:3000`. Os anúncios ficam desativados por padrão até definir `ADS_ENABLED=true`.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse no navegador:
   [http://localhost:3000](http://localhost:3000)

## 🗄️ Banco de Dados (Supabase)

### Projeto Remoto (Produção e Staging)

- **Projeto:** `amigo-secreto`
- **Project Ref:** `ulthbrfwsvmazgdvrcyw`
- **URL:** `https://ulthbrfwsvmazgdvrcyw.supabase.co`
- **Região:** `us-east-1`
- **Configuração:** RLS habilitada em todas as tabelas e exposição direta desativada.

Para vincular o repositório local ao projeto remoto no Supabase:

```bash
npx supabase login
npx supabase link --project-ref ulthbrfwsvmazgdvrcyw
```

### Desenvolvimento Local com Supabase CLI

Para rodar a instância local do Supabase (requer Docker Desktop ou Podman):

```bash
# Iniciar containers locais
npx supabase start

# Parar containers
npx supabase stop

# Resetar e reaplicar migrações
npx supabase db reset
```

### Deploy Automático de Migrações no GitHub Actions (CI/CD)

O pipeline do CI aplica as migrações automaticamente no banco de dados de produção (`supabase db push`) em pushes na branch `main`, após a aprovação dos jobs de qualidade (`quality`) e banco local (`db`).

Para habilitar a aplicação de migrações no banco remoto, configure os seguintes secrets no GitHub:

1. **`SUPABASE_ACCESS_TOKEN`**:
   - Acesse o painel do Supabase: **Account** > [Access Tokens](https://supabase.com/dashboard/account/tokens) > clique em **Generate new token**.
2. **`SUPABASE_DB_PASSWORD`**:
   - A senha do banco de dados PostgreSQL configurada na criação do projeto (pode ser redefinida no Supabase em **Project Settings** > **Database** > **Database password**).

**Como cadastrar no GitHub:**
- No repositório GitHub do projeto, acesse **Settings** > **Environments** > selecione ou crie o ambiente `production` e adicione os dois secrets em **Environment secrets** (ou adicione diretamente em **Settings** > **Secrets and variables** > **Actions** em **Repository secrets**).

> **Aviso de segurança:** Se os secrets não estiverem configurados, o job pula a execução exibindo um aviso amigável (`::warning::`) e não quebra o build. O pipeline **nunca** executa comandos destrutivos (`db reset` ou `rollback`) contra o banco de produção.

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
