# Contratos de back-end do MVP

Contrato aprovado pelo Orquestrador. O GRP-01 referencia este documento para os DTOs da aplicação. Referências: [requisitos](../requisitos/REQUISITOS.md), [arquitetura](ARQUITETURA.md), [ADR de acesso por link](adr/002-acesso-por-link.md), [ADR do sorteio](adr/003-algoritmo-sorteio.md) e [backlog](../board/BACKLOG.md). As especificações de [grupos](../features/grupos.md), [participantes](../features/participantes.md), [lista de desejos](../features/lista-desejos.md), [sorteio](../features/sorteio.md) e [monetização](../features/monetizacao.md) detalham os fluxos.

## Convenções

- Cada caso de uso devolve `Promise<Result<Saída, DomainError>>`. Erros esperados usam códigos estáveis. A apresentação traduz os códigos para português e devolve uma mensagem genérica em falhas inesperadas.
- Server actions e route handlers validam formulários, parâmetros e cookies com Zod. O token determina a identidade e o grupo. Identificadores enviados pelo navegador, como o de um item, são apenas alvos da operação.
- Valores monetários são inteiros em centavos. Datas de calendário usam `YYYY-MM-DD` e instantes usam ISO 8601 em UTC. Os campos opcionais dos itens são normalizados para `null`.
- Tokens pessoal e admin são persistidos como hash SHA-256. Os valores em claro circulam apenas no fluxo em que são necessários. Tokens, hashes e pares ficam fora dos logs. As rotas com token e as respostas de revelação usam `Cache-Control: no-store` e `Referrer-Policy: no-referrer` conforme o modelo de ameaças.
- Convite inválido ou expirado, acesso pessoal revogado e acesso admin inválido retornam `INVALID_LINK` nas rotas correspondentes, com mensagem que preserva a privacidade do grupo.

## Tipos compartilhados

```ts
type GroupId = string
type ParticipantId = string
type WishItemId = string
type GroupStatus = 'open' | 'drawn'

type GroupDetails = {
  name: string
  maxValueCents: number
  exchangeDate: string
  location: string | null
}

type DrawReceipt = { status: 'drawn'; drawnAt: string }
type RevealedResult = {
  drawVersion: number
  recipientName: string
  wishItems: RevealedWishItem[]
}

type DrawState = { status: 'open' } | DrawReceipt
type WishFields = { title: string; url: string | null; note: string | null }
type AffiliateStore = 'amazon' | 'mercadolivre'
type ProductLink =
  | { href: string; affiliate: false; store: null }
  | { href: string; affiliate: true; store: AffiliateStore }
type WishItem = WishFields & { id: WishItemId; productLink: ProductLink | null }
type RevealedWishItem = Omit<WishItem, 'url'>
type SaveWishItemOutput = { item: WishItem; warning: 'AFFILIATE_UNAVAILABLE' | null }

type PublicGroup = GroupDetails & { status: GroupStatus }
type AdminGroup = {
  group: GroupDetails
  inviteUrl: string
  draw: DrawState
  participantCount: number
  participants: { id: ParticipantId; displayName: string; joinedAt: string }[]
}
type ParticipantView = {
  displayName: string
  group: PublicGroup
  ownWishItems: WishItem[]
}
type OwnerMetrics = {
  groupsCreated: number
  participantsJoined: number
  participantsPerGroup: { groupId: GroupId; count: number }[]
  inviteConversionRate: number | null
  affiliateClicks: number
}
```

`productLink` traz o link direto por padrão. O caminho interno de redirecionamento só se aplica ao modo opcional, com destino indicado na interface. `inviteConversionRate` é o número de entradas dividido pelo número de aberturas de convite no mesmo recorte. Retorna `null` quando não houver aberturas.

## Casos de uso e erros

Todas as saídas abaixo são o conteúdo do sucesso de `Result`. `INVALID_INPUT` se aplica a entradas inválidas na borda, e `RATE_LIMITED` à criação e à entrada (SEC-03). Os demais códigos indicam recusas do caso de uso.

| Caso de uso | Entrada | Saída | Erros específicos |
| --- | --- | --- | --- |
| `create-group` · RF01, RF02, HU01 | `Omit<GroupDetails, 'location'> & { location?: string \| null; requestId: string }` | `{ inviteUrl: string; adminUrl: string }` | `IDEMPOTENCY_CONFLICT` |
| `get-invite-view` · RF02, RF03, PAR-03 | `{ inviteToken: string; resumeAccessToken?: string }` | `{ group: PublicGroup; returningParticipant: { displayName: string } \| null }` | `INVALID_LINK` |
| `join-group` · RF03, RF04, HU02 | `{ inviteToken: string; displayName: string }` | `{ displayName: string; personalUrl: string }` | `INVALID_LINK`, `GROUP_CLOSED`, `GROUP_FULL` |
| `get-admin-view` · RF06 | `{ adminToken: string }` | `AdminGroup` | `INVALID_LINK` |
| `remove-participant` · RF07, RN06 | `{ adminToken: string; participantId: ParticipantId }` | `{ participantCount: number }` | `INVALID_LINK`, `GROUP_CLOSED`, `PARTICIPANT_NOT_FOUND` |
| `get-participant-view` · RF04 | `{ accessToken: string }` | `ParticipantView` | `INVALID_LINK` |
| `list-wish-items` · RF05 | `{ accessToken: string }` | `WishItem[]` | `INVALID_LINK` |
| `add-wish-item` · RF05, RF10 | `WishFields & { accessToken: string }` | `SaveWishItemOutput` | `INVALID_LINK`, `WISH_LIST_FULL` |
| `update-wish-item` · RF05, RF10 | `WishFields & { accessToken: string; itemId: WishItemId }` | `SaveWishItemOutput` | `INVALID_LINK`, `WISH_ITEM_NOT_FOUND` |
| `remove-wish-item` · RF05 | `{ accessToken: string; itemId: WishItemId }` | `{ id: WishItemId }` | `INVALID_LINK`, `WISH_ITEM_NOT_FOUND` |
| `run-draw` · RF08, HU04 | `{ adminToken: string }` | `DrawReceipt` | `INVALID_LINK`, `NOT_ENOUGH_PARTICIPANTS` |
| `get-my-result` · RF09, HU05 | `{ accessToken: string }` | `RevealedResult` | `INVALID_LINK`, `DRAW_NOT_READY` |
| `resolve-product-link` · RF10, LST-03 | `{ accessToken: string; itemId: WishItemId }` | `{ destinationUrl: string }` para o route handler | `INVALID_LINK`, `WISH_ITEM_NOT_FOUND`, `PRODUCT_LINK_UNAVAILABLE` |
| `record-affiliate-click` · RF10, LST-03 | `{ accessToken: string; itemId: WishItemId }` | `{ recorded: true }` | `INVALID_LINK`, `WISH_ITEM_NOT_FOUND`, `PRODUCT_LINK_UNAVAILABLE` |
| `get-owner-metrics` · RF14 | `{ ownerSecret: string }` somente no servidor | `OwnerMetrics` | `OWNER_ACCESS_DENIED` |

- **Criação.** Nome de 1 a 60 caracteres após trim, valor positivo e data futura (GRP-02). A especificação de grupos define local opcional de até 120 caracteres. O caso normaliza ausência para `null` e calcula a expiração 60 dias após a troca. O cliente gera o `requestId` como UUID v4, guarda o identificador em `sessionStorage` e o mantém nas tentativas do mesmo envio. A borda valida o formato UUID v4 estrito com Zod. Após sucesso, o cliente remove o identificador do `sessionStorage`. A seção de decisões define quando a repetição pode emitir um novo link admin.
- **Convite e entrada.** Nome de 1 a 40 caracteres após trim, em texto simples. A entrada resolve sufixos sem distinguir maiúsculas de minúsculas e confirma o limite de 100 ativos na gravação. O cookie, quando válido para o mesmo grupo, habilita “Continuar como”. A abertura de um convite válido pelo fluxo da página registra `invite_opened`. O formulário pede somente o nome. A aplicação entrega ao adaptador da server action o identificador e a expiração do grupo, além da resposta de entrada. A apresentação configura `ptk_<groupId>` como `HttpOnly`, `Secure` e `SameSite=Lax`, com expiração no prazo do grupo, conforme PAR-01. O link pessoal funciona sem cookie. O servidor obtém a credencial de continuação do cookie do grupo.
- **Administração.** O painel enumera somente participantes ativos e mostra o estado do sorteio. A remoção só ocorre enquanto o grupo está aberto e revoga o acesso removido. A apresentação usa `inviteUrl` para compartilhar o convite.
- **Lista.** Até 20 itens ativos por participante, inclusive em gravações concorrentes. Título de 1 a 80 caracteres após normalização, observação de até 200 e URL opcional HTTPS de até 2.048, conforme LST-01. O titular pode incluir, editar ou excluir itens após o sorteio. A exclusão física libera uma vaga. A edição recalcula o link de afiliado e a loja a partir da nova URL. Se a conversão falhar, salva o link comum com loja nula e devolve o aviso. Um item fora da lista do titular recebe o mesmo erro de um item inexistente.
- **Sorteio.** Exige ao menos três participantes ativos. RN02 exige que cada pessoa dê e receba uma vez, sem tirar a si própria. Dois envios confirmam o mesmo sorteio vigente e devolvem a data persistida. O painel recebe estado e data. A tela pessoal inicial recebe o estado do grupo e consulta `get-my-result` apenas no toque em “Revelar”. A consulta devolve o destinatário do titular e a lista de desejos desse destinatário na versão vigente. Uma lista vazia é `[]`.
- **Links e cliques.** LST-01 define link direto por padrão, com `sendBeacon` para registrar o clique de afiliado. O servidor confere a credencial e verifica se o titular é dono da lista ou tem acesso pelo resultado vigente. O redirecionamento opcional por `/r/[itemId]` fica desligado por configuração e aceita apenas destinos salvos de afiliado com HTTPS e host permitido. Cada modo registra o clique pelo próprio fluxo.
- **Métricas.** O painel valida a credencial do dono no servidor. As agregações usam somente grupos e eventos, sem nomes, listas ou identificadores de participantes. A taxa usa `participant_joined` no numerador e `invite_opened` no denominador. MON-03 confirma a métrica no painel.

## Ports de `src/application/ports.ts`

As assinaturas são internas ao servidor. IDs e hashes abaixo entram no repositório após validação ou resolução da credencial pela aplicação. O adaptador revalida a autorização e o estado nas gravações e nas leituras sensíveis que dependem do estado vigente.

```ts
type RepositoryResult<T> = Promise<Result<T, DomainError>>
type AccessScope = { participantId: ParticipantId; accessTokenHash: string }
type AdminScope = { groupId: GroupId; adminTokenHash: string }
type StoredWishFields = WishFields & {
  affiliateUrl: string | null
  store: AffiliateStore | null
}
type Pair = { giverId: ParticipantId; receiverId: ParticipantId }
type NewGroup = GroupDetails & {
  inviteToken: string
  adminTokenHash: string
  requestId: string
  expiresAt: string
}

interface GroupRepository {
  createOrRotateAdminToken(input: NewGroup): RepositoryResult<{ groupId: GroupId; inviteToken: string }>
  findByInvite(token: string): Promise<{ groupId: GroupId; view: PublicGroup } | null>
  findAdminByHash(hash: string): Promise<AdminScope | null>
  getAdminView(admin: AdminScope): RepositoryResult<AdminGroup>
  removeParticipant(
    admin: AdminScope,
    participantId: ParticipantId,
  ): RepositoryResult<{ participantCount: number }>
}

interface ParticipantRepository {
  join(input: {
    inviteToken: string
    displayName: string
    accessTokenHash: string
  }): RepositoryResult<{ displayName: string; groupId: GroupId; expiresAt: string }>
  findActiveByHash(hash: string): Promise<(AccessScope & {
    groupId: GroupId
    displayName: string
  }) | null>
  getView(access: AccessScope): RepositoryResult<ParticipantView>
}

interface WishItemRepository {
  listOwn(access: AccessScope): RepositoryResult<WishItem[]>
  addOwn(access: AccessScope, item: StoredWishFields): RepositoryResult<WishItem>
  updateOwn(
    access: AccessScope,
    itemId: WishItemId,
    item: StoredWishFields,
  ): RepositoryResult<WishItem>
  deleteOwn(access: AccessScope, itemId: WishItemId): RepositoryResult<{ id: WishItemId }>
  getVisibleLink(access: AccessScope, itemId: WishItemId): RepositoryResult<{
    groupId: GroupId
    url: string
    affiliateUrl: string | null
  }>
}

interface DrawRepository {
  readForFirstDraw(admin: AdminScope): RepositoryResult<
    | { status: 'open'; participantIds: ParticipantId[] }
    | DrawReceipt
  >
  commitFirstDraw(
    admin: AdminScope,
    expectedParticipantIds: readonly ParticipantId[],
    pairs: readonly Pair[],
  ): RepositoryResult<DrawReceipt>
  getCurrentResult(access: AccessScope): RepositoryResult<RevealedResult>
}

interface TokenService {
  generate(): string
  hash(token: string): string
}

interface Clock {
  now(): Date
}

interface AffiliateLinkService {
  convert(url: string): Promise<{ affiliateUrl: string; store: AffiliateStore } | null>
  canRedirect(destinationUrl: string): boolean
}

type EventType =
  | 'group_created'
  | 'invite_opened'
  | 'participant_joined'
  | 'draw_performed'
  | 'result_revealed'
  | 'affiliate_click'

interface EventRepository {
  append(event: { groupId: GroupId; type: EventType }): Promise<void>
  readOwnerMetrics(): Promise<OwnerMetrics>
}
```

- `join` resolve disponibilidade, sufixo e inserção atomicamente. `removeParticipant` e `commitFirstDraw` precisam coordenar a concorrência com a entrada. `addOwn` aplica o limite na mesma operação que insere.
- `commitFirstDraw` representa a RPC transacional de SRT-02. Confirma o estado, o conjunto dos participantes ativos e a correspondência dos pares com esse conjunto antes de persistir. Se outro sorteio já confirmou, devolve a confirmação persistida. Se o conjunto mudou com o grupo aberto, devolve `DRAW_MEMBERS_CHANGED` internamente para a aplicação reler, recalcular e tentar novamente. Se o conflito persistir, a apresentação pede nova tentativa.
- A leitura de resultado restringe, na mesma operação, o doador à credencial, a versão ao sorteio vigente e a lista ao destinatário. `getVisibleLink` aplica a mesma autorização ao redirecionamento e ao registro de clique. As mutações da lista sempre verificam o acesso do titular.
- Eventos de criação, entrada e sorteio correspondem a transições confirmadas. Os adaptadores que gravam essas transições registram seus eventos sem duplicar em repetição idempotente. `append` atende abertura de convite, revelação e clique emitidos pelo servidor. O adaptador gera a data do evento. Para `affiliate_click`, os campos de negócio persistidos são grupo, tipo e data, além do identificador técnico do registro.
- A origem dos links absolutos vem da configuração do servidor. A página de convite, a área pessoal e o painel recebem apenas os campos dos tipos de saída.

## Decisões registradas

- **Idempotência da criação (GRP-02).** A coluna `groups.create_request_id` é `uuid not null unique` e acompanha o grupo no expurgo. Na primeira solicitação, o servidor cria o grupo e persiste o hash do token admin. Para um `requestId` existente, `createOrRotateAdminToken` bloqueia a linha do grupo e verifica na transação se os dados normalizados são iguais, se a criação ocorreu há até 15 minutos, se o grupo está aberto e se ainda não teve participantes. Atendidas essas condições, o servidor devolve o mesmo grupo e convite, substitui o hash pelo de um novo token admin e devolve o novo link. O link admin anterior perde a validade. A verificação de participantes deve ser coordenada com a operação de entrada. Se qualquer condição falhar, responde `IDEMPOTENCY_CONFLICT` sem nova tentativa de inserção. A tela orienta a recarregar o formulário para gerar outro `requestId`. Apenas a criação inicial emite `group_created`.
- **Escopo.** RF11, RF12 e RF13 ficam fora deste contrato conforme o backlog. A edição de grupo fica fora do MVP.
- **Datas e links.** `exchangeDate` usa `YYYY-MM-DD` na aplicação e o tipo `date` no banco. O servidor monta as URLs de convite, administração e acesso pessoal.
- **Lista e cliques.** A lista continua editável após o sorteio e a exclusão de itens é física. A loja (`amazon` ou `mercadolivre`) fica em `wish_items.store` para o selo. Links comuns têm loja nula. O evento `affiliate_click` registra grupo, tipo e data. A autenticação de beacon e redirect em navegadores sem cookie fica para o ADR-004 (SEC-06).
- **Conversão de convites.** `get-invite-view` registra `invite_opened` para cada abertura válida. O painel calcula entradas divididas por aberturas no mesmo recorte, com confirmação em MON-03.
