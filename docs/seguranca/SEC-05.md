# SEC-05 · Revisão Final de Segurança e LGPD (Pré-Lançamento 28/11)

- **Data:** 18/11/2026
- **Commit avaliado:** `758b926` (inclui `ea0993f`, todas as funcionalidades do MVP na `main`)
- **Ambiente vivo verificado:** `https://papelzinho.app` (verificação passiva de headers e rotas)
- **Responsável:** 15 Segurança & LGPD
- **Critério de aceite:** nenhum achado **Crítico** ou **Alto** aberto.
- **Veredito:** **APROVADO PARA LANÇAMENTO** (**0 Críticos**, **0 Altos**, **2 Médios**, **2 Baixos**).

---

## 1. Resumo Executivo

A revisão final cobriu OWASP Top 10, RNF03–RNF05, ADR-002 e ADR-004 no código da `main` (`758b926`) e nos headers HTTP publicados em `https://papelzinho.app`. Não foram encontrados achados Críticos ou Altos. Os dois achados Médios e os dois Baixos identificados são melhorias recomendadas de defesa em profundidade, sem bloqueio para o lançamento.

---

## 2. Achados

| ID | Severidade | Área | Evidência | Correção sugerida |
| --- | --- | --- | --- | --- |
| **SEC05-M01** | **Média** | Rate limit em `run_draw` (`AM-07`) | `DEFAULT_RATE_LIMIT_POLICIES` em `src/infrastructure/rate-limit.ts` define `run_draw` (`10 req / 10 min`), mas `runDrawAction` em `app/admin-actions.ts` e `runDrawUseCase` em `app/_lib/admin-usecase.ts` não chamam `getSharedRateLimiter().check("run_draw", ...)`. Mitigado parcialmente pela exigência de `adminToken` (256 bits) e idempotência de `draw_version` no banco. | Aplicar `getSharedRateLimiter().check("run_draw", extractClientIp(headers))` em `runDrawAction` (`app/admin-actions.ts`), seguindo o padrão de `app/actions.ts`. |
| **SEC05-M02** | **Média** | `accessToken` na URL de `/api/p/hs/[token]` | 1) `app/_lib/token-paths.ts` (`TOKEN_ROUTE_SOURCES`) e `EXTRA_SENSITIVE_ROUTES` (`src/infrastructure/security-headers.ts`) não incluem `/api/p/hs/:path*`. Em `https://papelzinho.app/api/p/hs/invalid-test`, a resposta retornou `Referrer-Policy: strict-origin-when-cross-origin` (regra global de `next.config.ts`) em vez de `no-referrer`.<br>2) `ops/nginx-papelzinho-domain.conf` desativa `access_log off;` em `^/(p\|owner\|r\|admin)/`, mas não em `^/api/p/hs/`, permitindo registro do path com token no log do Nginx. | 1) Incluir `"/api/p/hs/:path*"` em `TOKEN_ROUTE_SOURCES` (`app/_lib/token-paths.ts`) ou `EXTRA_SENSITIVE_ROUTES`.<br>2) Incluir `api/p/hs` na regra `location ~ ^/(p\|owner\|r\|admin\|api/p/hs)/` com `access_log off;` em `ops/nginx-papelzinho-domain.conf`. |
| **SEC05-B01** | **Baixa** | Rate limit no painel `/owner` | `app/owner/route.ts` valida Basic Auth via SHA-256 + `timingSafeEqual` com `OWNER_PANEL_SECRET` (>= 32 chars), mas não aplica rate limit por IP para tentativas `401`. | Adicionar `getSharedRateLimiter().check("owner_auth", clientIp)` em `app/owner/route.ts` antes da resposta `401`. |
| **SEC05-B02** | **Baixa** | Exposição de tecnologia (`X-Powered-By`) | Respostas HTML em `https://papelzinho.app/` incluem o cabeçalho `X-Powered-By: Next.js`. | Definir `poweredByHeader: false` em `next.config.ts`. |

---

## 3. Matriz de Verificação do Escopo

| Controle / Área | Estado | Evidência verificada |
| --- | --- | --- |
| **Rotas com token e cookie `ptk_` (ADR-004)** | ✅ Conforme (ressalva SEC05-M02) | `ptk_<groupId>` emitido com `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` e `Expires = groups.expires_at` (`app/api/p/hs/[token]/route.ts`, `app/_lib/personal-cookie.ts`). `/p/g/[groupId]` não serializa `accessToken` para o cliente; fallback sem cookie em `/p/[accessToken]?ck=1` força `adsAllowed={false}`. |
| **Server Actions & Validação** | ✅ Conforme | `createGroupAction`, `joinGroupAction` (`app/actions.ts`), `wish-actions*.ts`, `reveal-actions.ts` e `admin-actions.ts` validam entrada com Zod/domínio no servidor, exigem token/cookie do grupo e retornam mensagens neutras (`INVALID_LINK` / `ARE_06`). |
| **Supabase RLS e RPCs** | ✅ Conforme | `20261118000200_rls_and_constraints.sql` habilita e força RLS (`ENABLE` + `FORCE ROW LEVEL SECURITY`) sem policies para `anon`/`authenticated` e executa `REVOKE ALL`. RPCs (`create_group_once`, `join_group`, `run_draw`, `purge_expired_groups`) usam `SECURITY DEFINER`, `set search_path = public, pg_temp` e `REVOKE EXECUTE` de `public`/`anon`/`authenticated` (`service_role` apenas). `pairs` usa FKs compostas `(group_id, id)` e `CHECK (giver_id <> receiver_id)`. |
| **Rate Limits** | ⚠️ Parcial (SEC05-M01, SEC05-B01) | `src/infrastructure/rate-limit.ts` usa HMAC-SHA256 com salt aleatório por instância e janela fixa (máx. 10.000 chaves). Ativo em `create_group`, `join_group`, `affiliate_click` e `affiliate_redirect`; pendente em `run_draw` e `/owner`. |
| **Headers HTTP e CSP** | ✅ Conforme (ressalva SEC05-B02) | Verificado ao vivo em `https://papelzinho.app/`: `Content-Security-Policy` restritiva (`frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, sem origens AdSense com `ADS_ENABLED=false`), `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy`. Rotas `/p/`, `/admin/`, `/g/`, `/owner`, `/r/` retornam `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow` e `Cache-Control: private, no-store, max-age=0, must-revalidate`. `/dev/ui` retorna `404`. |
| **Segredos e Ambiente** | ✅ Conforme | `.gitignore` ignora `.env*` (exceto `.env.example`). `NEXT_PUBLIC_*` restrito a `NEXT_PUBLIC_ADSENSE_CLIENT` e `NEXT_PUBLIC_ADSENSE_SLOT`. `ops/deploy-vps.sh` usa `umask 077` e `chmod 600` em `.env.production` / `.env.local`. `app/owner/route.ts` exige `OWNER_PANEL_SECRET >= 32` chars com SHA-256 + `timingSafeEqual`. |
| **Logs e `redact.ts`** | ✅ Conforme | `src/infrastructure/observability/redact.ts` mascara `/api/p/hs/`, `/p/`, `/admin/`, `/owner/`, `/r/`, `/g/`, `ptk_`, `Bearer`, webhooks e campos PII/credencial. `logInfraError` registra apenas `operation`, `code`, `message`, `details`, `hint`. |
| **Eventos sem PII (`events`)** | ✅ Conforme | Tabela `events` (`20261118000100_initial_schema.sql`) contém apenas `id`, `group_id` (`ON DELETE SET NULL`), `type` e `created_at` — sem `participant_id`, nome, IP ou token. |
| **Expurgo de 60 dias (OPS-02)** | ✅ Em código (ver nota) | `20261120000100_purge_expired_groups.sql` define `purge_expired_groups()` e agenda `pg_cron` diário (`'0 6 * * *'`, 03:00 America/Sao_Paulo). |
| **Dependências (`npm audit`)** | ✅ Conforme | `npm audit --json` local em `758b926`: **0 vulnerabilidades** (0 críticas, 0 altas, 0 médias, 0 baixas em 598 dependências). |
| **CI/CD e Repositório Público** | ✅ Conforme | `.github/workflows/ci.yml` define `permissions: contents: read`, usa `pull_request` (sem `pull_request_target`, impedindo vazamento de secrets para PRs de fork), e restringe `deploy-migrations` e `deploy-vps` a `push` em `main` com `environment: production` e limpeza de chave SSH via `trap`. |

---

## 4. O que não foi possível verificar diretamente

1. **Execução ao vivo do `pg_cron` (`OPS-02`) e variáveis na VPS/Supabase de produção:** não há credenciais de produção nesta estação para consultar `cron.job_run_details` ou os arquivos `.env.production` da VPS; a validação baseou-se nas migrations versionadas, no workflow `deploy-migrations` e nos scripts em `ops/`.
2. **Teste de criação/exclusão de grupo em produção:** não foi criado grupo de teste em `https://papelzinho.app` porque a aplicação não oferece exclusão manual de grupo pelo organizador (apenas expurgo automático em 60 dias) e não há acesso direto ao banco de produção para apagar registros após o teste. Os fluxos ponta a ponta foram validados pela suíte E2E no CI e pelo `REL-01` executado pelo PO em produção.