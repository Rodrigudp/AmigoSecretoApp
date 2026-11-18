# Pendências do Rodrigo

Mantido pelo **Orquestrador**. Itens que só o Rodrigo pode preencher (contas, dados pessoais, chaves).
Nenhum deles bloqueia o time: os agentes usam o marcador `A PREENCHER PELO RODRIGO` até o valor chegar.

| ID | Pendência | Onde é usada | Cartão | Status |
| --- | --- | --- | --- | --- |
| PEN-01 | E-mail de contato | Páginas de contato e privacidade | MON-01 | ✅ `suporte@papelzinho.app` (18/11; caixa na Hostinger a confirmar pelo PO) |
| PEN-02 | Nome do controlador dos dados (pessoa ou empresa) | Política de privacidade (LGPD) | MON-01 | ✅ Rodrigo Del Padre, pessoa física (18/11) |
| PEN-03 | ID do editor AdSense (`pub-…`) e envio do pedido de aprovação | `ads.txt`, MON-01, MON-02 | MON-01 | ID ✅ `pub-2752974850416759` (conta criada pelo PO, 18/11; site papelzinho.app cadastrado, "Precisa de revisão"). Verificação por meta tag + ads.txt no MON-02a. Pedir revisão ao Google só depois de PEN-01/02 nas páginas |
| PEN-04 | Cadastro do domínio como mídia no Programa de Afiliados do Mercado Livre | Links de afiliado do ML | LST-03 | A PREENCHER PELO RODRIGO |
| PEN-05 | Chaves do Supabase (anon, service role) e senha do banco em `.env.local` e na Vercel; `supabase login` na CLI | SETUP-03, SETUP-04 | SETUP-04 | ✅ Feito 17/11 na Vercel (URL, service role, Production e Preview); `.env.local` e `supabase login` só se for rodar local |
| PEN-06 | Confirmar o código de verificação por e-mail da Vercel (primeiro deploy) | Deploy e previews | SETUP-03 | ✅ Feito 17/11 (produção no ar) |
| PEN-07 | Instalar Docker Desktop ou Podman no Windows para `supabase start` local | Validação local opcional (CI valida com Docker) | SETUP-04 | Opcional — não bloqueia (validação via CI) |
| PEN-08 | Criar no ambiente `production` do GitHub Actions os secrets `SUPABASE_ACCESS_TOKEN` (Supabase > Account > Access Tokens) e `SUPABASE_DB_PASSWORD` (senha do banco do projeto amigo-secreto). Não colar no chat. | Aplicar as migrations no banco de produção (OPS-04) | OPS-04 | A PREENCHER PELO RODRIGO — nomes confirmados no PR #28. Paliativo 18/11: as 5 migrations até 20261121000100 foram aplicadas à mão pelo ORQ no SQL Editor, com histórico em supabase_migrations; migrations novas continuam dependendo destes segredos |
| PEN-09 | Decisão de gasto: comprar domínio próprio para o Papelzinho (o app vai para a VPS sem domínio; sem domínio o SEO não rende e o cadastro no AdSense e no Mercado Livre fica fraco). Custo e prazo virão na recomendação do MKT-01. | SEO (MKT-02/03), nginx/certbot da VPS (OPS-VPS), PEN-03, PEN-04 | MKT-01 | ✅ Comprado pelo PO em 18/11: `papelzinho.app` (Hostinger). DNS A `@` → `2.25.252.45` feito pelo ORQ no hPanel; `www` é CNAME da raiz; HTTPS ativo e APP_URL trocado · Recomendação original: `papelzinho.app` (livre na consulta RDAP de 18/11; ~R$ 117 no 1º ano, ~R$ 102/ano depois, preço indicativo no MKT-01). `papelzinho.com.br` e `papelzinho.com` já estão registrados por terceiros |
| PEN-10 | Criar no DNS de `smartsolutionsbr.com.br` um registro A `papelzinho` → `2.25.252.45` (sem custo). Libera HTTPS (RNF03) com certbot na VPS enquanto o domínio próprio não vem. | Endereço do app na VPS (OPS-VPS) | OPS-VPS | ✅ Feito pelo PO em 18/11; hoje só redireciona (301) para https://papelzinho.app |
| PEN-11 | Criar webhook para alertas S1 (Discord, Telegram ou Slack) e cadastrar `ALERT_WEBHOOK_URL` nos secrets do GitHub Actions (environment `production`) e no `.env.production` da VPS (modo 600). Passo a passo em `docs/ops/monitoring.md`. | Monitoramento de erros e uptime S1 | OPS-01 | ✅ Feito pelo PO em 18/11 (Discord configurado na VPS e GitHub Secrets; teste HTTP 204 entregue; watchdog cron ativo a cada 5m) |

## Decisões já tomadas (17/11/2026)
- Domínio oficial desde 18/11: `https://papelzinho.app` (VPS própria). Usar em tudo: política de privacidade, links, Open Graph, sitemap, AdSense e afiliados. O endereço antigo da Vercel não vale mais.
- RF11/RN05 (refazer sorteio), RF12 e RF13: depois do lançamento, conforme BACKLOG.md (SRT-05, LST-05, MON-04).
- Supabase: projeto `amigo-secreto`, ref `ulthbrfwsvmazgdvrcyw`, região us-east-1. Desenvolvimento usa o Supabase local.
