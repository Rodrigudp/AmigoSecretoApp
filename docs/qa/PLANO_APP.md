# Plano de testes do app nativo (APP-QA-01)

Base: [ADR-005](../arquitetura/adr/005-app-mobile.md), [app-telas.md](../features/app-telas.md), [API-V1.md](../arquitetura/API-V1.md) e o [plano do site](../processo/PLANO_DE_TESTES.md). Mesmas regras: dados sintéticos, RNG e relógio injetados, sem esperas fixas. Os casos continuam numerados a partir do CT-35. Nenhum caso daqui conta como aprovado antes de rodar.

## 1. Camadas

| Camada | Ferramenta | Onde roda | Escopo |
| --- | --- | --- | --- |
| Contrato da API v1 | Playwright `request` contra o Next local (Supabase local no CI) | job E2E do `ci.yml` | Credenciais, sigilo, headers, rate limit, regras de negócio |
| Unitário e componente do app | `jest-expo` + React Native Testing Library em `mobile/` | job `Mobile CI` | Credenciais no SecureStore, cliente da API, telas e estados |
| Fluxo do app | Playwright no Expo Web (`expo start --web`, 360 px) contra o Next local | job novo `mobile-e2e` (a pedir ao 14 DevOps) | Criar → convidar → entrar → lista → sortear → revelar |
| Manual em aparelho | Roteiro §5 | iPhone e Android com build EAS | O que Expo Web não cobre (push, SecureStore real, links, foco) |

Limite conhecido do Expo Web: não executa `expo-secure-store`, `expo-notifications`, App Links nem leitores de tela nativos. Esses pontos ficam no roteiro manual, e o teste web troca o SecureStore por um mock de `localStorage` declarado no próprio teste.

## 2. Contrato da API v1 (Playwright `request`)

Arquivos em `tests/e2e/api-v1/`, todos em `test.fixme` com o motivo `PENDING` até os endpoints (APP-API-02, 02b, 02c) entrarem na main. Para ativar: apague o `test.fixme(true, PENDING)` do `describe`, rode `npm run test:e2e -- api-v1` com Supabase local e confira os 4 arquivos. Os grupos são criados pela própria API v1 (`seedGroup`), sem acesso direto ao banco.

| Caso | Arquivo | Resultado esperado | Requisito |
| --- | --- | --- | --- |
| CT-35 | `auth.spec.ts` | Cada rota recusa credencial de outro tipo (convite, participante, admin) com `401 INVALID_LINK` e envelope `{ error: { code, message } }`. Bearer ausente, vazio e desconhecido devolvem corpo idêntico (ADR-002). `my-groups/summary` aceita participante e organizador e informa `role`. Token em query string (`token`, `accessToken`, `adminToken`, `inviteToken`, `expoPushToken`, `key`, `secret`, `auth`) dá `400 INVALID_INPUT`. Participante removido perde o acesso. | RN06, RNF03, API-V1 §1.2 |
| CT-36 | `secrecy.spec.ts` | Antes do sorteio, `reveal` dá `409 DRAW_NOT_READY`. Depois, nenhuma resposta de admin, participante, desejos ou resumo contém chaves de pares; `reveal` devolve só `drawVersion`, `recipientName`, `wishItems`, nunca o próprio nome, e os 4 participantes juntos formam uma permutação. Itens de desejo sem `affiliateUrl`, `productLink` ou `tag=`. | RN03, RNF04, APP-MON-01 |
| CT-37 | `headers-and-limits.spec.ts` | Sucesso e erro levam `Cache-Control: private, no-store, max-age=0, must-revalidate`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`, `X-Content-Type-Options: nosniff` e nenhum `Access-Control-Allow-Origin`. `OPTIONS` dá 403 ou 405. Limites por IP: 120 req (`api_v1`) e 30 entradas (`join_group`) → `429 RATE_LIMITED`. | SEC-03, API-V1 §1.5–1.8 |
| CT-38 | `flows.spec.ts` | `NOT_ENOUGH_PARTICIPANTS`, `DRAW_MEMBERS_CHANGED`, `GROUP_CLOSED` (entrar e remover), sorteio repetido mantém `drawVersion` 1, `IDEMPOTENCY_CONFLICT` e validação de `INVALID_INPUT`. | RN01, RN04, RN07, RN09, RF05 |

Ficam para um segundo PR, escrito quando os endpoints existirem (API-V1 §4.6 e §5.2): CT-60 em `wishes.spec.ts` (`WISH_LIST_FULL` no 21º item, `WISH_ITEM_NOT_FOUND` em item alheio, CRUD sem `affiliateUrl`), CT-61 em `push.spec.ts` (formato inválido, repetição idempotente, `PUSH_DEVICE_LIMIT` no 6º aparelho, `DELETE`, `role` na resposta), CT-62 sufixo `(2)` (RN07) e CT-63 limites `create_group` (10 req) e `api_v1_write` (30 req).

Casos que o Playwright `request` não alcança e ficam em outros níveis:

| Caso | Nível | Plano |
| --- | --- | --- |
| CT-39 Token, `Bearer` e `ExpoPushToken[...]` não aparecem em logs | Unitário (Vitest) | Teste de `redact.ts` com as strings de API-V1 §1.7; roda com o APP-API-02. |
| CT-40 Remover participante apaga seus `push_tokens`; expurgo do grupo apaga todos | Integração (Vitest + Supabase) | Com o `register_push_token` e a tabela do DB-APP-01; confere CASCADE e a revogação por `credential_hash`. |
| CT-41 Push "Sorteio feito" e lembrete: payload sem nome, local, token ou resultado; uma única marca por `(group_id, reminder_date)` | Integração com fake do Expo | Cliente do Expo injetado; verifica título e corpo APP-13 a APP-17, `data` só com `groupId` e `type`, e que falha no envio não desfaz o sorteio. |
| CT-42 `POST /api/internal/push/exchange-reminders` recusa segredo ausente ou errado | Integração | Sem segredo, 401 sem corpo informativo; segredo certo respeita a janela de 2 dias em `America/Sao_Paulo` com relógio injetado. |
| CT-43 Paridade site × API | Integração | Sorteio feito pela API v1 aparece no site e vice-versa; a mesma credencial hash resolve nos dois. |

Regras do contrato para quem implementa: respostas de erro não variam entre token inexistente e token de outro papel; qualquer divergência reprova o CT-35.

## 3. Testes do app (`mobile/`)

### 3.1 Unitários e de componente (`jest-expo`)

| Caso | Resultado esperado |
| --- | --- |
| CT-44 Credenciais | Um item por grupo e papel; token do organizador não substitui o do participante (já coberto em `credentials.test.ts`); reabrir o mesmo acesso atualiza a entrada. |
| CT-45 Cliente da API | Todo pedido leva `Authorization: Bearer`; nenhum token vai em path ou query; erros viram `{ code }` do catálogo; `401 INVALID_LINK` remove o acesso local e leva a Meus grupos. |
| CT-46 Deep links | `/g/<token>`, `/p/<token>` e `/admin/<token>` abrem a tela certa; o token é validado pela API antes de ir ao SecureStore; link malformado cai em GLB-05 sem gravar nada. |
| CT-47 Meus grupos | Vazio mostra APP-02 e Criar grupo; pessoa que organiza e participa do mesmo grupo vê os dois destinos; ordem e rótulos de papel (APP-03). |
| CT-48 Criar grupo | Erros por campo e foco no primeiro inválido; botão bloqueado enquanto envia ("Criando…"); dados preservados em erro; sucesso grava o acesso de organizador. |
| CT-49 Convite e entrada | CNV-10, CNV-11, CNV-12 por código de erro; "Continuar como {nome}" com acesso salvo; nome confirmado pelo servidor (sufixo) aparece em PES-01. |
| CT-50 Lista de desejos e offline | Adicionar, editar, apagar com foco como em app-telas.md; limite de 20; offline mostra a última lista salva (APP-06); edição offline fica pendente (APP-07) e sincroniza; falha usa WSH-22 sem perder o texto. |
| CT-51 Revelar | Estados R0–R4; foco no nome ao revelar; "Esconder" devolve o foco; ao ir para segundo plano ou trocar de grupo o cartão volta fechado; resultado e lista do par nunca entram na cópia offline. |
| CT-52 Painel | Contagem, remoção com confirmação (cancelar e confirmar), botão de sorteio desabilitado abaixo de 3 com DRW-03, confirmação DRW-04, `DRAW_MEMBERS_CHANGED` com "Atualizar grupo", pós-sorteio sem Remover e sem Fazer o sorteio. |
| CT-53 Acessibilidade | Alvos ≥ 48, texto ≥ 16, `accessibilityLabel` com nome da pessoa ou do presente nas ações por linha, anúncios de carregando/erro/concluído. |
| CT-54 Push no app | Pedido de permissão só após o primeiro acesso pessoal e toque em "Ativar avisos"; negar mantém o uso; toque na notificação abre a área com Revelar fechado; sem acesso válido mostra APP-18 e abre Meus grupos. |

### 3.2 Fluxo no Expo Web (Playwright)

Um projeto `app-web` em `playwright.config.ts` (viewport 360 × 800, `webServer` com `expo start --web --port 8081` e o Next em 3000, `EXPO_PUBLIC_API_URL` apontando para ele). Cenários em `tests/e2e-app/`, a criar quando as telas do APP-FE-02 estiverem na main:

- CT-55 Organizador cria grupo, copia o link e vê o painel com 0 participantes.
- CT-56 Três pessoas entram por convite; a lista de cada uma salva um desejo.
- CT-57 Organizador sorteia (confirmação DRW-04); cada pessoa revela e vê um nome diferente do próprio; o painel não mostra pares.
- CT-58 Mesmo teste de vazamento do site (`result-isolation`) sobre o DOM do Expo Web e as respostas de rede.
- CT-59 Convite fechado, cheio e inválido mostram CNV-11, CNV-12 e CNV-10 sem nome de ninguém.

Seletores por papel e rótulo (`getByRole`, `getByLabel`), nunca por texto de marca. O CI do app web só entra depois de o 14 DevOps criar o job; até lá o fluxo roda localmente e o resultado vai no cartão.

## 4. Critérios de aceite do app (para o QA liberar um build)

1. CT-35 a CT-38 e CT-60 a CT-63 ativos e verdes no CI, sem `fixme`.
2. Jest do app verde, cobertura de `mobile/src` ≥ 70% e do cliente de API ≥ 90%.
3. Fluxo web CT-55 a CT-59 verde.
4. Roteiro manual §5 executado em pelo menos um iPhone e um Android, sem bug S1 ou S2 aberto.
5. Sem SDK de anúncio e sem link de afiliado no bundle (decisão APP-MON-01): busca por `affiliate`, `tag=` e `admob` no `mobile/` dá zero resultados.
6. Notificações na tela bloqueada sem nome, grupo, local ou resultado.

## 5. Roteiro manual em aparelho (quando houver build EAS)

Registrar aparelho, versão do sistema, versão do build, data, ambiente (produção ou preview), passos, esperado, obtido e capturas sem dados reais. Bugs entram no BOARD como `BUG-xxx` (S1–S4). Grupos de teste são apagados no fim.

| # | Passo | Esperado |
| --- | --- | --- |
| M1 | Instalar o build, abrir sem grupos | Marca, depois APP-02 e botão Criar grupo. |
| M2 | Criar grupo com valor pelo teclado numérico e data pelo calendário | Erros junto aos campos; sucesso mostra CRI-01, Compartilhar convite, Copiar link, Abrir o painel. |
| M3 | Compartilhar convite | Menu nativo com a mensagem WPP-01 e o link público; enviar para si mesmo no WhatsApp. |
| M4 | Tocar no convite recebido, com o app instalado | Abre no app (Universal Link ou App Link); sem o app, abre o site. |
| M5 | Entrar com nome repetido | Nome confirmado com sufixo; PES-01 e APP-05. |
| M6 | Segundo grupo no mesmo aparelho | Meus grupos lista os dois; reabrir o mesmo acesso não duplica. |
| M7 | Aceitar ativar avisos; repetir negando em outro aparelho | Permissão do sistema só após o toque; negar não bloqueia o app. |
| M8 | Lista de desejos: adicionar, editar, apagar, 20 itens | Foco, anúncio WSH-12 e limite WSH-06; link "Ver na loja" abre o navegador do sistema, sem WebView. |
| M9 | Modo avião: abrir a lista; editar; reconectar | Última lista salva (APP-06); edição pendente (APP-07) sincroniza; criar, entrar, sortear e revelar exigem conexão. |
| M10 | Painel com 2 pessoas e com 3 | Botão desabilitado com DRW-03; com 3, confirmação com total e aviso de irreversível. |
| M11 | Remover participante: cancelar e confirmar | Confirmação nativa; foco na próxima pessoa; a pessoa removida perde o acesso. |
| M12 | Sortear; conferir push em outro aparelho com tela bloqueada | "Sorteio feito!" sem nome, grupo ou resultado; tocar abre a área com Revelar fechado. |
| M13 | Revelar, esconder, ir para segundo plano e voltar | "Você tirou {nome}"; cartão volta fechado; resultado fora das capturas de tarefas recentes quando o sistema permitir. |
| M14 | Tocar numa notificação sem acesso salvo (limpar dados do app) | APP-18 e abertura em Meus grupos. |
| M15 | Fonte do sistema no máximo, TalkBack e VoiceOver | Sem rolagem lateral; textos quebram; alvos ≥ 48; ações por linha com o nome. |
| M16 | Teclado aberto nos formulários | Campo e botão visíveis; nada encoberto. |
| M17 | Abrir `/p/<token>` e `/admin/<token>` de outro aparelho | Cada link abre só a própria área; token trocado de papel é recusado com mensagem única. |
| M18 | Remover o app e reinstalar; abrir o link pessoal | Acesso refeito pelo link; nenhum dado antigo no aparelho. |

## 6. Dependências e riscos

- Ativação dos testes depende de APP-API-02, 02b e 02c (endpoints) e DB-APP-01 (`push_tokens`, `register_push_token`).
- O E2E do app web depende de APP-FE-02 e de um job novo do 14 DevOps (Expo Web + Next no mesmo job).
- Rate limit de CT-37 consome a cota do IP: o teste usa `x-forwarded-for` exclusivo; confirmar com o 10 Back-end que `extractClientIp` aceita esse header no ambiente de CI, senão o teste roda isolado e por último (`--workers=1`).
- Push real só é verificável em aparelho com build EAS (não confirmei se o Expo Go cobre push); fica no roteiro manual.
- Itens ainda sem texto do catálogo: mensagem de `PUSH_DEVICE_LIMIT` ("a validar com Design de Produto", API-V1 §2).
