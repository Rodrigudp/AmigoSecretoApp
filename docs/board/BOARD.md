# Kanban — Amigo Secreto

Mantido pelo **Orquestrador**. Os agentes só movem os **próprios** cartões e escrevem no log diário.
Backlog completo, com critérios de aceite e dependências: `docs/board/BACKLOG.md`.

Atualizado em: 2026-11-17 · Iteração atual: **It-1 · Fundação (18–19/11)** · Lançamento: **28/11/2026**

## Regras do quadro
- Fluxo: **Backlog → Pronto p/ iniciar → Em andamento → Em revisão → Em teste → Pronto → Em produção**.
- **WIP:** no máximo 1 cartão "Em andamento" por agente; no máximo 4 cartões "Em revisão" no total.
- Para mover para **Pronto p/ iniciar**: cumprir o DoR. Para **Pronto**: cumprir o DoD (`PROCESSO.md` §2).
- Cartão bloqueado: marque `⛔ bloqueado: <motivo>` e avise o Orquestrador.
- Bugs entram como `BUG-xxx` com severidade S1–S4 (`MANUTENCAO.md`); S1/S2 vão direto para o topo de "Pronto p/ iniciar".
- Formato do cartão: `ID · título · dono → revisor · pts · prazo`

---

## 🗂️ Backlog (próximas iterações)
- GRP-01..05, PAR-01..04, SEC-03, QA-03 — It-2 (20–21/11)
- SEC-06 · ADR-004 token da URL → cookie por grupo antes de anúncios, com fallback sem cookie (WebView) · SEC → ORQ · 1 pt · 20/11 — antes do PAR-04; origem: SEC-02 AM-03
- LST-01..04, SRT-01..04, QA-04 — It-3 (22–23/11)
- MON-01..03, SEC-04, OPS-01..02, QA-05..06, SEC-05 — It-4 (24–25/11)
- REL-01..02 — Release (26–28/11)

## ✅ Pronto p/ iniciar (It-1)
_(vazio)_

## ⏳ Aguardando dependência (It-1)

## 🔨 Em andamento
- OPS-00 · Endurecer CI (rollback ON_ERROR_STOP, npm audit, actions Node 24) · OPS → SEC · 1 pt · 19/11 — dívida do SETUP-03 (ORQ 17/11)
- DB-03 · types.ts gerado pelo CI + comparação estrita · DB → BE · 1 pt · 19/11 — dívida do DB-01 (ORQ 17/11)

## 👀 Em revisão
- LST-01 · Especificação da lista + termos de afiliados · LST → MON · 1 pt · 19/11 — `docs/features/lista-desejos.md` escrito; ✅ MON aprovado 17/11; ✅ D3 = lista editável após o sorteio, remoção física, evento sem `store` (ORQ 17/11); ⏳ revisão SEC (URL/redirect), priorizada pelo ORQ; D1 → PEN-04 (não bloqueia)

## 🧪 Em teste (QA)
_(vazio)_

## 🏁 Pronto
- QA-02 · Teste de propriedade do sorteio · QA → SRT · 1 pt · 19/11 — ✅ SRT+ORQ; mergeado PR #9 (bdab784); 10 mil sorteios em 296 ms no CI
- SETUP-04 · Supabase local + .env.example · OPS → SEC · 1 pt · 18/11 — ✅ SEC+ORQ; mergeado PR #3 (2bb1a82); banco sobe no job db do CI
- SETUP-03 · CI + preview Vercel · OPS → ORQ · 2 pts · 18/11 — ✅ ORQ (QA no DOM-01); mergeado PR #6 (c0ebd19); CI main 4f973bb verde (quality, db, e2e); preview Vercel depende de PEN-05/06
- SEC-01 · Utilitário de tokens · SEC → BE · 1 pt · 19/11 — ✅ BE+ORQ; mergeado PR #7 (0416203)
- DOM-01 · drawPairs (domínio do sorteio) · SRT → QA · 2 pts · 19/11 — ✅ QA+SEC+ORQ; mergeado PR #8 (4f973bb); 100% cobertura
- DB-01 · Migrations iniciais · DB → SEC · 3 pts · 19/11 — ✅ SEC; CI main: migrations aplicam, testes SQL passam, rollback + reset ok; dívida: types.ts manual vs artefato gerado
- DB-02 · RLS + constraints · DB → SEC · 2 pts · 19/11 — ✅ SEC; teste SQL (RLS, RN02, RN09) verde no job db do CI
- SETUP-02 · Estrutura de pastas + Result + env · BE → ORQ · 1 pt · 18/11 — ✅ aprovado ORQ e mergeado (PR #4, squash ac25daf); verificado combinado com a main: lint, typecheck, 33 testes, build
- UX-01 · Design system mínimo · FE → ORQ · 2 pts · 19/11 — ✅ aprovado ORQ 17/11 e mergeado (PR #2, squash e0ab45a): lint/typecheck/test 25/build verdes conferidos; /dev/ui = 404 em produção; prints em docs/features/design-system-prints/
- SETUP-01 · Repositório Next.js + ferramentas de qualidade · OPS → ORQ · 2 pts · 18/11 — ✅ aprovado ORQ 17/11: lint/typecheck/test/build verdes conferidos, complexity ≤ 10, strict, sem `.env` versionado; main = d82a1c7
- GRP-01 · Especificação de grupos · GRP → ORQ · 1 pt · 19/11 — ✅ reaprovado ORQ 17/11 após ajustes (`docs/features/grupos.md`); commit pendente até SETUP-01
- PAR-01 · Especificação de participantes · PAR → ORQ · 1 pt · 19/11 — ✅ reaprovado ORQ 17/11 após ajustes (`docs/features/participantes.md`); commit pendente até SETUP-01
- SRT-01 · Especificação do sorteio · SRT → ORQ · 1 pt · 19/11 — ✅ aprovado ORQ 17/11 (`docs/features/sorteio.md`); commit pendente até existir o repositório (SETUP-01)
- SEC-02 · Modelo de ameaças STRIDE inicial · SEC → ORQ · 1 pt · 18/11 — ✅ aprovado ORQ 17/11 (`docs/arquitetura/AMEACAS.md`); follow-up ADR-004 no It-2; commit pendente até SETUP-01
- QA-01 · Plano de testes com rastreabilidade · QA → ORQ · 2 pts · 18/11 — ✅ aprovado ORQ 17/11 (`docs/processo/PLANO_DE_TESTES.md`); 6 adições não bloqueantes incluídas; commit pendente até SETUP-01
- MON-01 · Páginas para aprovação do AdSense · MON → SEC · 2 pts · 19/11 — ✅ Segurança aprovou revisão 2 (condicionada aos marcadores); ✅ ORQ liberou para Pronto 17/11; PR #1 `docs/MON-01-paginas-adsense` aguarda merge; marcadores `A PREENCHER PELO RODRIGO` em PEN-01..03

## 🚀 Em produção
_(vazio)_

---

## Capacidade da iteração It-1
| Agente | Cartões | Pontos |
| --- | --- | --- |
| DevOps & Manutenção | SETUP-01, SETUP-03, SETUP-04 | 5 |
| Back-end | SETUP-02 | 1 |
| Front-end | UX-01 | 2 |
| Banco de Dados | DB-01, DB-02 | 5 |
| Segurança & LGPD | SEC-01, SEC-02 | 2 |
| QA / Testes | QA-01, QA-02 | 3 |
| Feature Sorteio | DOM-01, SRT-01 | 3 |
| Feature Grupos | GRP-01 | 1 |
| Feature Participantes | PAR-01 | 1 |
| Feature Lista de desejos | LST-01 | 1 |
| Feature Monetização | MON-01 | 2 |

## Log diário (cada agente adiciona 1 linha por dia: data · agente · ontem · hoje · impedimentos)
- 2026-11-17 · DevOps & Manutenção · PR #3 (SETUP-04) rebaseado/resolvido com main e pronto p/ merge; PR #6 (SETUP-03) entregue com pipeline CI verde no GitHub Actions (< 3 min; quality, db e e2e) · aguardar merge dos PRs #3 e #6 pelo Orquestrador · nenhum
- 2026-11-17 · Orquestrador · Backlog e kanban criados · iniciar It-1 em 18/11 · nenhum
- 2026-11-17 · Orquestrador · Revisões: SRT-01 ✅, QA-01 ✅ (com adições), PAR-01 🔁 ajustes · revisar SEC-02; acompanhar SETUP-01 e liberar SETUP-02/UX-01 · aguardando Rodrigo: ID AdSense, e-mail de contato, afiliado ML, alinhar RF11/RN05 no REQUISITOS.md
- 2026-11-17 · Orquestrador · CONTRATOS.md (SETUP-02) aprovado com decisões; GRP-01 🔁 ajustes; decisões: lista editável após sorteio (D3=não), exclusão física de desejos, exchange_date = date, evento invite_opened · aguardar SETUP-01 · confirmação da Segurança sobre idempotência do create-group
- 2026-11-17 · Orquestrador · Regra de autonomia enviada aos 11 agentes; DevOps fará git init + push para github.com/Rodrigudp/AmigoSecretoApp após SETUP-01 verde; decisões: GRP-01 ✅, wish_items.store aprovado, affiliate_click sem store, events.group_id ON DELETE SET NULL · liberar SETUP-02/UX-01 após SETUP-01 · escalado ao Rodrigo: domínio, e-mail de contato, nome do controlador, ID AdSense, domínio no ML, RF11/RN05 no REQUISITOS.md
- 2026-11-17 · Orquestrador · SETUP-01 ✅ (verificado localmente); SETUP-02 → BE e UX-01 → FE liberados; OPS segue SETUP-04 e depois SETUP-03; decisões do PO: domínio provisório amigo-secreto-app.vercel.app, RF11/RN05/RF12/RF13 pós-MVP (REQUISITOS.md alinhado); pendências do Rodrigo em PENDENCIAS_RODRIGO.md, ninguém bloqueado · revisar PRs de SETUP-02/UX-01 · nenhum
- 2026-11-17 · Orquestrador · Regra de git: pasta principal sempre em main; cada cartão com código usa worktree em C:\Users\Smart\amigo-secreto-wt\<ITEM>; BOARD/PENDENCIAS commitados pelo ORQ direto na main (docs operacionais) · — · nenhum
- 2026-11-17 · Orquestrador · UX-01 revisado e mergeado (PR #2) · revisar SETUP-02 · nenhum
- 2026-11-17 · Orquestrador · Decisão: sem Docker no host → banco validado no CI (job db do SETUP-03 com Supabase CLI); PEN-07 opcional; PR #3 (SETUP-04) com 3 ajustes pedidos e revisão da SEC; DB-01/02 já validados em PGlite pelo DB, PR único via worktree · revisar SETUP-02 e SETUP-03 · nenhum
- 2026-11-17 · Orquestrador · PR #4 (SETUP-02) e PR #5 (DB-01/02) mergeados após teste combinado; PR #3 (SETUP-04) aprovado SEC+ORQ, aguarda rebase (conflito README); bug: typecheck exige next typegen → corrigir no SETUP-03; SEC-01 e DOM-01 liberados · revisar SETUP-03 · nenhum
- 2026-11-17 · Orquestrador · PRs #3, #6, #7, #8 testados juntos e mergeados; CI da main 4f973bb verde (quality, db, e2e); DB-01/02 validados no Supabase real do CI; QA-02 liberado p/ PR · revisar QA-02 e LST-01 · dívidas: types.ts manual, rollback sem ON_ERROR_STOP, 19 vulnerabilidades altas no npm audit, actions em Node 20
- 2026-11-17 · Monetização · MON-01 iniciado (textos das páginas e plano de eventos) · escrever docs/features e pedir revisão da Segurança · pendente: ID do editor AdSense (pub-…) e e-mail de contato do Rodrigo
- 2026-11-17 · Monetização · MON-01 → Pronto (Segurança r2 aprovada; ORQ liberou com marcadores PEN-01..03) · PR #1 `docs/MON-01-paginas-adsense` aguarda merge · impedimento: dados do Rodrigo (PEN-01..03), sem bloquear o merge
- 2026-11-17 · Banco de Dados · — · DB-01 e DB-02 escritos (migrations, rollback, teste SQL); revisão pedida à Segurança · impedimento: sem Supabase local (SETUP-04) para validar
- 2026-11-18 · Participantes · PAR-01 ajustado conforme revisão (cookie por grupo, mensagens SRT-01, RN07, organizador entra pelo convite) · aguardar reaprovação do Orquestrador · nenhum
- 2026-11-17 · Front-end · — · UX-01: spec do design system escrita (tokens com contraste AA, componentes, wireframes das 6 telas); componentes após SETUP-01 · impedimento: SETUP-01
- 2026-11-17 · Front-end · UX-01 spec · UX-01 implementado (Button, Input, Card, tokens) e PR #2 aberto; pedir revisão ao ORQ · nenhum
- 2026-11-17 · Sorteio · SRT-01 aprovado pelo ORQ · DOM-01 entregue no PR #8 e aprovado pelo QA e pela SEC · aguarda merge do ORQ
- 2026-11-17 · Lista de desejos · — · LST-01: spec escrita e revisada pela Monetização (✅ 17/11; D2 = beacon; ML fora da receita do lançamento); ✅ decisões do ORQ aplicadas (D3 = lista editável após o sorteio, remoção física, `affiliate_click` sem `store`, auth do beacon no ADR-004); ⏳ revisão SEC · impedimento: Rodrigo cadastrar o domínio como mídia no Programa de Afiliados do ML (D1)

- 2026-11-17 · QA · — · QA-01 elaborado e revisão solicitada · impedimentos: revisão 4/4, repositório Git e DOM-01 pendentes
- 2026-11-17 · Segurança & LGPD · — · Revisões de MON-01 (r1 reprovada, r2 aprovada) e DB-01/DB-02 (ajustes enviados ao Banco); SEC-02 concluído em `docs/arquitetura/AMEACAS.md` (movido p/ Em revisão) · SEC-01 aguarda SETUP-02
- 2026-11-17 · Feature Grupos · — · GRP-01: ajustes da revisão aplicados em docs/features/grupos.md (CONTRATOS.md, idempotência requestId, mensagens unificadas, organizador pelo convite); cartão movido p/ Em revisão · nenhum
- 2026-11-17 · Back-end · Contratos aprovados e já na main · SETUP-02: PR #4 aberto com ports, Result, env e testes locais verdes · aguarda vaga em revisão e revisão ORQ
- 2026-11-17 · Segurança & LGPD · SEC-02 aprovado; revisões de DB-01/DB-02 e SETUP-04 (PR #3) aprovadas · SEC-01 implementado em `feat/SEC-01-tokens` (PR #7 aberto, 38 testes/lint/typecheck/build verdes, revisão pedida ao Back-end) · nenhum
