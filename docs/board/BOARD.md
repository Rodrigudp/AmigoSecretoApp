# Kanban — Amigo Secreto

Mantido pelo **Orquestrador**. Os agentes só movem os **próprios** cartões e escrevem no log diário.
Backlog completo, com critérios de aceite e dependências: `docs/board/BACKLOG.md`.

Atualizado em: 2026-11-17 · Iteração atual: **It-2 · Grupo e entrada (iniciada 17/11, prevista 20–21/11)** · It-1 concluída em 17/11 · Lançamento: **28/11/2026**

## Regras do quadro
- Fluxo: **Backlog → Pronto p/ iniciar → Em andamento → Em revisão → Em teste → Pronto → Em produção**.
- **WIP:** no máximo 1 cartão "Em andamento" por agente; no máximo 4 cartões "Em revisão" no total.
- Para mover para **Pronto p/ iniciar**: cumprir o DoR. Para **Pronto**: cumprir o DoD (`PROCESSO.md` §2).
- Cartão bloqueado: marque `⛔ bloqueado: <motivo>` e avise o Orquestrador.
- Bugs entram como `BUG-xxx` com severidade S1–S4 (`MANUTENCAO.md`); S1/S2 vão direto para o topo de "Pronto p/ iniciar".
- Formato do cartão: `ID · título · dono → revisor · pts · prazo`

---

## 🗂️ Backlog (próximas iterações)
- LST-02..04, SRT-02..04, QA-04 — It-3 (22–23/11)
- MON-02..03, SEC-04, OPS-01, QA-05..06, SEC-05 — It-4 (24–25/11)
- REL-01..02 — Release (26–28/11)

## ✅ Pronto p/ iniciar (It-2)
_(vazio)_

## ⏳ Aguardando dependência (It-2)
_(vazio)_

## 🔨 Em andamento
- SEC-03 · Rate limit (criar e entrar) + headers de segurança · SEC → OPS · 2 pts · 20/11 — desenho e headers já; rate limit após GRP-02
- QA-03 · E2E HU01 e HU02 (360 px) · QA → ORQ · 2 pts · 21/11 — draft PR #19; CT-01 conferido no GRP-03 (661 ms, stub); CT-02 conferido no PAR-03 (742 ms, cookie ptk_, stub) e armado: no CI vira fixme enquanto a rota /g não existe; "Ana 2" segue fixme (RN07 não está no stub)

## 👀 Em revisão
_(vazio)_

## 🧪 Em teste (QA)
_(vazio)_

## 🏁 Pronto
- PAR-04 · Área do participante (esqueleto) · PAR → FE · 2 pts · 21/11 — ✅ FE+ORQ; mergeado PR #27 (`6d27d0a`); cookie só no route handler; no ?ck=1 só segue se o cookie for o token da URL; link inválido pede um novo ao organizador; a área ainda lê o stub; CI 44219272617
- BE-02 · Adapter Supabase de criar grupo e entrar (no lugar dos stubs) · BE → DB · 2 pts · 19/11 — ✅ DB+ORQ; mergeado PR #31 (`f14a5e7`); prévia não grava invite_opened, a página grava 1×; CI 44219365288, integração 2 passed / 0 skipped; a área do participante segue stub
- OPS-04 · Aplicar migrations no Supabase de produção pelo CI (`supabase db push`) + APP_URL com o domínio real · OPS → SEC · 1 pt · 20/11 — ✅ SEC+ORQ; mergeado PR #28 (`5a0a4da`); CI 44217000044; o job pulou porque PEN-08 ainda está vazio
- GRP-04 · Open Graph do convite + noindex/headers nas páginas com token · FE → SEC · 1 pt · 20/11 — ✅ SEC+ORQ; mergeado PR #30 (`b376f90`); CI da main 44216261190; a Vercel não publicou (limite diário do plano gratuito)
- GRP-05 · Painel admin: lista, contador, remover antes do sorteio · GRP → QA · 3 pts · 21/11 — ✅ QA+ORQ; casos de uso no #26 (`8296d6`); tela no #32 (`322f094`); token desconhecido devolve INVALID_LINK; ainda é stub (token demo) até o adapter; CI da main 44215037513
- OPS-02 · Expurgo automático 60 dias após a troca (pg_cron) · OPS → DB · 1 pt · 20/11 — ✅ DB+ORQ; mergeado PR #21 (`3d35962`); job diário 06:00 UTC; CI do PR 44209815039
- BE-01 · Cliente Supabase do servidor + harness de testes de integração · BE → DB · 1 pt · 18/11 — ✅ DB+ORQ; mergeado PR #20 (`34a8f9a`); smoke 1 passed / 0 skipped (CI 44209620112)
- PAR-03 · Tela de convite + tela do link pessoal · FE → PAR · 3 pts · 21/11 — ✅ PAR+ORQ; mergeados #24 (`7aa98d6`) e #25 (`4ae079c`); stub até o adapter; o cookie do link pessoal ainda é gravado na página, o PAR-04 move isso para o route handler
- DB-05 · GRANT de tabelas/sequences para service_role (decisão ORQ: opção A) · DB → SEC · 1 pt · 19/11 — ✅ SEC+ORQ; mergeado PR #22 (6aab68e); anon/authenticated sem privilégio
- GRP-03 · Tela criar grupo (`/`) + tela de sucesso · FE → GRP · 3 pts · 20/11 — ✅ GRP+ORQ; mergeado PRs #15 (4eade29) e #16 (e9e2baa); ação ainda é stub até o adapter
- GRP-02 · Caso de uso `create-group` · GRP → BE · 2 pts · 19/11 — ✅ BE+ORQ; mergeado PR #18 (d37c4b3); testado junto com o #13 sobre a main
- PAR-02 · Caso de uso `join-group` · PAR → BE · 2 pts · 19/11 — ✅ BE+ORQ; mergeado PR #13 (7d00806); evento só na RPC
- OPS-03 · Testes de integração no CI + npm audit de produção · OPS → ORQ · 1 pt · 19/11 — ✅ ORQ (QA bloqueado pelo provedor); mergeado PR #17
- DB-04 · RPCs create_group_once e join_group · DB → SEC · 2 pts · 19/11 — ✅ SEC+ORQ; mergeado PR #14 (587473e); CI db no Supabase real
- DB-03 · types.ts gerado pelo CI + comparação estrita · DB → BE · 1 pt · 19/11 — ✅ BE+ORQ; mergeado PR #10 (98a9821); CI main verde
- SEC-06 · ADR-004 token da URL → cookie por grupo · SEC → ORQ · 1 pt · 18/11 — ✅ ORQ (com ajuste do aparelho compartilhado); mergeado PR #12 (a42e992)
- OPS-00 · Endurecer CI · OPS → SEC · 1 pt · 19/11 — ✅ SEC+ORQ; mergeado PR #11 (011ef8e); 19 vulns altas = picomatch só em dev
- LST-01 · Especificação da lista + termos de afiliados · LST → MON · 1 pt · 19/11 — ✅ MON + SEC (URL/redirect) + ORQ; notas p/ LST-02/03: canRedirect com allowlist; recusar 0.0.0.0, fc00::/7, fe80::/10
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
- MON-01 · Páginas para aprovação do AdSense · MON → SEC · 2 pts · 19/11 — ✅ Segurança aprovou revisão 2 (condicionada aos marcadores); ✅ ORQ; PR #1 (`9ebc5d1`) e domínio real no PR #23 (`ebc1e8a`, https://amigo-secreto-app-five.vercel.app); marcadores `A PREENCHER PELO RODRIGO` em PEN-01..03

## 🚀 Em produção
- Site em https://amigo-secreto-app-five.vercel.app: criar/entrar (`f14a5e7`) e a área do participante (`6d27d0a`) estão na main. A Vercel não publica (limite diário) e o job de migrations pula sem os secrets do PEN-08. No site, criar grupo ainda não grava.

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
- 2026-11-17 · DevOps & Manutenção · OPS-00 mergeado (PR #11); OPS-03: PR #17 aberto com testes de integração no job db (Vitest contra Supabase local via supabase status -o env), auditoria de produção no quality job e script test:integration no package.json; CI 44203125654 100% verde (5m56s) · revisão solicitada ao QA · nenhum
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
- 2026-11-17 · Orquestrador · It-1 CONCLUÍDA (todos os cartões em Pronto; LST-01 ✅ SEC); It-2 planejada e iniciada adiantada; novos cartões BE-01, DB-04, OPS-03 · distribuir It-2 · nenhum
- 2026-11-17 · Orquestrador · OPS-00 mergeado; ADR-004 (PR #12) aprovado com ajuste obrigatório: redirect só se cookie == token da URL (aparelho compartilhado); npm audit de produção no CI vai no OPS-03 · aguardar ajuste SEC-06 · nenhum
- 2026-11-17 · Orquestrador · ADR-004 aceito e mergeado (#12); DB-03 mergeado (#10); decisão: eventos group_created/participant_joined só nas RPCs do DB-04 (sem append no caso de uso) · revisar GRP-03 (#15/#16), PAR-02 (#13), DB-04 (#14) · nenhum
- 2026-11-17 · Orquestrador · DB-04 mergeado (#14); reserva automática Cursor configurada nos 12 agentes (pedido do PO) e registrada no AGENTS.md §5 · adapters de GRP-02/PAR-02 após BE-01 · nenhum
- 2026-11-17 · Orquestrador · Plano do Cursor esgotado: BE → Gemini 4 Argon, QA → Gemini 3.8 Flash; reservas com Gemini/Claude/OpenCode depois do Cursor; PR #17 revisado pelo ORQ (2 ajustes); pedidos de BE e QA reenviados · merge de #13/#18 após revisão do BE · nenhum
- 2026-11-17 · Monetização · MON-01 iniciado (textos das páginas e plano de eventos) · escrever docs/features e pedir revisão da Segurança · pendente: ID do editor AdSense (pub-…) e e-mail de contato do Rodrigo
- 2026-11-17 · Monetização · MON-01 → Pronto (Segurança r2 aprovada; ORQ liberou com marcadores PEN-01..03) · PR #1 `docs/MON-01-paginas-adsense` aguarda merge · impedimento: dados do Rodrigo (PEN-01..03), sem bloquear o merge
- 2026-11-17 · Banco de Dados · — · DB-01 e DB-02 escritos (migrations, rollback, teste SQL); revisão pedida à Segurança · impedimento: sem Supabase local (SETUP-04) para validar
- 2026-11-17 · Participantes · PAR-01 ajustado conforme revisão (cookie por grupo, mensagens SRT-01, RN07, organizador entra pelo convite) · aguardar reaprovação do Orquestrador · nenhum
- 2026-11-17 · Participantes · PAR-01 reaprovado (Pronto); It-2 iniciada · PAR-02: caso de uso join-group implementado com fake repo, PR #13 aberto (worktree própria, branch feat/PAR-02-join-group); lint/typecheck/test 67/build verdes; revisão pedida ao Back-end · nenhum
- 2026-11-17 · Participantes · PAR-02 mergeado (PR #13); PAR-04 liberado · PAR-04 implementado (PR #27): handshake ADR-004, get-participant-view + stub, ParticipantHeader; alinhado com o FE (rotas /p/* e headers são meus); revisões de PAR-03 #24/#25 registradas nos PRs (aprovados com notas) · nenhum
- 2026-11-17 · Participantes · PAR-03 mergeado; PAR-04 rebasado na main (commit 25703d3): cookie do handshake movido p/ route handler /api/p/hs (page não grava cookie), headers centrais da GRP-04 reaproveitados, ports.findActiveByHash + expiresAt; CI 3/3 verde (Vercel preview só rate limit); revisão final pedida ao FE · nenhum
- 2026-11-17 · Front-end · — · UX-01: spec do design system escrita (tokens com contraste AA, componentes, wireframes das 6 telas); componentes após SETUP-01 · impedimento: SETUP-01
- 2026-11-17 · Front-end · UX-01 spec · UX-01 implementado (Button, Input, Card, tokens) e PR #2 aberto; pedir revisão ao ORQ · nenhum
- 2026-11-17 · Front-end · UX-01 mergeado · GRP-03 implementado (PRs #15 e #16), revisão do 20 Grupos · nenhum (stub do GRP-02 no lugar do caso de uso)
- 2026-11-17 · Front-end · GRP-03 mergeado · PAR-03: PRs #24 (lógica) e #25 (telas) abertos; revisão pedida ao 21 Participantes; QA avisado p/ HU02 · nenhum (stub tipado até BE-01/adapter)
- 2026-11-17 · Front-end · PAR-03 · ✅ 21 aprovou #24/#25 (notas não bloqueantes BE-01 e handshake → PAR-04); aguarda merge ORQ · nenhum
- 2026-11-17 · Front-end · PAR-03 mergeado · GRP-04: PR #30 aberto (OG + noindex/headers); revisão pedida à 15 Segurança · nenhum
- 2026-11-17 · Front-end · GRP-04 · ✅ SEC aprovou #30 (sem ajustes obrigatórios); aguarda merge ORQ · nenhum
- 2026-11-17 · Front-end · PAR-04 · ✅ re-review #27 (`fb147ae`) aprovado; aguarda merge ORQ · nenhum
- 2026-11-17 · Orquestrador · PAR-03 mergeado (#24 `7aa98d6`, #25 `4ae079c`) · GRP-04 para o Front-end · nenhum
- 2026-11-17 · Sorteio · SRT-01 aprovado pelo ORQ · DOM-01 entregue no PR #8 e aprovado pelo QA e pela SEC · aguarda merge do ORQ
- 2026-11-17 · Lista de desejos · — · LST-01: spec aprovada pela Monetização (✅ 17/11) e pela Segurança (✅ 17/11; notas de canRedirect e IPs reservados incorporadas); decisões do ORQ aplicadas; pronto p/ validação final do Orquestrador · impedimento: Rodrigo cadastrar o domínio como mídia no Programa de Afiliados do ML (D1)

- 2026-11-17 · QA · QA-03 no PR #19 · GRP-05: #26 aprovado e #29 reaprovado (35ad701, 111 testes) · nenhum
- 2026-11-17 · QA · — · QA-01 elaborado e revisão solicitada · impedimentos: revisão 4/4, repositório Git e DOM-01 pendentes
- 2026-11-17 · Segurança & LGPD · — · Revisões de MON-01 (r1 reprovada, r2 aprovada) e DB-01/DB-02 (ajustes enviados ao Banco); SEC-02 concluído em `docs/arquitetura/AMEACAS.md` (movido p/ Em revisão) · SEC-01 aguarda SETUP-02
- 2026-11-17 · Feature Grupos · GRP-01 concluído (Pronto) · GRP-02 e GRP-03 mergeados; GRP-05 entregue em PRs empilhados #26 (casos de uso, 290L) e #29 (interface /admin/[token], AdminPanel, 371L); 110 testes, typecheck, lint e build verdes; CI 3 jobs verdes (44210246791); revisão pedida ao 13 QA · nenhum
- 2026-11-17 · Back-end · Contratos aprovados e já na main · SETUP-02: PR #4 aberto com ports, Result, env e testes locais verdes · aguarda vaga em revisão e revisão ORQ
- 2026-11-17 · Segurança & LGPD · SEC-02 aprovado; revisões de DB-01/DB-02 e SETUP-04 (PR #3) aprovadas · SEC-01 implementado em `feat/SEC-01-tokens` (PR #7 aberto, 38 testes/lint/typecheck/build verdes, revisão pedida ao Back-end) · nenhum
- 2026-11-17 · Segurança & LGPD · SEC-01 mergeado (PR #7); LST-01 aprovado · OPS-00 (PR #11) revisado e aprovado com recomendação; SEC-06 (ADR-004) entregue no PR #12 (`docs/SEC-06-adr-004`) e movido p/ Em revisão · nenhum
- 2026-11-17 · Orquestrador · Merges #13, #18, #1, #15, #16; Vercel configurada (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e APP_URL em Production e Preview) e produção no ar · Decisões: DB-05 = GRANT explícito para service_role (opção A, sem auto_expose); APP_URL = domínio real amigo-secreto-app-five.vercel.app; migrations de produção pelo CI (OPS-04) · impedimento: PEN-08
- 2026-11-17 · Monetização · PR #1 mergeado · PR #23 com `https://amigo-secreto-app-five.vercel.app`; CI verde (Quality, Database, E2E) · nenhum
- 2026-11-17 · Orquestrador · PR #23 mergeado (`ebc1e8a`); DB-05 já na main (`6aab68e`) · OPS-02 (#21) em conflito no ci.yml; BE-01 (#20) espera o smoke do job db · impedimento: PEN-08
- 2026-11-17 · Back-end · BE-01: rebase #20 após DB-05 (`0d483d6`); CI 44209620112 smoke 1 passed / 0 skipped; reaprovação pedida ao 12 · nenhum
- 2026-11-17 · Back-end · BE-01: 12 Banco aprovou PR #20 (`0d483d6`); Orquestrador avisado para merge · nenhum
- 2026-11-17 · Orquestrador · BE-01 mergeado (#20, `34a8f9a`) · BE-02 (adapter de criar e entrar) para o Back-end · impedimento: PEN-08 para o banco de produção
- 2026-11-17 · Back-end · BE-02: PR #31 aberto (`c4b7cb1`); adapters create/invite/join; CI 44212657904 com 2 passed / 0 skipped; revisão pedida ao 12 · nenhum
- 2026-11-17 · Back-end · BE-02: 12 Banco aprovou PR #31 (`c4b7cb1`); Orquestrador avisado para merge · nenhum
- 2026-11-17 · Orquestrador · OPS-02 mergeado (#21, `3d35962`) depois do rebase do DevOps · impedimento: PEN-08 para o banco de produção
- 2026-11-17 · Orquestrador · GRP-05 mergeado: casos de uso #26 (`8296d6`) e tela #32 (`322f094`); o #29 fechou com a branch base · impedimento: PEN-08
- 2026-11-17 · Orquestrador · PAR-04 (#27) conflita com a main nas duas páginas /p; rebase pedido ao Participantes · nenhum
- 2026-11-17 · Orquestrador · PAR-04 rebaseado (`25703d3`); revisão pedida ao Front-end · nenhum
- 2026-11-17 · Orquestrador · PAR-04: FE pediu 2 ajustes no #27; encaminhados ao Participantes · nenhum
- 2026-11-17 · Participantes · PAR-04 · ajustes do FE aplicados no #27 (`fb147ae`): ?ck=1 só canonicaliza com cookie == token da URL (senão fallback adsAllowed=false, caso de aparelho compartilhado, com teste novo) e "Peça um novo link ao organizador." nas duas telas de link inválido; lint/typecheck/147 testes/build locais e CI 3/3 verdes (Vercel segue rate limit, alheio ao código); re-revisão pedida ao FE · nenhum
- 2026-11-17 · Participantes · PAR-04 · ✅ re-review do FE: APROVADO no fb147ae, sem mais pedidos (notas não bloqueantes pós-merge); merge do Orquestrador · nenhum
- 2026-11-17 · Orquestrador · OPS-04 no PR #28, CI verde, ambiente production criado · falta PEN-08 e a revisão da Segurança · impedimento: PEN-08
- 2026-11-17 · Orquestrador · OPS-04 mergeado (#28, `5a0a4da`); CI 44217000044; deploy de migrations pulou sem os secrets · impedimento: PEN-08
- 2026-11-17 · Orquestrador · BE-02 (#31) aprovado pelo Banco, mas conflita e a prévia gravaria invite_opened; rebase pedido ao Back-end · nenhum
- 2026-11-17 · Orquestrador · BE-02 em `f4a55e9`: prévia sem evento; aguarda reaprovação do Banco · nenhum
- 2026-11-17 · Orquestrador · BE-02 mergeado (#31, `f14a5e7`); CI 44219365288 · impedimento: PEN-08 e o limite da Vercel
- 2026-11-17 · Orquestrador · PAR-04 mergeado (#27, `6d27d0a`); CI 44219272617 · a área ainda é stub · impedimento: PEN-08 e o limite da Vercel
- 2026-11-17 · Orquestrador · GRP-04 mergeado (#30, `b376f90`); CI 44216261190 verde; deploy da Vercel barrado pelo limite diário · nenhum
