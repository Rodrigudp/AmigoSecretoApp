# Pesquisa de palavras e plano de SEO — Papelzinho

Responsável: Marketing · revisão: Designer · 18/11/2026. O MKT-03 implementa a página e o SEO técnico; nada é publicado sem o PO. O guia DSN-01 está aprovado; textos novos seguem o alinhamento do Designer e precisam de seu parecer no PR.

## Objetivo e situação

Atender quem quer organizar amigo secreto para família, amigos ou equipe, com foco na utilidade e na clareza dos passos. Lançamento previsto em 28/11; crescimento prioritário por convites. IP:8090 em HTTP é somente para homologação interna; a alternativa provisória é `papelzinho.smartsolutionsbr.com.br`, dependente do DNS do PO (PEN-10) e da aprovação de HTTPS por DevOps e Segurança. Não usar o antigo endereço Vercel como canônico definitivo. Domínio próprio e contas dependem do PO (PEN-09, PEN-03, PEN-04).

## Pesquisa de termos

Consulta em 18/11/2026 às páginas citadas. A observação de linguagem em páginas existentes sugere intenção, mas **não mede volume, sazonalidade, dificuldade nem posição em buscador**; prioridades são hipóteses editoriais. Sem acesso a ferramenta de palavras-chave não se inventam números.

| Termo candidato | Intenção e página | Evidência observada |
|---|---|---|
| amigo secreto online | Fazer o sorteio; home, prioridade alta | [Migo Secreto](https://migosecreto.com/) usa o termo no título e descreve o fluxo online. |
| sorteio de amigo secreto | Realizar a brincadeira; home, alta | [Amigo Secreto](https://www.amigosecreto.com.br/comunicacao/artigos/como-fazer-o-sorteio-de-amigo-secreto-online) explica como sortear. |
| amigo oculto online | Nome alternativo para pesquisa, média; não usar na interface | [Sortei](https://sortei.com.br/) usa “amigo oculto” no contexto de sorteio online. |
| amigo secreto pelo WhatsApp | Compartilhar convite; Como funciona, alta | [Migo Secreto](https://migosecreto.com/) descreve compartilhamento pelo WhatsApp. |
| como fazer amigo secreto online | Aprender os passos; Como funciona, alta | [Amigo Secreto](https://www.amigosecreto.com.br/comunicacao/artigos/como-sortear-amigo-secreto-online-pelo-computador) publica guia passo a passo. |
| amigo secreto sem cadastro | Evitar conta; home e FAQ, média | [QMIX](https://ferramentas.qmix.com.br/sorteio-de-amigo-secreto) descreve sorteio sem cadastro. |

Essas páginas mostram ofertas distintas; não importar suas funcionalidades ou promessas para o Papelzinho. Não há evidência de tráfego ou domínio de autoridade. Após domínio e eventual acesso aprovado ao Search Console, observar impressões, consultas e cliques agregados; sem dados, registrar indisponível.

## Arquitetura e textos para revisão

Publicáveis após aceite e HTTPS: home `/` e futura `/como-funciona`, ligadas entre si. Não criar páginas por variação de palavra. Política e termos existentes devem ser acessíveis pelo rodapé, com tratamento de indexação definido pelo time jurídico/segurança. Não expor URLs de convite, organizador ou participante em links públicos, dados estruturados ou sitemap.

| Página | Title proposto | Meta description proposta |
|---|---|---|
| Home `/` | Amigo secreto online — Papelzinho | Organize seu amigo secreto em 2 minutos, sem cadastro e sem senha. |
| `/como-funciona` (proposta) | Como funciona o amigo secreto — Papelzinho | Veja como criar seu grupo, enviar o convite e participar do sorteio de amigo secreto pelo Papelzinho. |
| Convite `/g/[inviteToken]` | Nome do grupo — Papelzinho | Seguir OG-01 em `docs/features/textos.md`; aplicação do texto final depende de DSN-03. |
| Participante `/p/[accessToken]` | Área do participante — Papelzinho | Sem descrição proposta. |
| Organizador `/admin/[adminToken]` | Painel do organizador — Papelzinho | Sem descrição proposta. |

O convite mantém nome do grupo conforme contrato vigente aprovado pela Segurança; participante e organizador não têm prévia proposta. Não prometa “grátis”, recursos não entregues ou conclusão em tempo garantido sem validação.

**Home:** manter o H1 já em uso, “Amigo secreto começa aqui.”, e o texto de apoio atual. Incluir link para Como funciona quando a página existir.

**Como funciona, proposta:** 1. Organizador cria o grupo e guarda o link de organizador. 2. Compartilha apenas o convite. 3. Cada pessoa entra com o nome e guarda seu link pessoal. 4. Com pelo menos três pessoas, o organizador faz o sorteio; cada pessoa abre seu próprio resultado. Não compartilhar links pessoais nem de organizador.

**FAQ visível:** Preciso de cadastro? Não. Quantas pessoas? O grupo aceita até 100 pessoas. Para fazer o sorteio, precisa de pelo menos três. O organizador vê os pares? O painel não mostra os pares. Posso entrar depois do sorteio? Não: o grupo fecha para novas entradas. Como volto? Guarde o link pessoal. Conferir o estado de entrega antes de publicar.

## Metadados, compartilhamento e indexação

- Home e futura página pública: canonical absoluto na origem HTTPS definitiva, title, description e Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:image` absoluto). Testar imagem e prévia no WhatsApp após implantação; conferir coerência com conteúdo real.
- Convite: manter o contrato atual da prévia Open Graph e a imagem existente `public/images/og-invite-preview.png`; preservar `noindex`. Antes de qualquer mudança em divulgação de dados do grupo, revisar com Segurança e Designer. Participante e organizador: sem prévia proposta.
- Todas as rotas com token (`/g/`, `/p/`, `/admin/`) devem permanecer `noindex`; não incluir seus endereços em sitemap. `noindex` não é controle de acesso nem protege links secretos. Não colocar tokens em logs de marketing, exemplos ou ferramentas externas.
- `robots.txt`: permitir rastreamento das páginas que exibem `noindex`; não combinar `Disallow` para essas rotas com a expectativa de que o Google veja a diretiva. Google explica que um bloqueio impede a leitura do `noindex`: [documentação](https://developers.google.com/search/docs/crawling-indexing/block-indexing), consulta 18/11/2026. Definir eventuais exceções somente com Segurança, considerando acesso e exposição de tokens.
- `sitemap.xml`: somente URLs públicas canônicas, absolutas e disponíveis em HTTPS (home e Como funciona depois de publicada); nunca links com token. Publicar a localização do sitemap no robots após domínio aprovado. Sitemap facilita descoberta, mas não garante indexação: [Google](https://developers.google.com/search/help/crawling-index-faq), consulta 18/11/2026.
- Schema.org: propor JSON-LD `WebSite` para a home (`name`, `url`, `inLanguage`) e `WebPage` para a página de ajuda (`name`, `url`, `inLanguage`, `isPartOf`), com URLs públicas definitivas e conteúdo visível. Não colocar preços, avaliação ou recursos não comprovados. FAQ deve existir em texto; não esperar resultado especial de FAQ no Google, que o restringe principalmente a sites governamentais e de saúde reconhecidos ([Google](https://developers.google.com/search/blog/2023/08/howto-faq-changes), consulta 18/11/2026).

## Entrega e verificação — MKT-03

**Implementado em 18/11/2026:** página `/como-funciona` (textos CF-01..CF-14 em `docs/features/textos.md`), metadados da home (GLB-04) e da página, `app/sitemap.ts` e `app/robots.ts`. A origem do canonical, do Open Graph e do sitemap vem de `APP_URL` (`app/_lib/site-url.ts`), sem domínio fixo. As páginas com token seguem `noindex` e fora do sitemap. Schema.org: `WebSite` na home e `WebPage` em `/como-funciona`. Imagem OG da home e da página: `public/images/og-invite-preview.png` (1200×630); uma imagem dedicada à home fica para o 16.

1. Aprovar domínio e HTTPS, revisar segurança e decidir URL canônica; confirmar que páginas públicas existem e respondem corretamente.
2. FE implementa página, metadados, schema, sitemap e robots; Designer revisa textos e Segurança revisa rotas com token e headers. Não alterar scripts de terceiros sem segurança.
3. Conferir em HTML e cabeçalhos que as três famílias com token têm `noindex`, sem expor tokens nos exemplos; conferir sitemap apenas público, canonical/OG e prévia de convite em ambiente seguro. Executar Lighthouse SEO ≥ 90 conforme MKT-03 e registrar ambiente e resultado.
4. Quando houver conta e propriedade aprovadas, verificar URLs públicas e sitemap no Search Console. Registrar data, impressões e cliques agregados; o rastreamento pode levar dias ou semanas e não é garantido ([Google](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), consulta 18/11/2026).
