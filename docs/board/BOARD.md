# Kanban — Amigo Secreto

Mantido pelo **Orquestrador**. Os agentes só movem os **próprios** cartões e escrevem no log diário.
Backlog completo, com critérios de aceite e dependências: `docs/board/BACKLOG.md`.

Atualizado em: 2026-11-18 · Iteração atual: **It-3 · Lista e sorteio (aberta 18/11 adiantada)** · MON-02 e SEC-04 adiantados da It-4 · It-1 concluída em 17/11 · Lançamento: **28/11/2026**

## Regras do quadro
- Fluxo: **Backlog → Pronto p/ iniciar → Em andamento → Em revisão → Em teste → Pronto → Em produção**.
- **WIP:** no máximo 1 cartão "Em andamento" por agente; no máximo 4 cartões "Em revisão" no total.
- Para mover para **Pronto p/ iniciar**: cumprir o DoR. Para **Pronto**: cumprir o DoD (`PROCESSO.md` §2).
- Cartão bloqueado: marque `⛔ bloqueado: <motivo>` e avise o Orquestrador.
- Bugs entram como `BUG-xxx` com severidade S1–S4 (`MANUTENCAO.md`); S1/S2 vão direto para o topo de "Pronto p/ iniciar".
- Formato do cartão: `ID · título · dono → revisor · pts · prazo`

---

## 🗂️ Backlog (próximas iterações)
- QA-05..06 — It-4 (24–25/11)
- REL-01..02 — Release (26–28/11)

## ✅ Pronto p/ iniciar
- BUG-010 · S2 · App: "Salvar presente" fica em "Salvando…" com POST 201 e chave duplicada do item no React (Expo Web live; lógica igual no nativo) · FE → QA · responsável: 11 Front-end (apoio 22)
- BUG-011 · S4 · App: aviso "Unexpected text node: ." em /g, /p e /admin; e recarregar após "Grupo criado" volta ao formulário · FE → QA · responsável: 11 Front-end
- APP-QA-02 · Aceite do app com API real: contrato v1 (feito no #110) + interface no Expo Web em modo live contra Next/Supabase locais após o BUG-008 (#113), prints e bugs · QA → ORQ · 2 pts — responsável: 13 QA
- APP-DSN-03 · 5 capturas das lojas (1080×1920; 1290×2796; 1242×2208) a partir do app real com dados fictícios, em docs/marketing/capturas/ · DSN → MKT · 2 pts — responsável: 16 Designer
- APP-LEG-01 · /privacidade e /termos cobrindo o app (SecureStore, push opcional, push_tokens, v1 sem anúncio) · MON → SEC + DSN · 1 pt — responsável: 24 Monetização
- APP-MKT-01 · Fichas das lojas em pt-BR + questionário de privacidade · MKT → DSN + SEC · 2 pts — responsável: 25 Marketing

## ⏳ Aguardando dependência
_(vazio)_

## 🔨 Em andamento

- APP-FE-03 · PRIORIDADE BUG-008 (cliente ignora EXPO_PUBLIC_API_URL; Expo Web em modo live não persiste credenciais) + config de produção por perfil no eas.json (API https://papelzinho.app, MOBILE_API=live, versão 1.0.0/1) + docs/ops/app-release.md · FE → SEC + QA · 3 pts — responsável: 11 Front-end


## 👀 Em revisão
- SEC-05 · Revisão final de segurança (OWASP Top 10, RNF03–05) · SEC → ORQ · 18/11 — `docs/seguranca/SEC-05.md` (0 Críticos, 0 Altos, 2 Médios, 2 Baixos)
- APP-OPS-01 · EAS Build/Submit no CI, assetlinks.json e apple-app-site-association no site, checklist das contas das lojas · OPS → SEC · 3 pts — `docs/ops/app-lojas.md`, PR aberto

## 🧪 Em teste (QA)

## 🏁 Pronto
- APP-API-02 · API v1: PR A infraestrutura (Bearer por tipo, erros, headers, rate limit api_v1), PR B grupos/convite/participante/meus grupos/push-tokens, PR C envio de push e job do lembrete · BE → SEC · 8 pts — responsável: 10 Back-end — ✅ mergeado
- DB-APP-01 · Migration `push_tokens` + `push_reminders_sent` (RLS só service_role, cascade, rollback, testes) · DB → SEC · 2 pts — responsável: 12 Banco — ✅ mergeado
- APP-API-02b · API v1: endpoints da lista (`/participant/wishes`) · LST → SEC · 2 pts — responsável: 22 Lista (após o PR A do 10) — ✅ mergeado
- APP-API-02c · API v1: `/admin`, remover participante, `/admin/draw`, `/participant/reveal` · SRT → SEC · 3 pts — responsável: 23 Sorteio (após o PR A do 10) — ✅ mergeado
- APP-DSN-02 · Ícones (iOS, Android adaptativo, monocromático, notificação) e splash do app · DSN → FE · 2 pts — responsável: 16 Designer — ✅ mergeado
- APP-QA-01 · Plano de testes do app + testes de contrato da v1 (fixme até os endpoints) · QA → ORQ · 3 pts — responsável: 13 QA — ✅ mergeado
- REL-02-QA · Checklist de regressão do site para 28/11 · QA → ORQ · 1 pt — responsável: 13 QA — ✅ mergeado
- APP-OPS-02 · Workflow EAS manual (desligado sem EXPO_TOKEN) + eas.json · OPS → SEC · 2 pts — responsável: 14 DevOps — ✅ mergeado
- APP-FE-02 · Telas reais do app (Meus grupos, criar, convite/entrar, área + lista offline, Revelar, painel), cliente tipado do contrato com mocks · FE → DSN + SEC · 8 pts — responsável: 11 Front-end — ✅ mergeado
- REL-02 · CHANGELOG v1.0.0 + docs/ops/release.md (tag só em 28/11) · OPS → ORQ · 2 pts — `CHANGELOG.md` e `docs/ops/release.md` entregues, PR aberto — ✅ mergeado
- LST-03 · Afiliado Amazon (papelzinho20-20) + clique por beacon; /r desligado por flag · LST → SEC + DSN · 3 pts · 22/11 — ✅ SEC+DSN+ORQ; mergeado #77 (`ea0993f`); Mercado Livre removido pelo PO
- REL-01 · Teste com grupos reais do PO · ORQ → QA · 2 pts · 18/11 — ✅ PO testou o fluxo completo em produção (criar → entrar → lista → sortear → Revelar): "tá ok"
- SRT-04 · `get-my-result` + cartão "Revelar" · SRT → SEC + DSN + QA · 3 pts · 23/11 — ✅ SEC+DSN+ORQ; mergeados #66 e #67 (`a0a6995`), E2E hu04/hu05/result-isolation ativos
- MON-02 · Slots AdSense lazy + chave `ADS_ENABLED` · MON → SEC + DSN · 2 pts · 24/11 — ✅ SEC+DSN+ORQ; mergeado #62 (`8032481`); anúncios DESLIGADOS até aprovação do Google; links de saída da área monetizada são âncoras nativas
- MON-02a · Verificação do site no AdSense (meta tag + /ads.txt) · MON → SEC · 1 pt · 18/11 — ✅ SEC+ORQ; mergeado #65; site verificado no AdSense
- SEC-04 · Aviso de cookies / consentimento para anúncios · SEC → MON + DSN · 2 pts · 24/11 — ✅ MON+DSN+ORQ; mergeado #64 (`1d64d86`)
- BUG-SEC · Token do participante serializado no client na rota limpa · FE → SEC · S2 · 18/11 — ✅ SEC+ORQ; mergeado #63 (`07050be`)
- MKT-03 · Página Como funciona + SEO técnico · MKT → SEC + DSN · 2 pts · 22/11 — ✅ SEC+DSN+ORQ; mergeado #45
- OPS-DOC · Remover usuário SSH e portas de terceiros dos docs (repo público) · OPS → ORQ · 18/11 — ✅ ORQ; mergeado #68
- LST-04 · Tela da lista na área do participante · FE → LST + DSN · 2 pts · 22/11 — ✅ DSN+ORQ; mergeado PR #59 (`850293a`), no ar
- MON-03 · Plano de eventos e painel do dono (RF14) · MON → SEC + DSN · 3 pts · 24/11 — ✅ SEC+DSN+ORQ; mergeado PR #61 (`7eee344`); /owner responde 401 sem senha; métricas só agregadas ("entradas", não pessoas únicas)
- MKT-04 · Kit de posts e divulgação · MKT → DSN · 1 pt · 22/11 — ✅ DSN+ORQ; mergeado PR #46 (`c5e6c81`)
- SRT-03 · Caso de uso `run-draw` + botão "Sortear" · SRT → SEC + DSN · 3 pts · 21/11 — ✅ SEC+DSN+ORQ; mergeados #57, #58 e follow-up #60 (`d8da9d6`)
- SRT-02 · RPC transacional `run_draw` · DB → SRT · 2 pts · 20/11 — ✅ SRT+ORQ; aplicada à mão em produção
- LST-02 · Casos de uso CRUD da lista · LST → SEC · 2 pts · 20/11 — ✅ SEC+ORQ; mergeados #54 e adapter #50 (`1c24b85`)
- QA-04 · E2E HU03–HU05 + "resposta nunca vaza pares" · QA → SEC · 3 pts · 23/11 — ✅ SEC+ORQ; mergeado PR #51; trava PEN no #56 (desligada até o REL-02)
- OPS-01 · Monitoramento de erros, uptime e alertas S1 · OPS → SEC · 2 pts · 21/11 — ✅ SEC+ORQ; mergeado PR #53 (`e99243f`); falta só o canal do Discord para os avisos
- MON-01-APP · Páginas /sobre, /privacidade, /termos, /contato no app · MON → SEC + DSN · 2 pts · 20/11 — ✅ SEC+DSN+ORQ; no ar com marcadores PEN-01/02
- FE-DSN-4 · A-06, A-10 + rodapé "Privacidade · Termos" · FE → DSN · 1 pt · 21/11 — ✅ DSN+ORQ; mergeado PR #55 (`55830ab`)
- DSN-04 · Especificação da lista, do "Revelar" e do sorteio no painel · DSN → ORQ · 2 pts · 20/11 — ✅ ORQ; mergeado PR #48 (`25051f7`); `docs/features/dsn-04-it3.md`, textos WSH/REV/DRW
- BE-03 · Adapters Supabase do painel do organizador e da área do participante · BE → DB · 3 pts · 20/11 — ✅ DB+ORQ; mergeado PR #44 (`c0204a3`); integração 3 passed / 0 skipped; fluxo testado em produção em https://papelzinho.app. Dívida: remoção×sorteio atômica (SRT) e log de erro de infra sem token
- FE-DSN-2 · Painel e área: A-03, A-08, A-09 + textos ADM-04/05/12 · FE → DSN · 2 pts · 21/11 — ✅ DSN+ORQ; mergeado PR #41 (`6332545`)
- OPS-VPS · Hospedagem na VPS própria · OPS → SEC · 3 pts · 19/11 — ✅ SEC+ORQ; mergeado PR #35 (`6bb4090`); no ar em https://papelzinho.smartsolutionsbr.com.br (Let's Encrypt, pm2 fork 1 instância com boot automático, deploy da main pelo GitHub Actions); Vercel sem deploy automático
- FE-DSN-1 · Correções de componentes A-01, A-02, A-04 · FE → DSN · 2 pts · 20/11 — ✅ DSN+ORQ; mergeado PR #40 (`1992495`)
- DSN-01 · Guia de voz + inventário de textos · DSN → ORQ · 3 pts · 20/11 — ✅ ORQ; mergeado PR #38 (`1f15e34`)
- DSN-02 · Auditoria visual Estilo Notion · DSN → FE · 2 pts · 20/11 — ✅ ORQ; mergeado PR #38 (`1f15e34`); 10 correções em 4 cartões FE-DSN
- MKT-01 · Plano de lançamento e primeiro Natal · MKT → ORQ · 3 pts · 20/11 — ✅ ORQ; mergeado PR #37 (`b36512f`); recomenda papelzinho.app (PEN-09); divulgação só com HTTPS (PEN-10)
- MKT-02 · Palavras-chave e SEO · MKT → DSN · 2 pts · 21/11 — ✅ DSN+ORQ; mergeado PR #36 (`e4ad013`)
- QA-03 · E2E HU01 e HU02 (360 px) · QA → ORQ · 2 pts · 21/11 — ✅ ORQ; mergeado PR #19 (`fd960e5`) após atualizar com a main (SEC-03 + UX-LOGO), CI 44296421548 verde; criar 1.390 ms, entrar 2.582 ms; fixme só em grupo sorteado (SRT-03) e grupo cheio (coberto no SQL)
- SEC-03 · Rate limit (criar e entrar) + headers de segurança · SEC → OPS · 2 pts · 20/11 — ✅ OPS+ORQ; mergeado PR #33 (`d012793`); limite em memória (10/10 min criar, 30/10 min entrar), exige pm2 fork com 1 instância; headers no next.config.ts; CI 44294412070
- UX-LOGO · Logo oficial do Papelzinho + redesign Estilo Notion · FE → ORQ · 2 pts · 19/11 — ✅ ORQ; mergeado PR #34 (`7644a71`); recortes conferidos contra o PNG original; capturas 1280 e 360 px no PR; CI 44294057818
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
- 2026-11-18 · Lista de desejos · LST-01 aprovado · LST-02: casos de uso (add, update, remove, list), schemas e validação estrita de URL implementados; 24 novos testes unitários; PR #54 aberto e CI 100% verde (Quality, Database, E2E); revisão pedida à Segurança · nenhum
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
- 2026-11-17 · Orquestrador · UX-01: referência Fermento confirmada pelo PO. Textura do pacote no fundo, formulário em superfície sólida, vermelho escuro para rótulos e ações de texto, e seta animada no botão de criar grupo.
- 2026-11-17 · Orquestrador · UX-01: Papelzinho aprovado pelo PO como nome público do app. Marca aplicada à interface, aos títulos das páginas e ao compartilhamento.
- 2026-11-18 · Orquestrador · UX-01: o PO trocou a referência visual para Estilo Notion do Profitize. Componentes, telas públicas e painel usam papel quente, superfícies brancas, azul para ações e fontes locais.
- 2026-11-18 · Orquestrador · Redesign Estilo Notion publicado na branch `feat/UX-papelzinho-notion` (`cc40f14`). UX-LOGO criado e atribuído ao 11 Front-end: o PO enviou a logo com mascote 3D · nenhum
- 2026-11-18 · Orquestrador · UX-LOGO mergeado (#34, `7644a71`). PO decidiu sair da Vercel por causa do limite de deploys; OPS-VPS criado para o 14 DevOps (pm2 + nginx em porta própria, sem domínio). SEC-03 e QA-03 cobrados para continuar · nenhum
- 2026-11-18 · Segurança & LGPD · Revisões de DB-04, DB-05, GRP-04 e OPS-04 concluídas · SEC-03 implementado (`rate-limit.ts`, `security-headers.ts`, `actions.ts`, `next.config.ts`) e PR #33 aberto com CI 44294412070 verde; revisão pedida ao 14 DevOps · nenhum
- 2026-11-18 · Orquestrador · SEC-03 mergeado (#33, `d012793`) após aprovação do 14 DevOps · nenhum
- 2026-11-18 · QA · QA-03 rebase na main e HU01/HU02 reais em 360 px · PR #19 fora de draft com CI 44295573056 verde; criar 1.390 ms, entrar 2.582 ms, "Ana 2" no adapter real; fixme só em grupo sorteado e grupo cheio · nenhum
- 2026-11-18 · Orquestrador · QA-03 mergeado (#19, `fd960e5`) após rodar o CI de novo com a main atual; OPS-VPS em revisão no #35 · nenhum
- 2026-11-18 · Orquestrador · Entraram 16 Designer e 25 Marketing. DSN-01/02 e MKT-01/02 liberados. Visual e textos passam ao 16; ORQ só aprova. PEN-09 (domínio) registrado como decisão de gasto do PO · nenhum
- 2026-11-18 · Orquestrador · Decisão HTTPS×RNF03: IP:8090 em HTTP só para homologação interna; lançamento só com HTTPS. Endereço provisório papelzinho.smartsolutionsbr.com.br (PEN-10, sem custo) com certbot; domínio próprio papelzinho.app em PEN-09 · nenhum
- 2026-11-18 · Orquestrador · Mergeados #38 (DSN-01/02), #37 (MKT-01) e #36 (MKT-02). FE-DSN-1 liberado ao 11; FE-DSN-2/3/4 e DSN-03 na fila. Decisões: rodapé LGPD obrigatório antes do lançamento; promessa da lista sai até a LST-04; DSN-03 com revisão do QA · nenhum
- 2026-11-18 · Orquestrador · OPS-VPS no ar em https://papelzinho.smartsolutionsbr.com.br (certificado, nginx testado antes do reload, pm2 no boot, outros sites conferidos). FE-DSN-1 mergeado (#40); FE-DSN-2 liberado. Bloqueio do SSH do PO: regra LIMIT do ufw renovada por conexões em sequência e espera em loop; regra registrada em docs/ops/vps.md §9 · nenhum
- 2026-11-18 · Orquestrador · FE-DSN-2 mergeado (#41, `6332545`) e publicado na VPS pelo CI; DSN-03 + FE-DSN-3 liberado ao 11 · nenhum
- 2026-11-18 · Orquestrador · MKT-03 liberado ao 25 (caminho crítico do lançamento); MKT-04 em seguida, MKT-05 depois · nenhum
- 2026-11-18 · Orquestrador · BUG criar grupo em produção: banco vazio porque o job de migrations pula sem PEN-08. Apliquei à mão no SQL Editor as 5 migrations (até 20261121000100) e o histórico em supabase_migrations.schema_migrations. Criar e entrar testados no site; grupo e eventos de teste apagados · PEN-08 segue para migrations novas
- 2026-11-18 · Orquestrador · Lacuna achada na revisão geral: painel do organizador e área do participante ainda em stub em produção. BE-03 criado para o 10 Back-end, prioridade máxima · nenhum
- 2026-11-18 · Back-end · BE-03: adapters reais do painel e da área; demo-admin-token fora de produção; PR e revisão ao 12 · nenhum
- 2026-11-18 · Orquestrador principal (Claude) · PO comprou o domínio **papelzinho.app** (TLD .app exige HTTPS em todo acesso, HSTS pré-carregado). Prioridade 1 do 14 DevOps: nginx com server_name papelzinho.app e www, certificado Let's Encrypt (certbot), redirecionar www → raiz, atualizar a URL pública (Open Graph, sitemap, políticas, NEXT_PUBLIC_SITE_URL) e o 25 Marketing usar o domínio no SEO. O PO vai criar os registros DNS (A → 2.25.252.45) e a conta do AdSense · impedimento: DNS propagando
- 2026-11-18 · Orquestrador · BE-03 mergeado (#44, `c0204a3`). papelzinho.app no ar: DNS A @ → 2.25.252.45 na Hostinger, certificado Let's Encrypt (raiz e www), nginx com www e papelzinho.smartsolutionsbr.com.br em 301 para https://papelzinho.app, APP_URL trocado e deploy refeito. Fluxo criar → painel → entrar → área testado com dados reais; teste apagado. O item do DevOps acima já está feito · nenhum
- 2026-11-18 · Orquestrador · It-3 aberta adiantada a pedido do PO: SRT-02 (12), SRT-03 (23), LST-02 (22 + adapter do 10), DSN-04 (16), MON-01-APP (24; páginas aprovadas ainda não existiam no app), FE-DSN-4 (11), OPS-01 (14), QA-04 (13). LST-03, LST-04, SRT-04 e MON-03 na fila · nenhum
- 2026-11-18 · Orquestrador · DSN-04 aprovado e mergeado (#48). Decisões: adicionar/editar item inline, sem modal; Editar e Apagar como botões de texto visíveis (substitui o menu do item da LST-01 §2.1); Revelar é o botão principal quando há sorteio; confirmação do sorteio inline com foco em Cancelar (irreversível no MVP); resultado revelado só na tela (recarregar fecha); aviso de afiliado só quando há item daquela loja. Texto do Mercado Livre (WSH-21) depende do 24 · nenhum
- 2026-11-18 · QA · QA-04 no PR #51: page objects do painel e da área, fixture `groupFactory` criando grupos reais pelo fluxo de UI, e CT-03/CT-04/CT-05/CT-08. CI 44323760464 verde (6 passed / 7 skipped); a 1ª visita a `/p/<token>` estourava o timeout de 5 s durante a compilação da rota e foi corrigida com espera de 30 s no `open` · nenhum
- 2026-11-18 · Orquestrador · Adapter da lista mergeado (#50, `1c24b85`); migration 20261122000100_wish_item_limit aplicada à mão em produção e registrada em supabase_migrations. Revisão do 15: #49/#52 aprovados em LGPD; ajustes pedidos em #54 (URL com ponto final e tamanho pós-encoding), #51 (isolamento antes do Revelar) e #53 (2 Altas: test-alert e redact). Decisões: Papelzinho é gratuito para quem usa; a trava do marcador PEN vai para o REL-02 com o 13 · nenhum
- 2026-11-18 · DevOps · OPS-01 implementado com healthcheck /api/health, mascaramento de tokens LGPD, webhook S1 com debounce e watchdog VPS; PR aberto e enviado para revisão do 15 Segurança · nenhum
- 2026-11-18 · Orquestrador · Mergeados #59 (LST-04), #61 (MON-03) e #46 (MKT-04); deploy da main verde e /api/health ok. SRT-04 liberado ao 23. AdSense adiantado: MON-02 (24) e SEC-04 (15) começam já, com `ADS_ENABLED=false` até o Rodrigo criar a conta e mandar o ID pub- (PEN-03); pedir aprovação ao Google depende também de PEN-01/02 nas páginas legais. 11 e 15 trocados para Opus via contas do Gemini (Cursor/OpenCode sem crédito) · aguardando Rodrigo: PEN-01, PEN-02, PEN-03
- 2026-11-18 · Orquestrador · AdSense: conta criada pelo PO, ID pub-2752974850416759 (PEN-03). MON-02a (24): meta tag `google-adsense-account` + /ads.txt, sem script, para verificar o site. Decisão sobre a recomendação do 15 (dois root layouts): adiada para depois do lançamento como dívida; agora vale a correção do token pelo 11 + páginas monetizadas sem next/link para rotas com token (teste no #62). Anúncios só ligam após a correção do 11 e o SEC-04 real · aguardando Rodrigo: PEN-01, PEN-02 antes de pedir revisão ao Google
- 2026-11-18 · Orquestrador · Repositório público (decisão do PO, minutos do Actions); secret scanning e push protection ligados; gitleaks sem segredo real. Mergeados #63, #64, #45, #62 (anúncios desligados), #65 (site verificado no AdSense), #68, #66 e #67 (rebaseado pelo ORQ, conflito só de imports). SSH da VPS aceita senha; PO decidiu manter (porta 8090 fechada por fora) · aguardando Rodrigo: PEN-01, PEN-02 e teste ponta a ponta com os dois grupos
- 2026-11-18 · Orquestrador · REL-01 ok pelo PO. PEN-11: webhook do Discord salvo no .env.production da VPS (600) e no secret production do GitHub; alerta de teste entregue (204). Cron do watchdog ausente: pedido ao 14. Mergeados #69 (PEN-01/02) e #70 ("encontro" no lugar de "troca"). QA-05/QA-06 liberados ao 13 · aguardando Rodrigo: caixa suporte@ confirmada, IDs de afiliado (Amazon, ML)
- 2026-11-18 · Orquestrador · Mercado Livre: conta de afiliado aprovada, mas o gerador de links é só manual (sem API) e os termos proíbem alterar links. Decisão: no lançamento ML fica sem comissão nas listas (passthrough do LST-03); pós-lançamento MKT-05 com links gerados à mão. AdSense: revisão do site pedida (status "Preparando"). Mergeados #71 (MON-01b), #75 (BUG-007), #76 (divulgação Amazon) · aguardando Rodrigo: cadastro do papelzinho.app como mídia no ML, confirmação da caixa suporte@
- 2026-11-18 · Orquestrador · PO decidiu REMOVER o Mercado Livre do programa de afiliados (sem API, listas privadas não contam como mídia, cadastro de site indisponível). Só Amazon (papelzinho20-20). Remoção de código, textos e docs no #77 (22), com revisão do 15 e do 16. MKT-05 cancelado · nenhum
- 2026-11-18 · Orquestrador · PO pediu a versão app para App Store e Play Store (objetivo original). ADR-005: Expo em mobile/, API v1 sobre os mesmos casos de uso, Bearer no SecureStore, App/Universal Links, push, AdMob. Site segue para 28/11 sem mudança. Cartões APP-* abertos · aguardando Rodrigo: contas Apple Developer e Google Play Console
- 2026-11-18 · DevOps · APP-OPS-01: guia das lojas (Apple US$ 99/ano, Google US$ 25 taxa única com regra de 14 dias/12 testadores), plano EAS CI/CD, endpoints de deep linking (assetlinks.json e apple-app-site-association) servidos com fallbacks e 7 testes unitários; PR aberto · aguardando Rodrigo: criação das contas de desenvolvedor
- 2026-11-18 · Orquestrador · APP-MON-01 (#81): app v1 vai às lojas SEM monetização (sem AdMob e sem tag de afiliado; links de presente abrem a loja no navegador externo com a URL original). Monetização no app só depois de: aceite separado do Amazon Associados para app, conta AdMob + app-ads.txt, avaliação LGPD e regras Families do Play. APP-DSN-01 mergeado (#80); lembrete push 2 dias antes, 10h America/Sao_Paulo · nenhum
- 2026-11-18 · DevOps · REL-02: CHANGELOG.md da v1.0.0 e docs/ops/release.md com checklist completo do dia 28/11 (code freeze, regressão QA, criação de tag/release, deploy e rollback pronto; tag NÃO criada hoje); PR aberto · nenhum
- 2026-11-18 · Orquestrador · PO ausente por 3 h com autonomia total. Mergeados #82 (Nginx sem log de /api/p/hs), #83 (contrato API v1), #79 (esqueleto Expo), #84 (SEC-05-FIX), #85 (guia das lojas + .well-known). Modelos: 12→GPT-6.2 Sol, 13→Claude Sonnet; reservas sem Cursor/OpenCode em todos. Rodada: 10 APP-API-02 (PR A infra, B, C push), 12 DB-APP-01 (push_tokens), 22 APP-API-02b (wishes), 23 APP-API-02c (admin/draw/reveal), 11 APP-FE-02 (telas), 24 APP-LEG-01 (privacidade do app), 13 APP-QA-01 + REL-02-QA, 25 APP-MKT-01 (fichas das lojas), 14 REL-02 (CHANGELOG/release, sem tag) + APP-OPS-02 (EAS manual), 16 APP-DSN-02 (ícones) + revisões · aguardando Rodrigo: contas Apple/Google/Expo, caixa suporte@
- 2026-11-18 · Orquestrador · Mergeados: #88, #89, #92, #100, #104, #105, #107 (API v1 completa), pilha mobile #91…#109 consolidada no #86 (f4a01c7), #90 (ícones), #87 (REL-02 docs), #95 (EAS), #93/#94/#97 (QA). Migration 20261123000100_push_notifications aplicada à mão em produção pelo ORQ (CI pula por falta do PEN-08); tabelas, RLS forçada e grants conferidos. Push NÃO ativado (falta conta Expo). Próximos: APP-QA-02 (13), APP-LEG-01 #98 (24), APP-MKT-01 #101 (25), Nginx api/v1 + PEN-08 visível (14) · aguardando Rodrigo: contas Apple/Google/Expo, secrets PEN-08, caixa suporte@
