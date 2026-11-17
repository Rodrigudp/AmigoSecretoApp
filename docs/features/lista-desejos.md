# Lista de desejos e links de afiliado — especificação

**Cartão:** LST-01 · **Status:** pronto para revisão (MON e SEC) · **Consultado em:** 17/11/2026
**Requisitos:** RF05, RF10, RF12*, HU03 · **Regras:** RN04, RN08 · **RNF:** 01, 02, 03, 05, 08, 10
\* RF12 está no backlog como LST-05 (pós-MVP). A especificação cobre o desenho, mas a entrega fica atrás de flag (ver §10).
**Fontes dos termos:** §12, todas oficiais e lidas em 17/11/2026.

---

## 0. Resumo para quem decide

1. **Amazon** pode ser convertida automaticamente: o contrato manda usar link rastreado com a tag do associado como parâmetro na URL. Regras relevantes: sessão de 24 h, proibição de encurtador, de esconder a URL e de exibir preço sem a API de Produtos.
2. **Mercado Livre não pode ser convertido automaticamente hoje.** Os termos só aceitam "Links Especiais" fornecidos ou gerados por sistema do próprio Mercado Livre (1.6), proíbem encurtador e qualquer edição do link (1.8), e só pagam por divulgação em mídias cadastradas e aprovadas antes (1.3, 2.3). Sem essa aprovação o link do ML fica como link comum, sem comissão. **Isto é bloqueio de negócio, não de código.**
3. **O redirect `/r/[itemId]` é risco contratual nos dois programas** (Amazon: não disfarçar/esconder a URL, inclusive por redirect; ML: não incluir hiperlink que esconda que o destino é o Mercado Livre). O desenho abaixo mantém o redirect, mas com destino visível e um modo alternativo sem redirect. Decisão D2.
4. **Editar depois do sorteio** foi decidido como permitido (D3 = não): a lista continua editável e quem tirou vê a versão atual ao tocar em "Revelar".

| # | Decisão | Dono | Recomendação |
| --- | --- | --- | --- |
| D1 | Cadastrar o domínio público como mídia aprovada no Programa de Afiliados e Criadores do Mercado Livre e confirmar no painel de afiliados como gerar o Link Especial (ferramenta/API). Sem isso, adapter do ML fica desligado. | Rodrigo | Cadastrar antes de 22/11; se não houver geração programática, ML entra como link comum |
| D2 | Contagem de clique: `/r/[itemId]` (redirect) ou link direto + evento por `sendBeacon` | ORQ + SEC + MON | **Fechada em 17/11: `beacon` é o padrão** (MON aprovou; clique perdido quando o beacon falha é aceitável na métrica agregada). `/r/` fica implementado e desligado por flag |
| D3 | Lista somente leitura depois do sorteio? | ORQ | **Fechada em 17/11: não.** A lista continua editável depois do sorteio; quem tirou vê a versão atual. |
| D4 | RF12 entra no MVP? (backlog diz pós-MVP) | ORQ + Rodrigo | Fora do MVP; seção pronta atrás de flag `SUGGESTIONS_ENABLED` |

---

## 1. Escopo

**Dentro:**
- CRUD da lista de desejos do participante (título, link opcional, observação opcional).
- Conversão do link em link de afiliado **no momento de salvar**, guardando a URL original.
- Redirecionamento de saída com registro de clique sem dado pessoal.
- Exibição da lista para o dono e para quem tirou a pessoa (depois do sorteio).
- Sugestões de presente por faixa de valor (RF12, atrás de flag).

**Fora:** catálogo de produtos próprio, scraping de preço, upload de foto, reserva/"já comprei", integração com carrinho das lojas, notificações.

**Atores:** participante (dono da lista); quem tirou a pessoa (leitor após o sorteio); sistema (conversão, redirect, sugestões).

---

## 2. Fluxos

### 2.1 Participante monta a lista (`/p/[accessToken]`)
1. Abre a área do participante e vê "Sua lista de desejos" com contador `n/20` e estado vazio explicativo.
2. "Adicionar item" abre formulário com **Título** (obrigatório), **Link** (opcional, teclado `url`) e **Observação** (opcional, contador `0/200`).
3. Ao salvar: valida → converte link (§6) → grava `url` e `affiliate_url` → volta para a lista com o item no topo e aviso acessível (`aria-live="polite"`).
4. Item de afiliado mostra selo "link de afiliado" e o domínio de destino (`amazon.com.br`). Item comum mostra o domínio e abre com `rel="nofollow noopener noreferrer"`.
5. Editar e remover ficam no menu do item, com confirmação na remoção. Remover apaga a linha (§4) e libera vaga.

**Caminho alternativo:** link inválido → mensagem no campo, nada é gravado, texto digitado preservado. Item 21 → botão "Adicionar" desabilitado com explicação (não é erro silencioso).

### 2.2 Quem tirou vê a lista (RF09, chamado pelo SRT-04)
- Só depois de `groups.status = 'drawn'` e só para o par válido (quem tirou → quem foi tirado).
- Mesma renderização, **sem** botões de editar/remover; se o dono editar a lista depois, a próxima abertura mostra a versão atual.
- Se a lista estiver vazia: "Fulano ainda não montou a lista."

### 2.3 Clique em link de afiliado
1. Toque no item → `GET /r/[itemId]` (ou link direto, conforme D2).
2. Servidor resolve o item, grava evento `affiliate_click` (grupo + horário) e responde `302` para `affiliate_url`.
3. Loja registra a visita; a comissão depende das regras da loja (§7).

---

## 3. Regras de negócio

| ID | Regra |
| --- | --- |
| RN-LST-01 | Máximo de **20 itens** por participante. Remover apaga a linha e libera vaga. |
| RN-LST-02 | Título obrigatório, **1–80 caracteres** depois de `trim` e normalização NFC. |
| RN-LST-03 | Observação opcional, **até 200 caracteres**; quebras de linha preservadas, HTML sempre escapado. |
| RN-LST-04 | Link opcional, **somente `https:`**, até 2048 caracteres; `http:` e outros esquemas são recusados (§5). |
| RN-LST-05 | Link de loja fora da lista de afiliados é mantido como link comum, com `rel="nofollow noopener noreferrer"`. |
| RN-LST-06 | Guardar **sempre** `url` (original, como o usuário digitou, normalizada) e `affiliate_url` (gerada); a exibição usa `affiliate_url ?? url`. |
| RN-LST-07 | A conversão nunca falha o salvamento: se não der para converter, salva o link comum e devolve aviso "não foi possível gerar link de afiliado para esta loja". |
| RN-LST-08 | Item é do participante; ninguém edita lista de outro, nem o organizador. |
| RN-LST-09 | Depois do sorteio a lista **continua editável** (D3, 17/11); quem tirou vê a versão atual ao abrir. |
| RN-LST-10 | Remoção é **exclusão física** (`DELETE`): sem histórico do item, por minimização de dados (RNF05). O limite de 20 conta as linhas existentes. |
| RN-LST-11 | Sem preço, sem estoque e sem imagem de produto na lista: o usuário digita título livre. |
| RN-LST-12 | Nenhum dado pessoal em evento de clique: sem IP, sem user-agent, sem token, sem `participant_id`. |

---

## 4. Modelo de dados (proposta para o agente Banco)

`wish_items` (já prevista em `ARQUITETURA.md` §4, com ajustes):

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `group_id` | `uuid` | FK `groups`, `on delete cascade`; desnormalizado para consultas e eventos |
| `participant_id` | `uuid` | FK `participants`, `on delete cascade` |
| `title` | `varchar(80)` | `not null`, `check (length(btrim(title)) between 1 and 80)` |
| `url` | `text` | `null` ou `check (url ~ '^https://')` |
| `affiliate_url` | `text` | `null`; se preenchida, `check (affiliate_url ~ '^https://')` |
| `store` | `text` | `null` ou `in ('amazon','mercadolivre')`; `null` = link comum |
| `note` | `varchar(200)` | `null` |
| `created_at` / `updated_at` | `timestamptz` | `default now()` |

Índices: `(participant_id)` para contagem e listagem; `(group_id)`.

`events`: fica como em `ARQUITETURA.md` §4 — `group_id, type, created_at`, **sem** `store` e sem `item_id` (decisão do Orquestrador, 17/11; RN-LST-12).

---

## 5. Validação de URL

Ordem: `Zod` na borda (formato) → função pura `normalizeUrl()` no domínio (regras) → adapter da loja (§6). A URL **nunca** é buscada pelo servidor (sem `fetch`, sem SSRF).

| Entrada | Resultado | Mensagem |
| --- | --- | --- |
| `http://…` | recusa `insecure_url` | "Use um link que comece com https://" |
| `javascript:`, `data:`, `file:`, `ftp:`, `mailto:` | recusa `unsupported_scheme` | "Este tipo de link não é aceito" |
| `https://user:senha@loja.com/...` | recusa `invalid_url` | "Link inválido" |
| Porta explícita diferente de 443 | recusa `invalid_url` | "Link inválido" |
| `localhost`, IP literal, faixas privadas (`10.`, `172.16–31.`, `192.168.`, `127.`, `169.254.`, `::1`) | recusa `invalid_url` | "Link inválido" |
| Host sem ponto (`https://promo/`) | recusa `invalid_url` | "Link inválido" |
| Host com `xn--` ou caractere não ASCII | recusa `invalid_url` (homógrafo) | "Link inválido" |
| Acima de 2048 caracteres | recusa `url_too_long` | "Link muito longo" |
| Fragmento (`#…`) | removido antes de gravar | — |
| Encurtador (`bit.ly`, `t.co`, `amzn.to`, encurtadores do ML) | aceita como **link comum**, sem conversão | "Não é possível gerar link de afiliado para link encurtado" |
| URL de loja sem página de produto (busca, home, categoria) | aceita como **link comum**, sem conversão | "Link salvo sem afiliado: não é uma página de produto" |

Normalização: `new URL()` → `https` forçado a minúsculo no host, `host` sem `www.` para comparação, caminho preservado, query preservada (a tag é adicionada depois).

---

## 6. Adapters de afiliado (Strategy)

`src/infrastructure/affiliate/` — a interface fica em `application/ports.ts` (domínio não importa infraestrutura).

```ts
export type AffiliateStore = "amazon" | "mercadolivre";

export interface AffiliateAdapter {
  readonly store: AffiliateStore;
  /** A URL é uma página de produto desta loja? */
  supports(url: URL): boolean;
  /** Gera o link rastreado. Nunca lança: erro vira Result. */
  toAffiliateUrl(url: URL): Result<URL, "store_disabled" | "unsupported_page" | "missing_config">;
}
```

### 6.1 Amazon (`amazon.ts`)
- Domínios: `amazon.com.br` e `www.amazon.com.br` (comparação sem `www.`). `amzn.to` é encurtador: não converte.
- Reconhece produto por ASIN em `/dp/<ASIN>`, `/gp/product/<ASIN>` (10 caracteres alfanuméricos); guarda o caminho e a query originais.
- Acrescenta/substitui o parâmetro **`tag`** com `AMAZON_ASSOCIATE_TAG` (formato `xxxxx-20`). Se a URL já trouxer tag de terceiro, **substitui** pela nossa (RN-LST-06 guarda a original).
- Sem ASIN → `unsupported_page` (salva link comum).
- Nunca encurta, nunca usa wrapper de terceiro, nunca remove parâmetros do produto.

### 6.2 Mercado Livre (`mercado-livre.ts`)
- Domínios: `mercadolivre.com.br`, `www.mercadolivre.com.br`, `produto.mercadolivre.com.br`.
- Página de produto: `/p/MLB…` ou `MLB-<id>`; `/social/…`/`/sec/…` gerados pelo programa são aceitos **somente** se o host for do ML.
- **Não monta link por conta própria.** Só devolve link quando existir configuração oficial (D1):
  - modo `passthrough` (padrão enquanto não aprovado): `store_disabled` → link comum, sem comissão;
  - modo `official` (quando o ML liberar ferramenta/API): usa o Link Especial devolvido pelo ML, sem editar nada.
- Motivo, citado dos termos: 1.6 ("Links Especiais são URLs fornecidas pelo Mercado Livre ou geradas automaticamente por sistema definido pelo Mercado Livre") e 1.8 (proíbe encurtador e edição/modificação do link).

### 6.3 Configuração (só ambiente, nunca no repositório)
```
AMAZON_ASSOCIATE_TAG=xxxxx-20
AFFILIATE_ML_MODE=passthrough        # passthrough | official
AFFILIATE_ML_MEDIA_APPROVED=false    # vira true só com o domínio aprovado (D1)
AFFILIATE_CLICK_MODE=beacon          # beacon | redirect  (D2)
SUGGESTIONS_ENABLED=false            # RF12
```
Adapter sem configuração → `missing_config` → link comum e log de aviso sem dado pessoal.

### 6.4 Registro
`getAdapter(url)` percorre os adapters na ordem (Amazon, Mercado Livre) e devolve o primeiro que `supports`. Sem adapter → link comum. Um item tem no máximo um `store`.

### 6.5 Alinhamento com `docs/arquitetura/CONTRATOS.md` (rascunho do Back-end, 17/11)

**Já compatível:** `WishFields`, `WishItem`, `SaveWishItemOutput.warning = 'AFFILIATE_UNAVAILABLE'`, os casos `resolve-product-link` e `record-affiliate-click`, o port `WishItemRepository.getVisibleLink`.

**Precisa mudar no contrato (`CONTRATOS.md`):** tirar `GROUP_CLOSED` de `add-wish-item`, `update-wish-item` e `remove-wish-item` — a lista é editável depois do sorteio (D3 = não, 17/11), e o contrato hoje bloqueia. O resto:

- `AffiliateLinkService.convert(url): Promise<string | null>` perde a loja; o selo por item e `wish_items.store` dependem dela → `convert(url): Promise<{ affiliateUrl: string; store: AffiliateStore } | null>`.
- `StoredWishFields` ganha `store: AffiliateStore | null`.
- `WishItem` precisa de `createdAt: string` — a lista ordena do mais recente para o mais antigo.
- `EventRepository.append` **não** muda: segue `{ groupId, type }`.

**Divergência a corrigir fora desta spec:** `docs/features/monetizacao.md` (linha 42) diz que `affiliate_click` leva `store`. A decisão do Orquestrador de 17/11 e o `ARQUITETURA.md` §4 dizem só grupo, tipo e data. O MON-03 deve seguir a decisão; a linha da spec de monetização precisa ser corrigida pela Monetização.

**Códigos públicos (mapeamento):** detalhes do domínio → `WISH_LIST_FULL` (20 itens), `WISH_ITEM_NOT_FOUND` (item inexistente ou de outro titular), `PRODUCT_LINK_UNAVAILABLE` (link comum ou item sem URL), `INVALID_LINK` (token). `AFFILIATE_UNAVAILABLE` é aviso de sucesso, não erro; não há bloqueio por status do grupo.

---

## 7. Redirect `/r/[itemId]`

**Contrato**
- `GET /r/[itemId]` — `itemId` é UUID; qualquer outro formato → `404`.
- Resolve o item existente. Não encontrado → `404` com página curta "Este link não está mais disponível".
- Destino = `affiliate_url ?? url`. **Nunca** aceita destino por query string, header ou cookie (sem open redirect).
- Resposta: `302` + `Location`, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`.
- Se `url` é `null` (item só com título), `/r/` não existe para ele: o item não é clicável.
- Prefetch: se a requisição trouxer `Sec-Purpose: prefetch`/`Purpose: prefetch`, redireciona **sem** gravar evento. Links na tela usam `prefetch={false}`.

**Autenticação sem cookie:** decisão adiada para o **ADR-004 (SEC-06, 20/11)**, que deve cobrir beacon e redirect. Requisitos que o ADR não pode violar: sem cookie obrigatório, sem open redirect, destino só vindo do banco, token fora de log e de URL de saída. Formas consideradas aqui, sem decisão: `POST` same-origin com `{ accessToken, itemId }` para o beacon, e ticket assinado com HMAC de curta duração para o `/r/`.
Até o ADR-004, o beacon só registra clique quando a requisição traz credencial válida; se o navegador recusar cookies, a contagem pode ficar subestimada — aceito pela Monetização.

**Evento**
- `events(type='affiliate_click', group_id, created_at)`; nenhum outro campo (decisão de 17/11, igual ao `ARQUITETURA.md` §4).
- Deduplicação em memória (janela de 60 s por `itemId` + hash diário com sal rotativo) para clique duplo/refresh não inflar o painel. Nada persistido sobre o visitante.

**Transparência (obrigatória pelos dois programas)**
- O item exibe o domínio de destino e o selo "link de afiliado" **antes** do clique.
- Nada de encurtador, pop-up, iframe, `window.open` automático ou abertura de loja sem clique.

**Modo alternativo (D2, aprovado pela Monetização em 17/11):** `href` direto para `affiliate_url`, com `rel="nofollow noopener noreferrer sponsored"`, e o clique registrado por `navigator.sendBeacon('/api/affiliate-click', {itemId})`; se o beacon falhar, o clique acontece do mesmo jeito e a métrica perde aquele clique (aceito para o agregado). `/r/` continua implementado, desligado por configuração, para o caso de o SEC concluir que o redirect é aceitável.

Contrato dos eventos: `affiliate_click` leva `group_id`, `type` e `created_at`; **sem** `store`, `item_id`, `participant_id`, IP ou user-agent.

---

## 8. Divulgação de afiliado na interface

Textos obrigatórios ou propostos (não inventar além disto):

- **Amazon (literal, exigido pelo Contrato Operacional, cláusula 5):**
  > "Como participante do Programa de Associados da Amazon, sou remunerado pelas compras qualificadas efetuadas"
  Conferido no texto do contrato na fonte (§12.1), não em resumo de terceiro (pedido da revisão MON, 17/11).
  Local: rodapé da lista e da tela de sugestões, corpo ≥ 12 px, contraste AA. Não pode ficar escondido nem dentro de accordion fechado.
- **Mercado Livre (texto proposto, sujeito ao CONAR e à revisão do MON):**
  > "Este site participa do Programa de Afiliados e Criadores do Mercado Livre e pode receber comissão por compras feitas pelos links."
  Os termos (5.1) exigem indicar que o conteúdo com links é publicidade, seguindo o Guia de Influenciadores do CONAR.
- **Selo por item:** "link de afiliado · amazon.com.br" / "link de afiliado · mercadolivre.com.br".
- **Nada de preço, desconto ou "menor preço"** ao lado de link de loja (Amazon proíbe exibir preço/disponibilidade sem a API de Produtos; ML proíbe publicidade comparativa, 5.3).

---

## 9. Termos dos programas — o que foi conferido

### 9.1 Amazon Associados (Brasil)
Fonte: Contrato Operacional **atualizado em 15/10/2025**; Políticas do Programa **atualizadas em 14/04/2026**; tabela de Comissões Padrão. (URLs em §12.)

| Regra | Onde | Efeito no produto |
| --- | --- | --- |
| Link rastreado obrigatório, com a tag do associado como parâmetro na URL, acessado diretamente do site | Contrato §1; Políticas, Requisitos 2(a) e 2(b) | Só convertemos quando conseguimos pôr `tag=` na URL do produto |
| Proibido disfarçar/esconder/falsificar a URL, inclusive por link de redirecionamento | Políticas, Requisitos 2(b)(v) | Redirect transparente ou modo `beacon` (D2) |
| Proibido encurtador de link ou botão que não deixe claro que vai para a Amazon | Políticas, Requisitos 2(b)(w) | Nenhum encurtador; destino visível |
| Compra conta na sessão iniciada no clique, encerrada em 24 h (ou outro evento) | Regulamento de Comissões 1(b) | Expectativa de receita baixa em compra de presente planejada |
| Proibido abrir página da Amazon sem clique do usuário | Requisitos 2(b)(q) | Sem pré-abertura, sem `window.open` |
| Proibido pop-up/pop-under e iframe/WebView da loja | Requisitos 2(n)(o) | Item abre em aba normal |
| Proibido comprar pelos próprios links, inclusive por familiares, ou incentivar clique com recompensa | Requisitos 2(b)(u)(g) | Sem "clique e concorra"; o amigo secreto não premia clique |
| Preço e disponibilidade só com API de Divulgação ou link oficial da Amazon | Requisitos 2(b) | Lista não mostra preço; sugestões usam faixa própria (§10) |
| Declaração de associado obrigatória e destacada | Contrato §5 | Texto literal no §8 |
| Só uma tag por tráfego; não misturar atribuição com outro programa | Comissões 5 | Item tem uma loja só |
| Pagamento mínimo R$ 30 (depósito) | Comissões 6 | Métrica de receita precisa considerar o mínimo |

**Comissões Padrão (tabela vigente, consultada em 17/11/2026):**

| Categorias | Comissão |
| --- | --- |
| Bebê, Beleza, Beleza de Luxo, Saúde e Cuidados Pessoais, Bebidas Alcoólicas, Alimentos e Bebidas, Audiolivros | 13% |
| Roupas, Pet Shop | 11% |
| Livros e Livros Digitais | 10% |
| Dispositivos Amazon (Echo, Fire TV, Kindle) | 9,5% |
| Casa, Móveis, Cozinha, Ferramentas, Esportes, Brinquedos, Eletrodomésticos, Eletrônicos, Informática, Games, TV e Áudio, Celulares | 8% |
| Calçados, Bolsas e Mochilas, Jóias, Relógios, Automotivo, DVD/Blu-ray, CD e Vinil, Produtos Industriais | 7% |
| Outros | 7% |
| Coach | 0% |

> A tabela é da Amazon e muda sem aviso: **não replicar percentual no código**. Receita é dado do relatório do programa, não cálculo nosso.

### 9.2 Mercado Livre — Programa de afiliados e criadores
Fonte: "Termos e Condições do Programa de afiliados e criadores" (página sem data de atualização visível), consultada em 17/11/2026.

| Regra | Item | Efeito no produto |
| --- | --- | --- |
| Mídias = mídias sociais, **sites e blogs pessoais informados antes do início**; divulgação em outro site/mídia não gera pagamento | 1.3 | O domínio do Amigo Secreto precisa ser cadastrado e aprovado |
| Sites passam por aprovação ("Mídia Social Aprovada") e por verificações periódicas | 2.3 | Aprovação é pré-requisito para ligar o adapter |
| Links Especiais são gerados **pelo Mercado Livre**; o afiliado não monta link | 1.6 | Sem geração programática, `passthrough` (link comum) |
| Proibido encurtador, edição/modificação do link, ou ferramenta que esconda que o destino é o Mercado Livre | 1.8 | Sem `utm` próprio no link do ML; sem wrapper opaco |
| Venda só conta se concluída em até **24 h** | 1.6 | mesma leitura da Amazon |
| Só anúncio de produto ativo e novo, de vendedor com reputação amarela ou acima (quem tem Perfil Social) | 1.6, nota | Validar que a URL é página de produto, não busca/home |
| Não pagam: compras do próprio afiliado, anúncio genérico/home/busca, usados, cancelados/devolvidos | 3.1.2 | Item aponta para produto específico; sem link de busca como afiliado |
| Pagamento mínimo R$ 30 e ao menos 3 pessoas distintas; crédito em Mercado Pago em até 60 dias | 3.2, 3.3.1 | Receita do ML é lenta; não serve de caixa no lançamento |
| Proibido pop-up, iframe, redirecionamento automático; cookie só com clique voluntário em link visível | 1.10 | Reforça o D2 e a transparência |
| Proibido incorporar sorteio de produtos ou jogos de azar nas Mídias | 4.3(f) | **Risco a esclarecer por escrito**: nosso "sorteio" é amigo secreto, não sorteio de prêmio; pedir confirmação ao programa |
| Publicidade identificada conforme CONAR | 5.1 | Selo e texto do §8 |
| Proibida publicidade comparativa de produtos | 5.3 | Sem "mais barato que X" |

**O que não dá para afirmar daqui:** percentual por categoria do ML (tabela no item 3.1 fica no painel do afiliado, atrás de login); data de vigência dos termos; e o alcance real do item 3.1.2(b) ("os anúncios do Marketplace"). Confirmar com o programa antes de contar receita do ML como meta.

**Parecer da Monetização (17/11):** aprovado o `passthrough` até a aprovação da mídia; **o lançamento não conta receita do Mercado Livre**. D1 (aprovação do domínio + forma oficial de gerar o Link Especial) fica com o Rodrigo no painel de afiliados. Os itens 3.1.2(b) e 4.3(f) precisam de confirmação por escrito do suporte do ML antes de o canal contar como receita.

---

## 10. RF12 — Sugestões dentro do valor do grupo (pós-MVP, `SUGGESTIONS_ENABLED`)

- **Fonte:** catálogo curado em `src/infrastructure/gifts/catalog.ts` — `{ slug, title, category, priceBand: { minCents, maxCents }, searchQuery, blurb }`. Texto original nosso; **nenhum scraping** e nenhuma chamada às lojas.
- **Filtro:** `priceBand.maxCents <= group.max_value_cents` e faixa com pelo menos um item; ordenar por faixa crescente; máximo 6 sugestões.
- **Preço:** a faixa é nossa referência ("ideia de presente até R$ 50"), com data de revisão do catálogo; **não** é preço de produto Amazon/ML e não é exibida junto de produto específico.
- **Link:** Amazon — busca da loja com `tag` (a Amazon exige conteúdo original adicional em páginas de lista, e o catálogo é esse conteúdo). Mercado Livre — somente produto específico com Link Especial; enquanto D1 não resolvido, busca do ML **sem** afiliado.
- **Grupo sem valor máximo** → seção não aparece.
- **Métrica:** eventos `suggestion_shown` e `suggestion_clicked` (sem dado pessoal), para o MON-03 avaliar se vale manter.

---

## 11. Acessibilidade, desempenho e segurança

- **Mobile first (RNF01):** adicionar item em menos de 20 s; formulário em uma coluna; alvos ≥ 44 px.
- **Acessibilidade (RNF10):** `<label>` real em cada campo, contador de caracteres associado por `aria-describedby`, erros com `role="alert"`, foco no primeiro erro, lista como `<ul>` com título do item como elemento de leitura, selo de afiliado em texto (não só ícone).
- **Desempenho (RNF02):** lista renderizada no servidor; nenhum script de loja; sem imagem de produto.
- **Segurança (revisão SEC obrigatória):**
  - autorização por token em **toda** operação; um token nunca lê lista de outro participante fora do par do sorteio;
  - validação dupla (Zod + domínio) e escape de HTML na exibição;
  - sem open redirect: destino só do banco; sem `?to=`; sem host do usuário em `Location`;
  - `/r/` e `/p/` com `noindex` e `Referrer-Policy: no-referrer`;
  - rate limit na criação de itens (ex.: 20/min por token) e no `/r/` (ex.: 60/min por IP, contador sem persistir IP);
  - logs sem título, observação, URL ou token.
- **LGPD (RNF05):** título e observação são texto livre do usuário → podem conter dado pessoal; exibir só para dono e para o par do sorteio; expurgo junto com o grupo (RN08); nenhum evento com identificador de pessoa.

---

## 12. Fontes consultadas (17/11/2026)

1. Amazon — Contrato Operacional do Programa de Associados (atualizado 15/10/2025): https://associados.amazon.com.br/help/operating/agreement/
2. Amazon — Políticas do Programa de Associados (atualizado 14/04/2026): https://associados.amazon.com.br/help/operating/policies/
3. Amazon — Comissões Padrão: https://associados.amazon.com.br/help/node/topic/GRXPHT8U84RAYDXZ
4. Mercado Livre — Termos e Condições do Programa de afiliados e criadores: https://www.mercadolivre.com.br/ajuda/30228
5. Mercado Livre — página do programa (ganhos extras, cupons, "ganhe mesmo que comprem outro produto"): https://www.mercadolivre.com.br/l/afiliados-home

---

## 13. Critérios de aceite (verificáveis)

| # | Critério | Req. | Como verificar |
| --- | --- | --- | --- |
| CA-01 | Participante cria, edita e remove item com título, link e observação | RF05 | E2E em viewport 360 px |
| CA-02 | 21º item é recusado com mensagem clara; remover libera a vaga | RF05 | Teste de integração |
| CA-03 | Título de 1 e de 80 caracteres aceitos; 0 e 81 recusados (após `trim`) | RF05 | Teste unitário de domínio |
| CA-04 | Observação de 200 aceita; 201 recusada | RF05 | Teste unitário |
| CA-05 | `http:`, `javascript:`, `data:`, URL com credenciais, IP privado e host com `xn--` recusados | RF05/RNF03 | Tabela de casos do §5 automatizada |
| CA-06 | Link de produto Amazon salvo gera `affiliate_url` com `tag` e mantém a `url` original | RF10 | Teste unitário + snapshot |
| CA-07 | Link de encurtador e link de busca/home ficam como link comum, com aviso, sem quebrar o salvamento | RF10 | Teste unitário |
| CA-08 | Mercado Livre não gera link por conta própria; em `passthrough` salva link comum | RF10 | Teste unitário |
| CA-09 | Clique em item de afiliado grava 1 evento com `group_id`, `type` e `created_at` e nenhum outro dado | RF10/RNF05 | Teste de integração |
| CA-10 | Nenhum destino é aceito fora do banco; `/r/` não redireciona para host arbitrário | RF10/RNF03 | Teste com `?to=`, `?url=`, header forjado |
| CA-11 | Prefetch não gera evento | RF10 | Teste com header `Sec-Purpose` |
| CA-12 | Quem tirou vê a lista só após o sorteio; token de terceiro recebe 404 | RF09/RN03 | Teste de integração |
| CA-13 | Editar, incluir e remover continuam funcionando depois do sorteio, e quem tirou passa a ver a versão atual | RF05/D3 | Teste de integração + E2E |
| CA-14 | Texto de associado da Amazon presente e visível na lista | RF10 | Verificação visual + E2E de texto |
| CA-15 | Sugestões respeitam o valor máximo do grupo e não aparecem com a flag desligada | RF12 | Teste unitário |

---

## 14. Testes previstos

- **Unitário (Vitest, domínio puro):** `normalizeUrl`, limites de título/observação, contagem de 20 itens, `AmazonAdapter` (ASIN, tag existente, sem ASIN), `MercadoLivreAdapter` (só produto, `passthrough`/`official`), seleção de sugestões por faixa.
- **Integração (Supabase local):** `add-wish-item`, `update-wish-item`, `remove-wish-item`, `list-wish-items`; autorização por token; limite concorrente (dois "adicionar" ao mesmo tempo no 20º item usa transação e não passa de 20); exclusão física; edição depois do sorteio; evento de clique.
- **E2E (Playwright, 360 px):** HU03 completa — adicionar 3 itens, editar 1, remover 1, abrir link de afiliado e voltar; lista vista por quem tirou.
- **Manual:** abrir um link Amazon e um ML no navegador interno do WhatsApp e conferir que a URL de destino aparece antes do clique.

---

## 15. Dependências

| Depende de | Para quê |
| --- | --- |
| PAR-04 (área do participante) | onde a tela vive |
| DB-01/DB-02 | `wish_items` com os checks do §4, sem `removed_at` e sem `store` em `events` |
| SEC-01/SEC-03 | headers, rate limit, revisão de URL |
| SEC-06 / ADR-004 (20/11) | como autenticar beacon e redirect sem cookie |
| D1 (Rodrigo) | ligar receita do Mercado Livre |
| D2 (fechada) | contagem de clique por beacon |
| MON-03 | consumir os eventos de clique no painel (sem `store`) |
| SRT-04 | exibir a lista para quem tirou |
