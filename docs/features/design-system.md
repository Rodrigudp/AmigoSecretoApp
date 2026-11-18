# Design system mínimo — UX-01

Dono: Front-end · Revisor: Orquestrador · Requisitos: RNF01 (mobile first), RNF02 (desempenho), RNF10 (WCAG AA, legível para idosos).

## 1. Princípios
1. **Mobile first**: uma coluna em telas estreitas. A criação e o painel usam duas colunas em telas largas.
2. **Legível para idosos**: texto base 18 px, nunca menor que 16 px; um objetivo por tela; um botão primário por tela.
3. **Sem bibliotecas de UI**: só Tailwind + componentes próprios (bundle < 100 KB gzip por rota, RNF02).
4. **Server Components por padrão**; `"use client"` apenas em componentes com interação (copiar link, revelar).
5. **Cor nunca é o único sinal**: erro/sucesso sempre com ícone + texto.
6. Texto em português claro, sem jargão ("link pessoal", não "token").

## 2. Tokens

### 2.1 Cores

A referência aprovada é o [Estilo Notion do Profitize](https://profitize.com.br/build/design-systems/estilo-notion). O Papelzinho usa fundo quente, cartões brancos com borda fina e superfícies de destaque chapadas.

| Token | Hex | Uso |
| --- | --- | --- |
| `bg` | `#F6F5F4` | papel quente |
| `surface` / `line` | `#FFFFFF` / `#DEDBD7` | cartões e divisórias |
| `text` / `text-muted` | `#211F1D` / `#615D59` | texto e apoio |
| `primary` / `primary-hover` | `#0066C3` / `#0054A0` | ação principal |
| `primary-soft` / `primary-soft-text` | `#E6F3FE` / `#004E96` | ação secundária e destaque do painel |
| `peach` / `note` | `#F6D5B8` / `#FFF0BB` | destaque da abertura e do convite |
| `border` / `focus` | `#8A8580` / `#0066C3` | campos e foco |
| `danger` / `danger-bg` | `#A32921` / `#FFF1EF` | erro |
| `success` / `success-bg` | `#1F5C38` / `#E8F5EE` | sucesso |
| `warning` / `warning-bg` | `#694714` / `#FFF6DC` | avisos |
| `disabled` / `disabled-bg` | `#615D59` / `#EEECE9` | controle desabilitado |

### 2.2 Contraste

| Par | Razão | Mínimo |
| --- | --- | --- |
| Texto principal sobre papel quente | 15,09 | 4,5 |
| Texto de apoio sobre papel quente | 5,99 | 4,5 |
| Texto de apoio sobre cartão branco | 6,53 | 4,5 |
| Branco sobre botão azul | 5,69 | 4,5 |
| Branco sobre botão azul em hover | 7,57 | 4,5 |
| Texto de botão secundário | 7,36 | 4,5 |
| Texto principal sobre pêssego | 11,83 | 4,5 |
| Texto principal sobre amarelo | 14,42 | 4,5 |
| Aviso | 7,75 | 4,5 |
| Erro | 6,59 | 4,5 |
| Sucesso | 7,08 | 4,5 |
| Texto de controle desabilitado | 5,53 | 4,5 |
| Borda dos campos sobre branco | 3,65 | 3 |
| Anel de foco sobre papel quente | 5,23 | 3 |

### 2.3 Tipografia
**Inter** na interface e **Source Serif 4** nos textos de abertura. As fontes são servidas pelo próprio app.

| Token | Tamanho / entrelinha | Peso | Uso |
| --- | --- | --- | --- |
| `text-base` | 18 / 28 px | 400 | corpo, inputs |
| `text-sm` | 16 / 24 px | 400 | apoio, mensagens de erro (**mínimo permitido**) |
| `text-lg` | 20 / 28 px | 600 | rótulos, títulos de cartão |
| `text-xl` | 24 / 32 px | 700 | título de tela (h1) em 360 px |
| `text-2xl` / `text-3xl` / `text-4xl` | 30–44 px | 700 | marca e títulos |

Proibido `text-xs` e tamanhos < 16 px. Caixa-alta só em rótulos curtos de marca (tracking amplo).

### 2.4 Espaçamento, forma e movimento
- Escala de 4 px: 4, 8, 12, 16, 24, 32, 48. Margem lateral da página: 16 px (360 px). Espaço entre campos: 16 px; entre seções: 24–32 px.
- Raio de 8 px nos controles e 12 px nos cartões. Os cartões usam borda fina, sem sombra.
- Alvo de toque mínimo **44 × 44 px** (botão e input: altura 48 px); espaço mínimo de 8 px entre alvos adjacentes.
- Foco visível: anel de 3 px `focus` + offset 2 px, em todo elemento interativo. Nunca `outline: none` sem substituto.
- Movimento: transições de cor em 200 ms, com `prefers-reduced-motion` respeitado.

## 3. Componentes (`app/_components/`)

### 3.1 Button
Props: `variant: "primary" | "secondary" | "ghost"`, `size` (único: altura 48 px, largura total em 360 px), `loading`, `disabled`, `type`. Renderiza `<button>`; versão link usa `<a>` com o mesmo estilo.

| Estado | Aparência | Comportamento |
| --- | --- | --- |
| padrão | primary: fundo `primary`, texto branco, 18 px/600 | — |
| hover/pressionado | fundo `primary-hover` | — |
| foco | anel `focus` 3 px | ativa com Enter/Espaço |
| carregando | texto trocado ("Criando…"), spinner, `aria-busy="true"` | clique ignorado (evita duplo envio) |
| desabilitado | `disabled-bg`/`disabled-text`, sem sombra | `disabled` nativo; motivo explicado em texto próximo |

### 3.2 Input (campo de texto com rótulo)
Props: `label` (obrigatório, visível acima do campo), `hint`, `error`, `required`, `type`, `maxLength`. Rótulo associado via `htmlFor`/`id`; placeholder nunca substitui rótulo.

| Estado | Aparência | Acessibilidade |
| --- | --- | --- |
| padrão | borda 1 px `border`, fundo `surface`, 18 px, altura 48 px | `autocomplete`/`inputmode` adequados |
| foco | borda `focus` + anel 3 px | — |
| erro | borda e ícone `danger`, mensagem 16 px abaixo ("⚠ Escreva o nome do grupo") | `aria-invalid="true"`, `aria-describedby` → mensagem, `role="alert"` ao aparecer |
| desabilitado | `disabled-bg`, texto `disabled-text` | `disabled` nativo |
| só leitura | fundo `surface`, borda tracejada (usado para links a copiar) | `readOnly`, seleciona tudo ao focar |

Hint: 16 px `text-muted` entre rótulo e campo. Contador opcional ("12/60").

### 3.3 Card
Props: `tone: "default" | "warning" | "success" | "danger"`, `as` (`section`/`article`), título opcional (`h2`/`h3`). Fundo `surface` (ou `*-bg` do tom), borda 1 px, raio 12 px, padding 20 px (360 px) / 28 px (≥ 640 px). Tons de aviso levam ícone + título em texto, nunca só cor. Card clicável: vira `<a>`/`<button>` com área inteira ≥ 44 px e os mesmos estados de foco/hover do Button.

### 3.4 Mensagens e estados de tela (padrão obrigatório, AGENTS/11-frontend)
- **Carregando**: esqueleto neutro (sem animação com reduced-motion) + texto "Carregando…" para leitores de tela (`aria-live="polite"`).
- **Vazio**: Card com frase amigável + uma ação ("Ainda ninguém entrou. Compartilhe o convite.").
- **Erro**: Card `danger` com o que houve e o que fazer; link inválido sempre a mesma mensagem genérica (não revela se o grupo existe).

### 3.5 Componentes planejados (fora do UX-01, usam estes tokens)
`ShareWhatsAppButton`, `CopyField`, `RevealCard`, `AdSlot` — definidos nos cartões das features.

## 4. Layout base
- `<html lang="pt-BR">`, `<meta viewport width=device-width, initial-scale=1>` (nunca bloquear zoom).
- Estrutura: `header` (nome do app) · `main` (coluna única, centralizada, `max-w-md`) · `footer` (Privacidade · Termos).
- Link "Pular para o conteúdo" como primeiro foco. Um único `h1` por página.
- Slot de anúncio só abaixo do conteúdo principal, com altura reservada (evita CLS) e nunca em telas com link pessoal/admin recém-exibidos.

## 5. Wireframes em texto (360 px)

### 5.1 Criar grupo — `/` (RF01, HU01)
```
┌──────────────────────────┐
│ Papelzinho               │
├──────────────────────────┤
│ Faça seu amigo secreto    │  h1
│ em 2 minutos.             │
│ Sem cadastro e sem senha. │
│                           │
│ Nome do grupo *           │
│ [ Família 2026         ]  │  máx. 60
│ Valor máximo do presente *│
│ [ R$ 50,00             ]  │  inputmode=decimal
│ Data do encontro *        │
│ [ 24/12/2026           ]  │  type=date
│ Local do encontro         │
│ [ Casa da vovó         ]  │
│                           │
│ [   Criar grupo   ]       │  primário, 48 px
├──────────────────────────┤
│ Privacidade · Termos      │
└──────────────────────────┘
Erros: abaixo de cada campo + resumo no topo ao enviar. Enviando: botão "Criando…".
```

### 5.2 Grupo criado (convite + link admin) — pós-RF01/RF02
```
┌──────────────────────────┐
│ ✓ Grupo criado!           │  h1
│                           │
│ Convide os amigos         │  Card
│ [ link do convite   ]     │  CopyField
│ [ Copiar link ]           │
│ [ Compartilhar no WhatsApp]│  primário
│                           │
│ ⚠ Seu link de organizador │  Card warning
│ Guarde este link. Só você │
│ deve ter. NÃO compartilhe.│
│ [ link admin        ]     │
│ [ Copiar link admin ]     │
│                           │
│ [ Abrir painel ]          │  secundário
└──────────────────────────┘
```

### 5.3 Convite — `/g/[inviteToken]` (RF03, HU02)
```
┌──────────────────────────┐
│ 🎁 Você foi convidado!    │  h1
│ Grupo: Família 2026       │
│ Encontro em 24/12 · até R$50 │
│ 7 pessoas já entraram     │
│                           │
│ Seu nome *                │
│ [ Maria                ]  │
│ [   Entrar no grupo   ]   │  primário
│                           │
│ Já entrou antes?          │
│ [ Continuar como Maria ]  │  secundário (se há cookie)
└──────────────────────────┘
Estados: grupo já sorteado → Card "Este grupo já foi sorteado e está fechado";
grupo cheio (100) → Card "Este grupo está cheio"; link inválido → erro genérico.
```

### 5.4 Link pessoal — logo após entrar (RF04)
```
┌──────────────────────────┐
│ ✓ Pronto, Maria!          │  h1
│ Este é o seu link pessoal.│
│ Salve para voltar depois. │
│ [ link pessoal      ]     │
│ [ Copiar link ]           │
│ [ Salvar no WhatsApp ]    │  envia para si mesmo
│ ⚠ Quem tiver este link vê │  Card warning
│   o seu resultado.        │
│ [ Ir para minha área ]    │  primário
└──────────────────────────┘
```

### 5.5 Área do participante — `/p/[accessToken]` (RF04, RF05, HU05)
```
┌──────────────────────────┐
│ Olá, Maria 👋             │  h1
│ Grupo Família 2026        │
│ Encontro em 24/12 · até R$50 │
├──────────────────────────┤
│ Antes do sorteio          │  Card
│ Aguardando o organizador. │
│ 7 pessoas no grupo.       │
├──────────────────────────┤
│ Minha lista de desejos    │  Card (esqueleto aqui;
│ (vazio) "Adicione ideias."│   conteúdo no LST)
│ [ + Adicionar presente ]  │
├──────────────────────────┤
│ Depois do sorteio:        │  RevealCard
│ ┌──────────────────────┐  │
│ │ Seu amigo secreto    │  │
│ │ [ Toque para revelar ]│  │  nome escondido até tocar
│ └──────────────────────┘  │
│ [anúncio, lazy, ao final] │
└──────────────────────────┘
```

### 5.6 Painel admin — `/admin/[adminToken]` (RF06, RF07, HU04)
```
┌──────────────────────────┐
│ Painel do organizador     │  h1
│ Família 2026 · R$50 · 24/12│
│ 7 pessoas entraram        │
├──────────────────────────┤
│ Convite                   │  Card
│ [ Copiar ] [ WhatsApp ]   │
├──────────────────────────┤
│ Participantes             │  Card, lista
│ Maria            [Remover]│  alvo ≥ 44 px
│ João             [Remover]│  confirmação ao remover
│ …                         │
│ Vazio: "Ninguém entrou."  │
├──────────────────────────┤
│ Sorteio                   │  Card
│ Mínimo 3 pessoas.         │
│ [ Realizar sorteio ]      │  desabilitado < 3 (com motivo)
│ Após sortear: "Sorteio    │
│ realizado ✓" — o painel   │
│ nunca mostra os pares.    │
└──────────────────────────┘
Remover só com grupo aberto. Token inválido → erro genérico.
```
Em 1280 px o painel usa `max-w-3xl`, com Convite e Sorteio lado a lado (grade de 2 colunas ≥ 768 px).

## 6. Critérios de aceite do UX-01 e como verificar
| Critério | Verificação |
| --- | --- |
| Contraste AA verificado | tabela §2.2 (calculada); teste automatizado dos tokens + axe nas telas |
| Alvos de toque ≥ 44 px | `min-h-12` (48 px) em Button/Input; checagem por script de medição no Playwright |
| Fonte ≥ 16 px | nenhum `text-xs`; checagem por script (fontSize computado ≥ 16) |
| Foco/erro/desabilitado | página interna `/dev/ui` (somente dev) listando todos os estados |
| Prints 360 px e 1280 px | geradas da página `/dev/ui` e anexadas ao relatório |

## 7. Pendências / decisões
- Implementação em `app/_components/` depende do **SETUP-01** (repositório Next.js ainda não existe).
- `/dev/ui` precisa ficar fora do build de produção (decidir com DevOps no SETUP-03).
