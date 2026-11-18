# Contrato da RPC `run_draw` (SRT-02)

Chamada só pelo servidor, com a service role (`supabase.rpc('run_draw', {...})`). Implementa `DrawRepository.commitFirstDraw` (CONTRATOS.md) e já aceita refazer o sorteio (SRT-05) pela versão esperada.

**Decisão:** os pares vêm do domínio (`drawPairs`, ADR-003, `crypto.getRandomValues`) como argumento. A RPC não sorteia: valida, trava e grava. Assim o RNG fica em um lugar só e a RPC é determinística e testável.

## Assinatura

```sql
public.run_draw(
  p_group_id         uuid,
  p_admin_token_hash text,       -- SHA-256 hex do token admin
  p_expected_version integer,    -- groups.draw_version que a tela viu (0 = primeiro sorteio)
  p_givers           uuid[],     -- pares: par i = (p_givers[i], p_receivers[i])
  p_receivers        uuid[]
) returns table (draw_version integer, status text, drawn_at timestamptz, was_replay boolean)
```

Retorno: uma linha com a versão vigente, `status = 'drawn'`, a data do sorteio (`draws.created_at`) e `was_replay`. **Nunca devolve pares.**

## Comportamento (uma transação)

1. `p_givers` e `p_receivers` não nulos e com o mesmo tamanho (senão `INVALID_INPUT`).
2. Trava a linha do grupo (`for update`) com `id = p_group_id` e `admin_token_hash = p_admin_token_hash`. Não achou ou `expires_at <= now()`: `INVALID_LINK`.
3. Versão: `groups.draw_version = p_expected_version + 1` é repetição da mesma operação (clique duplo ou resposta perdida): devolve o sorteio vigente com `was_replay = true`, sem gravar nada. `draw_version <> p_expected_version`: `DRAW_NOT_READY` (confirmação desatualizada).
4. Menos de 3 participantes ativos (`removed_at is null`): `NOT_ENOUGH_PARTICIPANTS`.
5. Valida os pares: sem repetidos, ninguém tira a si mesmo, o conjunto de doadores é igual ao de recebedores (`INVALID_INPUT`) e igual ao conjunto de participantes ativos lidos agora (`DRAW_MEMBERS_CHANGED`).
6. Preenche `invalidated_at` do sorteio vigente (se houver), grava `draws` (versão = `draw_version + 1`) e todos os `pairs`, atualiza `groups.status = 'drawn'` e `groups.draw_version`, e grava o evento `draw_performed` (sem pares, sem nomes).

Qualquer erro reverte tudo e mantém estado e versão anteriores.

## Códigos de erro (`errcode P0001`, o texto da mensagem é o código)

| Mensagem | Quando | Código de domínio |
| --- | --- | --- |
| `INVALID_LINK` | grupo inexistente, hash admin diferente ou grupo expirado | `INVALID_LINK` |
| `NOT_ENOUGH_PARTICIPANTS` | menos de 3 ativos | `NOT_ENOUGH_PARTICIPANTS` |
| `DRAW_MEMBERS_CHANGED` | doadores diferentes dos ativos (alguém entrou ou saiu entre a leitura e o commit): reler, recalcular e tentar de novo | `DRAW_MEMBERS_CHANGED` |
| `DRAW_NOT_READY` | `p_expected_version` desatualizado | `DRAW_NOT_READY` |
| `INVALID_INPUT` | arrays malformados, pares repetidos, auto-par, doadores ≠ recebedores | `INVALID_INPUT` |
| `GROUP_CLOSED` | emitido pelo banco ao tentar remover participante de grupo já sorteado (novo gatilho abaixo) | `GROUP_CLOSED` |

Outro erro de banco (falha de rede, deadlock) chega sem mensagem de negócio: tratar como falha técnica, sem logar pares.

## Concorrência

- Duas chamadas iguais: a segunda espera o `for update` e devolve `was_replay = true`. Uma só versão, um só `draw_performed`.
- Entrada concorrente: `join_group` trava o mesmo grupo; quem perde vê o grupo já `drawn` (`GROUP_CLOSED`) ou muda o conjunto (`DRAW_MEMBERS_CHANGED`).
- Remoção concorrente: novo gatilho em `participants` recusa `removed_at` em grupo não aberto (`GROUP_CLOSED`), travando o grupo em `for share`. Fecha a janela apontada na revisão do BE-03.

## Produção

Sem o PEN-08, o Orquestrador aplica a migration à mão no SQL Editor e registra em `supabase_migrations.schema_migrations`.
