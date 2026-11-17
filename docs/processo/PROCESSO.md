# Processo de desenvolvimento

## 1. Modelo de processo
**Kanban com iterações curtas (mini-sprints de 2 dias)**, adaptado do Scrum, porque o prazo é curto (MVP em 28/11/2026)
e o trabalho é feito por agentes em paralelo.

| Cerimônia | Quando | Quem conduz | Saída |
| --- | --- | --- | --- |
| Planejamento da iteração | Início de cada iteração | Orquestrador | Itens no `BOARD.md` com dono e prazo |
| Daily assíncrona | 1x por dia | Cada agente | Linha de status no `BOARD.md` |
| Revisão | Fim da iteração | Orquestrador + QA | Demo ao Rodrigo (dono do produto) |
| Retrospectiva | Fim da iteração | Orquestrador | 1 melhoria de processo registrada |

**Papéis humanos:** Rodrigo = Product Owner (prioriza, aprova entregas, decide escopo).

### Iterações planejadas
1. **It-1 (18–19/11):** setup do repositório, CI, schema do banco, domínio do sorteio com testes.
2. **It-2 (20–21/11):** criar grupo, entrar no grupo, link pessoal.
3. **It-3 (22–23/11):** lista de desejos, afiliados, sorteio e resultado.
4. **It-4 (24–25/11):** anúncios, painel, acessibilidade, hardening de segurança.
5. **Testes reais (26–27/11)** com 2 grupos de verdade → **Lançamento 28/11**.

## 2. Fluxo de um item (Kanban)
`Backlog → Pronto para iniciar (DoR) → Em andamento → Em revisão → Em teste (QA) → Pronto (DoD) → Em produção`

Limite de WIP: **no máximo 1 item "Em andamento" por agente.**

### Definition of Ready (DoR) — o item só começa se
- Tem ID, requisito(s) de origem (RF/RN/RNF/HU) e critérios de aceite verificáveis.
- Dependências identificadas (ex.: migration antes do endpoint).
- Contratos definidos (tipos TypeScript / formato da API) quando envolve mais de uma camada.

### Definition of Done (DoD) — o item só termina se
- Critérios de aceite atendidos e demonstráveis.
- Testes unitários e de integração escritos; cobertura do domínio ≥ 90%.
- Lint, typecheck e build passando no CI.
- Revisado por pelo menos 1 agente que não escreveu o código + Segurança quando toca dados ou tokens.
- Documentação atualizada (README, ADR, CHANGELOG quando aplicável).
- Funciona no navegador interno do WhatsApp (RNF08) quando é tela.

## 3. Git e versionamento
- **Trunk-based development:** `main` sempre implantável; branches curtas (< 1 dia).
- Nome de branch: `feat/<item>-<slug>`, `fix/<item>-<slug>`, `chore/...`, `refactor/...`, `docs/...`.
- **Conventional Commits:** `feat(sorteio): generate derangement on server`.
- **SemVer:** MVP = `v1.0.0`. Correção = patch, nova funcionalidade = minor, quebra = major.
- `CHANGELOG.md` no formato *Keep a Changelog*.
- Merge por **squash**, feito apenas pelo Orquestrador.

## 4. Revisão de código (checklist)
- [ ] Atende os critérios de aceite do item.
- [ ] Respeita as camadas da arquitetura (domínio não importa Supabase nem Next.js).
- [ ] Sem segredo no código; entrada validada (Zod) na borda.
- [ ] Nomes claros, funções pequenas, sem código morto.
- [ ] Testes cobrem o caminho feliz e os erros.

## 5. Estratégia de testes (pirâmide)
| Nível | Ferramenta | Cobre |
| --- | --- | --- |
| Unitário | Vitest | Domínio (sorteio, regras de negócio), validações |
| Integração | Vitest + Supabase local | Casos de uso + repositórios + RLS |
| E2E | Playwright (mobile viewport) | HU01 a HU05 de ponta a ponta |
| Manual exploratório | QA + Rodrigo | WhatsApp in-app browser, iPhone e Android reais |

## 6. Gestão de riscos e mudanças
- Mudança de escopo só com aprovação do Rodrigo; o Orquestrador registra no `BOARD.md`.
- Item que estoura o prazo em 50% → Orquestrador corta escopo ou redistribui.
- Prioridade sempre: requisitos de prioridade **Alta** antes de qualquer Média/Baixa.
