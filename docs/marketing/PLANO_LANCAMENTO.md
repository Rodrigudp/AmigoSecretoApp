# Plano de lançamento e primeiro Natal

Responsável: Marketing · revisão: Orquestrador · versão 18/11/2026. Planejamento sujeito à aprovação do PO; nada aqui autoriza publicação, compra ou criação de conta.

## Público, proposta e canais

Prioridade: pessoas que organizam trocas para famílias, amigos e equipes; participantes podem vir a organizar outros grupos. Papelzinho permite criar um grupo, compartilhar o convite e entrar só com o nome, sem cadastro ou senha. Tom: acolhedor, claro e curto; seguir DSN-01 quando aprovado. Não prometer recursos ainda não entregues. Link de organizador e link pessoal são privados; só o convite vai para o grupo.

WhatsApp e indicações são prioridade: cada convite chega às pessoas que já decidiram participar. Instagram e TikTok/Reels demonstram os passos; status alcança contatos próximos. Comunidades e grupos externos dependem das regras locais e de autorização de quem administra. Busca orgânica é investimento de prazo incerto, não previsão para sustentar a meta deste Natal. Criativos e textos ficam no MKT-04, sujeitos à revisão do Designer e publicação pelo PO.

**Portão de segurança:** o ambiente previsto em IP:8090 com HTTP conflita com RNF03, que exige HTTPS. Não divulgar links reais ou dados de participantes enquanto Orquestrador, DevOps e Segurança não resolverem a divergência e aprovarem o ambiente. O domínio antigo da Vercel não é a URL principal. Não anunciar uma URL final até aprovação.

## Metas e medição

Meta do produto: 10.000 participantes únicos até 25/12 e média ≥ 8 por grupo. Os marcos abaixo são metas operacionais acumuladas, não previsão; foram distribuídos para acompanhamento semanal. `participant_joined` conta entradas, **não pessoas únicas deduplicadas entre grupos**; usá-lo como proxy, sem afirmar que a meta de pessoas únicas foi comprovada. Para média, dividir entradas por grupos criados no mesmo período/coorte, distinguindo grupos ativos dos recém-criados. Confirmar disponibilidade do RF14/MON-03 antes de depender do painel; se indisponível, registrar “sem dado”, não inventar números.

| Até | Entradas acumuladas (proxy) | Grupos acumulados de referência | Revisão |
|---|---:|---:|---|
| 28/11 | 100 | 13 | Teste e início condicionado à liberação |
| 05/12 | 1.500 | 188 | Mensagens e conclusão dos grupos |
| 12/12 | 4.000 | 500 | Reforçar canais que geram grupos |
| 19/12 | 7.500 | 938 | Acompanhar sorteios e revelações |
| 25/12 | 10.000 | 1.250 | Fechamento e aprendizados |

Grupos são referência aritmética de oito entradas por grupo, não meta independente de usuários únicos. No RF14: grupos criados, entradas, média por grupo e cliques de afiliado; `draw_performed` e `result_revealed` só se disponíveis no painel aprovado. Convites enviados não têm denominador definido: conversão de convite fica indisponível. A meta de 10% de organizadores que foram participantes não é mensurável no MVP sem identificação e decisão própria; não cruzar nomes nem coletar dados extras. Fontes internas: `docs/features/monetizacao.md` e `docs/requisitos/REQUISITOS.md`.

Revisão semanal: comparar o acumulado com o marco, conferir incidentes e disponibilidade das métricas, selecionar uma mudança de mensagem/canal para a próxima semana e registrar responsável e resultado. Números por canal não são atribuíveis ao RF14 atual; não inferir causalidade. Caso a média fique abaixo de 8, testar um texto que incentive completar o grupo antes do sorteio, após aprovação do PO.

## Calendário diário

Tudo é preparação ou proposta para o PO publicar após aprovação e liberação de segurança. Teste real depende de REL-01.

| Data | Ação proposta |
|---|---|
| 20/11 | Consolidar plano, pendências e aprovação de mensagens. |
| 21/11 | Revisar SEO e texto com Designer. |
| 22/11 | Roteirizar demonstração de criar grupo. |
| 23/11 | Roteirizar entrada pelo convite. |
| 24/11 | Preparar kit de teste real REL-01. |
| 25/11 | Conferir funcionalidades entregues e privacidade dos links. |
| 26/11 | Executar preparação para teste real, sujeito à liberação. |
| 27/11 | Revisar achados, funcionamento e prontidão de divulgação. |
| 28/11 | Lançamento condicionado à aprovação; PO compartilha apresentação. |
| 29/11 | Propor status mostrando o convite. |
| 30/11 | Propor post para família: criar grupo. |
| 01/12 | Propor roteiro curto: entrar só com nome. |
| 02/12 | Preparar texto para comunidades com permissão. |
| 03/12 | Propor demonstração de link pessoal e como guardá-lo. |
| 04/12 | Propor post para equipes e grupos de amigos. |
| 05/12 | Revisar primeiro marco e ajustar mensagem. |
| 06/12 | Propor lembrete para organizadores convidarem o grupo. |
| 07/12 | Propor vídeo de como conferir participantes. |
| 08/12 | Propor resposta às dúvidas observadas no teste. |
| 09/12 | Propor post sobre valor e data da troca. |
| 10/12 | Propor demonstração do sorteio, se entregue. |
| 11/12 | Propor status: guarde seu link pessoal. |
| 12/12 | Revisar segundo marco e disponibilidade do painel. |
| 13/12 | Propor post para grupos que ainda estão organizando. |
| 14/12 | Propor lembrete de confirmar participantes antes do sorteio. |
| 15/12 | Propor vídeo curto sobre revelar resultado, se entregue. |
| 16/12 | Propor mensagem para quem organiza outra troca. |
| 17/12 | Revisar dúvidas de uso e corrigir materiais preparados. |
| 18/12 | Propor status sobre guardar o link pessoal. |
| 19/12 | Revisar terceiro marco e incidentes. |
| 20/12 | Propor post de reta final para grupos existentes. |
| 21/12 | Propor explicação de como voltar à área pessoal. |
| 22/12 | Propor lembrete sobre data e valor combinados. |
| 23/12 | Propor mensagem acolhedora para a troca de presentes. |
| 24/12 | Propor mensagem de boas festas. |
| 25/12 | Fechar métricas disponíveis e registrar limitações. |

## Recomendação de domínio — PEN-09

Recomendo escolher um nome curto e verificá-lo antes da compra; disponibilidade, conflito de marca e preço específico **não foram verificados**. Opções: `papelzinho.app`, `meupapelzinho.app` e `papelzinhoamigosecreto.app`. Preço indicativo padrão .app da [Zinn Digital](https://zinndigital.com/pt-BR/dom%C3%ADnios/app): R$ 116,99 no primeiro ano e R$ 101,99/ano para renovar; nomes premium, taxas e condições podem alterar o valor. Consulta: 18/11/2026. Comparar também .com.br antes da decisão; não foi obtida cotação verificável específica. Todos os nomes são apenas sugestões, não disponibilidade garantida.

O .app exige HTTPS e certificado antes de funcionar nos navegadores ([Google Registry](https://www.registry.google/domains/app/), consulta 18/11/2026). Prazo de registro .app e propagação dependem do registrador, pagamento, configuração e caches: **não verificados**; reservar 1–2 dias úteis como margem de planejamento, sem garantia. Referência apenas para eventual .br: registro com DNS do Registro.br pode ser efetivado em até 5 minutos sem pendências e a zona é publicada a cada 5 minutos ([Registro.br](https://registro.br/tecnologia/caracteristicas-tecnicas/), consulta 18/11/2026); caches ainda podem demorar. Isso não é prazo do .app.

**Prazo recomendado: decidir e colocar domínio com HTTPS e páginas públicas no ar até 20/11**, para dar a maior janela possível antes do lançamento e do pico até 15/12. É uma decisão de planejamento, não prazo garantido: o Google informa que rastreamento pode levar dias a semanas e não garante indexação ([Google](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), consulta 18/11/2026). Mesmo comprando hoje, SEO pode não ajudar neste Natal. IP:porta dificulta uma presença de marca estável e a avaliação de AdSense/afiliado; elegibilidade não está verificada e depende das regras de cada programa.

## Pendências para o PO, via Orquestrador

- PEN-09: aprovar ou recusar domínio, verificar titularidade/disponibilidade e custo final; registro e conta são ações do PO.
- PEN-03 e PEN-04: decisão sobre contas AdSense e afiliado Mercado Livre; confirmar requisitos atuais com o dono da monetização antes de qualquer promessa.
- Perfis, ferramentas pagas, mídia paga e custos: não previstos neste plano; se necessários, apresentar orçamento e contas ao PO antes de criar ou gastar.
- Resolver HTTPS/RNF03 e validar o endereço final com DevOps e Segurança. Sem aprovação, não divulgar o ambiente com dados reais.
