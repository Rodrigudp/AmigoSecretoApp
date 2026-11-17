# Design system mínimo — UX-01

Dono: Front-end · Revisor: Orquestrador · Requisitos: RNF01 (mobile first), RNF02 (desempenho), RNF10 (WCAG AA, legível para idosos).

## 1. Princípios
1. **Mobile first**: projetar em 360 px; 1280 px só centraliza e limita a largura (coluna única, `max-w-md` em formulários, `max-w-3xl` no painel).
2. **Legível para idosos**: texto base 18 px, nunca menor que 16 px; um objetivo por tela; um botão primário por tela.
3. **Sem bibliotecas de UI**: só Tailwind + componentes próprios (bundle < 100 KB gzip por rota, RNF02).
4. **Server Components por padrão**; `"use client"` apenas em componentes com interação (copiar link, revelar).
5. **Cor nunca é o único sinal**: erro/sucesso sempre com ícone + texto.
6. Texto em português claro, sem jargão ("link pessoal", não "token").

## 2. Tokens

### 2.1 Cores (contraste calculado pela fórmula WCAG 2.x)
| Token | Hex | Uso |
| --- | --- | --- |
| `bg` | `#FFF7ED` | fundo da página |
| `surface` | `#FFFFFF` | cartões, inputs |
| `text` | `#1F2937` | texto principal |
| `text-muted` | `#4B5563` | texto de apoio, rótulos secundários |
| `primary` | `#B91C1C` | botão primário, links |
| `primary-hover` | `#991B1B` | hover/pressionado |
| `primary-soft` | `#FEE2E2` | botão secundário (fundo) |
| `primary-soft-text` | `#7F1D1D` | texto do botão secundário |
| `border` | `#6B7280` | borda de input (componente de UI) |
| `focus` | `#1D4ED8` | anel de foco |
| `danger-bg` / `danger` | `#FEF2F2` / `#B91C1C` | erro |
| `success-bg` / `success` | `#F0FDF4` / `#166534` | sucesso |
| `warning-bg` / `warning` | `#FEF3C7` / `#78350F` | avisos (ex.: "não compartilhe o link admin") |
| `disabled-bg` / `disabled-text` | `#E5E7EB` / `#4B5563` | desabilitado |

### 2.2 Contraste verificado
Mínimos: texto normal ≥ 4,5:1; texto grande (≥ 24 px ou ≥ 18,66 px negrito) ≥ 3:1; componentes de UI e foco ≥ 3:1.

| Par (frente sobre fundo) | Razão | Critério | OK |
| --- | --- | --- | --- |
| `text` sobre `surface` | 14,68 | 4,5 | ✓ |
| `text` sobre `bg` | 13,83 | 4,5 | ✓ |
| `text-muted` sobre `surface` | 7,56 | 4,5 | ✓ |
| `text-muted` sobre `bg` | 7,12 | 4,5 | ✓ |
| branco sobre `primary` | 6,47 | 4,5 | ✓ |
| branco sobre `primary-hover` | 8,31 | 4,5 | ✓ |
| `primary` (link) sobre `surface` | 6,47 | 4,5 | ✓ |
| `primary` (link) sobre `bg` | 6,09 | 4,5 | ✓ |
| `primary-soft-text` sobre `primary-soft` | 8,20 | 4,5 | ✓ |
| `danger` sobre `danger-bg` | 5,91 | 4,5 | ✓ |
| `success` sobre `success-bg` | 6,81 | 4,5 | ✓ |
| `warning` sobre `warning-bg` | 8,15 | 4,5 | ✓ |
| `disabled-text` sobre `disabled-bg` | 6,10 | 4,5 | ✓ |
| `border` sobre `surface` | 4,83 | 3 (UI) | ✓ |
| `border` sobre `bg` | 4,55 | 3 (UI) | ✓ |
| `focus` sobre `surface` | 6,70 | 3 (UI) | ✓ |
| `focus` sobre `bg` | 6,31 | 3 (UI) | ✓ |

Os valores serão reconferidos por script no teste de tokens quando os componentes forem implementados.

### 2.3 Tipografia
Fonte: pilha do sistema (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`) — zero download, ajuda o LCP.

| Token | Tamanho / entrelinha | Peso | Uso |
| --- | --- | --- | --- |
| `text-base` | 18 / 28 px | 400 | corpo, inputs |
| `text-sm` | 16 / 24 px | 400 | apoio, mensagens de erro (**mínimo permitido**) |
| `text-lg` | 20 / 28 px | 600 | rótulos, títulos de cartão |
| `text-xl` | 24 / 32 px | 700 | título de tela (h1) em 360 px |
| `text-2xl` | 30 / 36 px | 700 | h1 a partir de 640 px |

Proibido `text-xs` e tamanhos < 16 px. Sem texto em caixa-alta contínua.

### 2.4 Espaçamento, forma e movimento
- Escala de 4 px: 4, 8, 12, 16, 24, 32, 48. Margem lateral da página: 16 px (360 px). Espaço entre campos: 16 px; entre seções: 24–32 px.
- Raio: 12 px (controles), 16 px (cartões). Sombra de cartão: `0 1px 3px rgb(0 0 0 / .12)`.
- Alvo de toque mínimo **44 × 44 px** (botão e input: altura 48 px); espaço mínimo de 8 px entre alvos adjacentes.
- Foco visível: anel de 3 px `focus` + offset 2 px, em todo elemento interativo. Nunca `outline: none` sem substituto.
- Movimento: transições ≤ 150 ms; respeitar `prefers-reduced-motion` (sem animação).

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
| padrão | borda 2 px `border`, fundo `surface`, 18 px, altura 48 px | `autocomplete`/`inputmode` adequados |
| foco | borda `focus` + anel 3 px | — |
| erro | borda e ícone `danger`, mensagem 16 px abaixo ("⚠ Escreva o nome do grupo") | `aria-invalid="true"`, `aria-describedby` → mensagem, `role="alert"` ao aparecer |
| desabilitado | `disabled-bg`, texto `disabled-text` | `disabled` nativo |
| só leitura | fundo `surface`, borda tracejada (usado para links a copiar) | `readOnly`, seleciona tudo ao focar |

Hint: 16 px `text-muted` entre rótulo e campo. Contador opcional ("12/60").

### 3.3 Card
Props: `tone: "default" | "warning" | "success" | "danger"`, `as` (`section`/`article`), título opcional (`h2`/`h3`). Fundo `surface` (ou `*-bg` do tom), borda 1 px, raio 16 px, padding 16 px (360 px) / 24 px (≥ 640 px). Tons de aviso levam ícone + título em texto, nunca só cor. Card clicável: vira `<a>`/`<button>` com área inteira ≥ 44 px e os mesmos estados de foco/hover do Button.

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

## 5. Wireframes em texto (360 px; em 1280 px o mesmo conteúdo, centralizado)

### 5.1 Criar grupo — `/` (RF01, HU01)
```
┌──────────────────────────┐
│ 🎁 Amigo Secreto          │
├──────────────────────────┤
│ Faça seu amigo secreto    │  h1
│ em 2 minutos.             │
│ Sem cadastro e sem senha. │
│                           │
│ Nome do grupo *           │
│ [ Família 2026         ]  │  máx. 60
│ Valor máximo do presente *│
│ [ R$ 50,00             ]  │  inputmode=decimal
│ Data da troca *           │
│ [ 24/12/2026           ]  │  type=date
│ Local da troca            │
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
│ Troca em 24/12 · até R$50 │
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
│ Troca em 24/12 · até R$50 │
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
- Paleta vermelha/laranja (clima de festa) é proposta minha; sem identidade visual definida nos requisitos — o Orquestrador pode trocar os hex mantendo a tabela §2.2 (reexecutar a conferência).
- `/dev/ui` precisa ficar fora do build de produção (decidir com DevOps no SETUP-03).
