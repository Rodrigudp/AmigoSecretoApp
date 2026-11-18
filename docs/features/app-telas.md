# APP-DSN-01 — Telas do Papelzinho para iOS e Android

Implementação em Expo conforme o [ADR-005](../arquitetura/adr/005-app-mobile.md). Os IDs abaixo apontam para o [catálogo de textos](textos.md). Os wireframes usam dados fictícios.

## Visual e navegação

- Uma coluna com 360 unidades lógicas de referência (360 px no desenho, pt no iOS e dp no Android). Cada moldura tem 36 colunas de 10 unidades e indica ordem e hierarquia. A tela rola na vertical.
- Use a marca existente e o [Estilo Notion](design-system.md). Fundo papel quente, cartões brancos com borda fina e pêssego no convite e antes de revelar. Azul na ação principal. Estados de sucesso, erro e espera têm texto além da cor.
- Título 24, corpo 18 e mínimo 16 em todos os textos do app. Use fonte do sistema com escala do aparelho. Alvos de pelo menos 48 × 48 pt/dp, inclusive voltar, menus e ícones. Margem lateral de 16. Permita quebra de linha e empilhe ações quando a fonte crescer.
- Use a pilha nativa, área segura, gesto ou botão de voltar, teclado numérico para valor, calendário para data, diálogos de confirmação e menu de compartilhar do sistema. Exiba a data em dia/mês/ano e mantenha a dica `dd/mm/yyyy` se houver edição digitada.
- Ao abrir tela ou diálogo, foque o título. Em ação irreversível, priorize Cancelar e restaure o foco ao fechar. VoiceOver e TalkBack anunciam carregamento, erro e conclusão. Inclua o nome da pessoa ou do presente nas ações por linha.

## Abertura e Meus grupos

```text
+----------------------------------+
| Papelzinho                       |
|                                  |
| Meus grupos                      |
| [ Criar grupo ]                  |
|                                  |
| Família Silva                 >  |
| Organizador · Entradas abertas   |
| Encontro em 20/12/2026           |
|                                  |
| Turma da escola               >  |
| Participante · Sorteio feito     |
| Encontro em 22/12/2026           |
+----------------------------------+
```

- Mostre a marca enquanto lê os acessos locais e GLB-07 se houver demora. Em seguida, abra APP-01 ou conclua a navegação do link recebido. Sem grupos salvos, mostre APP-02 e Criar grupo.
- Cada linha mostra nome, papel (APP-03), situação e data disponível. Se a pessoa organiza e participa do mesmo grupo, ofereça os dois destinos (CRI-07 e PES-03) com acessos separados. Reabrir o mesmo acesso atualiza a entrada existente.
- Convite, link pessoal e link de organizador abrem seus destinos conforme o ADR. Valide o acesso antes de guardar a credencial no SecureStore. A API recebe a credencial no cabeçalho Bearer. Os links de entrada ficam fora de logs, notificações e URLs da API.

## Criar grupo

```text
+----------------------------------+
| < Meus grupos                    |
| Criar grupo                      |
| Os dados abaixo vão no convite.  |
|                                  |
| Nome do grupo                    |
| [ Família Silva ]                |
|                                  |
| Valor máximo do presente (R$)    |
| [ 50,00 ]                        |
|                                  |
| Data do encontro                 |
| [ 20/12/2026            data ]   |
|                                  |
| Local do encontro (opcional)     |
| [ Casa da vó ]                   |
|                                  |
| [ Criar grupo ]                  |
+----------------------------------+
```

- Use HOM-04 a HOM-16. Local é opcional. Mostre erros junto aos campos, foque o primeiro inválido e preserve os dados. Enquanto envia, mostre Criando… e bloqueie outro toque.
- Após sucesso, salve o acesso de organizador e mostre Grupo criado (CRI-01), Compartilhar convite (APP-04), Copiar link (CRI-03) e Abrir o painel (CRI-07). Mantenha CRI-04 para quem também quiser participar pelo convite.
- Compartilhar convite abre o menu nativo com WPP-01 e o link público. Copiar link é alternativa. As duas ações ficam disponíveis também no painel.

## Convite e entrada

```text
+----------------------------------+
| < Meus grupos                    |
| Você foi convidado               |
|                                  |
| Família Silva                    |
| Encontro em 20/12/2026           |
| Até R$ 50,00                     |
| Casa da vó                       |
|                                  |
| Entre só com o seu nome.         |
| Sem cadastro e sem senha.        |
|                                  |
| Como você se chama?              |
| [ Ana ]                          |
|                                  |
| [ Entrar no grupo ]              |
+----------------------------------+
```

- Use CNV-01 a CNV-13. Com acesso pessoal salvo, ofereça Continuar como {nome}. Entrar com outro nome segue as regras de lotação e encerramento. Mostre CNV-10, CNV-11 ou CNV-12 para convite inválido, encerrado ou cheio. Uma pessoa com acesso salvo pode voltar à própria área após o sorteio.
- Ao entrar, salve o acesso pessoal, mostre PES-01 com o nome confirmado pelo servidor (inclusive sufixo em nomes repetidos), APP-05 e Ir para a minha área (PES-03).

## Área do participante e lista de desejos

```text
+----------------------------------+
| < Meus grupos                    |
| Família Silva                    |
| Olá, Ana.                        |
|                                  |
| Seu amigo secreto                |
| [ Revelar meu amigo secreto ]    |
|                                  |
| Lista de desejos                 |
| 1 de 20 presentes                |
|                                  |
| Livro de receitas                |
| [ Ver na loja ]                  |
| [ Editar ]  [ Apagar ]           |
|                                  |
| [ Adicionar presente ]           |
|                                  |
| Reserva de anúncio (wireframe)   |
+----------------------------------+
```

```text
+----------------------------------+
| < Lista de desejos               |
| Novo presente                    |
|                                  |
| Nome do presente                 |
| [ Livro de receitas ]            |
|                                  |
| Link da loja (opcional)          |
| [ https:// ]                     |
|                                  |
| Observação (opcional)            |
| [ Capa dura ]                    |
|                                  |
| [ Salvar presente ]              |
| [ Cancelar ]                     |
+----------------------------------+
```

- Use ARE-01 e a data do encontro. Mostre Revelar antes da Lista de desejos. Use WSH-01 a WSH-18 e WSH-22 a WSH-24 para lista, limite, vazio, edição e ações. Cancelar restaura o foco ao acionador. Após salvar, anuncie WSH-12 e foque o item. Após apagar, foque o próximo item ou Adicionar presente. Mostre domínio e link quando disponíveis. WSH-19 e WSH-20 em modo afiliado dependem de APP-MON-01.
- Offline, mostre a última lista própria salva para aquele acesso (APP-06). Edições locais aguardam sincronização (APP-07). Use WSH-12 após confirmação do servidor. Em falha, mantenha a edição recuperável e use WSH-22. Sem cópia local, use GLB-08. Criar, entrar, remover participantes, sortear e revelar exigem conexão.
- Reserve a posição de anúncio abaixo da lista própria, após as ações. O espaço fica recolhido enquanto a monetização estiver desativada. A legenda do desenho é anotação do wireframe. Esta entrega cobre apenas a posição, sem SDK.

## Revelar

```text
+----------------------------------+
| < Meus grupos                    |
| Família Silva                    |
|                                  |
| Seu amigo secreto                |
| Você tirou                       |
| Rafael                           |
|                                  |
| Encontro em 20/12/2026           |
| Até R$ 50,00                     |
| Local: Casa da vó                |
| Guarde segredo até o encontro.   |
| [ Esconder ]                     |
|                                  |
| Lista de desejos de Rafael       |
| 2 presentes                      |
+----------------------------------+
```

- R0 mostra REV-02 em cartão branco. R1 mostra REV-03 em pêssego. R2 mantém o cartão com Revelando… e bloqueia novo toque. R3 mostra REV-04 e a lista de leitura do par (REV-05, WSH-24), com Ver na loja quando disponível.
- Ao revelar, foque o nome e anuncie Você tirou {nome}. Esconder devolve o foco ao botão de revelar. Ao voltar, mudar de grupo ou colocar o app em segundo plano, retorne com o cartão fechado. Resultado e lista do par ficam fora da cópia offline e das notificações.
- R4 usa cartão de erro e Tentar de novo (REV-06). Acesso inválido usa REV-08. O painel do organizador recebe apenas o estado do sorteio.

## Painel do organizador

```text
+----------------------------------+
| < Meus grupos                    |
| Família Silva                    |
| Painel do organizador            |
| Entradas abertas                 |
|                                  |
| Encontro em 20/12/2026           |
| Valor máximo R$ 50,00            |
| Local do encontro: Casa da vó    |
|                                  |
| Link do convite                  |
| [ Compartilhar convite ]         |
| [ Copiar link ]                  |
|                                  |
| Participantes (3 de 100)         |
| Ana                  [ Remover ] |
| Rafael               [ Remover ] |
| Joana                [ Remover ] |
|                                  |
| Sorteio                          |
| [ Fazer o sorteio ]              |
+----------------------------------+
```

- Use ADM-04 a ADM-08 para detalhes, convite e lista com contagem e data de entrada. Remover abre confirmação nativa (ADM-10). Após remoção, anuncie APP-08 e foque a próxima pessoa ou o título da lista. Em falha, preserve a linha e use ADM-11.
- DRW-03 explica o botão desabilitado abaixo de 3 pessoas. Com 3 ou mais, DRW-04 confirma total, encerramento das entradas e irreversibilidade. DRW-05 indica envio e impede novo toque. Mudança na contagem invalida a confirmação. Mostre DRW-08 com Atualizar grupo (APP-09).
- Após conclusão, mostre ADM-03 e a orientação DRW-06. Retire Remover e Fazer o sorteio. No espaço do convite, mostre APP-10. A ação Avisar o grupo abre o menu nativo com WPP-04 (APP-11). Em erro, use DRW-07 e confira o estado do grupo antes de nova tentativa.

## Notificações push

| Evento | Título e corpo | Ao tocar |
| --- | --- | --- |
| Sorteio feito | APP-13 e APP-14 | Abra a área do participante com Revelar fechado. |
| Lembrete X dias antes | APP-15 e APP-16, ou APP-17 quando X = 1 | Abra a área salva do grupo com os dados do encontro. |

- Após o primeiro acesso pessoal salvo, ofereça APP-12. Abra o pedido de permissão do sistema quando a pessoa tocar em Ativar avisos. Adiar ou negar mantém o uso do app. Se precisar mudar a permissão depois, a pessoa pode usar os ajustes do sistema.
- X é fornecido pelo agendamento. Singular usa Amanhã. Plural usa {dias} para valores a partir de 2. Atualize o lembrete se a data mudar e cancele se o grupo deixar de existir. Fuso e valor padrão de X ficam no contrato de implementação do push.
- Na tela bloqueada, use textos genéricos, sem nomes, local, link pessoal ou resultado. Ao tocar, localize o acesso salvo e valide antes de navegar. Se o acesso faltar ou tiver expirado, use APP-18 e abra Meus grupos.

## Estados e aceite

```text
+----------------------------------+
| Meus grupos                      |
|                                  |
| Você ainda não tem grupos        |
| neste aparelho. Crie um grupo    |
| ou abra um convite que recebeu.  |
|                                  |
| [ Criar grupo ]                  |
+----------------------------------+
```

```text
+----------------------------------+
| Convite                          |
|                                  |
| Sem conexão no momento.          |
| Verifique a internet e tente     |
| de novo.                         |
|                                  |
| [ Tentar de novo ]               |
+----------------------------------+
```

| Estado | Resposta |
| --- | --- |
| Carregando | GLB-07 ou texto da ação. Preserve dados visíveis durante atualização. |
| Sem conexão | GLB-08 e Tentar de novo. Use APP-06 para a lista própria com cópia salva. |
| Erro recuperável | Mensagem da ação e nova tentativa explícita. Preserve campos e evite duplicar envio. |
| Acesso expirado, revogado ou inválido | CNV-10, ADM-16, ARE-06 ou APP-18 conforme a origem. Ofereça retorno a Meus grupos. |
| Vazio | APP-02 para grupos, WSH-04 para lista própria, WSH-24 para lista do par, ADM-08 para participantes. |

Na implementação, confira iOS e Android em 360 unidades com fonte padrão e ampliada. Percorra criação, convite, segundo grupo salvo, lista offline e sincronização, remoção cancelada e confirmada, sorteio com 2 e 3 pessoas e revelação com esconder. Verifique foco, alvos de toque, ausência de rolagem lateral, teclado sem encobrir campos, menu com o convite público e notificações com permissão concedida e negada. Teste também a abertura de push sem acesso válido e o sigilo do resultado na tela bloqueada e no painel.
