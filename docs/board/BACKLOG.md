# Product Backlog — Amigo Secreto (MVP v1.0.0)

Dono: **Orquestrador** (prioriza com o Rodrigo). Ordem = prioridade. Estimativa em **pontos** (1 = ~2 h de agente).
Cada item vai para o `KANBAN.md` quando entra numa iteração. Nenhum item começa sem cumprir o DoR (`PROCESSO.md` §2).

Legenda de agentes: ORQ Orquestrador · BE Back-end · FE Front-end · DB Banco · QA Testes · OPS DevOps & Manutenção ·
SEC Segurança & LGPD · GRP Feature Grupos · PAR Feature Participantes · LST Feature Lista de desejos ·
SRT Feature Sorteio · MON Feature Monetização

## It-1 · Fundação (18–19/11)
| ID | Item | Req. | Dono | Revisor | Pts | Depende de | Critérios de aceite |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | Repositório Next.js + TS strict, ESLint (complexity ≤ 10), Prettier, Vitest, Playwright, Husky, commitlint | ADR-001 | OPS | ORQ | 2 | — | `npm run lint/typecheck/test/build` passam no repo vazio; README com como rodar |
| SETUP-02 | Estrutura de pastas da arquitetura (`src/domain`, `application`, `infrastructure`, `shared`) + `Result` e `env.ts` com Zod | ARQ §3 | BE | ORQ | 1 | SETUP-01 | Pastas criadas; `env.ts` falha no boot se faltar variável |
| SETUP-03 | CI GitHub Actions (lint → typecheck → testes → build → E2E) + preview Vercel por PR | PROC §3 | OPS | QA | 2 | SETUP-01 | PR de teste mostra CI verde e link de preview; CI < 8 min |
| SETUP-04 | Supabase local (CLI) + `.env.example` documentado | ADR-001 | OPS | SEC | 1 | SETUP-01 | `supabase start` sobe o banco; nenhum segredo commitado |
| DB-01 | Migrations iniciais: groups, participants, wish_items, draws, pairs, events | ARQ §4 | DB | SEC | 3 | SETUP-04 | Migrations aplicam e revertem; tipos gerados em `src/infrastructure/supabase/types.ts` |
| DB-02 | RLS negando `anon`/`authenticated` em todas as tabelas + constraints de RN02 e RN09 | RN02, RN09 | DB | SEC | 2 | DB-01 | Teste prova que cliente anônimo não lê nada; trigger barra o 101º participante |
| SEC-01 | Utilitário de tokens (gerar 32 bytes base64url, hash SHA-256, comparação em tempo constante) | RNF03, ADR-002 | SEC | BE | 1 | SETUP-02 | 100% de cobertura; token nunca aparece em log |
| SEC-02 | Modelo de ameaças STRIDE inicial (`docs/arquitetura/AMEACAS.md`) | RNF03–05 | SEC | ORQ | 1 | — | Ameaças-chave do agente SEC listadas com mitigação e dono |
| DOM-01 | `drawPairs(ids, rng)` — Fisher–Yates + ciclo único | RF08, RN01, RN02, ADR-003 | SRT | QA | 2 | SETUP-02 | 100% de cobertura; erro tipado com < 3 participantes |
| QA-01 | Plano de testes com rastreabilidade HU/RN → casos → testes | HU01–HU05 | QA | ORQ | 2 | — | `docs/processo/PLANO_DE_TESTES.md` cobre todas as RN e HU |
| QA-02 | Teste de propriedade do sorteio (n de 3 a 100, 10 mil execuções) | RN02 | QA | SRT | 1 | DOM-01 | Ninguém tira a si mesmo; todos dão e recebem uma vez |
| UX-01 | Design system mínimo (cores, tipografia ≥ 16 px, Button, Input, Card) mobile first | RNF01, RNF10 | FE | ORQ | 2 | SETUP-01 | Contraste AA verificado; componentes com estados foco/erro/desabilitado |

## It-2 · Grupo e entrada (20–21/11)
| ID | Item | Req. | Dono | Revisor | Pts | Depende de | Critérios de aceite |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GRP-01 | Especificação `docs/features/grupos.md` | RF01, RF02, RF06, RF07 | GRP | ORQ | 1 | — | Fluxos, estados, mensagens e erros descritos |
| GRP-02 | Caso de uso `create-group` + repositório | RF01, RN06 | GRP | BE | 2 | DB-02, SEC-01 | Valida nome 1–60, valor > 0, data futura; gera convite e admin token; idempotente |
| GRP-03 | Tela criar grupo (`/`) + tela de sucesso com convite, botão WhatsApp e link admin | RF01, RF02, HU01 | FE | GRP | 3 | GRP-02, UX-01 | Criação < 2 min no celular; aviso para não compartilhar o link admin |
| GRP-04 | Open Graph do convite + `noindex` nas páginas com token | RNF09 | FE | SEC | 1 | GRP-03 | Prévia mostra nome do grupo no WhatsApp |
| GRP-05 | Painel admin: lista de participantes, contador, remover antes do sorteio | RF06, RF07, RN06 | GRP | QA | 3 | PAR-02 | Remover só com status `open`; token inválido não revela existência do grupo |
| PAR-01 | Especificação `docs/features/participantes.md` | RF03, RF04 | PAR | ORQ | 1 | — | Inclui fluxo "continuar como Fulano" |
| PAR-02 | Caso de uso `join-group` (sufixo em nome repetido, limite 100, grupo fechado) | RF03, RN04, RN07, RN09 | PAR | BE | 2 | DB-02, SEC-01 | Testes cobrem duplicado, cheio e sorteado |
| PAR-03 | Tela de convite (`/g/[inviteToken]`) + tela do link pessoal (copiar, salvar no WhatsApp) | RF03, RF04, HU02 | FE | PAR | 3 | PAR-02 | Entrar < 30 s; cookie `HttpOnly`/`Secure`/`SameSite=Lax` |
| PAR-04 | Área do participante (`/p/[accessToken]`) — esqueleto que abriga lista e resultado | RF04 | PAR | FE | 2 | PAR-02 | Token inválido → erro amigável |
| SEC-03 | Rate limit em criar grupo e entrar + headers de segurança (CSP, HSTS, Referrer-Policy) | RNF03 | SEC | OPS | 2 | GRP-02 | Testes de limite; headers verificados no preview |
| QA-03 | E2E HU01 e HU02 (viewport 360 px) | HU01, HU02 | QA | ORQ | 2 | GRP-03, PAR-03 | E2E verdes no CI |

## It-3 · Lista, afiliados e sorteio (22–23/11)
| ID | Item | Req. | Dono | Revisor | Pts | Depende de | Critérios de aceite |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LST-01 | Especificação `docs/features/lista-desejos.md` com regras vigentes dos programas de afiliado (fonte citada) | RF05, RF10 | LST | MON | 1 | — | Termos da Amazon e Mercado Livre conferidos |
| LST-02 | Casos de uso CRUD da lista (até 20 itens, validação de URL `https:`) | RF05 | LST | SEC | 2 | PAR-04 | Testes de limite e de URL maliciosa |
| LST-03 | Adapters de afiliado (Strategy) Amazon e Mercado Livre + redirect `/r/[itemId]` com evento | RF10 | LST | SEC | 3 | LST-02 | Sem open redirect; evento sem dado pessoal |
| LST-04 | Tela da lista de desejos na área do participante | RF05, HU03 | FE | LST | 2 | LST-02 | Adicionar item em < 20 s; estados vazio e erro |
| SRT-01 | Especificação `docs/features/sorteio.md` + diagrama de estados | RF08, RF09, RF11 | SRT | ORQ | 1 | — | Estados open → drawn → redrawn documentados |
| SRT-02 | RPC transacional `run_draw` (invalida anterior, grava draws e pairs) | RF08, RN05 | DB | SRT | 2 | DB-02 | Atômica; testada com concorrência (clique duplo) |
| SRT-03 | Caso de uso `run-draw` + botão "Sortear" no painel admin | RF08, RN01, RN03, HU04 | SRT | SEC | 3 | DOM-01, SRT-02, GRP-05 | Admin vê só "sorteio realizado"; nenhuma resposta contém pares |
| SRT-04 | Caso de uso `get-my-result` + cartão "Revelar" com a lista do sorteado | RF09, HU05 | SRT | QA | 3 | SRT-03, LST-04 | Resultado escondido até tocar; mostra só o próprio par |
| QA-04 | E2E HU03, HU04, HU05 + teste "resposta nunca vaza pares" | HU03–HU05, RN03 | QA | SEC | 3 | SRT-04 | E2E verdes no CI |

## It-4 · Receita, painel e endurecimento (24–25/11)
| ID | Item | Req. | Dono | Revisor | Pts | Depende de | Critérios de aceite |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MON-01 | Páginas para aprovação do AdSense (sobre, privacidade, termos, contato) + `ads.txt` | RNF05 | MON | SEC | 2 | — | Páginas publicadas; pedido do AdSense enviado pelo Rodrigo |
| MON-02 | Slots de anúncio lazy nas páginas de resultado e lista + chave liga/desliga | RNF02 | MON | FE | 2 | SRT-04, MON-01 | LCP < 2 s com anúncio; desligado por variável de ambiente |
| SEC-04 | Aviso de cookies / consentimento para anúncios | RNF05 | SEC | MON | 2 | MON-02 | Sem cookie de anúncio antes do consentimento |
| MON-03 | Plano de eventos e painel do dono (`RF14`) protegido por segredo | RF14 | MON | SEC | 3 | LST-03 | Mostra as 5 métricas de sucesso; nada de dado pessoal |
| OPS-01 | Monitoramento de erros, uptime e alertas S1 | MANUT §2 | OPS | SEC | 2 | SETUP-03 | Alerta de teste chega ao Rodrigo |
| OPS-02 | Cron de expurgo 60 dias após a troca | RN08 | OPS | DB | 1 | DB-02 | Teste apaga só grupos vencidos |
| QA-05 | Auditoria de acessibilidade (WCAG AA) e Lighthouse mobile | RNF02, RNF10 | QA | FE | 2 | MON-02 | Lighthouse ≥ 90 em performance e acessibilidade |
| QA-06 | Teste exploratório no navegador do WhatsApp e Instagram (Android e iPhone) | RNF08 | QA | ORQ | 2 | QA-04 | Relatório com prints; bugs registrados |
| SEC-05 | Revisão de segurança final (OWASP Top 10) | RNF03–05 | SEC | ORQ | 2 | todos | Nenhum achado Crítico ou Alto aberto |

## Release (26–28/11)
| ID | Item | Req. | Dono | Revisor | Pts | Depende de | Critérios de aceite |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REL-01 | Teste com 2 grupos reais (família e amigos do Rodrigo) | Todos | ORQ | QA | 2 | It-4 | Feedback registrado; bugs S1/S2 corrigidos |
| REL-02 | Domínio, produção, migrations em produção, tag `v1.0.0`, CHANGELOG | ADR-001 | OPS | ORQ | 2 | REL-01 | Site no ar em 28/11 |

## Pós-MVP (não entra antes do lançamento)
| ID | Item | Req. | Dono | Pts |
| --- | --- | --- | --- | --- |
| SRT-05 | Refazer sorteio com aviso a todos | RF11, RN05 | SRT | 3 |
| LST-05 | Sugestões de presente dentro do valor | RF12 | LST | 3 |
| MON-04 | Contagem regressiva até a troca | RF13 | MON | 1 |
| BKL-01 | Restrições de sorteio ("fulano não tira ciclano") — exige novo ADR | Fora do MVP | SRT | 5 |
| BKL-02 | Modo Amigo Chocolate (Páscoa) | Fora do MVP | GRP | 3 |
