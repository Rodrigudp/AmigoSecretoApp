# Arquitetura

## 1. Visão geral
Monólito modular em **Next.js (App Router, TypeScript strict)**, hospedado na **Vercel** (serverless, escala sozinho no pico),
com **Supabase Postgres** como banco. Sem login de usuário: o acesso é por **links com token** (capability URLs).

```
Navegador (PWA, mobile first)
   │  HTTPS
   ▼
Next.js na Vercel
   ├─ app/ (presentation)      → páginas, componentes, server actions
   ├─ src/application/         → casos de uso (orquestram o domínio)
   ├─ src/domain/              → regras puras: sorteio, validações, entidades
   └─ src/infrastructure/      → Supabase (repositórios), afiliados, relógio, gerador de tokens
   │
   ▼
Supabase Postgres (acesso SOMENTE pelo servidor, com service role; RLS ligada e negando tudo ao público)
```

## 2. Paradigmas e princípios
- **Arquitetura em camadas / Clean Architecture leve:** dependências apontam para dentro.
  `presentation → application → domain`; `infrastructure` implementa interfaces (ports) definidas em `application`.
- **Functional core, imperative shell:** o domínio é feito de funções puras e determinísticas
  (ex.: `drawPairs(participants, rng)`), fáceis de testar; efeitos colaterais ficam nas bordas.
- **DDD leve:** linguagem ubíqua em inglês no código — `Group`, `Participant`, `WishItem`, `Draw`, `Pair`.
- **SOLID**, em especial: responsabilidade única por caso de uso e inversão de dependência via ports.
- **Validação na borda** com Zod: todo dado de fora (form, URL) é validado antes de entrar na aplicação.
- **Server-first:** dados sensíveis (pares do sorteio) nunca são enviados ao cliente além do próprio par (RNF04).

## 3. Estrutura de pastas
```
app/
  page.tsx                      # landing + criar grupo
  g/[inviteToken]/page.tsx      # convite (entrar)
  p/[accessToken]/page.tsx      # área do participante (lista, resultado)
  admin/[adminToken]/page.tsx   # painel do organizador
  api/                          # route handlers quando server action não servir
src/
  domain/        group.ts, participant.ts, draw.ts, wish-item.ts, errors.ts
  application/   create-group.ts, join-group.ts, run-draw.ts, ... ports.ts
  infrastructure/supabase/*.repo.ts, affiliate/*.ts, tokens.ts
  shared/        result.ts, env.ts
supabase/migrations/             # SQL versionado
tests/unit, tests/integration, tests/e2e
```

## 4. Modelo de dados (inicial — dono: agente Banco)
| Tabela | Campos principais |
| --- | --- |
| `groups` | id, name, max_value_cents, exchange_date, location, admin_token_hash, invite_token, status (`open`/`drawn`), draw_version, created_at, expires_at |
| `participants` | id, group_id, display_name, access_token_hash, joined_at, removed_at |
| `wish_items` | id, participant_id, title, url, affiliate_url, note, created_at |
| `draws` | id, group_id, version, created_at, invalidated_at |
| `pairs` | draw_id, giver_id, receiver_id (único por giver e por receiver) |
| `events` | id, group_id, type, created_at (métricas e cliques de afiliado, sem dado pessoal) |

Tokens de acesso e admin são guardados **com hash (SHA-256)**; o valor em claro só existe no link.

## 5. Decisões registradas (ADRs)
- ADR-001 Next.js + Supabase + Vercel.
- ADR-002 Acesso por capability URL, sem login.
- ADR-003 Sorteio no servidor por permutação sem ponto fixo (derangement) com `crypto.getRandomValues`.
- ADR-004 Token da URL pessoal trocado por cookie `ptk_<groupId>` antes de anúncios, com fallback sem cookie e sem anúncios.
Novas decisões: copie `adr/000-template.md`.
