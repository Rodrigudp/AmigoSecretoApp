# Especificação visual e de textos da It-3 — DSN-04

Dono: 16 Designer · Para: 11 Front-end (LST-04), 23 Sorteio (SRT-03, SRT-04), 22 Lista (regras) · Revisor: Orquestrador.
Base: `lista-desejos.md` (LST-01), `sorteio.md`, `design-system.md`, `textos.md` §§ 10–12 (textos finais com IDs `WSH-`, `REV-`, `DRW-`).
Endereço oficial dos exemplos: `https://papelzinho.app`. Nenhum texto fixa o domínio; links vêm do ambiente.

## 0. Decisões de design (para o Orquestrador registrar no log)

| # | Decisão | Motivo |
| --- | --- | --- |
| D-A | Adicionar e editar presente **na própria página**, em cartão inline. Sem janela modal. | Modal prende o foco e confunde quem usa leitor de tela ou tem mais idade. |
| D-B | Editar e Apagar são **dois botões de texto visíveis** em cada item, não um menu de três pontos (a LST-01 fala em "menu do item"). | Ícone sem texto não é claro para o público idoso; alvo ≥ 44 px. |
| D-C | "Revelar" é um botão **principal** da área quando há sorteio; "Adicionar presente" passa a secundário nessa tela. | Um botão principal por tela. |
| D-D | Confirmação de sorteio **inline no cartão**, com foco inicial em "Cancelar". | Ação irreversível no MVP (refazer é pós-MVP, SRT-05). |
| D-E | O estado "revelado" vive só na tela (não persiste): ao recarregar o cartão volta fechado. | `sorteio.md`: cartão inicia fechado; nada do par na renderização inicial. |
| D-F | Texto de divulgação de afiliado aparece **só quando há item daquela loja** na lista exibida. | Evita aviso comercial sem link comercial; cumpre §8 da LST-01. |

## 1. Componentes novos (usam os tokens do design-system)

| Componente | Base | Regras |
| --- | --- | --- |
| `WishList` | `Card` | Título, contador, lista `<ul>`, botão de adicionar, rodapé de divulgação. Recebe `mode: "owner" \| "reader"` (leitor não vê botões nem formulário). |
| `WishItem` | `<li>` | Nome do presente (`text-base`, 600), observação (`text-sm`, `text-muted`, quebras preservadas), linha da loja, botões do dono. Divisória `line` entre itens. |
| `StoreBadge` | `<span>` | Texto sempre (nunca só ícone). Afiliado: fundo `note` (`#FFF0BB`), texto `text`, "Link de afiliado · amazon.com.br". Link comum: sem fundo, texto `text-muted`: "amazon.com.br". |
| `WishForm` | `Card` interno, borda `border` | Dois modos: novo e editar. Três campos, botões Salvar e Cancelar. |
| `Textarea` | igual ao `Input` | 3 linhas, contador "0/200", mesmo estado de erro/foco/desabilitado. |
| `AffiliateDisclosure` | `<p>` `text-sm` `text-muted` | Rodapé da lista, nunca dentro de elemento recolhido. |
| `RevealCard` | `Card` com fundo `peach` quando fechado e pronto | Estados da §2. |
| `DrawCard` | `Card` | Estados da §3. |
| `InlineConfirm` | bloco `warning-bg`, borda `warning` | Já existe no painel (remover participante); padronizar para remover presente e sortear. `role="group"` + `aria-labelledby`. |

Largura: botões dentro de cartão em largura total até 640 px e largura automática em linha depois (regra do FE-DSN-1).

## 2. Lista de desejos (LST-04) — `/p/[accessToken]`

Ordem da área do participante, de cima para baixo: cabeçalho (`ParticipantHeader`) → **Meu amigo secreto** (só depois do sorteio, §3) → **Lista de desejos** → anúncio ao final (ADR-004: nunca no fallback `?ck=1`).

### 2.1 Estados

| # | Estado | O que a pessoa vê |
| --- | --- | --- |
| E1 | Carregando | Cartão com esqueleto de 2 linhas e "Carregando…" (`aria-live="polite"`). |
| E2 | Vazio | Texto de ajuda + botão `secondary` "Adicionar presente". |
| E3 | Com itens | Contador, itens do mais novo ao mais antigo, botão "Adicionar presente". |
| E4 | Formulário novo | Cartão inline abre acima da lista; foco no campo "Nome do presente"; botão de adicionar some. |
| E5 | Editando | O item vira formulário no lugar; os outros itens seguem visíveis. |
| E6 | Erro de campo | Mensagem abaixo do campo (ícone ⚠ + texto), `role="alert"`, foco no primeiro campo com erro; texto digitado fica. Sem cartão-resumo (A-07). |
| E7 | Salvo | Formulário fecha, item aparece no topo, mensagem `role="status"` "Presente salvo." Se houve aviso de afiliado, um aviso `warning` curto abaixo do item novo (não bloqueia). |
| E8 | Confirmar apagar | `InlineConfirm` dentro do item. Foco em "Cancelar". |
| E9 | Limite de 20 | Botão "Adicionar presente" desabilitado, com a frase do motivo logo abaixo, `aria-describedby`. Editar e apagar continuam. |
| E10 | Erro de rede / servidor | Cartão `danger` dentro da lista com a frase e o botão "Tentar de novo". |
| E11 | Leitor (depois de revelar) | Mesma lista, sem botões e sem formulário; vazia: "Esta pessoa ainda não adicionou desejos." |

### 2.2 Wireframe 360 px (estado E3 + E4)

```
┌──────────────────────────────┐
│ Lista de desejos             │  h2 (Card)
│ 3 de 20 presentes            │  text-sm muted
│ Quem tirar você vai ver esta │
│ lista. Pode mudar quando     │
│ quiser.                      │
│ ┌──────────────────────────┐ │
│ │ Novo presente            │ │  h3, borda border, raio 12
│ │ Nome do presente *       │ │
│ │ [ Ex.: Livro de receitas]│ │
│ │ Link da loja (opcional)  │ │
│ │ Cole o endereço da página│ │  hint 16 px
│ │ [ https://             ] │ │  inputmode=url
│ │ Observação (opcional)    │ │
│ │ [                      ] │ │  3 linhas
│ │ [                0/200 ] │ │
│ │ [  Salvar presente     ] │ │  primary
│ │ [  Cancelar            ] │ │  ghost
│ └──────────────────────────┘ │
│ ───────────────────────────  │
│ Fone de ouvido azul          │  600
│ Tamanho M, sem fio           │  observação
│ [Link de afiliado · amazon…] │  StoreBadge
│ [ Ver na loja ]              │  secondary (link, abre em aba)
│ [ Editar ]   [ Apagar ]      │  ghost, ≥ 44 px
│ ───────────────────────────  │
│ Camiseta preta               │
│ (sem link)                   │
│ [ Editar ]   [ Apagar ]      │
│ ───────────────────────────  │
│ Como participante do Programa│
│ de Associados da Amazon, sou │  AffiliateDisclosure
│ remunerado pelas compras …   │
└──────────────────────────────┘
```

Em E2 o cartão fica: título, texto de vazio e o botão. Em E9 o botão "Adicionar presente" aparece cinza com a frase "Você chegou a 20 presentes. Apague um para adicionar outro." abaixo.

### 2.3 Wireframe 1280 px

- Página em `max-w-3xl`, coluna única (a área do participante continua estreita; a lista não ganha segunda coluna).
- Cabeçalho do participante acima, largura total da coluna.
- Dentro do cartão, cada item usa grade `1fr auto`: à esquerda nome, observação e selo; à direita, **Ver na loja · Editar · Apagar** em linha, alinhados ao topo do item. O formulário fica com os campos em coluna única (`max-w-xl`) e os botões Salvar e Cancelar lado a lado.
- Selo e domínio ficam sempre abaixo da observação, nunca à direita, para a leitura não depender da largura.

### 2.4 Regras de comportamento

1. **Contador:** "{n} de 20 presentes" (singular: "1 de 20 presentes"). Atualiza ao salvar e ao apagar, com `aria-live="polite"`.
2. **Link:** campo `type="url"` com `inputmode="url"`, `autocomplete="off"`, `autocapitalize="off"`. Sem validação enquanto digita; valida ao sair do campo e ao salvar. O que a pessoa digitou nunca é apagado por erro.
3. **Aviso de afiliado (E7):** o salvamento nunca falha por causa da loja (RN-LST-07). Mensagens `WSH-18`, em `Card` tom `warning` pequeno com ⚠, abaixo do item, fechadas ao tocar em "Entendi" ou ao salvar de novo.
4. **Ver na loja:** link com o domínio visível na linha acima (selo). Abre em aba nova, `rel="nofollow noopener noreferrer"` (afiliado também leva `sponsored`). Sem pré-abertura, sem `window.open`, sem pop-up (programas de afiliados). Item sem link não tem esse botão.
5. **Apagar:** confirmação inline com o nome do presente. Apaga de verdade (RN-LST-10), sem "desfazer".
6. **Foco:** ao abrir o formulário, foco no primeiro campo; ao salvar, foco no título do item salvo; ao cancelar, foco no botão que abriu; ao apagar, foco no título do próximo item (ou no botão "Adicionar presente" se a lista ficar vazia).
7. **Depois do sorteio:** a lista continua editável (D3). Troca só o texto de apoio (WSH-03).
8. **Sem preço, sem imagem, sem "menor preço"** ao lado de link de loja (LST-01 §8).
9. **Divulgação (D-F):** `AffiliateDisclosure` no rodapé do cartão para cada loja presente na lista. Amazon: texto **literal** da LST-01 §8 (não editar). Mercado Livre: texto proposto, sujeito ao 24 Monetização.
10. **Tokens do cartão:** fundo `surface`, borda `line`, itens separados por `line`; formulário com borda `border` para se destacar sem sombra.

### 2.5 Acessibilidade (RNF10)
- Cada campo com `<label>` visível; hint e contador ligados por `aria-describedby`.
- Lista é `<ul>`; botões levam o nome do item no `aria-label`: "Editar Fone de ouvido azul", "Apagar Fone de ouvido azul".
- Erro nunca só por cor: ícone ⚠ + texto.
- Selo de afiliado é texto. Contraste dos pares da tabela do design-system (§2.2); `note` + `text` = 14,42.
- Alvos ≥ 44 px, espaço ≥ 8 px entre Editar e Apagar.

## 3. Cartão "Revelar" (SRT-04) — `/p/[accessToken]`

Aparece **acima** da lista de desejos. Não existe renderização do nome do par antes de tocar (a resposta só vem do `get-my-result`).

### 3.1 Estados

| # | Estado | Aparência | Ação |
| --- | --- | --- | --- |
| R0 | Sorteio ainda não feito | `Card` branco, sem botão. Título + frase de espera. | nenhuma |
| R1 | Pronto, fechado | `Card` fundo `peach`, título, frase de segredo, botão `primary` "Revelar meu amigo secreto" | toque |
| R2 | Carregando | Botão desabilitado "Revelando…", `aria-busy="true"` | — |
| R3 | Revelado | Nome grande, resumo da troca, lista do par (leitor), botão `ghost` "Esconder" | Esconder volta a R1 |
| R4 | Erro | `Card` `danger`: frase + "Tentar de novo" | repete a consulta |
| R5 | Link inválido | Mesma tela de link indisponível (ARE-06) | — |
| R6 | Sorteio refeito (pós-MVP, SRT-05) | Aviso `warning` no topo do cartão; "Revelar" mostra o resultado vigente | — |

### 3.2 Wireframe 360 px

```
R1 — fechado                          R3 — revelado
┌──────────────────────────────┐     ┌──────────────────────────────┐
│ Seu amigo secreto            │     │ Seu amigo secreto            │
│ O sorteio foi feito. Toque   │     │ Você tirou                   │  text-sm muted
│ para ver quem você tirou.    │     │ Beatriz Lima                 │  serif 30/36, 700
│ Confira se ninguém está      │     │ Encontro em 24/12/2026 ·     │
│ olhando a sua tela.          │     │ até R$ 50,00                 │
│ [ Revelar meu amigo secreto ]│     │ [ Esconder ]                 │  ghost
└──────────────────────────────┘     ├──────────────────────────────┤
                                     │ Lista de desejos de Beatriz  │  WishList mode=reader
                                     │ 2 presentes                  │
                                     │ ─ Fone de ouvido azul …      │
                                     │ ─ (sem botões de editar)     │
                                     └──────────────────────────────┘
```

- Em R3 o nome usa `font-accent` (Source Serif 4), 30 px, com `wrap-break-word` (nome de até 40 letras não pode estourar a largura).
- A lista do par é um **segundo cartão** logo abaixo; no estado vazio mostra "Esta pessoa ainda não adicionou desejos."
- Em 1280 px os dois cartões ficam empilhados na mesma coluna estreita (`max-w-3xl`); o nome sobe para 36 px.

### 3.3 Regras
1. **D-E:** recarregar a página fecha o cartão. Voltar do histórico também (`Cache-Control: private, no-store`, já no contrato).
2. **Nada de anúncio** dentro do cartão nem colado nele; o espaço de anúncio da área fica no fim da página, depois da lista.
3. **Sem animação obrigatória.** Se houver transição de abrir, 200 ms e some com `prefers-reduced-motion`.
4. **Foco:** ao revelar, o foco vai para o nome (`tabIndex=-1`) e o leitor de tela lê "Você tirou {nome}". Ao esconder, foco no botão "Revelar".
5. **Organizador que participa** usa o próprio link pessoal; o painel nunca mostra pares.
6. Não existe botão de copiar nem compartilhar o resultado (segredo). Sem botão de imprimir.

## 4. Painel: "Sortear" e "Sorteio realizado" (SRT-03) — `/admin/[token]`

O cartão "Sorteio" do painel já existe. Ele muda assim (o "Em breve" sai junto com o botão ativo).

### 4.1 Estados

| # | Estado | Aparência | Ação |
| --- | --- | --- | --- |
| S1 | Aberto, menos de 3 pessoas | Botão "Fazer o sorteio" desabilitado + motivo (DRW-03) | — |
| S2 | Aberto, 3 ou mais | Botão **principal** "Fazer o sorteio" (único principal do painel) | abre S3 |
| S3 | Confirmando | `InlineConfirm` no cartão: título, aviso, contagem de pessoas, **Cancelar** (foco inicial) e **Sim, fazer o sorteio** (`primary`) | confirma ou volta a S2 |
| S4 | Sorteando | "Sorteando…", ambos os botões desabilitados, `aria-busy="true"` | — |
| S5 | Sorteio feito | Cartão `success` com ✓, data, orientação e botão "Avisar o grupo no WhatsApp" (`secondary`). Selo do topo vira "Sorteio feito em {data}". Botões "Remover" saem da lista. | WhatsApp (WPP-04) |
| S6 | Erro | Cartão `danger` dentro do cartão do sorteio com a frase e o botão do passo anterior | tentar de novo |
| S7 | Grupo mudou durante a confirmação | `warning`: contagem diferente; botão "Atualizar" recarrega a página | — |

### 4.2 Wireframe 360 px

```
S2 e S3                              S5
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ Sorteio                      │    │ Sorteio                      │
│ Quando todos tiverem entrado,│    │ ✓ Sorteio feito em 22/11/2026│  success-bg
│ faça o sorteio. Cada pessoa  │    │ Cada pessoa já pode ver quem │
│ vê só quem tirou.            │    │ tirou pelo seu link pessoal. │
│ [  Fazer o sorteio  ]        │    │ Por segurança, este painel   │
│ ┌──────────────────────────┐ │    │ não mostra os pares.         │
│ │ Fazer o sorteio agora?   │ │    │ Você também participa? Abra  │
│ │ 7 pessoas vão participar.│ │    │ o seu link pessoal.          │
│ │ Depois, ninguém mais     │ │    │ [ Avisar o grupo no WhatsApp]│
│ │ entra pelo convite e não │ │    └──────────────────────────────┘
│ │ dá para desfazer.        │ │
│ │ [ Cancelar ]             │ │  ← foco inicial
│ │ [ Sim, fazer o sorteio ] │ │  primary
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

No estado S3 o botão "Fazer o sorteio" original some (para não haver dois principais).

### 4.3 1280 px
O cartão fica na coluna esquerda, embaixo de "Link do convite" (grade do painel de 2 colunas já existente); a confirmação cresce dentro do cartão, sem deslocar a coluna da direita (`items-start`). Botões da confirmação lado a lado.

### 4.4 Regras
1. A contagem na tela é informativa; o servidor decide (mínimo 3, estado do grupo).
2. Duplo clique ou reenvio mostra o mesmo S5 (a operação é idempotente).
3. Nenhuma resposta nem tela do painel exibe nomes sorteados ou pares.
4. O selo do cabeçalho e o cartão usam a data gravada pelo servidor, formato `dd/mm/aaaa`.
5. **Foco:** S2→S3: foco em "Cancelar". S3→S5: foco no texto "✓ Sorteio feito…" (`tabIndex=-1`). S6: foco na mensagem.
6. Refazer sorteio é pós-MVP (SRT-05); nenhum botão disso aparece agora.

## 5. Impacto em outras telas e textos já aprovados
- `ARE-04` (lista provisória) e `ARE-05` (resultado provisório) deixam de existir: viram `WSH-*` e `REV-*`.
- `ADM-12` a `ADM-15` continuam; `EXTRA.upcoming` ("Em breve") sai do painel quando a SRT-03 entrar.
- `sorteio.md` usa "Sortear" e "participantes"; o app usa "Fazer o sorteio" e "pessoas" (guia de voz). O 23 Sorteio ajusta as mensagens dele para as de `textos.md` §12–13.
- WhatsApp de aviso de sorteio = `WPP-04` (já em `textos.md` §8).

## 6. Critérios de aceite do desenho (para o FE e o QA)
| Critério | Verificação |
| --- | --- |
| Toda frase vem de `copy.ts` com a chave do ID de `textos.md` | busca por texto solto; teste de catálogo |
| Um botão principal por tela (área: "Revelar" ou "Adicionar"; painel: "Fazer o sorteio") | revisão visual 360/1280 |
| Nome do par só aparece depois do toque (R3) | E2E: HTML inicial sem o nome; QA-04 |
| Foco e leitura: ordem da §2.4 (6) e §3.3 (4) | teste com teclado; axe |
| Alvos ≥ 44 px e fonte ≥ 16 px nas três telas | medição Playwright (igual ao FE-DSN) |
| Sem rolagem horizontal em 360 px com nome de 40 letras e título de 80 | E2E com dados longos |
| Divulgação da Amazon literal quando há item Amazon | teste de texto |
| Painel e área nunca mostram "Em breve" depois da SRT-03/LST-04 | revisão |

Prints de revisão: o FE anexa 360 e 1280 px de página inteira (sem indicador do Next) para cada estado E2, E3, E4, E6, E9, R0, R1, R3, S2, S3, S5; o Designer revisa em até meio dia (DSN-05).
