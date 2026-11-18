# Pendências do Rodrigo

Mantido pelo **Orquestrador**. Itens que só o Rodrigo pode preencher (contas, dados pessoais, chaves).
Nenhum deles bloqueia o time: os agentes usam o marcador `A PREENCHER PELO RODRIGO` até o valor chegar.

| ID | Pendência | Onde é usada | Cartão | Status |
| --- | --- | --- | --- | --- |
| PEN-01 | E-mail de contato | Páginas de contato e privacidade | MON-01 | A PREENCHER PELO RODRIGO |
| PEN-02 | Nome do controlador dos dados (pessoa ou empresa) | Política de privacidade (LGPD) | MON-01 | A PREENCHER PELO RODRIGO |
| PEN-03 | ID do editor AdSense (`pub-…`) e envio do pedido de aprovação | `ads.txt`, MON-01, MON-02 | MON-01 | A PREENCHER PELO RODRIGO |
| PEN-04 | Cadastro do domínio como mídia no Programa de Afiliados do Mercado Livre | Links de afiliado do ML | LST-03 | A PREENCHER PELO RODRIGO |
| PEN-05 | Chaves do Supabase (anon, service role) e senha do banco em `.env.local` e na Vercel; `supabase login` na CLI | SETUP-03, SETUP-04 | SETUP-04 | ✅ Feito 17/11 na Vercel (URL, service role, Production e Preview); `.env.local` e `supabase login` só se for rodar local |
| PEN-06 | Confirmar o código de verificação por e-mail da Vercel (primeiro deploy) | Deploy e previews | SETUP-03 | ✅ Feito 17/11 (produção no ar) |
| PEN-07 | Instalar Docker Desktop ou Podman no Windows para `supabase start` local | Validação local opcional (CI valida com Docker) | SETUP-04 | Opcional — não bloqueia (validação via CI) |
| PEN-08 | Criar no ambiente `production` do GitHub Actions os secrets `SUPABASE_ACCESS_TOKEN` (Supabase > Account > Access Tokens) e `SUPABASE_DB_PASSWORD` (senha do banco do projeto amigo-secreto). Não colar no chat. | Aplicar as migrations no banco de produção (OPS-04) | OPS-04 | A PREENCHER PELO RODRIGO — nomes confirmados no PR #28 |
| PEN-09 | Decisão de gasto: comprar domínio próprio para o Papelzinho (o app vai para a VPS sem domínio; sem domínio o SEO não rende e o cadastro no AdSense e no Mercado Livre fica fraco). Custo e prazo virão na recomendação do MKT-01. | SEO (MKT-02/03), nginx/certbot da VPS (OPS-VPS), PEN-03, PEN-04 | MKT-01 | AGUARDA DECISÃO DO PO — recomendação: `papelzinho.app` (livre na consulta RDAP de 18/11; ~R$ 117 no 1º ano, ~R$ 102/ano depois, preço indicativo no MKT-01). `papelzinho.com.br` e `papelzinho.com` já estão registrados por terceiros |
| PEN-10 | Criar no DNS de `smartsolutionsbr.com.br` um registro A `papelzinho` → `2.25.252.45` (sem custo). Libera HTTPS (RNF03) com certbot na VPS enquanto o domínio próprio não vem. | Endereço do app na VPS (OPS-VPS) | OPS-VPS | A PREENCHER PELO RODRIGO |

## Decisões já tomadas (17/11/2026)
- Domínio provisório em tudo (prévia, política de privacidade, links): `https://amigo-secreto-app-five.vercel.app`. Domínio próprio fica para depois.
- RF11/RN05 (refazer sorteio), RF12 e RF13: depois do lançamento, conforme BACKLOG.md (SRT-05, LST-05, MON-04).
- Supabase: projeto `amigo-secreto`, ref `ulthbrfwsvmazgdvrcyw`, região us-east-1. Desenvolvimento usa o Supabase local.
