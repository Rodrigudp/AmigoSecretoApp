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
- SETUP-02 · Estrutura de pastas + Result + env · BE → ORQ · 1 pt · 19/11 — ⛔ bloqueado: aguarda SETUP-01 e liberação do Orquestrador. Rascunho dos contratos do MVP em `docs/arquitetura/CONTRATOS.md`
- SETUP-03 · CI + preview Vercel · OPS → QA · 2 pts · 18/11 — depende de SETUP-01
- SETUP-04 · Supabase local + .env.example · OPS → SEC · 1 pt · 18/11 — depende de SETUP-01
- SEC-01 · Utilitário de tokens · SEC → BE · 1 pt · 19/11 — ⛔ bloqueado: SETUP-02 pendente
- DOM-01 · drawPairs (domínio do sorteio) · SRT → QA · 2 pts · 19/11 — ⛔ bloqueado: SETUP-02 pendente
- QA-02 · Teste de propriedade do sorteio · QA → SRT · 1 pt · 19/11 — ⛔ bloqueado: DOM-01 pendente

## 🔨 Em andamento
- SETUP-01 · Repositório Next.js + ferramentas de qualidade · OPS → ORQ · 2 pts · 18/11
- UX-01 · Design system mínimo · FE → ORQ · 2 pts · 19/11 — spec escrita em `docs/features/design-system.md`; ⏳ componentes em `app/_components/` aguardam SETUP-01
- MON-01 · Páginas para aprovação do AdSense (adiantado: a aprovação demora) · MON → SEC · 2 pts · 19/11 — revisão 1 reprovada pela Segurança; ajustes aplicados, ⏳ nova revisão

## 👀 Em revisão
- DB-01 · Migrations iniciais · DB → SEC · 3 pts · 19/11 — SQL escrito; ⏳ validar (aplicar/reverter) e gerar types.ts quando SETUP-04 subir o Supabase local
- DB-02 · RLS + constraints · DB → SEC · 2 pts · 19/11 — SQL + teste escritos (`supabase/tests/`); ⏳ executar quando SETUP-04 subir o Supabase local
- LST-01 · Especificação da lista + termos de afiliados · LST → MON · 1 pt · 19/11 — `docs/features/lista-desejos.md` escrito; ✅ MON aprovado 17/11; ✅ D3 = lista editável após o sorteio, remoção física, evento sem `store` (ORQ 17/11); ⏳ revisão SEC (URL/redirect); ⛔ D1: Rodrigo cadastrar o domínio como mídia no ML

## 🧪 Em teste (QA)
_(vazio)_

## 🏁 Pronto
- GRP-01 · Especificação de grupos · GRP → ORQ · 1 pt · 19/11 — ✅ reaprovado ORQ 17/11 após ajustes (`docs/features/grupos.md`); commit pendente até SETUP-01
- PAR-01 · Especificação de participantes · PAR → ORQ · 1 pt · 19/11 — ✅ reaprovado ORQ 17/11 após ajustes (`docs/features/participantes.md`); commit pendente até SETUP-01
- SRT-01 · Especificação do sorteio · SRT → ORQ · 1 pt · 19/11 — ✅ aprovado ORQ 17/11 (`docs/features/sorteio.md`); commit pendente até existir o repositório (SETUP-01)
- SEC-02 · Modelo de ameaças STRIDE inicial · SEC → ORQ · 1 pt · 18/11 — ✅ aprovado ORQ 17/11 (`docs/arquitetura/AMEACAS.md`); follow-up ADR-004 no It-2; commit pendente até SETUP-01
- QA-01 · Plano de testes com rastreabilidade · QA → ORQ · 2 pts · 18/11 — ✅ aprovado ORQ 17/11 (`docs/processo/PLANO_DE_TESTES.md`); 6 adições não bloqueantes incluídas; commit pendente até SETUP-01

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
- 2026-11-17 · DevOps & Manutenção · Planejamento inicial · Executar SETUP-01 (Next.js, TS strict, ESLint, Vitest, Playwright, Husky, commitlint) · nenhum
- 2026-11-17 · Orquestrador · Backlog e kanban criados · iniciar It-1 em 18/11 · nenhum
- 2026-11-17 · Orquestrador · Revisões: SRT-01 ✅, QA-01 ✅ (com adições), PAR-01 🔁 ajustes · revisar SEC-02; acompanhar SETUP-01 e liberar SETUP-02/UX-01 · aguardando Rodrigo: ID AdSense, e-mail de contato, afiliado ML, alinhar RF11/RN05 no REQUISITOS.md
- 2026-11-17 · Orquestrador · CONTRATOS.md (SETUP-02) aprovado com decisões; GRP-01 🔁 ajustes; decisões: lista editável após sorteio (D3=não), exclusão física de desejos, exchange_date = date, evento invite_opened · aguardar SETUP-01 · confirmação da Segurança sobre idempotência do create-group
- 2026-11-17 · Orquestrador · Regra de autonomia enviada aos 11 agentes; DevOps fará git init + push para github.com/Rodrigudp/AmigoSecretoApp após SETUP-01 verde; decisões: GRP-01 ✅, wish_items.store aprovado, affiliate_click sem store, events.group_id ON DELETE SET NULL · liberar SETUP-02/UX-01 após SETUP-01 · escalado ao Rodrigo: domínio, e-mail de contato, nome do controlador, ID AdSense, domínio no ML, RF11/RN05 no REQUISITOS.md
- 2026-11-17 · Monetização · MON-01 iniciado (textos das páginas e plano de eventos) · escrever docs/features e pedir revisão da Segurança · pendente: ID do editor AdSense (pub-…) e e-mail de contato do Rodrigo
- 2026-11-17 · Banco de Dados · — · DB-01 e DB-02 escritos (migrations, rollback, teste SQL); revisão pedida à Segurança · impedimento: sem Supabase local (SETUP-04) para validar
- 2026-11-18 · Participantes · PAR-01 ajustado conforme revisão (cookie por grupo, mensagens SRT-01, RN07, organizador entra pelo convite) · aguardar reaprovação do Orquestrador · nenhum
- 2026-11-17 · Front-end · — · UX-01: spec do design system escrita (tokens com contraste AA, componentes, wireframes das 6 telas); componentes após SETUP-01 · impedimento: SETUP-01
- 2026-11-17 · Sorteio · — · SRT-01 entregue e movido para revisão · DOM-01 aguarda SETUP-02
- 2026-11-17 · Lista de desejos · — · LST-01: spec escrita e revisada pela Monetização (✅ 17/11; D2 = beacon; ML fora da receita do lançamento); ✅ decisões do ORQ aplicadas (D3 = lista editável após o sorteio, remoção física, `affiliate_click` sem `store`, auth do beacon no ADR-004); ⏳ revisão SEC · impedimento: Rodrigo cadastrar o domínio como mídia no Programa de Afiliados do ML (D1)

- 2026-11-17 · QA · — · QA-01 elaborado e revisão solicitada · impedimentos: revisão 4/4, repositório Git e DOM-01 pendentes
- 2026-11-17 · Segurança & LGPD · — · Revisões de MON-01 (r1 reprovada, r2 aprovada) e DB-01/DB-02 (ajustes enviados ao Banco); SEC-02 concluído em `docs/arquitetura/AMEACAS.md` (movido p/ Em revisão) · SEC-01 aguarda SETUP-02
- 2026-11-17 · Feature Grupos · — · GRP-01: ajustes da revisão aplicados em docs/features/grupos.md (CONTRATOS.md, idempotência requestId, mensagens unificadas, organizador pelo convite); cartão movido p/ Em revisão · nenhum
- 2026-11-17 · Back-end · — · Redigi os contratos do MVP para revisão do Orquestrador · SETUP-02 aguarda liberação após SETUP-01
