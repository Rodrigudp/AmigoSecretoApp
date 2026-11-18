# APP-QA-02 — contrato da API v1 ativo e fluxo do app contra a API real

**Data:** 18/11/2026 · **Base:** `main` em `aa13f6e` · **Responsável:** 13 QA e Testes · **Plano:** [PLANO_APP.md](PLANO_APP.md)

## 1. Contrato da API v1 (CT-35 a CT-38, CT-60 a CT-63)

Os testes de `tests/e2e/api-v1/` saíram de `fixme` e rodam no job E2E do CI contra o Next local e o Supabase local. Resultado no CI: **61 passaram, 3 ignorados** (os `fixme` antigos de grupo cheio e sorteio, que não são deste cartão), sem repetição automática.

| Caso | Arquivo | Resultado |
| --- | --- | --- |
| CT-35 credencial por tipo, recusa neutra, token em query, participante removido | `auth.spec.ts` | passou |
| CT-36 sigilo dos pares e ausência de afiliado | `secrecy.spec.ts` | passou |
| CT-37 headers, CORS, `OPTIONS`, 429 de `api_v1` e `join_group` | `headers-and-limits.spec.ts` | passou |
| CT-38 mínimo de 3, contagem divergente, grupo fechado, idempotência | `flows.spec.ts` | passou |
| CT-60 lista de desejos: CRUD, validação, limite de 20, item alheio, 429 de escrita | `wishes.spec.ts` | passou |
| CT-61 push-tokens: papel, validação, idempotência, credenciais inválidas, 429 | `push.spec.ts` | passou |
| CT-62 nome repetido: `ana` vira `ana 2` | `flows.spec.ts` | passou |
| CT-63 11ª criação de grupo por IP dá 429 | `flows.spec.ts` | passou |

Ajustes dos testes: cada teste usa um IP próprio em `x-forwarded-for` (o limite `api_v1` é 120 req por IP em 10 min e a suíte passaria disso no IP do runner); a recusa neutra compara cinco formas de credencial ruim (ausente, vazia, curta, de formato válido mas desconhecida e de outro papel).

## 2. Fluxo do app com a API real

Pedido: `EXPO_PUBLIC_MOBILE_API=live` no Expo Web contra o Next local. **Não é possível sem mudar o código do app**, por dois motivos que verifiquei no código:

1. `mobile/src/v1/client.ts` fixa `https://papelzinho.app/api/v1`. Não existe variável para apontar para o Next local.
2. No Expo Web, `SecureStore.isAvailableAsync()` é falso. Em modo `live`, `saveAccess` lança erro e `listAccess` devolve lista vazia, então o app não guarda a credencial de nenhum grupo. O README do app já avisa que a prévia web usa memória.

Alternativa feita: `mobile-client.spec.ts` roda o **mesmo cliente HTTP do app** (`createHttpApi`) contra o Next local, trocando só a URL de produção pelo servidor local. Fluxo coberto, passou no CI: criar grupo → ver convite → 3 entradas → adicionar e editar presente → resumo de participante e de organizador → painel com 3 pessoas → registrar aparelho → sortear com contagem esperada → cada pessoa revela um nome diferente do próprio (permutação) → desativar avisos. Também confere que erros da API chegam ao app como `ApiError` com o código do contrato.

Não coberto: a interface do app em modo `live` (telas, foco, prints). Fica para aparelho com build EAS (roteiro M1–M18 do plano) ou para depois do BUG-008. Não há prints desta rodada.

## 3. Bugs e divergências

| ID | Sev. | Dono | Descrição |
| --- | --- | --- | --- |
| BUG-008 | S3 | 11 Front-end | Cliente do app com URL de produção fixa e Expo Web sem armazenamento de credencial em modo `live`: impossível testar a interface contra API local. Sugestão: `EXPO_PUBLIC_API_URL` com produção como padrão e, só fora de produção, um armazenamento de credencial para a web. |
| BUG-009 | S4 | 10 Back-end (doc) / Orquestrador | `API-V1.md` diverge da implementação: §5.2 prevê `409 PUSH_DEVICE_LIMIT` no 6º aparelho, mas a RPC `register_push_token` aceita e apaga o mais antigo (resposta 200); §4.4 prevê sufixo `(2)` para nomes repetidos, mas a API devolve `ana 2`. Os testes fixam o comportamento implementado. Decidir se o contrato muda ou o código muda. |

Sem S1 ou S2.

## 4. Interface do app (Expo Web live) — APP-FE-03 e fechamento do BUG-008

Teste `tests/e2e-app/expo-web-live.spec.ts`, workflow `App Web E2E` (`.github/workflows/app-web-e2e.yml`): Supabase local, Next local, Expo Web em modo `live` com `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`, viewport 360 × 800, grupo e nomes fictícios. Todas as chamadas `/api/v1` foram para a origem do Expo (proxy do Metro), nenhuma para produção. Prints em [prints-app-web](prints-app-web/).

| Passo | Resultado |
| --- | --- |
| Meus grupos vazio → Criar grupo → "Grupo criado" | passou (01 a 03) |
| Recarregar a mesma aba | A URL fica em `/create`, então o reload volta ao formulário vazio (03b); o acesso continua salvo |
| Voltar a Meus grupos e abrir o painel | passou: grupo listado como "Organizador · Entradas abertas", painel com 0 de 100 (04, 05) |
| Convite → 3 pessoas em abas separadas (Ana, Bruno, Carla) | passou, cada aba com seu próprio acesso (06, 07); área explica a espera e não oferece Revelar antes do sorteio |
| Adicionar presente | **falhou na tela**, ver BUG-010 (08, 09) |
| Painel com 3 participantes → confirmar → sorteio feito | passou; o painel não mostra pares (10 a 12) |
| Cada pessoa revela | passou: cada uma vê um nome diferente do próprio, os três formam uma permutação; antes de revelar a tela não tem nome alheio (13, 14) |
| Desativar avisos | Não aparece no Expo Web: a oferta de avisos só existe em Android e iOS. Fica no roteiro manual M7 e coberto pelo teste do cliente |
| Aba nova | não herda nenhum acesso |

**BUG-008: fechado.** A URL é configurável, a credencial fica no `sessionStorage` da aba só em desenvolvimento e o fluxo roda contra o Next local.

| ID | Sev. | Dono | Descrição |
| --- | --- | --- | --- |
| BUG-010 | S3 (S2 se repetir em nativo) | 22 Lista de Desejos / 11 Front-end | No Expo Web live, ao tocar "Salvar presente" o `POST /api/v1/participant/wishes` responde 201 e o cache local fica certo (item salvo, sem pendência), mas a tela fica em "Salvando…" com o formulário aberto, sem "Presente salvo." e sem o item na lista; o React acusa "two children with the same key" com o id do item. A lógica de lista e cache é a mesma no nativo, então precisa ser confirmada em aparelho. Passos: criar grupo, entrar, "Adicionar presente", preencher nome, "Salvar presente". |
| BUG-011 | S4 | 11 Front-end | Aviso do React Native Web "Unexpected text node: . A text node cannot be a child of a View" em `/g`, `/p` e `/admin` (também em modo demonstração); em nativo, texto solto dentro de `View` costuma ser erro. Origem não localizada: o número de avisos acompanha o número de textos `Body` da tela. |
| Obs. | S4 | 11 Front-end | Depois de "Grupo criado", recarregar perde a tela com o convite (a URL não muda); o convite continua acessível pelo painel. |

Limites: sem aparelho nem build nativo, então push, SecureStore, deep links e BUG-010/011 em nativo não foram verificados.
