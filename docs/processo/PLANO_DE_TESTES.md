# Plano de testes — Amigo Secreto

Base: REQUISITOS.md, PROCESSO.md §5 e BACKLOG.md. Este plano descreve casos planejados; nomes de testes abaixo são identificadores propostos, não evidência de implementação ou execução. Atualizar os caminhos e resultados quando cada teste existir. Dados de teste devem ser sintéticos; RNG e relógio devem ser injetados para resultados determinísticos, sem esperas fixas.

## Rastreabilidade das histórias e regras

| Requisito | Caso e resultado esperado | Nível | Teste automatizado planejado / status |
| --- | --- | --- | --- |
| HU01 | CT-01 Criar grupo com dados válidos: convite e link admin distintos são apresentados; compartilhar abre o fluxo do WhatsApp. | E2E | QA-03: `hu01-create-group` — pendente |
| HU02 | CT-02 Entrar pelo convite apenas com nome e receber link pessoal; após sorteio, nova entrada é recusada. | E2E | QA-03: `hu02-join-and-closed-group` — pendente |
| HU03 | CT-03 Criar, alterar e excluir desejos; links elegíveis Amazon/Mercado Livre são convertidos em afiliado. | E2E | QA-04: `hu03-wishlist-affiliate` — pendente |
| HU04 | CT-04 Com 3 participantes, organizador sorteia e vê confirmação sem pares; com menos de 3, sorteio é recusado. | E2E | QA-04: `hu04-draw-admin` — pendente |
| HU05 | CT-05 Resultado fica oculto até revelar e mostra somente o destinatário e sua lista; destinatário difere do participante. | E2E | QA-04: `hu05-reveal-own-result` — pendente |
| RN01 | CT-06 Tamanhos 0, 1 e 2 retornam erro; 3 é aceito. | Unitário | DOM-01: `draw-minimum-participants` — pendente |
| RN02 | CT-07 Para tamanhos 3 a 100 e 10 mil execuções, cada participante dá e recebe exatamente uma vez, sem tirar a si mesmo. RNG determinístico; registrar semente e tamanho em falha. | Unitário | QA-02: `draw-permutation-properties` — bloqueado por DOM-01 |
| RN03, RNF04 | CT-08 Link pessoal revela apenas o próprio resultado; admin, respostas de API e dados entregues ao cliente não expõem outros pares; token inválido não obtém resultado. | Integração | QA-04: `result-isolation` — pendente |
| RN04 | CT-09 Após sorteio, tentativa de entrada é recusada e não cria participante. | Integração | PAR-02: `join-after-draw` — pendente |
| RN04, RF11 | CT-10 Refazer sorteio permite incluir pessoa conforme fluxo aprovado. | E2E | pós-MVP (SRT-05) — não automatizar agora; fluxo ainda a definir |
| RN05, RF11 | CT-11 Ao refazer, resultado anterior é invalidado e todos são avisados. | Integração | pós-MVP (SRT-05) — não automatizar agora; canal de aviso a definir |
| RN06 | CT-12 Link admin autorizado edita, remove antes do sorteio e sorteia; convite, link pessoal e token inválido não autorizam essas operações. | Integração | GRP-02/GRP-05/SRT-03: `admin-authorization` — pendente |
| RN07 | CT-13 Nomes repetidos ignoram diferença entre maiúsculas e minúsculas: após Ana, ana torna-se ana 2; nome com sufixo tem no máximo 60 caracteres. | Integração | PAR-02: `duplicate-name-suffix` — pendente |
| RN08 | CT-14 Relógio controlado: expurgo remove dados de grupos vencidos 60 dias após a troca e preserva grupos ainda não vencidos. | Integração | OPS-02: `purge-expired-groups` — pendente; conferir limite temporal exato |
| RN09 | CT-15 Entrada do 100º participante é aceita; 101º é recusado, inclusive em concorrência. | Integração | PAR-02/DB-02: `participant-limit` — pendente |

## Requisitos não funcionais

| Requisito | Caso e resultado esperado | Nível | Teste / status |
| --- | --- | --- | --- |
| RNF01 | CT-16 Medir em celular: criar grupo em menos de 2 min e entrar em menos de 30 s; registrar dispositivo e condições. | Manual | Sessão cronometrada — pendente |
| RNF02 | CT-17 Medir LCP mobile em 4G inferior a 2 s; verificar anúncio após conteúdo. | Manual | QA-05: Lighthouse mobile e inspeção de rede — pendente |
| RNF03 | CT-18 Verificar fonte criptográfica e tokens com pelo menos 128 bits; ambiente publicado usa HTTPS. | Integração | SEC-01: `token-entropy-and-https` — pendente; inspeção HTTPS no preview |
| RNF04 | CT-19 Confirmar execução do sorteio no servidor e ausência de pares alheios na resposta e no cliente. | Integração | CT-08 e inspeção de arquitetura — pendente |
| RNF05 | CT-20 Verificar coleta limitada a nome e desejos, política de privacidade e aviso de cookies. | Manual | Revisão de formulários, payloads e páginas — pendente |
| RNF06 | CT-21 Verificar configuração de escala automática e executar carga representativa antes do lançamento; registrar capacidade e limites. | Manual | Revisão de configuração e relatório de carga — pendente |
| RNF07 | CT-22 Conferir custo mensal de infraestrutura fora da temporada inferior a R$ 30. | Manual | Revisão de faturas e estimativas — pendente |
| RNF08 | CT-23 Executar roteiro exploratório abaixo em Android e iPhone, WhatsApp e Instagram; complementar em Chrome e Safari. | Manual | QA-06: relatório e capturas — pendente |
| RNF09 | CT-24 Compartilhar convite no WhatsApp e verificar prévia Open Graph com nome do grupo. | Manual | GRP-04: verificação em aparelho real — pendente |
| RNF10 | CT-25 Avaliar WCAG AA: teclado, foco, rótulos, contraste, zoom e leitura com tecnologia assistiva; legibilidade para idosos. | Manual | QA-05: auditoria e Lighthouse — pendente |

## Casos adicionais da revisão de QA-01

Todos estão planejados e pendentes; os identificadores são propostas, não testes já implementados.

| Requisito / origem | Caso e resultado esperado | Nível | Teste automatizado planejado / status |
| --- | --- | --- | --- |
| RF08, SRT-02/SRT-03 | CT-26 Clique duplo e requisições concorrentes para o primeiro sorteio geram uma única versão persistida. | Integração | `draw-concurrent-single-version` — pendente |
| RN03, RN06, ADR-002 | CT-27 Token inválido, de tipo incorreto ou de grupo inexistente recebe a mesma resposta genérica, sem revelar existência ou diferenças de autorização. | Integração | `generic-token-failure` — pendente |
| RF07, RN06 | CT-28 Após remoção pelo organizador, o link pessoal do participante removido deixa de dar acesso. | Integração | `removed-participant-access-revoked` — pendente |
| RN07, PAR-02 | CT-29 Conferir nomes com diferenças de caixa e limite de 60 caracteres após acréscimo do sufixo, inclusive no limite. | Integração | `duplicate-name-case-and-length` — pendente; ver também CT-13 |
| RF05, LST-02 | CT-30 URL não HTTPS ou maliciosa é recusada no cadastro e na edição. | Integração | `reject-unsafe-wish-url` — pendente |
| RF10, LST-03 | CT-31 O redirect `/r/[itemId]` não permite open redirect para destino arbitrário manipulado. | Integração | `affiliate-redirect-rejects-arbitrary-destination` — pendente |
| RF04, PAR-03 | CT-32 Cookie de acesso possui HttpOnly, Secure e SameSite=Lax. | Integração | `participant-cookie-attributes` — pendente |
| RNF03, RNF04, ADR-002 | CT-33 Páginas com token enviam `noindex` e `Referrer-Policy: no-referrer`; resposta do resultado envia `Cache-Control: no-store`. | Integração | `token-page-and-result-headers` — pendente |
| REL-02 | CT-34 Nenhum fonte em `app/` e nenhuma página pública serve "A PREENCHER PELO RODRIGO" antes do go-live. | E2E | QA-04: `release-placeholders` — fixme até o REL-02 |

## Exploração em aparelhos reais

Em Android e iPhone, abrir o convite recebido no navegador interno do WhatsApp; repetir no Instagram e conferir Chrome e Safari. Criar grupo, compartilhar convite, entrar, guardar link pessoal, montar lista, realizar sorteio e revelar resultado. Conferir retorno ao app, navegação, teclado, legibilidade, estados de erro, sigilo e prévia do convite no WhatsApp. Registrar aparelho, versão do sistema e aplicativo, data, ambiente, passos, esperado, obtido e capturas sem dados reais. Registrar defeitos no board conforme MANUTENCAO.md. Execução prevista no QA-06, antes do lançamento; nenhuma execução é declarada aqui.

## Execução e aceite

Unitários: Vitest; integração: Vitest com Supabase local; E2E: Playwright em viewport mobile de 360 px. Registrar comando, revisão testada, ambiente e resultado no cartão correspondente. Metas: domínio ≥ 90% e total ≥ 70%; lint, typecheck, testes e build no CI. Nenhum caso pendente conta como aprovado. A decisão informada pelo Orquestrador em 17/11 mantém o fechamento de entrada (RN04) no MVP e adia RF11/RN05 para SRT-05; REQUISITOS.md ainda precisa ser alinhado pelo responsável, pois lista essas funções no MVP.

## App nativo

O plano do app (contrato da API v1, testes do app e roteiro em aparelho) está em [docs/qa/PLANO_APP.md](../qa/PLANO_APP.md), com os casos CT-35 a CT-63.
