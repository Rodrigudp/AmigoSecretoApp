# Textos do Papelzinho — guia de voz e inventário (DSN-01)

Dono: 16 Designer de Produto & Textos · Revisor: Orquestrador · Requisitos: RNF01, RNF09, RNF10.
Fonte da verdade dos textos visíveis. O módulo único no código (`src/shared/copy.ts` ou similar) é o cartão DSN-03; até lá, a coluna **Hoje** diz o que está no código.

## 1. Guia de voz

1. **Quem fala:** o Papelzinho, um amigo organizado. Caloroso, simples, direto. Trata a pessoa por **você**.
2. **Frases curtas.** Uma ideia por frase. Palavras do dia a dia (a pessoa pode ter 70 anos).
3. **Sem jargão:** "link pessoal" e "link de organizador", nunca "token", "admin", "HTML", "erro 404", "requisição".
4. **Sem gíria que envelheça:** nada de "galera", "bora", "top". Emoji só 🎁 no WhatsApp; ⚠ e ✓ só como ícone junto com texto.
5. **Erro:** diz o que aconteceu **e** o que fazer. Nunca culpa ("você errou"). Ex.: "Escreva o nome do grupo (até 60 letras)."
6. **Botão:** verbo no infinitivo + o que acontece ("Criar grupo", "Copiar link"). Um botão principal por tela.
7. **Maiúsculas:** só a primeira letra da frase e nomes próprios ("Link do convite", não "Link do Convite").
8. **Formatos:** data `24/12/2026`; dinheiro `R$ 50,00`; "3 pessoas" (nunca "3 participante(s)"); reticências em ação em andamento: "Criando…".
9. **Segurança em primeiro lugar no texto:** link inválido tem sempre a mesma frase (não revela se o grupo existe): "Este link é inválido ou não está mais disponível. Peça um novo link ao organizador." (fixada na PAR-04).
10. **Termos fixos:** amigo secreto · grupo · convite · organizador · participante · sorteio · lista de desejos · link pessoal. Não alternar com "lista de presentes", "admin", "galera".

Legenda da coluna **Final**: ✓ mantém o texto de hoje · ✎ muda (vira cartão DSN-03) · **novo** não existe no app ainda.

## 2. Textos globais

| ID | Onde | Hoje | Final |
| --- | --- | --- | --- |
| GLB-01 | Link de pular (primeiro foco) | Pular para o conteúdo | ✓ |
| GLB-02 | Logo (alt) | Papelzinho | ✓ |
| GLB-03 | Descrição do site (meta) | Organize seu amigo secreto em 2 minutos, sem cadastro e sem senha. | ✓ |
| GLB-04 | Título da home (meta) | Papelzinho | ✎ "Amigo secreto online — Papelzinho" (MKT-02, aprovado) |
| GLB-05 | 404 título | Página não encontrada | ✓ |
| GLB-06 | 404 texto / botão | Confira o endereço ou volte para a página inicial. / Voltar ao início | ✓ |
| GLB-07 | Carregando | Carregando sua área... / Carregando painel… | ✎ "Carregando…" (com o caractere …) em todas |
| GLB-08 | Sem conexão | Sem conexão no momento. Verifique a internet e tente de novo. | ✓ (usar também no painel) |
| GLB-09 | Muitas tentativas | Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo. | ✓ |
| GLB-10 | Rodapé | (não existe) | **novo**: "Privacidade · Termos" (links dependem das páginas do 15 Segurança) |
| GLB-11 | Copiou | ✓ Link copiado! | ✓ |
| GLB-12 | Não conseguiu copiar | (falha em silêncio) | **novo**: "Não foi possível copiar. Toque no campo e copie o link." |

## 3. Início — criar grupo (`/`)

| ID | Onde | Hoje | Final |
| --- | --- | --- | --- |
| HOM-01 | Título (h1) | Amigo secreto começa aqui. | ✓ |
| HOM-02 | Subtítulo | Organize a troca em dois minutos. Cada pessoa entra pelo convite, só com o nome. | ✓ |
| HOM-03 | Passos | Crie o grupo · Envie o convite · Faça o sorteio | ✓ |
| HOM-04 | Título do formulário / apoio | Criar grupo / Os dados abaixo vão no convite. | ✓ |
| HOM-05 | Rótulo nome | Nome do grupo (ex.: Família Silva) | ✓ |
| HOM-06 | Rótulo valor | Valor máximo do presente (R$) (ex.: 50,00) | ✓ |
| HOM-07 | Rótulo data | Data da troca de presentes | ✎ "Data da troca" |
| HOM-08 | Rótulo local | Local da troca (opcional) (ex.: Casa da Vó Maria) | ✓ |
| HOM-09 | Botão / enviando | Criar grupo → / Criando… | ✓ |
| HOM-10 | Resumo de erro (campos) | Não foi possível criar o grupo + "Confira os campos destacados." | ✎ título "Confira os campos destacados", sem corpo |
| HOM-11 | Erro nome | Informe um nome para o grupo entre 1 e 60 caracteres. | ✎ Escreva o nome do grupo (até 60 letras). |
| HOM-12 | Erro valor | O valor do presente deve ser maior que zero. | ✎ Informe um valor maior que zero. Ex.: 50,00. |
| HOM-13 | Erro data | A data da troca de presentes deve ser uma data futura. | ✎ Escolha uma data a partir de amanhã. |
| HOM-14 | Erro local | O local da troca deve ter no máximo 120 caracteres. | ✎ Use até 120 letras no local. |
| HOM-15 | Erro duplicado | Os dados enviados conflitam com uma criação anterior. Recarregue a página para criar um novo grupo. | ✎ Este grupo já foi criado antes. Recarregue a página para criar outro. |
| HOM-16 | Erro geral | Não foi possível criar o grupo agora. Confira os dados e tente de novo. | ✓ |
| HOM-17 | Link para Como funciona | (não existe) | **novo**: "Veja como funciona" |

## 4. Grupo criado

| ID | Onde | Hoje | Final |
| --- | --- | --- | --- |
| CRI-01 | Título | Grupo criado. | ✓ |
| CRI-02 | Card convite | Link do convite — Envie este link para a galera entrar só com o nome. | ✎ "Envie este link para as pessoas entrarem só com o nome." |
| CRI-03 | Botões do convite | Copiar convite · Compartilhar no WhatsApp | ✎ "Copiar link" · ✓ |
| CRI-04 | Card participar | Você também vai participar? — Entre pelo link de convite com o seu nome para participar do sorteio e receber um amigo secreto. / Entrar no grupo como participante | ✎ "Entre pelo convite com o seu nome para entrar no sorteio." / "Entrar no grupo" |
| CRI-05 | Aviso organizador (título) | Atenção: seu link de organizador | ✎ Guarde o seu link de organizador |
| CRI-06 | Aviso organizador (texto) | Este é o seu link secreto de organizador. Não compartilhe no grupo do WhatsApp, pois quem tiver este link pode alterar participantes e sortear os pares. | ✎ "Este link abre o painel do grupo. Não compartilhe no grupo do WhatsApp: quem tiver o link pode tirar pessoas e fazer o sorteio." |
| CRI-07 | Botões do aviso | Copiar link admin · Salvar no meu WhatsApp · Ir para o painel do organizador | ✎ "Copiar link" · ✓ · "Abrir o painel" |

## 5. Convite (`/g/[inviteToken]`)

| ID | Onde | Hoje | Final |
| --- | --- | --- | --- |
| CNV-01 | Chamada | Você foi convidado | ✓ |
| CNV-02 | Apoio | Entre só com o seu nome. Sem cadastro e sem senha. | ✓ |
| CNV-03 | Rótulo | Como você se chama? (ex.: Ana) | ✓ |
| CNV-04 | Botão / enviando | Entrar / Entrando… | ✎ "Entrar no grupo" / ✓ |
| CNV-05 | Retorno | Continuar como {nome} · Entrar com outro nome | ✓ |
| CNV-06 | Resumo de erro | Não foi possível entrar + "Confira o campo destacado." | ✎ título "Confira o campo destacado", sem corpo |
| CNV-07 | Erro nome vazio | Informe como você se chama. | ✎ Escreva o seu nome. |
| CNV-08 | Erro nome longo | Use no máximo 40 caracteres. | ✎ Use até 40 letras. |
| CNV-09 | Erro símbolos | Escreva o nome sem HTML. | ✎ Escreva o nome sem os símbolos < e >. |
| CNV-10 | Link inválido (título/texto) | Link indisponível / Este link é inválido ou não está mais disponível. | ✎ texto + " Peça um novo link ao organizador." |
| CNV-11 | Sorteio já feito | O sorteio já foi realizado. As entradas estão encerradas. | ✎ + " Fale com o organizador." |
| CNV-12 | Grupo cheio | Este grupo já está completo (100 pessoas). | ✎ + " Fale com o organizador." |
| CNV-13 | Erro geral | Não foi possível entrar no grupo agora. Tente de novo em instantes. | ✓ |

## 6. Link pessoal e área do participante (`/p/…`)

| ID | Onde | Hoje | Final |
| --- | --- | --- | --- |
| PES-01 | Título | Você entrou, {nome}. | ✓ |
| PES-02 | Apoio | Guarde este link. É por ele que você verá quem tirou e a sua lista. Não compartilhe. | ✓ |
| PES-03 | Card / botões | Seu link pessoal · Copiar · Salvar no WhatsApp · Ir para a minha área | ✎ "Copiar link"; botão principal passa a ser "Ir para a minha área" (ver DSN-02) |
| ARE-01 | Kicker / título | Grupo {nome} / Olá, {nome}. | ✓ |
| ARE-02 | Antes do sorteio | O sorteio ainda não foi realizado. | ✓ |
| ARE-03 | Depois do sorteio | O sorteio já foi realizado. Veja abaixo quem você tirou. | ✓ |
| ARE-04 | Lista (provisório) | Lista de desejos — Em breve você poderá montar aqui a sua lista de desejos. | substituído por WSH-01 a WSH-24 (§10) |
| ARE-05 | Resultado (provisório) | Meu amigo secreto — Em breve o resultado aparecerá aqui, escondido até você tocar em revelar. | substituído por REV-01 a REV-08 (§11) |
| ARE-06 | Link inválido | Link inválido — Este link é inválido ou não está mais disponível. Peça um novo link ao organizador. | ✎ título "Link indisponível" (igual ao convite e ao painel) |
| ARE-07 | Sem link pessoal | Abra o seu link pessoal para acessar esta área. | ✓ |

## 7. Painel do organizador (`/admin/[token]`)

| ID | Onde | Hoje | Final |
| --- | --- | --- | --- |
| ADM-01 | Kicker | Painel do Organizador | ✎ Painel do organizador |
| ADM-02 | Selo aberto | Aberto para inscrições | ✎ Entradas abertas |
| ADM-03 | Selo sorteado | Sorteio Realizado em {data} | ✎ Sorteio feito em {data} |
| ADM-04 | Detalhes | Detalhes do Grupo · Data da troca · Valor sugerido · Local · Não informado | ✎ "Detalhes do grupo" · ✓ · "Valor máximo" · ✓ · ✓ |
| ADM-05 | Convite | Link do Convite — Compartilhe o convite com os amigos que vão participar: | ✎ "Link do convite" — "Envie o convite para quem vai participar." |
| ADM-06 | Botões do convite | Copiar convite · Compartilhar no WhatsApp | ✎ "Copiar link" · ✓ |
| ADM-07 | Lista | Participantes ({n} de 100) · Entrou em {data} | ✓ |
| ADM-08 | Lista vazia | Nenhum participante entrou ainda. Compartilhe o link de convite acima! | ✎ Ninguém entrou ainda. Envie o convite acima. |
| ADM-09 | Remover | Remover (aria: "Remover {nome}") | ✓ |
| ADM-10 | Confirmar remoção | Tem certeza que deseja remover {nome}? Essa pessoa não participará do sorteio. · Cancelar · Confirmar remoção | ✎ "Remover {nome}? Essa pessoa não entrará no sorteio." · ✓ · "Sim, remover" |
| ADM-11 | Erro ao remover | Não foi possível remover o participante. / Erro de comunicação ao remover participante. Tente novamente. | ✎ "Não foi possível remover agora. Tente de novo." / usar GLB-08 |
| ADM-12 | Card sorteio | Sorteio dos Pares — Quando todos tiverem entrado, dispare o sorteio para definir quem tira quem. | ✎ "Sorteio" — "Quando todos tiverem entrado, faça o sorteio. Cada pessoa vê só quem tirou." |
| ADM-13 | Botão sorteio | Realizar Sorteio | ✎ Fazer o sorteio |
| ADM-14 | Motivo desabilitado | São necessários pelo menos 3 participantes para sortear. | ✎ Para sortear, precisa de pelo menos 3 pessoas. |
| ADM-15 | Após sorteio | ✓ Sorteio realizado! Os participantes já podem conferir seus amigos secretos acessando seus links pessoais. Por segurança, os pares nunca são enviados para este painel. | ✎ "✓ Sorteio feito! Cada pessoa já pode ver quem tirou pelo seu link pessoal. Por segurança, este painel não mostra os pares." |
| ADM-16 | Link inválido | Link não disponível — Este link é inválido ou não está mais disponível. Verifique se você copiou o endereço completo ou crie um novo grupo. · Criar um novo grupo | ✎ título "Link indisponível"; apoio "Confira se copiou o endereço completo. Se perdeu o link, crie um novo grupo." |
| ADM-17 | Título da aba | Painel do Organizador — Papelzinho | ✎ Painel do organizador — Papelzinho |

## 8. WhatsApp (texto final)

Abre `https://wa.me/?text=…`. Negrito do WhatsApp com `*…*`. Linha do local some quando não há local (hoje imprime "Local: Não informado").

**WPP-01 — Convite** (organizador → grupo). Final ✎:
```
Oi! Criei um amigo secreto no Papelzinho: *Família Silva* 🎁

Troca de presentes: 24/12/2026
Valor máximo: R$ 50,00
Local: Casa da Vó Maria

Entre pelo link, só com o seu nome:
https://…/g/…
```
Mudanças: sem "galera"/"Oi pessoal"; "Valor máximo" (igual ao formulário); sem 🎄; sem a promessa "montar sua lista de desejos" até a LST estar no ar; linha "Local" omitida se vazio.

**WPP-02 — Link pessoal** (pessoa → ela mesma). ✓ sem mudança (o E2E CT-02 confere "não compartilhe"):
`Meu link pessoal do Papelzinho (guarde, não compartilhe):` + link.

**WPP-03 — Link de organizador** (organizador → ele mesmo). ✓ sem mudança:
`Meu link de organizador do Papelzinho (guarde, não compartilhe):` + link.

**WPP-04 — Aviso de sorteio** (organizador → grupo). **novo**, para a SRT-04; hoje não há botão:
```
O sorteio do amigo secreto *Família Silva* foi feito! 🎁

Abra o link pessoal que você salvou ao entrar para ver quem você tirou. Não conte para ninguém!

Troca de presentes: 24/12/2026
```

## 9. Prévia ao compartilhar (Open Graph) e metadados

Páginas com token são `noindex` (regra do 15 Segurança, não muda). Imagem do convite: `public/images/og-invite-preview.png` (1200×630).

| ID | Página | Título | Descrição |
| --- | --- | --- | --- |
| OG-01 | Convite válido | {Grupo} — Papelzinho | Você foi convidado para o amigo secreto '{Grupo}'. Toque para entrar e dizer o seu nome. (✎ troca "montar sua lista de presentes" por "dizer o seu nome" até a lista existir; depois: "…entrar e montar sua lista de desejos.") |
| OG-02 | Convite (Twitter/X) | igual a OG-01 | Você foi convidado para o amigo secreto '{Grupo}'. ✓ |
| OG-03 | Convite inválido | Papelzinho | Este link é inválido ou não está mais disponível. ✓ |
| OG-04 | Área do participante | Papelzinho | sem descrição (`noindex`, sem prévia útil) ✓ |
| OG-05 | Painel | Painel do organizador — Papelzinho | sem descrição ✓ |
| OG-06 | Home | proposta em GLB-04 | GLB-03 |

## 10. Lista de desejos (WSH, LST-04) — especificação em `dsn-04-it3.md` §2

Vale para o dono da lista e, sem botões, para quem tirou a pessoa. Regras de negócio: `lista-desejos.md` (RN-LST-01 a 12). Estes textos substituem ARE-04.

| ID | Onde | Texto final |
| --- | --- | --- |
| WSH-01 | Título do cartão | Lista de desejos |
| WSH-02 | Contador | {n} de 20 presentes (com 1: "1 de 20 presentes") |
| WSH-03 | Apoio, antes do sorteio / depois | Quem tirar você vai ver esta lista. Pode mudar quando quiser. / Quem tirou você vê a versão mais recente desta lista. Pode mudar quando quiser. |
| WSH-04 | Lista vazia | Sua lista está vazia. Adicione ideias de presente para quem tirar você. |
| WSH-05 | Botão adicionar | Adicionar presente |
| WSH-06 | Limite de 20 (motivo do botão desabilitado; código WISH_LIST_FULL) | Você chegou a 20 presentes. Apague um para adicionar outro. |
| WSH-07 | Títulos do formulário | Novo presente · Editar presente |
| WSH-08 | Campo nome | Nome do presente * (ex.: Livro de receitas) |
| WSH-09 | Campo link | Link da loja (opcional) · dica "Cole o endereço da página do produto." · exemplo https:// |
| WSH-10 | Campo observação | Observação (opcional) · dica "Tamanho, cor, número… o que ajuda quem for comprar." · contador {n}/200 |
| WSH-11 | Botões do formulário | Salvar presente · Salvar alterações · Cancelar · enviando: Salvando… |
| WSH-12 | Avisos para leitor de tela | Presente salvo. · Presente apagado. |
| WSH-13 | Botões do item | Ver na loja · Editar · Apagar (aria: "Editar {nome}", "Apagar {nome}") |
| WSH-14 | Confirmar apagar | Apagar “{nome}”? Não dá para desfazer. · Cancelar · Sim, apagar |
| WSH-15 | Erro nome vazio / longo | Escreva o nome do presente. · Use até 80 letras no nome do presente. |
| WSH-16 | Erro observação longa | Use até 200 letras na observação. |
| WSH-17 | Erros de link | `http:` Use um link que comece com https:// · outro tipo (`javascript:`, `ftp:`…) Este tipo de link não é aceito. Use o endereço da loja, que começa com https:// · inválido Link inválido. Copie o endereço completo da página do produto. · longo Link muito longo. Use o endereço da página do produto. |
| WSH-18 | Avisos ao salvar (o presente é salvo; botão "Entendi") | Encurtado: Presente salvo, sem link de afiliado: links encurtados não são convertidos. · Não é produto (busca, página inicial, categoria): Presente salvo, sem link de afiliado: este link não é de um produto. · Falha da loja: Presente salvo. Não foi possível gerar o link de afiliado desta loja. |
| WSH-19 | Selo da loja | Link de afiliado · {domínio} (ex.: amazon.com.br) · link comum: só {domínio} |
| WSH-20 | Divulgação, Amazon (**literal**, só se houver item Amazon) | Como participante do Programa de Associados da Amazon, sou remunerado pelas compras qualificadas efetuadas |
| WSH-21 | Divulgação, Mercado Livre (proposta; revisão do 24 Monetização; só se houver item ML afiliado) | O Papelzinho participa do Programa de Afiliados e Criadores do Mercado Livre e pode receber comissão por compras feitas pelos links. |
| WSH-22 | Erros de rede e servidor | Sem conexão: GLB-08 · Carregar: Não foi possível carregar a sua lista. Tente de novo. · Salvar: Não foi possível salvar agora. Tente de novo. · botão: Tentar de novo |
| WSH-23 | Outros códigos | WISH_ITEM_NOT_FOUND: Este presente não está mais na lista. Atualize a página. · PRODUCT_LINK_UNAVAILABLE: Este link não está mais disponível. · INVALID_LINK: ARE-06 |
| WSH-24 | Visão de quem tirou (leitor) | Lista de desejos de {nome} · {n} presentes · vazia: Esta pessoa ainda não adicionou desejos. |

## 11. Cartão "Revelar" (REV, SRT-04) — `dsn-04-it3.md` §3

Substitui ARE-05 (título passa de "Meu amigo secreto" para "Seu amigo secreto", como "Seu link pessoal").

| ID | Estado | Texto final |
| --- | --- | --- |
| REV-01 | Título do cartão | Seu amigo secreto |
| REV-02 | R0, sorteio ainda não feito | Quando o organizador fizer o sorteio, o seu amigo secreto aparece aqui. |
| REV-03 | R1, pronto e fechado | O sorteio foi feito. Toque para ver quem você tirou. Confira se ninguém está olhando a sua tela. · botão Revelar meu amigo secreto · enviando: Revelando… |
| REV-04 | R3, revelado | Você tirou · {nome} · Troca em {data} · até R$ {valor} · Local: {local} (só se houver) · Guarde segredo até a troca. · botão Esconder (aria do nome: "Você tirou {nome}") |
| REV-05 | Lista do par | WSH-24 |
| REV-06 | R4, erro | Não foi possível carregar o seu resultado. Tente de novo. · botão Tentar de novo |
| REV-07 | R6, sorteio refeito (**pós-MVP**, SRT-05) | O sorteio foi refeito. O resultado anterior não vale mais. Toque em Revelar para ver o novo. |
| REV-08 | R5, link inválido | ARE-06 |

## 12. Sorteio no painel (DRW, SRT-03) — `dsn-04-it3.md` §4

Mantém ADM-12 a ADM-15; o "Em breve" provisório sai quando o botão ficar ativo.

| ID | Estado | Texto final |
| --- | --- | --- |
| DRW-01 | Cartão (título / apoio) | ADM-12 |
| DRW-02 | Botão | Fazer o sorteio |
| DRW-03 | S1, menos de 3 pessoas (também o erro do servidor) | Para sortear, precisa de pelo menos 3 pessoas. |
| DRW-04 | S3, confirmação | Fazer o sorteio agora? · {n} pessoas vão participar. Depois do sorteio, ninguém mais entra pelo convite e não dá para desfazer. · Cancelar · Sim, fazer o sorteio |
| DRW-05 | S4, enviando | Sorteando… |
| DRW-06 | S5, feito | ✓ Sorteio feito em {data}. · Cada pessoa já pode ver quem tirou pelo seu link pessoal. Por segurança, este painel não mostra os pares. · Você também participa? Abra o seu link pessoal para ver quem você tirou. · botão Avisar o grupo no WhatsApp (envia WPP-04) |
| DRW-07 | S6, erro geral | Não foi possível concluir o sorteio. Tente de novo. |
| DRW-08 | S7, grupo mudou durante a confirmação | O número de pessoas mudou. Atualize a página e confira antes de sortear. · botão Atualizar a página |
| DRW-09 | Link inválido | ADM-16 |

Operação repetida (duas abas, duplo clique): mostra DRW-06 sem aviso de erro.

## 13. Pendências desta versão
- Os textos "✎" viram o cartão DSN-03; E2E que citam textos acompanham.
- WSH, REV e DRW entram em `copy.ts` com o cartão que implementar cada tela (LST-04, SRT-04, SRT-03).
- `sorteio.md` usa "Sortear" e "participantes": o 23 Sorteio alinha as mensagens dele a DRW e REV.
- WSH-21 (Mercado Livre): revisão do 24 Monetização; sem afiliado ativo do ML no lançamento, o texto não aparece.
- Título/descrição de "Como funciona" e FAQ: com o 25 Marketing (MKT-02/03).
- Rodapé "Privacidade · Termos" (GLB-10): FE-DSN-4, com as páginas do MON-01.

## 14. Como funciona (`/como-funciona`) — MKT-03

Proposto pelo 25 Marketing em 18/11/2026; sujeito à aprovação do 16. Página pública, indexável, linkada da home (HOM-17).

| ID | Onde | Hoje | Final |
| --- | --- | --- | --- |
| CF-01 | Título (h1) | (não existe) | **novo**: "Como funciona o amigo secreto" |
| CF-02 | Intro | (não existe) | **novo**: "Crie o grupo, envie o convite e faça o sorteio. Cada pessoa entra só com o nome." |
| CF-03 | Passos | (não existe) | **novo**: 1. "O organizador cria o grupo e guarda o link de organizador." 2. "Compartilha apenas o convite." 3. "Cada pessoa entra com o nome e guarda o link pessoal." 4. "Com pelo menos três pessoas, o organizador faz o sorteio. Cada pessoa abre o próprio resultado." |
| CF-04 | Aviso (título) | (não existe) | **novo**: "Atenção: links privados" |
| CF-05 | Aviso (texto) | (não existe) | **novo**: "Não compartilhe esses links. O link de organizador permite alterar o grupo; o link pessoal dá acesso à sua área e ao seu resultado." |
| CF-06 | Título FAQ | (não existe) | **novo**: "Perguntas frequentes" |
| CF-07 | FAQ cadastro | (não existe) | **novo**: "Preciso de cadastro?" — "Não. Basta entrar pelo convite com o seu nome." |
| CF-08 | FAQ pessoas | (não existe) | **novo**: "Quantas pessoas podem participar?" — "O grupo aceita até 100 pessoas. Para fazer o sorteio, precisa de pelo menos três." |
| CF-09 | FAQ pares | (não existe) | **novo**: "O organizador vê os pares?" — "Não. O painel não mostra os pares." |
| CF-10 | FAQ entrar depois | (não existe) | **novo**: "Posso entrar depois do sorteio?" — "Não. O grupo fecha para novas entradas." |
| CF-11 | FAQ voltar | (não existe) | **novo**: "Como volto para a minha área?" — "Guarde o link pessoal." |
| CF-12 | Botão | (não existe) | **novo**: "Criar grupo" |
| CF-13 | Título da aba | (não existe) | **novo**: "Como funciona o amigo secreto — Papelzinho" |
| CF-14 | Descrição da página (meta) | (não existe) | **novo**: "Veja como criar seu grupo, enviar o convite e participar do sorteio de amigo secreto pelo Papelzinho." |
