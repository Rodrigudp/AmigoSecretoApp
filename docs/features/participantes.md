# Feature Participantes — especificação

Dono: agente Feature Participantes (21). Revisores: Orquestrador, Segurança & LGPD (tokens/cookie), Front-end (telas).
Requisitos: **RF03, RF04, RN04, RN07, RN09, HU02, RNF01, RNF03, RNF05, RNF10, ADR-002**.
Casos de uso: `join-group` (PAR-02) e `get-participant-view` (PAR-04); telas com o Front-end (PAR-03).

## 1. Fluxo principal — entrar no grupo (RF03, HU02)

Página `/g/[inviteToken]` (Front-end), case `join-group` (Back-end). Objetivo: entrar em **menos de 30 s** (RNF01) —
um campo e um botão.

```
Abrir link de convite
  → grupo existe e status = open
      → tela: nome do grupo, campo "Como você se chama?", botão "Entrar"
  → status = drawn (RN04)
      → mensagem: "O sorteio já foi realizado. As entradas estão encerradas." Sem formulário.
  → grupo cheio (RN09)
      → mensagem: "Este grupo já está completo (100 pessoas)." Sem formulário.
  → token inválido/expirado (ADR-002: sem revelar existência)
      → mensagem: "Este link é inválido ou não está mais disponível." Erro amigável genérico,
        sem indicar se o grupo existe.
```

Passos de quem entra (texto simples, público inclui pessoas idosas — persona Seu João):

1. Nome: 1–40 caracteres, sem HTML, trim; validação com Zod na borda (ARQ §2).
2. Botão "Entrar" (grande, ≥ 48 px de altura).
3. Em caso de nome já usado, ver §3 — o nome entra com sufixo automático, **sem atrito** (a pessoa não escolhe nada).
4. Sucesso → tela do link pessoal (§2).

Regras do `join-group`:

| Regra | Comportamento |
| --- | --- |
| Nome duplicado (RN07) | Sufixo automático "Ana", "Ana 2", "Ana 3", … Comparação case-insensitive; sem normalizar acentos no MVP. Participantes removidos não contam para o sufixo. Nome digitado: até 40 caracteres; nome final com sufixo: ≤ 60 (limite de `display_name` no banco). O sufixo é automático, sem atrito (a pessoa não escolhe nada) |
| Grupo cheio (RN09) | Recusa com mensagem clara; trigger no banco barra o 101º (DB-02) |
| Grupo sorteado (RN04) | Recusa com mensagem clara: "O sorteio já foi realizado. As entradas estão encerradas." (SRT-01); incluir pessoa depois exige refazer o sorteio |
| Nome vazio/41+ caracteres | Mensagem de erro no campo, em português simples |
| Grupo inexistente | Mesma mensagem de token inválido (não revela existência) |

O organizador entra no próprio grupo pelo convite, como qualquer participante (alinha com SRT-01 e GRP-01):
usa o link pessoal gerado para ver o próprio resultado; não vê os pares dos outros (RN03).

## 2. Tela do link pessoal (RF04)

Após entrar, o servidor gera um token pessoal de **32 bytes base64url** (≥ 128 bits, RNF03) via utilitário de tokens
da Segurança (SEC-01). Regras de ADR-002:

- O valor em claro aparece **só uma vez**, no link `https://<domínio>/p/<token>`; no banco vai só o hash SHA-256
  (`participants.access_token_hash`).
- O caso `join-group` retorna o link; o Front-end mostra:
  - **Botão "Copiar"** (copiar o link pessoal).
  - **Botão "Salvar no WhatsApp"** (`wa.me` — abre o WhatsApp para a pessoa mandar o link para si mesma).
  - Texto curto: "Guarde este link. É por ele que você verá quem tirou e a sua lista. Não compartilhe."
- Nenhum outro campo de formulário nesta tela. A área do participante é esqueleto (PAR-04) que abrigará lista e
  resultado (LST, SRT).

Evento: `participant_joined` gravado no servidor (tabela `events`, sem dado pessoal).

## 3. Voltar sem senha — "continuar como Fulano"

- Quando a mesma pessoa abre `/g/[inviteToken]` de novo no mesmo aparelho, o servidor lê o cookie do grupo
  (`ptk_<groupId>`) e, se ele corresponde a um participante ativo do grupo, oferece **"Continuar como Fulano"**
  (nome atual) com um botão para ir direto à área do participante, e um link discreto "Entrar com outro nome".
- Cookie: **um por grupo**, nome `ptk_<groupId>` — com um nome único (`participant`), quem está em dois grupos no
  mesmo celular (família + trabalho) perde o "Continuar como Fulano" do primeiro. Valor = token pessoal.
  Flags: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. Expiração = `groups.expires_at` (troca + 60 dias, RN08),
  em vez de 60 dias fixos. A Segurança valida isso no PAR-03.
- **Onde gravar:** uma page do App Router não grava cookie em `/p/[accessToken]`; o (re)set do cookie é feito por
  route handler, middleware ou server action (nunca por código de cliente).
- Abrir o link pessoal direto (`/p/[token]`) também funciona e (re)define o cookie do grupo.
- Token inválido em `/p/[accessToken]` → mensagem: "Este link é inválido ou não está mais disponível." com
  acréscimo "Peça um novo link ao organizador.", sem revelar existência do grupo.
- Se o participante foi removido pelo organizador, o link dele para de funcionar (mesma mensagem genérica).
- Sem aparelho guardado → quem perder o link pede reenvio ao organizador (ADR-002, consequência aceita).

## 4. `get-participant-view` (RF04, esqueleto PAR-04)

Caso de uso que alimenta a área do participante; recebe o token pessoal, valida por hash (comparação em tempo
constante) e retorna: nome, status do grupo e, quando existir, os blocos de lista e resultado (interfaces definidas
em It-3). No MVP da It-2: nome + "aguardando sorteio"/"sorteado" e o lugar da lista de desejos.

## 5. Segurança e privacidade (ADR-002, RNF03, RNF05)

- Token pessoal só como hash no banco; log nunca contém token (SEC-01).
- Páginas com token: `noindex` + `Referrer-Policy: no-referrer` (GRP-04 aplica os headers; confirmar aqui).
- Rate limit no `join-group` por IP (SEC-03).
- Dado pessoal coletado: apenas o nome (RNF05).

## 6. Critérios de aceite (rastreabilidade)

| Critério | Req. |
| --- | --- |
| Entrar = 1 campo + 1 botão, < 30 s | RF03, RNF01 |
| Link pessoal mostrado 1×, com Copiar e Salvar no WhatsApp e explicação curta | RF04 |
| Reabrir convite → "Continuar como Fulano"; cookie por grupo `ptk_<groupId>`, HttpOnly/Secure/SameSite=Lax, expira em `groups.expires_at` | RF04 |
| Grupo sorteado ou cheio → mensagem clara, sem formulário | RN04, RN09 |
| Duplicado → sufixo automático sem atrito | RN07 |
| Token inválido → erro amigável, sem revelar grupo | ADR-002 |
| Textos simples e legíveis para idosos (≥ 16 px, botão grande) | RNF10 |

## 7. Dependências e riscos

- Depende de DB-02 (constraints RN09), SEC-01 (tokens) — It-1; implementação em It-2 (PAR-02/03/04).
- Risco: navegador interno do WhatsApp (RNF08) pode bloquear cookies → o fluxo não pode **exigir** cookie;
  "continuar como Fulano" é melhoria, não dependência. O link pessoal continua sendo o caminho garantido.
- Pendência anterior resolvida na revisão: cookie por grupo `ptk_<groupId>` e expiração = `groups.expires_at`.
