# Manutenção de software

Baseado na **ISO/IEC/IEEE 14764** (tipos de manutenção) e em práticas de SRE leves.
Dono do processo: **agente DevOps & Manutenção**. Todo pedido de manutenção vira item no `BOARD.md`.

## 1. Tipos de manutenção
| Tipo | O que é | Exemplo neste projeto | Prioridade padrão |
| --- | --- | --- | --- |
| **Corretiva** | Corrige defeito encontrado | Sorteio permite alguém tirar a si mesmo | Crítica / Alta |
| **Adaptativa** | Ajusta a mudanças do ambiente | Nova versão do Next.js, mudança na API de afiliados, navegador do WhatsApp | Média |
| **Perfectiva** | Melhora desempenho, UX ou adiciona capacidade | Reduzir LCP, novo modo Amigo Chocolate | Média / Baixa |
| **Preventiva** | Reduz risco futuro | Atualizar dependências, refatorar, aumentar testes, rodar `npm audit` | Baixa (agendada) |

## 2. Severidade e tempo de resposta (durante a temporada 28/11–25/12)
| Severidade | Critério | Resposta | Correção |
| --- | --- | --- | --- |
| S1 — Crítica | Sorteio errado, vazamento de resultado, site fora do ar | Imediata | Hotfix em até 4 h |
| S2 — Alta | Fluxo principal quebrado para parte dos usuários | Até 4 h | Até 24 h |
| S3 — Média | Erro com contorno simples | Até 24 h | Próxima iteração |
| S4 — Baixa | Cosmético | Backlog | Quando houver folga |

## 3. Fluxo de correção
1. **Registro:** item `BUG-xxx` no `BOARD.md` com passos para reproduzir, ambiente, severidade.
2. **Triagem:** Orquestrador + DevOps classificam tipo e severidade e atribuem o agente da feature afetada.
3. **Reprodução por teste:** o QA escreve primeiro um teste que falha (regressão).
4. **Correção** em branch `fix/BUG-xxx-slug`.
5. **Revisão + CI verde.**
6. **Deploy:** S1/S2 via branch `hotfix/` direto para produção com aprovação do Orquestrador; demais no fluxo normal.
7. **Pós-incidente (S1/S2):** análise sem culpados em `docs/processo/incidentes/AAAA-MM-DD-slug.md`
   (o que aconteceu, impacto, causa raiz, ações).

## 4. Manutenção preventiva programada
- Semanal: `npm audit`, atualização de patches de dependências, revisão de logs de erro.
- Mensal (fora da temporada): atualização de minors, revisão de índices do banco, limpeza de grupos expirados (RN08).
- Antes de cada temporada (out/nov): atualização de majors, teste completo no WhatsApp in-app browser.

## 5. Métricas de manutenibilidade acompanhadas
- Cobertura de testes do domínio ≥ 90%; total ≥ 70%.
- MTTR (tempo médio de recuperação) de S1 < 4 h.
- Taxa de falha em mudanças (deploys que geram bug) < 15%.
- Complexidade ciclomática por função ≤ 10 (ESLint `complexity`).
- Dívida técnica registrada em `docs/processo/DIVIDA_TECNICA.md` com custo estimado.

## 6. Versionamento de correções
- Corretiva → incrementa **patch** (`1.0.1`).
- Adaptativa/perfectiva com nova funcionalidade → **minor** (`1.1.0`).
- Toda entrega atualiza o `CHANGELOG.md`.
