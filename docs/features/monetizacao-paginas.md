# Páginas exigidas para aprovação do AdSense (MON-01)

Status: **aguardando dados do Rodrigo para publicar.** Revisão 2 aprovada pela Segurança & LGPD (15).
Revisão 1 reprovada em 17/11 (ajustes aplicados). Requisito: RNF05 (privacidade).
Conteúdo em português claro. Os textos entram em código só depois do SETUP-01.

Valores decididos (17/11/2026):
- Domínio provisório para tudo: `https://amigo-secreto-app.vercel.app`. Domínio próprio fica para depois.
- E-mail de contato, nome do controlador e ID do AdSense: marcador `A PREENCHER PELO RODRIGO`, registrado em `docs/board/PENDENCIAS_RODRIGO.md` (PEN-01 a PEN-03). Não usar e-mail pessoal nem inventar valor.
- `{{PUBLICATION_DATE}}` — data de publicação das páginas (usada como "última atualização").

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

Última atualização: `{{PUBLICATION_DATE}}`

**Quem é o responsável pelos dados**

Controlador: `A PREENCHER PELO RODRIGO`. Contato: `A PREENCHER PELO RODRIGO`.

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

- Os dados do grupo, incluindo nomes e listas de desejos, são apagados 60 dias após a data da troca.
- Depois disso, ficam apenas contadores anônimos do histórico (por grupo e tipo de ação, como "grupo criado" ou "sorteio feito").
  Esses contadores não contêm nome, lista de desejos nem qualquer identificador de pessoa, por isso não são apagados junto com o grupo.

**Seus direitos (LGPD)**

Você pode pedir acesso, correção, exclusão ou revogação do consentimento a qualquer momento.

- **Sem e-mail e sem login:** para editar a sua lista de desejos, use o seu link pessoal. Para sair ou ser removido de um grupo,
  peça ao organizador antes do sorteio. Não enviamos links secretos por e-mail.
- **Pedidos pelo contato:** escreva para `A PREENCHER PELO RODRIGO`. Respondemos em até 15 dias.

---

## 3. Termos de uso (`/termos`)

**Termos de uso do Amigo Secreto**

Última atualização: `{{PUBLICATION_DATE}}`

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

Site: https://amigo-secreto-app.vercel.app

Dúvidas e sugestões: escreva para `A PREENCHER PELO RODRIGO`. Respondemos em até 5 dias úteis.
Pedidos sobre seus dados pessoais: respondemos em até 15 dias, conforme a política de privacidade.

---

## 5. `ads.txt` (arquivo na raiz do site)

Conteúdo (o ID do editor entra por variável de ambiente no build, não fica fixo no repositório):

```
google.com, A PREENCHER PELO RODRIGO, DIRECT, f08c47fec0942fa0
```

---

## Pendências

- [ ] Rodrigo: PEN-01 (e-mail de contato), PEN-02 (nome do controlador), PEN-03 (ID do AdSense e pedido de aprovação). Marcador `A PREENCHER PELO RODRIGO` até chegar.
- [ ] `{{PUBLICATION_DATE}}`: preencher na data de publicação.
- [x] Retenção dos eventos decidida pelo Orquestrador: `ON DELETE SET NULL` (contadores anônimos sobrevivem ao expurgo). Falta o Banco aplicar no DB-01.
- [ ] Segurança & LGPD: revisar de novo se o texto de retenção mudar.
- [ ] Depois do SETUP-01: transformar estes textos em páginas e publicar `ads.txt`.
