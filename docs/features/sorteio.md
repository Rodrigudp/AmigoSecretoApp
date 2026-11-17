# Sorteio e revelação do resultado

SRT-01 · RF08, RF09, RF11 · RN01–RN05 · HU04 e HU05

O organizador realiza o sorteio pelo painel admin. Cada participante revela quem tirou e consulta a lista de desejos dessa pessoa pelo próprio link. O fluxo de refazer o sorteio faz parte desta especificação. Sua entrega está prevista para o pós-MVP (SRT-05).

## Estados do grupo

~~~mermaid
stateDiagram-v2
    [*] --> open: Grupo criado
    open --> drawn: Primeiro sorteio confirmado
    drawn --> redrawn: Novo sorteio confirmado duas vezes
    redrawn --> redrawn: Novo sorteio confirmado duas vezes
~~~

| Estado do fluxo | Dados persistidos | Organizador | Participante |
| --- | --- | --- | --- |
| `open` | `groups.status = open`, sem sorteio vigente | Vê a contagem e pode sortear a partir de 3 participantes ativos | Pode entrar pelo convite. Na área pessoal, vê “O sorteio ainda não foi realizado.” |
| `drawn` | `groups.status = drawn`, versão vigente 1 | Vê “Sorteio realizado em <data>” | O convite está fechado. Na área pessoal, vê o cartão “Revelar”. |
| `redrawn` | `groups.status = drawn`, versão vigente maior que 1 | Vê a data da versão vigente | O convite continua fechado. Na área pessoal, vê o aviso de invalidação e pode revelar o resultado vigente. |

`redrawn` é um estado do fluxo derivado de `draw_version`. A arquitetura persiste `open` ou `drawn` em `groups.status`. Uma operação recusada ou revertida mantém o estado e a versão anteriores.

## Realizar o sorteio (RF08, RN01–RN04)

1. Em `/admin/[adminToken]`, o painel mostra “Sortear” para o grupo aberto e orienta o organizador quando faltam participantes. A contagem da tela é informativa. O servidor verifica o token admin, o estado do grupo e o mínimo de 3 participantes ativos antes de gravar.
2. No servidor, `drawPairs(ids, rng)` embaralha os IDs com Fisher–Yates e cria um ciclo único. Cada pessoa tira a próxima da lista embaralhada, e a última tira a primeira. Assim, cada ID dá e recebe uma vez e nenhum par tem a mesma pessoa nas duas pontas. O gerador de produção usa `crypto.getRandomValues` (ADR-003), e o domínio recebe o gerador por parâmetro.
3. A operação transacional `run_draw` protege a leitura do estado e dos participantes contra mudanças concorrentes. Ela grava a versão 1 em `draws`, grava todos os `pairs` e atualiza o estado e a versão do grupo na mesma transação. Se o grupo mudar entre a leitura e a gravação, a operação deve revalidar os dados antes de confirmar. Qualquer falha reverte a transação inteira.
4. Ao confirmar, o painel mostra “Sorteio realizado em <data>” usando a data gravada. Dois envios da mesma operação produzem uma única versão. A repetição recebe a confirmação da operação já concluída, inclusive se o primeiro envio tiver concluído sem a resposta chegar ao navegador. O retorno ao painel contém apenas o estado da operação e a data, sem nomes sorteados ou pares.

## Revelar o resultado (RF09, RN02–RN03)

1. Em `/p/[accessToken]`, o servidor identifica o participante ativo e o grupo pelo token pessoal. O cartão inicia fechado. A renderização inicial e as respostas de carregamento antecipado omitem o nome e a lista da pessoa sorteada.
2. Ao tocar em “Revelar”, a tela consulta `get-my-result`. O servidor revalida o acesso pessoal e busca apenas o par cujo doador é o titular do link e cujo sorteio é a versão vigente do seu grupo, com `invalidated_at` vazio. A consulta obtém a lista de desejos do destinatário desse par.
3. A resposta de revelação inclui o nome da pessoa sorteada e sua lista de desejos. Quando a lista estiver vazia, a tela mostra “Esta pessoa ainda não adicionou desejos.” As respostas pessoais não entram em cache compartilhado. Nenhum painel admin ou link de convite consulta ou recebe pares. Um organizador que também participa usa seu link pessoal para ver o próprio resultado.

## Refazer o sorteio (RF11, RN04–RN05)

1. O organizador abre “Refazer sorteio” no painel admin. A primeira confirmação explica a consequência (“Ao refazer o sorteio, todos os resultados anteriores serão invalidados.”). Uma segunda ação explícita (“Confirmar novo sorteio”) envia a operação. Cancelar em qualquer etapa preserva o sorteio vigente.
2. O servidor verifica o token admin, a versão que o organizador confirmou e o mínimo de 3 participantes ativos. Em uma transação, preenche `invalidated_at` na versão anterior, grava a versão seguinte com seus pares e atualiza `draw_version`. O bloqueio por grupo ou a checagem da versão impede que dois envios da mesma confirmação criem duas versões. Uma confirmação desatualizada para outra operação exige recarregar o painel e confirmar novamente.
3. A área pessoal exibe “O sorteio foi refeito. Seu resultado anterior foi invalidado.” para todos os participantes do grupo. Na próxima consulta, uma tela que ainda exiba a versão anterior descarta o resultado e fecha o cartão. “Revelar” sempre consulta a versão vigente e o servidor nunca devolve pares invalidados.
4. O convite permanece fechado nos estados `drawn` e `redrawn`. A inclusão após o primeiro sorteio só pode ocorrer junto com um novo sorteio. A forma de incluir essas pessoas antes da confirmação fica para definição no SRT-05. Até lá, a entrada pelo convite segue bloqueada após o primeiro sorteio.

## Mensagens e erros

| Situação | Mensagem na interface | Comportamento esperado |
| --- | --- | --- |
| Link admin ou pessoal inválido, trocado de tipo, expirado ou sem acesso | “Este link é inválido ou não está mais disponível.” | Resposta genérica, sem indicar se o grupo existe. |
| Menos de 3 participantes ativos | “São necessários pelo menos 3 participantes para sortear.” | O domínio retorna erro tipado. Nenhum sorteio é gravado ou invalidado. |
| Resultado ainda indisponível porque o grupo está aberto | “O sorteio ainda não foi realizado.” | Cartão sem ação de revelação. |
| Entrada pelo convite após o sorteio | “O sorteio já foi realizado. As entradas estão encerradas.” | Recusa a entrada e mantém a versão vigente. |
| Versão mudou após abrir a confirmação de refazer | “O sorteio mudou. Atualize a página e confirme novamente.” | Uma confirmação antiga não cria outra versão. |
| Falha ao gravar | “Não foi possível concluir o sorteio. Tente novamente.” | Reverte as alterações se a transação falhar. Se a resposta se perdeu, repetir a mesma operação recupera a confirmação já gravada. |
| Falha ao consultar o resultado ou inconsistência no par vigente | “Não foi possível carregar seu resultado. Tente novamente.” | Não exibe dados parciais. Registra falhas técnicas sem tokens ou pares. |

## Verificação de aceite

- **RN01 e RN02.** Com 0, 1 ou 2 participantes ativos, o sorteio é recusado. De 3 a 100, todos dão e recebem exatamente uma vez e ninguém tira a si mesmo.
- **RF08, HU04 e RN03.** Só o link admin inicia o sorteio. Duas solicitações da mesma operação produzem uma versão. A resposta admin e a resposta do convite ficam livres de pares.
- **RF09 e HU05.** A página inicial omite o resultado. A revelação de cada link pessoal traz somente o destinatário daquele participante e sua lista, inclusive no estado vazio.
- **RF11, RN04 e RN05.** Cancelar ou falhar ao refazer preserva a versão anterior. Confirmar invalida a anterior, exibe o aviso para todos e torna somente a nova versão elegível para consulta. Dois envios da mesma confirmação criam uma única versão. O convite continua fechado.

[Requisitos](../requisitos/REQUISITOS.md) · [Arquitetura](../arquitetura/ARQUITETURA.md) · [ADR-002](../arquitetura/adr/002-acesso-por-link.md) · [ADR-003](../arquitetura/adr/003-algoritmo-sorteio.md) · [Backlog](../board/BACKLOG.md)