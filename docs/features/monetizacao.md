# Feature Monetização — especificação inicial

Dono: agente Feature Monetização (24). Revisores: Segurança & LGPD (eventos, cookies) e Front-end (impacto no LCP).
Requisitos: RNF02, RNF03, RNF05, RN03, RF13, RF14. Documento de MON-01 (páginas): `docs/features/monetizacao-paginas.md`.
Revisão da Segurança: reprovada em 17/11 (ajustes aplicados nesta versão, falta nova revisão).

## 1. Anúncios (Google AdSense)

- Slots somente nas páginas de **resultado** e de **lista de desejos**. Nunca no fluxo de criar grupo e entrar.
- Carregamento lazy, depois do conteúdo (RNF02). Código de MON-02.
- Chave de ativação por variável de ambiente (ex.: `ADS_ENABLED`). Desligada = nenhum script do AdSense é carregado.
- Consentimento de cookies antes de anúncios personalizados (SEC-04).

### Trava de segurança antes do MON-02 (crítica)

**Não carregar o AdSense em uma URL que contém o `accessToken`** (ex.: `/p/[accessToken]`).
Script de terceiro lê `window.location.href`, o que vazaria o token secreto (RN03, RNF03, ADR-002).

Antes de MON-02, a área do participante precisa:
1. Trocar o token da URL por um cookie `HttpOnly; Secure; SameSite=Lax` (PAR-03).
2. Redirecionar para uma rota sem token.
3. Só então renderizar os slots de anúncio.

Sem isso concluído, MON-02 não pode ser entregue.

## 2. Plano de eventos (tabela `events`)

Regra: **sem dado pessoal e sem identificador de participante no MVP**. Cada linha tem só `id`, `group_id`, `type` e `created_at`,
conforme `ARQUITETURA.md` §4. Nenhum evento leva nome, e-mail, token ou item da lista.

| `type` | Quando dispara | `group_id` | Métrica que alimenta |
| --- | --- | --- | --- |
| `group_created` | Organizador cria o grupo | sim | Grupos criados |
| `participant_joined` | Alguém entra pelo link de convite | sim | Participantes; participantes por grupo; convidados que entram |
| `draw_performed` | Sorteio realizado com sucesso | sim | Sorteios realizados |
| `result_revealed` | Participante toca em "revelar" | sim | Resultado visto |
| `affiliate_click` | Clique em link de afiliado (RF10) | sim | Cliques em afiliado |

Observações:
- Eventos são gravados no servidor, nunca pelo navegador direto.
- Eventos de anúncio (impressão, clique) ficam com o painel do AdSense; não duplicamos.
- `affiliate_click` leva só `group_id`, `type` e `created_at` (decisão do Orquestrador, ARQUITETURA §4). Sem `store`:
  o painel do MON-03 mostra o total de cliques. Apenas a Amazon gera comissão (decisão do PO em 18/11; Mercado Livre removido do programa de afiliados do Papelzinho).
- **Denominador de convites** (meta "convidados que entram", 70%): a fonte de convites ainda não está definida (CONTRATOS.md, seção final).
  Até lá, esse percentual fica indisponível no painel.

### Decisões da revisão de segurança

1. **`participant_id` fica fora do MVP.** É dado pseudonimizado enquanto `participants` existir. A média de cliques por
   participante já sai com `group_id` + `type`: `affiliate_click` ÷ `participant_joined` por grupo, no agregado.
2. **Métrica "organizadores que antes foram participantes" fica fora do MVP.** Não cruzamos organizadores com participantes
   por nome. Se um dia for medida, precisa de ADR próprio.
3. **Retenção (RN08), decidida pelo Orquestrador:** `events.group_id ON DELETE SET NULL`. No expurgo de 60 dias o grupo some,
   mas os contadores anônimos (grupo + tipo + data) continuam. O texto da política de privacidade já cita isso.
   O Banco aplica a troca no DB-01 (a migration atual, linha 77, ainda está com `CASCADE`).

## 3. Painel do dono — RF14

- Rota fora de links públicos, protegida por segredo de ambiente (ex.: `OWNER_PANEL_SECRET`).
- Mostra: grupos criados, participantes, participantes por grupo, convidados que entram, cliques em afiliado
  (agregado por grupo e por tipo de evento).
- Somente leitura, agregado. Nunca mostra nome, lista de desejos ou pares de sorteio.

## 4. Contagem regressiva — RF13

- Mostra os dias até `exchange_date` do grupo, na página do participante.
- Sem dado pessoal, sem evento próprio (é só leitura do grupo).

## 5. Metas de sucesso (da análise)

| Métrica | Meta | Como medir no MVP |
| --- | --- | --- |
| Participantes únicos | 10 mil até 25/12/2026 | `participant_joined` |
| Participantes por grupo | ≥ 8 | `participant_joined` por `group_id` |
| Convidados que entram | 70% | `participant_joined` ÷ convites |
| Organizadores que antes foram participantes | 10% | **fora do MVP** (ver §2) |
| Cliques em afiliado por participante | ≥ 1 | `affiliate_click` ÷ `participant_joined`, por grupo |

## 6. Critérios de aceite (checklist)

- [ ] Eventos da tabela acima, sem dado pessoal e sem `participant_id`.
- [ ] Trava do `accessToken` cumprida antes de qualquer script de anúncio (seção 1).
- [ ] Painel do dono protegido e fora de links públicos.
- [ ] Anúncio desligável por variável de ambiente.
- [ ] Nova revisão da Segurança concluída (CSP, cookies, LGPD).
- [ ] Revisão do Front-end concluída (LCP).
