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
