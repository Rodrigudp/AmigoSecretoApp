# Checklist de regressão do site para o lançamento de 28/11 (REL-02-QA)

Base: [PLANO_DE_TESTES.md](../processo/PLANO_DE_TESTES.md), relatórios [QA-05](RELATORIO_QA-05_LIGHTHOUSE_ACESSIBILIDADE.md) e [QA-06](RELATORIO_QA-06_EXPLORATORIO_WEBVIEWS.md). Ambiente: produção, `https://papelzinho.app`. O site não muda por causa do app (ADR-005).

Como usar: rodar o checklist inteiro em produção no dia 27/11 (ensaio) e de novo na manhã de 28/11, depois do último deploy. Cada linha vira `OK`, `FALHOU` (com `BUG-xxx` e severidade) ou `N/A` (com motivo), com data, hora e o commit em produção. Qualquer S1 ou S2 aberto barra o lançamento e vai ao Orquestrador na hora. Nada aqui está executado: a coluna Resultado nasce vazia.

## 0. Pré-condições

| # | Item | Como conferir | Resultado |
| --- | --- | --- | --- |
| 0.1 | `main` e produção no mesmo commit | `gh run list --branch main --limit 3` verde; `/api/health` responde 200 | |
| 0.2 | CI da `main` verde (Quality, Database, E2E) | Último run do `ci.yml` | |
| 0.3 | Migrations aplicadas em produção | Deploy do `ci.yml` sem aviso de "Skipping"; tabela `supabase_migrations` com a última versão | |
| 0.4 | Nenhum texto pendente | Teste CT-34 (`release-placeholders.spec.ts`) sem `fixme` e verde; `grep -r "A PREENCHER PELO RODRIGO" app/` vazio; PENDENCIAS_RODRIGO sem item que bloqueie o go-live | |
| 0.5 | Grupo de teste planejado | Nome com prefixo `QA-REL`, nomes sintéticos, um celular real ou emulação declarada | |

## 1. Fluxo completo em produção (grupo de teste)

Viewport 360 × 800. Registrar o tempo de criar (limite 2 min) e de entrar (limite 30 s) — RNF01. Ao final, apagar o grupo (§1.12).

| # | Passo | Esperado | Resultado |
| --- | --- | --- | --- |
| 1.1 | Home → "Criar grupo" com nome, valor, data futura e local | Grupo criado; convite e link do organizador distintos; mensagem de sucesso do catálogo | |
| 1.2 | Enviar o formulário vazio e com data passada | Erros junto dos campos, foco no primeiro inválido, dados preservados | |
| 1.3 | Compartilhar convite pelo WhatsApp | Abre `wa.me` com a mensagem WPP-01, valor máximo e link do convite; sem "lista de presentes" nem "galera" | |
| 1.4 | Abrir o convite em aba limpa; entrar com "Ana" | Link pessoal exibido; cookie `ptk_<groupId>` com HttpOnly, Secure, SameSite=Lax | |
| 1.5 | Entrar de novo com "ana" | Nome vira "ana (2)" (RN07) | |
| 1.6 | Entrar com mais uma pessoa (3 no total) | Contador do painel mostra 3 | |
| 1.7 | Painel com 2 pessoas | Botão de sorteio desabilitado com a explicação de mínimo de 3 | |
| 1.8 | Lista de desejos: adicionar, editar, apagar; link da Amazon | Item salvo; link elegível passa por `/r/<id>` e leva à loja; URL `http://` ou maliciosa é recusada | |
| 1.9 | Remover uma pessoa no painel (cancelar e confirmar) | Confirmação; link pessoal da pessoa removida deixa de dar acesso | |
| 1.10 | Sortear com 3 pessoas | Confirmação com total e aviso de irreversível; depois, painel sem Remover e sem Fazer o sorteio; nenhum par exibido | |
| 1.11 | Cada pessoa abre o link pessoal, revela e esconde | Nome revelado diferente do próprio; os 3 formam um ciclo sem repetição; antes do clique o HTML não contém nenhum nome alheio | |
| 1.12 | **Limpeza:** apagar o grupo de teste | Grupo e participantes removidos (SQL do 12 Banco ou rotina de expurgo manual), sem deixar dado de pessoa real; registrar como foi apagado | |
| 1.13 | Convite depois do sorteio | Entrada recusada com a mensagem de grupo encerrado, sem citar ninguém | |
| 1.14 | Convite, link pessoal e link admin inválidos | Mesma recusa neutra, sem revelar se o grupo existe (ADR-002) | |

## 2. Páginas públicas e legais

Baseline de leitura em 18/11/2026, só código HTTP: `/`, `/como-funciona`, `/sobre`, `/privacidade`, `/termos`, `/contato`, `/robots.txt`, `/sitemap.xml`, `/ads.txt` e `/api/health` responderam 200; `/nao-existe` respondeu 404. Repetir e conferir também o conteúdo:

| # | Item | Esperado | Resultado |
| --- | --- | --- | --- |
| 2.1 | Seis páginas públicas | 200, `h1` único, sem texto de rascunho, sem "A PREENCHER PELO RODRIGO" | |
| 2.2 | `/privacidade` | Cita nome e lista de desejos como únicos dados, prazo de 60 dias, contato do controlador e cookies; coerente com o que a LGPD pede (conferir com o 15 Segurança) | |
| 2.3 | `/termos` e `/contato` | E-mail de contato real e funcionando; nada de placeholder | |
| 2.4 | Rodapé em todas as páginas | Links para privacidade, termos, contato e sobre funcionam | |
| 2.5 | Aviso de cookies | Aparece na primeira visita; "Recusar" mantém o site funcional; escolha persiste | |
| 2.6 | Página 404 | Mensagem do catálogo (GLB-05) e caminho de volta | |
| 2.7 | `sitemap.xml` | Só as 6 URLs públicas, no domínio `papelzinho.app`; nenhuma URL com token | |
| 2.8 | `robots.txt` | `Allow: /` e `Sitemap: https://papelzinho.app/sitemap.xml` (token fica fora do índice por `noindex`, não por robots) | |
| 2.9 | Open Graph | Convite compartilhado no WhatsApp mostra nome do grupo e imagem; página inicial com título e descrição | |
| 2.10 | Lighthouse mobile (QA-05) em `/`, `/como-funciona`, `/privacidade`, área do participante, painel | Performance e acessibilidade ≥ 90; comparar com 100/100/100/90/91 do QA-05 e registrar queda | |

## 3. `ads.txt` e anúncios

Baseline em 18/11/2026: `https://papelzinho.app/ads.txt` responde 200 com `google.com, pub-2752974850416759, DIRECT, f08c47fec0942fa0`. Os anúncios estão desligados (`ADS_ENABLED=false`); a CSP da home já vem sem hosts do AdSense.

| # | Item | Esperado | Resultado |
| --- | --- | --- | --- |
| 3.1 | `ads.txt` | 200, `text/plain`, linha idêntica ao `public/ads.txt`; id do AdSense igual ao da conta do PO | |
| 3.2 | Estado dos anúncios no lançamento | Conferir com o Orquestrador se continuam desligados; se ligarem, §3.3 a §3.6 passam a valer | |
| 3.3 | CSP com anúncios ligados | `script-src`, `img-src`, `connect-src`, `frame-src` incluem só os hosts da lista do AdSense; sem erro de CSP no console | |
| 3.4 | Anúncios nunca na área sensível | Nenhum slot no painel, na área depois de Revelar nem em página com token (RN03 e política do AdSense) | |
| 3.5 | Consentimento | Anúncio personalizado só após aceite; recusar não carrega scripts de anúncio | |
| 3.6 | Layout | Anúncio carrega após o conteúdo e não causa salto de layout (CLS) | |

## 4. Headers e segurança

Baseline em 18/11/2026 (`curl -I`) na home: CSP, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Em `/p/x`: `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store, max-age=0, must-revalidate`. `http://` e `www.` respondem 301.

| # | Item | Esperado | Resultado |
| --- | --- | --- | --- |
| 4.1 | Home e páginas públicas | Os 6 headers acima presentes; sem `X-Powered-By` | |
| 4.2 | `/g/…`, `/p/…`, `/admin/…`, `/r/…`, `/owner/…` e `/api/p/hs/…` | `noindex, nofollow`, `no-referrer`, `no-store`; token não aparece no log de acesso do Nginx para `/api/p/hs/` | |
| 4.3 | Resposta do resultado (reveal) | `Cache-Control: no-store`; nenhum par alheio no corpo (CT-08, CT-33) | |
| 4.4 | HTTPS | `http://papelzinho.app` e `www.` redirecionam 301 para `https://papelzinho.app`; certificado válido por mais de 14 dias; `ssllabs` ou `openssl s_client` sem aviso | |
| 4.5 | Cookie `ptk_` | HttpOnly, Secure, SameSite=Lax, 60 dias (CT-32) | |
| 4.6 | Open redirect | `/r/<id>` com destino manipulado não leva a domínio arbitrário (CT-31) | |
| 4.7 | Rate limit | Mais de 30 entradas ou 10 criações por IP em 10 min recebem 429 com mensagem do catálogo | |
| 4.8 | Segredos | Nenhuma chave no bundle: buscar `SUPABASE_SERVICE_ROLE`, `service_role`, `sk_` e `EXPO_ACCESS` nos arquivos de `/_next/static` | |
| 4.9 | Erros | Provocar um erro 500 controlado (token malformado em `/api/p/hs/`): resposta genérica sem stack trace | |
| 4.10 | Dependências | `npm audit --omit=dev --audit-level=high` sem achado alto ou crítico | |

## 5. WebViews e navegadores

Reaproveitar o roteiro do QA-06 (emulação em 18/11: WhatsApp e Instagram em Android e iPhone, 15 capturas, sem S1–S3, BUG-007 S4 aberto). Para o lançamento, repetir pelo menos o caminho crítico — convite → entrar → link pessoal → Revelar — e, se houver aparelho real, trocar a emulação por ele.

| # | Item | Esperado | Resultado |
| --- | --- | --- | --- |
| 5.1 | WhatsApp Android e iPhone: abrir convite recebido por mensagem | Página carrega; entrar funciona | |
| 5.2 | Instagram Android e iPhone: abrir o link do convite pelo perfil ou mensagem | Idem | |
| 5.3 | Cookie `ptk_` no navegador interno | Gravado após entrar; se o navegador interno não guardar cookie, o fallback `?ck=1` (ADR-004) abre a área limpa | |
| 5.4 | Fonte e alvos | Campos com fonte ≥ 16 px (sem zoom automático no iOS); botões ≥ 48 px | |
| 5.5 | Compartilhar pelo WhatsApp | `wa.me` abre o WhatsApp com a mensagem completa, sem corte de acento | |
| 5.6 | Chrome Android e Safari iPhone | Fluxo completo da §1 em cada um | |
| 5.7 | Desktop Chrome, Firefox e Safari | Home, criar grupo e convite legíveis; layout em coluna única sem quebra | |
| 5.8 | Rolagem e teclado | Sem rolagem horizontal em 360 px; teclado não encobre campo ou botão | |
| 5.9 | BUG-007 (S4) | Decisão registrada: corrigir antes ou aceitar para depois do lançamento | |

## 6. Observabilidade e plano de volta

| # | Item | Esperado | Resultado |
| --- | --- | --- | --- |
| 6.1 | Monitoramento | `uptime-watchdog` ativo; alerta de teste chega (`npm run alert:test` conforme `docs/ops/monitoring.md`) | |
| 6.2 | Logs | Erro provocado em §4.9 aparece no log sem token, nome ou URL com credencial | |
| 6.3 | Backup e expurgo | Rotina de expurgo de 60 dias agendada; backup do banco conferido com o 14 DevOps | |
| 6.4 | Rollback | Procedimento de volta ao deploy anterior ensaiado e escrito no cartão do REL | |
| 6.5 | Contato | Caixa de e-mail de contato monitorada nos primeiros dias | |

## 7. Registro do ensaio e da manhã de 28/11

Preencher uma cópia por rodada:

```text
Data/hora:
Commit em produção:
Quem executou e em qual ambiente (aparelho real ou emulação):
Tempo de criar grupo / tempo de entrar:
Resultados: OK = _  FALHOU = _  N/A = _
Bugs abertos (BUG-xxx, severidade):
Grupo de teste apagado (como e quando):
Parecer do QA: liberado | liberado com ressalvas | barrado
```

Critério do QA para liberar: §0 a §6 sem `FALHOU` S1 ou S2, CT-34 verde sem `fixme`, Lighthouse ≥ 90 nas cinco páginas e grupo de teste apagado.
