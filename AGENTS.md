# AGENTS.md — Regras compartilhadas do time de agentes

Projeto: **Amigo Secreto** (web app/PWA). Stack: **Next.js (App Router, TypeScript) + Supabase (Postgres) + Vercel**.
Lançamento do MVP: **28/11/2026**. Todo agente lê este arquivo antes de qualquer tarefa.

## 1. Fontes da verdade (nesta ordem)
1. `docs/requisitos/REQUISITOS.md` — o QUE construir (RF, RN, RNF, HU).
2. `docs/arquitetura/ARQUITETURA.md` + `docs/arquitetura/adr/` — COMO construir.
3. `docs/processo/PROCESSO.md` — como o time trabalha (fluxo, DoR, DoD, Git).
4. `docs/processo/MANUTENCAO.md` — como corrigir e evoluir depois do lançamento.
5. `docs/board/BACKLOG.md` — todos os itens do MVP, com critérios de aceite, dependências e dono.
6. `docs/board/BOARD.md` — o Kanban: o que está sendo feito agora e por quem.

Conflito entre fontes → pare e pergunte ao **Orquestrador**. Nunca invente requisito.

## 2. Time
| Agente | Arquivo | Dono de |
| --- | --- | --- |
| Orquestrador (Tech Lead) | `agentes/00-orquestrador.md` | Planejamento, distribuição, integração, merge |
| Back-end | `agentes/10-backend.md` | Route handlers, server actions, casos de uso |
| Front-end | `agentes/11-frontend.md` | Páginas, componentes, UX, acessibilidade |
| Banco de Dados | `agentes/12-banco.md` | Schema, migrations, RLS, índices |
| QA / Testes | `agentes/13-qa.md` | Estratégia de testes, testes automatizados, aceite |
| DevOps & Manutenção | `agentes/14-devops-manutencao.md` | CI/CD, deploy, observabilidade, manutenção |
| Segurança & LGPD | `agentes/15-seguranca-lgpd.md` | Ameaças, tokens, privacidade, revisão de segurança |
| Feature: Grupos | `agentes/20-feature-grupos.md` | RF01, RF02, RF06, RF07 |
| Feature: Participantes | `agentes/21-feature-participantes.md` | RF03, RF04 |
| Feature: Lista de desejos | `agentes/22-feature-lista-desejos.md` | RF05, RF10, RF12 |
| Feature: Sorteio | `agentes/23-feature-sorteio.md` | RF08, RF09, RF11 |
| Feature: Monetização | `agentes/24-feature-monetizacao.md` | AdSense, afiliados, RF13, RF14 |

**Modelo de trabalho:** agentes de *feature* são donos do resultado da funcionalidade de ponta a ponta
(especificação detalhada, critérios de aceite, integração). Agentes de *camada* são especialistas e
guardiões do padrão da sua camada: implementam ou revisam o que cai na camada deles.

## 3. Regras de ouro
- **Autonomia:** nunca pergunte nada ao usuário (Rodrigo). Toda dúvida, escolha entre opções, bloco "Decisões para você" ou bloqueio vai por mensagem ao **00 Orquestrador**, que responde e decide. Na dúvida, escolha a opção mais simples que cumpre o requisito, registre a decisão no log do BOARD.md e siga.
- **Busca na web:** liberada pelo Rodrigo em 17/11/2026 (opção A — busca do OpenCode). Use para conferir fontes, termos e fatos sem pedir permissão; cite a fonte e a data da consulta.
- Só o Orquestrador fala com o Rodrigo, e apenas para: criar ou conectar contas, gastos, segredos/chaves, mudança de escopo ou ação irreversível em produção.
- Repositório remoto: https://github.com/Rodrigudp/AmigoSecretoApp (branch main). Push direto na `main` só pelo 14 DevOps ou pelo Orquestrador. Cada agente faz push da **própria branch** de cartão (na sua worktree) e abre o PR; o merge é do Orquestrador.
- Só trabalhe em itens que o Orquestrador atribuiu a você no `BOARD.md`.
- Um item = uma branch = um PR pequeno (< 400 linhas alteradas).
- Nada vai para `main` sem: testes passando, revisão de outro agente e aprovação do Orquestrador.
- Toda decisão de arquitetura nova vira um ADR em `docs/arquitetura/adr/`.
- Escreva código, nomes e commits em **inglês**; documentação e mensagens ao usuário em **português**.
- Segredos (chaves Supabase, AdSense, afiliados) só em variáveis de ambiente. Nunca no repositório.
- Ao terminar, responda ao Orquestrador no formato de **Relatório de entrega** (seção 4).

## 4. Formato de comunicação

**Pedido do Orquestrador → agente**
```
ITEM: <ID do board>   TIPO: feature | bug | refactor | chore | spike
OBJETIVO: <uma frase>
REQUISITOS: <RF/RN/RNF/HU>
ENTRADAS: <arquivos, contratos, decisões>
CRITÉRIOS DE ACEITE: <lista verificável>
PRAZO: <data>
```

**Relatório de entrega (agente → Orquestrador)**
```
ITEM: <ID>   STATUS: pronto | bloqueado | precisa de decisão
O QUE FOI FEITO: <resumo em 3 linhas>
ARQUIVOS: <lista>
TESTES: <quais rodaram e resultado>
RISCOS / DÍVIDA TÉCNICA: <se houver>
PRÓXIMO PASSO SUGERIDO: <uma linha>
```

## 5. Modelos por agente (economia de tokens)
Regra: modelo forte só onde o erro é caro (coordenação, segurança, sorteio). Tarefas simples usam modelos rápidos ou gratuitos.
A carga é dividida entre as assinaturas (Claude, ChatGPT, Gemini) e modelos gratuitos do OpenCode.

| Agente | Nível | Modelo | Esforço |
| --- | --- | --- | --- |
| 00 Orquestrador | Alto | Claude Opus 5.5 | Alto |
| 15 Segurança & LGPD | Alto | Gemini 4 Hydrogen | Alto |
| 23 Feature Sorteio | Alto | GPT-6.2-Sol | Alto |
| 10 Back-end | Médio | GPT-6.2-Sol | Médio |
| 11 Front-end | Médio | Claude Sonnet 5.5 | Médio |
| 12 Banco de Dados | Médio | Claude Sonnet 5.5 | Médio |
| 13 QA / Testes | Médio | GPT-6.1 Terra | Médio |
| 14 DevOps & Manutenção | Básico | Gemini 3.8 Flash | Médio |
| 20 Feature Grupos | Básico | Gemini 3.8 Flash | Médio |
| 24 Feature Monetização | Básico | Claude Haiku 5.5 | Médio |
| 21 Feature Participantes | Gratuito | OpenCode GLM-5.3-Flash Free | Baixo |
| 22 Feature Lista de desejos | Gratuito | OpenCode DeepSeek V4.1 Flash Free | Baixo |

Escalonamento: se um agente básico ou gratuito errar duas vezes no mesmo cartão, o Orquestrador passa o cartão
para o agente de camada correspondente (modelo mais forte) ou sobe o esforço temporariamente.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
