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
| GLB-10 | Rodapé | (não existe) | **novo**, ver §2.1 (FTR-01 a FTR-10) |
| GLB-11 | Copiou | ✓ Link copiado! | ✓ |
| GLB-12 | Não conseguiu copiar | (falha em silêncio) | **novo**: "Não foi possível copiar. Toque no campo e copie o link." |

### 2.1 Rodapé, páginas legais e aviso de cookies (FTR-01 a FTR-10)

Rodapé em todas as páginas, abaixo do conteúdo, em `text-sm` (16 px), links com alvo ≥ 44 px e sublinhado. Nas páginas com link pessoal ou de organizador recém-exibido não leva anúncio acima dele (design-system §4).

| ID | Onde | Texto final |
| --- | --- | --- |
| FTR-01 | Links do rodapé | Sobre · Privacidade · Termos (nesta ordem; o `·` é só visual, cada item é um link) |
| FTR-02 | Região do rodapé (aria-label) | Informações do Papelzinho |
| FTR-03 | Linha de apoio do rodapé | Papelzinho: amigo secreto sem cadastro e sem senha. |
| FTR-04 | Título da aba `/privacidade` | Política de privacidade — Papelzinho |
| FTR-05 | Título da aba `/termos` | Termos de uso — Papelzinho |
| FTR-06 | Título da aba `/sobre` | Sobre o Papelzinho |
| FTR-07 | Aviso de cookies (título / texto) | Cookies / Usamos cookies para o site funcionar e, se você aceitar, para mostrar anúncios. Veja a Política de privacidade. |
| FTR-08 | Aviso de cookies (botões, mesmo destaque) | Aceitar · Recusar |
| FTR-09 | Aviso de cookies (depois de escolher) | Escolha salva. Você pode mudar em "Cookies", no rodapé. |
| FTR-10 | Rodapé: reabrir a escolha | Cookies |

Marcador para dados ainda não definidos: `A PREENCHER PELO RODRIGO` (PEN-01/02; nunca inventar e-mail, nome ou ID). Nas páginas legais, "responsável pelos dados" no texto corrido; "controlador" só no campo formal. A regra de consentimento do AdSense é do 15 Segurança e do 24 Monetização; os textos acima são proposta de voz.

**Para o MON-01 ajustar** (`monetizacao-paginas.md`, revisão de voz):

- O produto se chama **Papelzinho**; o texto ainda usa "Amigo Secreto" como nome do site.
- "site gratuito": o 25 Marketing pede não prometer "grátis" sem validação; usar "sem cadastro e sem senha".
- "descobre com sigilo quem tirou": simplificar para "vê, só ela, quem tirou".
- Usar os termos fixos do guia (§1, regra 10): "link pessoal", "lista de desejos", "organizador".

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
| ARE-04 | Lista (provisório) | Lista de desejos — Em breve você poderá montar aqui a sua lista de desejos. | ✓ até a LST-04; textos finais na DSN-04 |
| ARE-05 | Resultado (provisório) | Meu amigo secreto — Em breve o resultado aparecerá aqui, escondido até você tocar em revelar. | ✓ até a SRT-04; textos finais na DSN-04 |
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

## 10. Pendências desta versão
- Os textos "✎" viram o cartão DSN-03 (centralizar em um módulo e aplicar); testes E2E que citam textos precisam acompanhar.
- Textos finais de lista de desejos e "Revelar": DSN-04.
- Título/descrição de "Como funciona" e FAQ: com o 25 Marketing (MKT-02/03).
- Rodapé (§2.1): decisão do Orquestrador em 18/11: obrigatório antes do lançamento; entra no FE-DSN-4. As páginas são do MON-01.
