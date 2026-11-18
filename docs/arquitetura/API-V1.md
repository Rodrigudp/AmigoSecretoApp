# Contrato da API v1 para o App Mobile (`/api/v1/...`)

- **Cartão:** APP-API-01
- **Referências:** [ADR-005](adr/005-app-mobile.md), [app-telas.md](../features/app-telas.md), [app-monetizacao.md](../features/app-monetizacao.md), [CONTRATOS.md](CONTRATOS.md), [AMEACAS.md](AMEACAS.md)
- **Status:** Em revisão (15 Segurança & LGPD + 00 Orquestrador)

## 1. Princípios, segurança e decisões de arquitetura

A API v1 (`/api/v1/...`) expõe os casos de uso existentes em `src/application/` via Route Handlers do Next.js para o app Expo (`mobile/`), sem alterar páginas, server actions ou cookies do site web (lançamento de 28/11 intacto).

1. **Mesmos casos de uso (`src/application/`):** os endpoints reutilizam os casos de uso e ports existentes (`createServerClient()`).
2. **Credencial exclusivamente em `Authorization: Bearer <token>`:**
   - `/api/v1/invite` e `/api/v1/invite/join` validam o `inviteToken` do Bearer. A rota `/api/v1/participant` e suas subrotas validam apenas `accessToken`. A rota `/api/v1/admin` e suas subrotas validam apenas `adminToken`. Um token de outro papel retorna `401 INVALID_LINK` sem tentativa no repositório do outro papel.
   - Apenas `/api/v1/my-groups/summary` e `/api/v1/push-tokens` podem resolver o mesmo Bearer como participante ativo ou organizador. A resposta de sucesso informa `role` (`"participant"` ou `"organizer"`).
   - **Proibido** enviar à API v1 qualquer token (`inviteToken`, `accessToken`, `adminToken`, `expoPushToken`) em path ou query string. Tokens também ficam fora dos logs. Requisições a `/api/v1/*` com parâmetros de query sensíveis (`token`, `accessToken`, `adminToken`, `inviteToken`, `expoPushToken`, `key`, `secret`, `auth`) ou token na URL são recusadas imediatamente com `400 INVALID_INPUT`.
   - O app extrai o token de Universal Links / App Links (`https://papelzinho.app/g/<inviteToken>`, `/p/<accessToken>`, `/admin/<adminToken>`), guarda `accessToken` e `adminToken` no `SecureStore` e chama a API v1 sempre via header `Authorization: Bearer <token>`.
3. **Sigilo absoluto dos pares (RN03, RNF04):** nenhuma resposta inclui a lista de pares do sorteio. Apenas `POST /api/v1/participant/reveal` devolve o resultado individual (`recipientName` e `wishItems`) do próprio participante autenticado pelo Bearer token.
4. **Sem monetização nem afiliado no app v1 (decisão APP-MON-01):**
   - O app v1 vai às lojas sem SDK de anúncios e sem links de afiliado (o programa Amazon Associados exige aceite específico para app mobile ainda pendente).
   - A API v1 devolve nos itens de lista de desejos (tanto na lista própria quanto no `reveal`) apenas `url: string | null` (a URL original `https://` cadastrada pelo participante).
   - **Não expõe** `affiliateUrl` nem `productLink` com tag de afiliado na API v1, e o app **não envia** eventos `affiliate_click`. Os links abrem no navegador externo do sistema (`expo-web-browser` / `Linking`), nunca em WebView com anúncio.
5. **CORS fechado:** chamadas nativas não usam CORS de navegador. Nenhum header `Access-Control-Allow-Origin` é emitido; requisições `OPTIONS` recebem `403 Forbidden` (ou `405 Method Not Allowed`), bloqueando consumo cross-origin por sites de terceiros.
6. **Headers de segurança e cache:** todas as respostas de `/api/v1/*` incluem `Cache-Control: private, no-store, max-age=0, must-revalidate`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow` e `X-Content-Type-Options: nosniff`.
7. **Redação e logs (`src/infrastructure/observability/redact.ts`):** `redact.ts` deve mascarar `Bearer <token>` e tokens Expo em strings. Adicionar `Expo(nent)?PushToken\[[^\]]+\]` a `SENSITIVE_TEXT_REPLACEMENTS`. Também deve mascarar chaves com substring `token`/`auth` (`ALWAYS_REDACTED_SUBSTRINGS`, que já cobre `expoPushToken`) e campos de PII (`displayName`, `recipientName`, `name`, `title`, `url`, `note`). Nenhum handler loga headers brutos, body ou token; erros de infraestrutura passam por `logInfraError` / `sanitizeContext`.
8. **Rate limit (SEC-03):** usa `getSharedRateLimiter()` e `extractClientIp(request.headers)` (`src/infrastructure/rate-limit.ts`). Todas as rotas compartilham `api_v1` (120 req / 10 min por IP). Escritas de desejos e tokens de push compartilham também `api_v1_write` (30 req / 10 min por IP). Os limites se somam às políticas específicas `create_group` (10 req / 10 min por IP), `join_group` (30 req / 10 min por IP) e `run_draw` (10 req / 10 min por IP). Exceder qualquer limite retorna `429 RATE_LIMITED`.

## 2. Formato padrão de erro

Todas as respostas de erro retornam o envelope JSON único:

```json
{
  "error": {
    "code": "CODIGO_DO_ERRO",
    "message": "Mensagem em português do catálogo (textos.md / copy.ts)."
  }
}
```

| `error.code` | HTTP | Quando ocorre | Mensagem padrão (`copy.ts`) |
| --- | --- | --- | --- |
| `INVALID_INPUT` | `400` | JSON malformado, falha de validação Zod ou token em query string | Mensagem do campo ou genérica (`copy.HOM_16`, `copy.CNV_13`, `copy.WSH_22.saveError`) |
| `INVALID_LINK` | `401` | Header `Authorization: Bearer` ausente/vazio, token desconhecido, participante removido ou grupo expirado (não vaza existência do grupo) | Convite/Participante: `copy.CNV_10.text` · Admin/Sorteio: `copy.ADM_16.text` · Push/Meus grupos: `copy.APP_18` |
| `PARTICIPANT_NOT_FOUND` | `404` | `participantId` não pertence ao grupo ou já foi removido | `copy.ADM_11` (`"Não foi possível remover agora. Tente de novo."`) |
| `WISH_ITEM_NOT_FOUND` | `404` | `itemId` não existe ou pertence a outro participante | `copy.WSH_23.notFound` (`"Este presente não está mais na lista. Atualize a página."`) |
| `IDEMPOTENCY_CONFLICT` | `409` | `requestId` reutilizado para outro grupo | `copy.HOM_15` (`"Este grupo já foi criado antes. Recarregue a página para criar outro."`) |
| `GROUP_CLOSED` | `409` | Tentativa de entrar ou remover participante após o sorteio | Entrada: `copy.CNV_11` · Remoção: `copy.ADM_11` |
| `GROUP_FULL` | `409` | Grupo atingiu o limite de 100 participantes ativos (RN09) | `copy.CNV_12` (`"Este grupo já está completo (100 pessoas). Fale com o organizador."`) |
| `WISH_LIST_FULL` | `409` | Participante atingiu o limite de 20 itens na lista (RN-LST-01) | `copy.WSH_06` (`"Você chegou a 20 presentes. Apague um para adicionar outro."`) |
| `NOT_ENOUGH_PARTICIPANTS` | `409` | Tentativa de sortear com menos de 3 participantes ativos (RN01) | `copy.DRW_03` (`"Para sortear, precisa de pelo menos 3 pessoas."`) |
| `DRAW_NOT_READY` | `409` | Tentativa de revelar resultado antes da realização do sorteio | `copy.ARE_02` (`"O sorteio ainda não foi realizado."`) |
| `DRAW_MEMBERS_CHANGED` | `409` | `expectedParticipantCount` diverge do total ativo no sorteio | `copy.DRW_08.text` (`"O número de pessoas mudou. Atualize a página e confira antes de sortear."`) |
| `RATE_LIMITED` | `429` | Limite de requisições por IP excedido (SEC-03) | `copy.GLB_09` (`"Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo."`) |
| `INTERNAL_ERROR` | `500` | Falha inesperada de infraestrutura | `copy.GLB_08` (`"Sem conexão no momento. Verifique a internet e tente de novo."`) |

## 3. Resumo dos Endpoints

| Método | Rota | Caso de uso / Operação | Credencial (`Authorization: Bearer`) | Rate limit |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/groups` | `createGroup` | Nenhuma (público) | `api_v1` + `create_group` |
| `GET` | `/api/v1/my-groups/summary` | Resumo por credencial (Meus grupos) | `Bearer <accessToken \| adminToken>` | `api_v1` |
| `GET` | `/api/v1/invite` | `getInviteViewUseCase` | `Bearer <inviteToken>` (+ opcional `X-Resume-Participant-Token`) | `api_v1` |
| `POST` | `/api/v1/invite/join` | `joinGroup` | `Bearer <inviteToken>` | `api_v1` + `join_group` |
| `GET` | `/api/v1/participant` | `getParticipantView` | `Bearer <accessToken>` | `api_v1` |
| `GET` | `/api/v1/participant/wishes` | `listWishItems` | `Bearer <accessToken>` | `api_v1` |
| `POST` | `/api/v1/participant/wishes` | `addWishItem` | `Bearer <accessToken>` | `api_v1` + `api_v1_write` |
| `PATCH` | `/api/v1/participant/wishes/[itemId]` | `updateWishItem` | `Bearer <accessToken>` | `api_v1` + `api_v1_write` |
| `DELETE` | `/api/v1/participant/wishes/[itemId]` | `removeWishItem` | `Bearer <accessToken>` | `api_v1` + `api_v1_write` |
| `POST` | `/api/v1/participant/reveal` | `getMyResult` | `Bearer <accessToken>` | `api_v1` |
| `GET` | `/api/v1/admin` | `getAdminView` | `Bearer <adminToken>` | `api_v1` |
| `DELETE` | `/api/v1/admin/participants/[participantId]` | `removeParticipant` | `Bearer <adminToken>` | `api_v1` |
| `POST` | `/api/v1/admin/draw` | `runDraw` + disparo push "sorteio feito" | `Bearer <adminToken>` | `api_v1` + `run_draw` |
| `POST` | `/api/v1/push-tokens` | Registrar token de push do Expo | `Bearer <accessToken \| adminToken>` | `api_v1` + `api_v1_write` |
| `DELETE` | `/api/v1/push-tokens` | Remover token de push do Expo | `Bearer <accessToken \| adminToken>` | `api_v1` + `api_v1_write` |

## 4. Especificação dos Endpoints

### 4.1. Criar grupo — `POST /api/v1/groups`
- **Caso de uso:** `createGroup` (`src/application/create-group.ts`) · **Auth:** nenhuma · **Rate limit:** `create_group`
- **Request (`application/json`):**
  ```json
  {
    "name": "Família Silva",
    "maxValueCents": 10000,
    "exchangeDate": "2026-12-24",
    "location": "Casa da Vó Maria",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
  Validações: `name` (1–60 chars após trim, sem `<`/`>`), `maxValueCents` (inteiro > 0), `exchangeDate` (`YYYY-MM-DD` posterior a hoje em `America/Sao_Paulo`), `location` (opcional/null, ≤ 120 chars), `requestId` (UUID v4 estrito).
- **Response `201 Created`:**
  ```json
  {
    "inviteUrl": "https://papelzinho.app/g/<inviteToken>",
    "adminUrl": "https://papelzinho.app/admin/<adminToken>",
    "inviteToken": "<inviteToken>",
    "adminToken": "<adminToken>"
  }
  ```
- **Erros:** `400 INVALID_INPUT`, `409 IDEMPOTENCY_CONFLICT`, `429 RATE_LIMITED`.

### 4.2. Resumo para "Meus grupos" — `GET /api/v1/my-groups/summary`
- **Objetivo (APP-01 a APP-03):** o app armazena várias credenciais no `SecureStore` (participante e/ou organizador). Para montar a lista "Meus grupos" sem puxar lista de desejos ou lista de participantes completa, este endpoint resolve a credencial enviada em `Authorization: Bearer <token>` (tentando hash de participante ativo ou hash de admin do grupo) e devolve apenas o cabeçalho do grupo.
- **Auth:** `Authorization: Bearer <accessToken | adminToken>` (obrigatório)
- **Response `200 OK`:**
  ```json
  {
    "groupId": "01933e40-0000-7000-8000-000000000001",
    "groupName": "Família Silva",
    "role": "participant",
    "displayName": "Ana",
    "status": "open",
    "exchangeDate": "2026-12-24",
    "maxValueCents": 10000,
    "expiresAt": "2027-02-22T23:59:59.999Z"
  }
  ```
  *(`role` é `"participant"` ou `"organizer"`; `displayName` é preenchido quando `role === "participant"` e `null` quando `role === "organizer"`; `status` é `"open"` ou `"drawn"`).*
- **Erros:** `401 INVALID_LINK` (quando a credencial expirou ou o participante foi removido).

### 4.3. Ver convite — `GET /api/v1/invite`
- **Caso de uso:** `getInviteViewUseCase({ inviteToken, resumeAccessToken, recordOpened: true })`
- **Auth:** `Authorization: Bearer <inviteToken>` (obrigatório) e `X-Resume-Participant-Token: <accessToken>` (opcional, para "Continuar como Fulano", RF03/PAR-01; redatado por `redact.ts`).
- **Response `200 OK`:**
  ```json
  {
    "groupId": "01933e40-0000-7000-8000-000000000001",
    "group": {
      "name": "Família Silva",
      "maxValueCents": 10000,
      "exchangeDate": "2026-12-24",
      "location": "Casa da Vó Maria",
      "status": "open"
    },
    "isFull": false,
    "returningParticipant": { "displayName": "Ana" },
    "expiresAt": "2027-02-22T23:59:59.999Z"
  }
  ```
- **Erros:** `401 INVALID_LINK`.

### 4.4. Entrar no grupo — `POST /api/v1/invite/join`
- **Caso de uso:** `joinGroup` (`src/application/join-group.ts`) · **Auth:** `Authorization: Bearer <inviteToken>` · **Rate limit:** `join_group`
- **Request (`application/json`):** `{ "displayName": "Ana" }` (1–40 chars após trim, sem `<`/`>`; sufixo `(2)` automático em homônimos conforme RN07).
- **Response `201 Created`:**
  ```json
  {
    "displayName": "Ana",
    "personalUrl": "https://papelzinho.app/p/<accessToken>",
    "accessToken": "<accessToken>",
    "groupId": "01933e40-0000-7000-8000-000000000001",
    "expiresAt": "2027-02-22T23:59:59.999Z"
  }
  ```
- **Erros:** `400 INVALID_INPUT`, `401 INVALID_LINK`, `409 GROUP_CLOSED`, `409 GROUP_FULL`, `429 RATE_LIMITED`.

### 4.5. Área do participante — `GET /api/v1/participant`
- **Caso de uso:** `getParticipantView` (`src/application/get-participant-view.ts`) · **Auth:** `Authorization: Bearer <accessToken>`
- **dto de item no app v1 (`MobileWishItem`):** `{ id: string; title: string; url: string | null; note: string | null }` (sem `productLink` nem `affiliateUrl`, conforme seção 1.4).
- **Response `200 OK`:**
  ```json
  {
    "groupId": "01933e40-0000-7000-8000-000000000001",
    "expiresAt": "2027-02-22T23:59:59.999Z",
    "view": {
      "displayName": "Ana",
      "group": {
        "name": "Família Silva",
        "maxValueCents": 10000,
        "exchangeDate": "2026-12-24",
        "location": "Casa da Vó Maria",
        "status": "open"
      },
      "ownWishItems": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "title": "Livro de receitas",
          "url": "https://www.amazon.com.br/dp/B000000000",
          "note": "Capa dura se possível"
        }
      ]
    }
  }
  ```
- **Erros:** `401 INVALID_LINK`.

### 4.6. CRUD da lista de desejos — `/api/v1/participant/wishes`
Todos exigem `Authorization: Bearer <accessToken>` e devolvem `MobileWishItem` (`{ id, title, url, note }`, com `url` original `https://` sem tag de afiliado):
- **`GET /api/v1/participant/wishes`** (`listWishItems`): retorna `200 OK` com `{ "items": MobileWishItem[] }`.
- **`POST /api/v1/participant/wishes`** (`addWishItem`): body `{ "title": string, "url"?: string | null, "note"?: string | null }`. Retorna `201 Created` com `{ "item": MobileWishItem }`. Erros: `400 INVALID_INPUT`, `401 INVALID_LINK`, `409 WISH_LIST_FULL`.
- **`PATCH /api/v1/participant/wishes/[itemId]`** (`updateWishItem`): body `{ "title": string, "url"?: string | null, "note"?: string | null }`. Retorna `200 OK` com `{ "item": MobileWishItem }`. Erros: `400 INVALID_INPUT`, `401 INVALID_LINK`, `404 WISH_ITEM_NOT_FOUND`.
- **`DELETE /api/v1/participant/wishes/[itemId]`** (`removeWishItem`): retorna `200 OK` com `{ "id": "<itemId>" }`. Erros: `400 INVALID_INPUT`, `401 INVALID_LINK`, `404 WISH_ITEM_NOT_FOUND`.

### 4.7. Revelar amigo secreto — `POST /api/v1/participant/reveal`
- **Caso de uso:** `getMyResult` (`src/application/get-my-result.ts`) · **Auth:** `Authorization: Bearer <accessToken>`
- **Comportamento:** registra `result_revealed` e retorna apenas o destinatário sorteado para o titular do Bearer token. Nos itens da lista do amigo sorteado, devolve `url: string | null` original (extraída de `wish_items.url` / `productLink.href` sem tag de afiliado).
- **Response `200 OK`:**
  ```json
  {
    "drawVersion": 1,
    "recipientName": "Bruno",
    "wishItems": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "title": "Fone Bluetooth",
        "url": "https://www.amazon.com.br/dp/B000000001",
        "note": "Preto"
      }
    ]
  }
  ```
- **Erros:** `401 INVALID_LINK`, `409 DRAW_NOT_READY`.

### 4.8. Painel do organizador — `GET /api/v1/admin`
- **Caso de uso:** `getAdminView` (`src/application/get-admin-view.ts`) · **Auth:** `Authorization: Bearer <adminToken>`
- **Response `200 OK`:**
  ```json
  {
    "group": {
      "name": "Família Silva",
      "maxValueCents": 10000,
      "exchangeDate": "2026-12-24",
      "location": "Casa da Vó Maria"
    },
    "inviteUrl": "https://papelzinho.app/g/<inviteToken>",
    "draw": { "status": "open" },
    "participantCount": 3,
    "participants": [
      { "id": "880e8400-e29b-41d4-a716-446655440001", "displayName": "Ana", "joinedAt": "2026-11-18T18:00:00.000Z" },
      { "id": "880e8400-e29b-41d4-a716-446655440002", "displayName": "Bruno", "joinedAt": "2026-11-18T18:01:00.000Z" },
      { "id": "880e8400-e29b-41d4-a716-446655440003", "displayName": "Carla", "joinedAt": "2026-11-18T18:02:00.000Z" }
    ]
  }
  ```
  *(Nunca inclui os pares do sorteio — RN03).*
- **Erros:** `401 INVALID_LINK`.

### 4.9. Remover participante — `DELETE /api/v1/admin/participants/[participantId]`
- **Caso de uso:** `removeParticipant` (`src/application/remove-participant.ts`) · **Auth:** `Authorization: Bearer <adminToken>`
- **Comportamento:** além do soft-delete do participante (`removed_at`), revoga/remove quaisquer registros de `push_tokens` vinculados ao `credential_hash` daquele participante no grupo.
- **Response `200 OK`:** `{ "participantCount": 2 }`
- **Erros:** `400 INVALID_INPUT`, `401 INVALID_LINK`, `404 PARTICIPANT_NOT_FOUND`, `409 GROUP_CLOSED`.

### 4.10. Realizar sorteio — `POST /api/v1/admin/draw`
- **Caso de uso:** `runDraw` (`src/application/run-draw.ts`) · **Auth:** `Authorization: Bearer <adminToken>` · **Rate limit:** `run_draw`
- **Request (`application/json`, opcional):** `{ "expectedParticipantCount": 3 }`
- **Response `200 OK`:** `{ "status": "drawn", "drawnAt": "2026-11-18T19:00:00.000Z" }`
- **Efeito colateral assíncrono (Push):** quando o sorteio transiciona de `open` para `drawn`, dispara o envio de push "Sorteio feito" (seção 5.3) para os tokens Expo ativos registrados naquele `group_id`. Falhas no envio de push são logadas via `logInfraError` sem impedir nem reverter o sorteio.
- **Erros:** `400 INVALID_INPUT`, `401 INVALID_LINK`, `409 NOT_ENOUGH_PARTICIPANTS`, `409 DRAW_MEMBERS_CHANGED`, `429 RATE_LIMITED`.

---

## 5. Notificações Push e Proteção de Dados (LGPD)

### 5.1. Minimização de dados e ciclo de vida (avaliação 15 Segurança & LGPD)
O identificador de push do aparelho (`ExponentPushToken[...]`) é um **dado pessoal novo** (identificador de dispositivo vinculado a uma credencial de acesso). Para cumprir LGPD Art. 6º (necessidade/minimização) e Art. 46 (segurança):
- **Dados armazenados mínimos** (tabela `push_tokens`, a ser criada pelo 12 Banco com RLS forçado e acesso restrito a `service_role`):
  - `id` (UUID PK)
  - `group_id` (UUID FK `groups.id` `ON DELETE CASCADE`)
  - `credential_hash` (`text`, hash SHA-256 do `accessToken` ou `adminToken` que registrou o aparelho — permite apagar automaticamente quando o participante é removido ou quando a credencial revoga o push)
  - `role` (`'participant' | 'organizer'`)
  - `platform` (`'ios' | 'android'`)
  - `expo_push_token` (`text`, formato `ExponentPushToken[...]` ou `ExpoPushToken[...]`)
  - `created_at` / `updated_at` (`timestamptz`)
  - Constraint de unicidade: `UNIQUE (credential_hash, expo_push_token)` (idempotência no registro).
- **Sem nome nem PII na tabela de push:** `push_tokens` não armazena `displayName`, telefone, nome do aparelho nem resultado do sorteio.
- **Retenção e descarte automático:**
  1. **Expurgo de 60 dias (RN08 / OPS-02):** `ON DELETE CASCADE` a partir de `groups(id)` garante que todos os `push_tokens` do grupo são apagados junto com o grupo 60 dias após a data do encontro.
  2. **Revogação de acesso:** ao remover um participante (`removeParticipant`) ou quando o usuário desativa notificações / remove o grupo no app (`DELETE /api/v1/push-tokens`), os registros são excluídos imediatamente. A revogação exclui todos os tokens da credencial. O `DELETE` do app exclui só o token do aparelho informado para aquela credencial.
  3. **Token inválido no Expo (`DeviceNotRegistered`):** verificar o retorno imediato do envio (ticket) e o recibo consultado depois. Ao detectar esse código, apagar os registros do token inválido e interromper novos envios a ele. [Documentação do Expo Push Service](https://docs.expo.dev/push-notifications/sending-notifications/).
- **Política de privacidade:** registrar push após o aceite no sistema operacional, para os avisos solicitados pelo titular. Antes de publicar o app com push ativo, atualizar `/privacidade` para informar o uso do identificador Expo, a finalidade dos avisos, o conteúdo genérico e as regras de exclusão acima.

### 5.2. Endpoints de Push Tokens — `POST` e `DELETE /api/v1/push-tokens`

- **Autenticação:** `Authorization: Bearer <accessToken | adminToken>` (obrigatório; o servidor calcula `credential_hash = sha256(token)` e valida que pertence a um participante ativo ou organizador de um grupo não expirado).
- **Limite de aparelhos:** o banco mantém até cinco tokens distintos por credencial. Repetir o registro do mesmo token atualiza a data sem consumir vaga. Ao registrar um sexto aparelho, a mesma operação atômica remove o registro menos recente, inclusive quando há registros concorrentes.
- **`POST /api/v1/push-tokens` (Registrar/atualizar token do Expo):**
  - **Request (`application/json`):**
    ```json
    {
      "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      "platform": "ios"
    }
    ```
    Validações Zod: `expoPushToken` (`^Expo(nent)?PushToken\[[A-Za-z0-9_-]+\]$`, máx. 200 chars), `platform` (`"ios" | "android"`).
  - **Response `200 OK`:** `{ "registered": true, "role": "participant" }`
  - **Erros:** `400 INVALID_INPUT`, `401 INVALID_LINK`, `429 RATE_LIMITED`.
- **`DELETE /api/v1/push-tokens` (Remover token do Expo para a credencial):**
  - **Request (`application/json`):**
    ```json
    {
      "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
    }
    ```
  - **Response `200 OK`:** `{ "removed": true, "role": "participant" }`
  - **Erros:** `400 INVALID_INPUT`, `401 INVALID_LINK`, `429 RATE_LIMITED`.

### 5.3. Disparo e conteúdo das notificações no servidor (APP-13 a APP-17)

Ativar a segurança reforçada do Expo Push Service. O servidor autentica os envios ao Expo com `EXPO_ACCESS_TOKEN`, configurado no ambiente da VPS e como secret do GitHub Actions para workflows de servidor autorizados. O valor fica fora do app, do repositório e dos logs. [Autenticação no Expo Push Service](https://docs.expo.dev/push-notifications/sending-notifications/#additional-security).

Nenhuma notificação push inclui nome do grupo, nome de participante, local do encontro, token ou resultado do sorteio (proteção de tela bloqueada, `app-telas.md` §Notificações push). O payload `data` carrega apenas `{ "groupId": "<groupId>", "type": "draw_done" | "exchange_reminder" }` para o app localizar a credencial já salva no `SecureStore` local.

1. **Sorteio feito (disparado após `runDraw` com sucesso, tanto pelo site quanto pela API v1):**
   - **Destinatários:** tokens de `push_tokens` do `group_id` com `role = 'participant'`.
   - **Título (`APP-13`):** `"Sorteio feito!"`
   - **Corpo (`APP-14`):** `"Abra o Papelzinho para ver quem você tirou."`
   - **Data payload:** `{ "groupId": "<groupId>", "type": "draw_done" }`
2. **Lembrete do encontro (job diário às 10:00 `America/Sao_Paulo`):**
   - **Gatilho:** cron da VPS chama `POST /api/internal/push/exchange-reminders` às 10h em `America/Sao_Paulo`. O handler autentica um segredo exclusivo do cron (`PUSH_CRON_SECRET`) via `Authorization: Bearer <segredo>`, comparando os hashes de tamanho fixo com `timingSafeEqual`. O segredo fica no ambiente do servidor, fora de URL, query e logs.
   - **Seleção:** grupos não expirados cujo `exchange_date` seja a data local da execução + 2 dias (`X = 2`).
   - **Prevenção de duplicidade:** antes de enviar, inserir atomicamente uma marca única por `(group_id, reminder_date)`, em que `reminder_date` é a data local de envio. Só quem inserir a marca envia. Execuções concorrentes ou repetidas pulam marcas existentes. A marca expira com o grupo. Uma falha de resultado incerto no Expo pode deixar o aviso sem entrega. O cron mantém a marca para evitar um segundo disparo.
   - **Destinatários:** todos os `push_tokens` ativos do `group_id` (`participant` e `organizer`).
   - **Título (`APP-15`):** `"Encontro de amigo secreto"`
   - **Corpo (`APP-16`, para `X = 2`):** `"Faltam 2 dias para o encontro."` *(se acionado para `X = 1`, usa `APP-17`: `"Seu encontro é amanhã."`).*
   - **Data payload:** `{ "groupId": "<groupId>", "type": "exchange_reminder" }`