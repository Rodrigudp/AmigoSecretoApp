# Pendências do Rodrigo

Mantido pelo **Orquestrador**. Itens que só o Rodrigo pode preencher (contas, dados pessoais, chaves).
Nenhum deles bloqueia o time: os agentes usam o marcador `A PREENCHER PELO RODRIGO` até o valor chegar.

| ID | Pendência | Onde é usada | Cartão | Status |
| --- | --- | --- | --- | --- |
| PEN-01 | E-mail de contato | Páginas de contato e privacidade | MON-01 | A PREENCHER PELO RODRIGO |
| PEN-02 | Nome do controlador dos dados (pessoa ou empresa) | Política de privacidade (LGPD) | MON-01 | A PREENCHER PELO RODRIGO |
| PEN-03 | ID do editor AdSense (`pub-…`) e envio do pedido de aprovação | `ads.txt`, MON-01, MON-02 | MON-01 | A PREENCHER PELO RODRIGO |
| PEN-04 | Cadastro do domínio como mídia no Programa de Afiliados do Mercado Livre | Links de afiliado do ML | LST-03 | A PREENCHER PELO RODRIGO |
| PEN-05 | Chaves do Supabase (anon, service role) e senha do banco em `.env.local` e na Vercel; `supabase login` na CLI | SETUP-03, SETUP-04 | SETUP-04 | A PREENCHER PELO RODRIGO |
| PEN-06 | Confirmar o código de verificação por e-mail da Vercel (primeiro deploy) | Deploy e previews | SETUP-03 | A PREENCHER PELO RODRIGO |
| PEN-07 | Instalar Docker Desktop ou Podman no Windows para `supabase start` local | Validação local opcional (CI valida com Docker) | SETUP-04 | Opcional — não bloqueia (validação via CI) |

## Decisões já tomadas (17/11/2026)
- Domínio provisório em tudo (prévia, política de privacidade, links): `https://amigo-secreto-app.vercel.app`. Domínio próprio fica para depois.
- RF11/RN05 (refazer sorteio), RF12 e RF13: depois do lançamento, conforme BACKLOG.md (SRT-05, LST-05, MON-04).
- Supabase: projeto `amigo-secreto`, ref `ulthbrfwsvmazgdvrcyw`, região us-east-1. Desenvolvimento usa o Supabase local.
