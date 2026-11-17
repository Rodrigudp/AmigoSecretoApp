# Páginas exigidas para aprovação do AdSense (MON-01)

Status: **revisão 2 — ajustes da Segurança & LGPD (15) aplicados; aguardando nova revisão.**
Revisão 1: reprovada em 17/11 (ajustes obrigatórios). Requisito: RNF05 (privacidade).
Conteúdo em português claro. Os textos entram em código só depois do SETUP-01.

Itens para preencher antes de publicar (não inventar):
- `[DOMÍNIO]` — endereço público do site.
- `[E-MAIL DE CONTATO]` — e-mail que o Rodrigo quer expor. Não usar e-mail pessoal sem autorização.
- `[EDITOR AdSense]` — ID `pub-…` da conta AdSense (vai no `ads.txt` e na variável de ambiente, nunca no código).
- `[DATA]` — data da última atualização.
- `[RETENÇÃO DOS EVENTOS]` — decisão com o Banco de Dados (ver `monetizacao.md` §2).

---

## 1. Sobre (`/sobre`)

**Sobre o Amigo Secreto**

O Amigo Secreto é um site gratuito para organizar a troca de presentes entre amigos e família.
O organizador cria um grupo, compartilha o link no WhatsApp, cada pessoa entra só com o nome,
monta a própria lista de desejos e, no dia marcado, descobre com sigilo quem tirou.

Não é preciso criar conta nem senha. Ninguém vê o resultado do sorteio além da própria pessoa.

Como o site se mantém: exibimos anúncios do Google AdSense e, em alguns links de produtos,
usamos links de afiliado. Quando você compra por um desses links, a loja pode pagar uma comissão ao site,
sem custo extra para você.

---

## 2. Política de privacidade (`/privacidade`)

**Política de privacidade do Amigo Secreto**

Última atualização: `[DATA]`

**Quem é o responsável pelos dados**

Controlador: `[NOME DO RESPONSÁVEL]`. Contato: `[E-MAIL DE CONTATO]`.

**Quais dados coletamos**

- **Nome** que você digita ao entrar em um grupo (pode ser apelido).
- **Lista de desejos**: os itens, links opcionais e observações que você cadastra.
- **Dados técnicos de uso**, de forma anônima: por exemplo, que um grupo foi criado ou que um sorteio foi feito.
  Esses registros usam apenas números internos do sistema. Não guardamos e-mail, telefone, CPF, endereço ou localização.
- **Cookies** (detalhados abaixo).

Não pedimos e-mail, telefone, documentos ou dados de pagamento.

**Para que usamos**

- Fazer o sorteio e mostrar o resultado somente para quem tem o link pessoal.
- Mostrar a lista de desejos aos colegas do grupo.
- Medir, de forma agregada, quantos grupos e participantes usam o site.
- Exibir anúncios, com a sua escolha de consentimento.

**Cookies**

- **Cookies estritamente necessários:** mantêm você conectado ao seu grupo durante a sessão e guardam a sua escolha
  sobre cookies. Sem eles o site não funciona, por isso não pedimos consentimento para eles.
- **Cookies do Google AdSense:** usados para mostrar anúncios. O Google pode usar esses cookies para mostrar anúncios
  com base em visitas anteriores a este e a outros sites. Só usamos anúncios personalizados se você consentir.
  Se você recusar, o site continua funcionando e os anúncios aparecem sem personalização, ou não aparecem.
- Você pode mudar sua escolha a qualquer momento, no aviso de cookies do próprio site. Para configurar os anúncios
  do Google diretamente, use: https://www.google.com/settings/ads

**Compartilhamento e transferência internacional**

Compartilhamos dados apenas com os prestadores que mantêm o site:

- **Vercel** (hospedagem) e **Supabase** (banco de dados): podem processar dados fora do Brasil.
- **Google AdSense**: recebe dados técnicos para exibir anúncios, conforme a escolha de cookies. Pode haver transferência internacional.
- **Lojas afiliadas**: quando você clica em um link de afiliado, você é redirecionado para a loja. Não enviamos seu nome
  nem sua lista de desejos a elas.

**Links de afiliado**

Alguns links de produtos são links de afiliado. Ao clicar, a loja registra o clique com o identificador do programa de afiliados.

**Por quanto tempo guardamos**

- Os dados do grupo são apagados 60 dias após a data da troca.
- Registros técnicos anônimos: `[RETENÇÃO DOS EVENTOS]`.

**Seus direitos (LGPD)**

Você pode pedir acesso, correção, exclusão ou revogação do consentimento a qualquer momento.

- **Sem e-mail e sem login:** para editar a sua lista de desejos, use o seu link pessoal. Para sair ou ser removido de um grupo,
  peça ao organizador antes do sorteio. Não enviamos links secretos por e-mail.
- **Pedidos pelo contato:** escreva para `[E-MAIL DE CONTATO]`. Respondemos em até 15 dias.

---

## 3. Termos de uso (`/termos`)

**Termos de uso do Amigo Secreto**

Última atualização: `[DATA]`

1. **Uso.** O site serve para organizar trocas de presentes entre pessoas que se conhecem. É gratuito.
2. **Idade.** O uso do site é permitido a partir de 18 anos. Pessoas menores de idade só podem usar o site com supervisão
   de um responsável, que concorda com estes termos e com a política de privacidade.
3. **Responsabilidade do organizador.** O organizador é responsável pelo grupo que cria e pelos convites que envia.
4. **Conteúdo.** Quem cadastra itens na lista de desejos é responsável pelo que escreve e pelos links que inclui.
5. **Afiliados e anúncios.** O site pode exibir anúncios e links de afiliado. A compra é feita diretamente na loja,
   que responde pelo produto, pela entrega e pela troca.
6. **Disponibilidade.** Fazemos o possível para manter o site no ar, mas não garantimos funcionamento sem interrupções.
7. **Alterações.** Podemos atualizar estes termos. A data de atualização fica no topo da página.
8. **Foro.** Aplica-se a lei brasileira.

---

## 4. Contato (`/contato`)

**Fale com a gente**

Dúvidas e sugestões: escreva para `[E-MAIL DE CONTATO]`. Respondemos em até 5 dias úteis.
Pedidos sobre seus dados pessoais: respondemos em até 15 dias, conforme a política de privacidade.

---

## 5. `ads.txt` (arquivo na raiz do site)

Conteúdo (o ID do editor entra por variável de ambiente no build, não fica fixo no repositório):

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

`pub-XXXXXXXXXXXXXXXX` é o marcador. O valor real vem da conta AdSense do Rodrigo.

---

## Pendências

- [ ] Rodrigo: informar o ID do editor AdSense (`pub-…`) e o e-mail de contato.
- [ ] Rodrigo: confirmar o domínio público, o nome do controlador e a data de publicação.
- [ ] Banco de Dados: definir a retenção dos eventos após o expurgo (RN08) e preencher `[RETENÇÃO DOS EVENTOS]`.
- [ ] Segurança & LGPD: nova revisão destes textos antes de publicar.
- [ ] Depois do SETUP-01: transformar estes textos em páginas e publicar `ads.txt`.
