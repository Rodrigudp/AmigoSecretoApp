# Relatório de Acessibilidade (WCAG 2.1 AA) e Performance Mobile (Lighthouse) — QA-05

**Item:** QA-05  
**Data da Auditoria:** 18 de novembro de 2026  
**Ambiente:** Produção (`https://papelzinho.app`)  
**Responsável:** 13 QA e Testes  
**Requisitos Avaliados:** RNF02 (Acessibilidade WCAG AA), RNF10 (Lighthouse Mobile)  
**Critério de Aceite:** Lighthouse Mobile ≥ 90 em Performance e Acessibilidade em todas as rotas principais.

---

## 1. Resumo Executivo e Veredito

| Rota / Tela | Tipo de Página | Performance Mobile | Acessibilidade (WCAG AA) | Veredito |
| :--- | :--- | :---: | :---: | :---: |
| `/` | Home / Criar Grupo | **100** / 100 | **100** / 100 | **APROVADO** |
| `/como-funciona` | Institucional / SEO | **100** / 100 | **100** / 100 | **APROVADO** |
| `/privacidade` | Documento Legal / LGPD | **100** / 100 | **100** / 100 | **APROVADO** |
| `/admin/[token]` | Painel do Organizador (Admin) | **91** / 100 | **100** / 100 | **APROVADO** |
| `/p/[token]` | Área do Participante | **90** / 100 | **100** / 100 | **APROVADO** |

**Veredito Geral:** **APROVADO SEM RESSALVAS BLOQUEANTES**.  
Todas as 5 rotas obrigatórias atingiram ou superaram a meta estabelecida de 90 pontos. Em acessibilidade, **100% das páginas atingiram a pontuação máxima (100/100)**, com zero violações em 76 auditorias automatizadas do motor axe-core.

---

## 2. Metodologia de Teste

- **Ferramenta:** Google Lighthouse 13.6.0 via CLI oficial / Chrome headless (DevTools Protocol).
- **Emulação:** Perfil Mobile padrão do Lighthouse (Nexus 5X / Moto G4 emulation, 360×800 px, throttling de CPU 4x e rede 4G simulada).
- **Motor de Acessibilidade:** `axe-core` integrado ao Lighthouse, cobrindo regras WCAG 2.0, 2.1 e 2.2 níveis A e AA.
- **Grupo de Teste Utilizado:** Criado especificamente para a auditoria do painel e área do participante (`/admin/vZoXCFReXW7FKuf5_-_WVXk6vsZtad7P-Fjs7Fa-iUA` e participante Alice). O participante de teste foi devidamente removido ao término da medição.

---

## 3. Detalhamento por Página

### 3.1. Home (`/`) — Criar Grupo
- **Performance:** 100
  - First Contentful Paint (FCP): 0,8 s
  - Largest Contentful Paint (LCP): 0,8 s
  - Total Blocking Time (TBT): 0 ms
  - Cumulative Layout Shift (CLS): 0,000
  - Speed Index: 0,9 s
- **Acessibilidade:** 100 (0 violações em 76 verificações)
  - Formulário acessível com labels vinculados semanticamente (`htmlFor` / `id`).
  - Inputs com altura mínima de 48 px (`min-h-12`) e fonte de 18 px (`text-base`).
  - Skip link (`#conteudo`) presente e focalizável.
  - Contraste de cores entre texto e fundo com taxa superior a 4,5:1.

### 3.2. Como Funciona (`/como-funciona`)
- **Performance:** 100
  - FCP: 0,8 s | LCP: 0,8 s | TBT: 0 ms | CLS: 0,000 | Speed Index: 0,8 s
- **Acessibilidade:** 100 (0 violações)
  - Estrutura hierárquica de cabeçalhos correta (`h1` -> `h2` -> `h3`).
  - Lista de passos ordenada semanticamente com suporte a leitores de tela.
  - Links com texto descritivo e estados de foco visíveis (`focus-visible`).

### 3.3. Política de Privacidade (`/privacidade`)
- **Performance:** 100
  - FCP: 0,8 s | LCP: 0,8 s | TBT: 0 ms | CLS: 0,000 | Speed Index: 0,8 s
- **Acessibilidade:** 100 (0 violações)
  - Conteúdo textual estruturado com landmarks HTML5 (`<main>`, `<header>`, `<footer>`).
  - Dados do controlador e contato (PEN-01 / PEN-02) perfeitamente legíveis e indexáveis.

### 3.4. Painel do Organizador (`/admin/[token]`)
- **Performance:** 91
  - FCP: 1,3 s | LCP: 2,1 s | TBT: 40 ms | CLS: 0,001 | Speed Index: 1,8 s
  - Observação: O tempo ligeiramente superior decorre da renderização dinâmica do painel com Suspense e resolução de token via hash SHA-256 no backend. A pontuação permanece acima da meta de 90.
- **Acessibilidade:** 100 (0 violações)
  - Lista de participantes (`<ul>` / `<li>`) com badges de estado acessíveis.
  - Diálogos e botões com rótulos semânticos (`aria-label`, `aria-describedby`).
  - Feedback visual e textual em ações críticas (confirmação de remoção e realização de sorteio).

### 3.5. Área do Participante (`/p/[token]`)
- **Performance:** 90
  - FCP: 1,4 s | LCP: 2,2 s | TBT: 50 ms | CLS: 0,000 | Speed Index: 1,9 s
  - Nota de rota: Avaliado no modo fallback (`?ck=1`) e modo canônico (`/p/g/[id]`), ambos performando dentro do limite estrito.
- **Acessibilidade:** 100 (0 violações)
  - Cartão de "Revelar amigo secreto" com acessibilidade completa via teclado (Enter / Espaço).
  - Estado aria-live para feedback dinâmico ao exibir o amigo secreto sorteado.
  - Formulário de desejos (`WishForm`) com contadores acessíveis e mensagens de erro descritivas com `role="alert"`.

---

## 4. Auditoria Detalhada WCAG 2.1 AA

| Critério WCAG | Requisito | Status | Observação |
| :--- | :--- | :---: | :--- |
| **1.1.1** | Conteúdo Não-textual | **Conforme** | Todos os ícones SVG possuem `aria-hidden="true"` ou alternativa textual acessível. |
| **1.3.1** | Informações e Relações | **Conforme** | Landmarks semânticos (`<main id="conteudo">`, `<nav>`, `<footer>`) e hierarquia de títulos coerente. |
| **1.4.3** | Contraste Mínimo (4.5:1) | **Conforme** | Cores do design system validadas (texto principal, secundário e botões primários/secundários). |
| **2.1.1** | Teclado | **Conforme** | Todos os fluxos operáveis via teclado; skip link ativo no topo de todas as páginas. |
| **2.4.3** | Ordem do Foco | **Conforme** | Ordem de tabulação lógica correspondendo à ordem visual do DOM. |
| **2.4.7** | Foco Visível | **Conforme** | Estilo `focus-visible:outline-focus` consistente em todos os elementos interativos. |
| **2.5.5 / 2.5.8** | Área de Toque (Target Size) | **Conforme** | Botões e campos com altura mínima ≥ 48 px (`min-h-12`). |
| **3.2.1 / 3.2.2** | No Focus / On Input | **Conforme** | Nenhuma mudança inesperada de contexto ao focar ou preencher campos. |
| **3.3.1 / 3.3.2** | Identificação e Instrução de Erros | **Conforme** | Erros de validação associados via `aria-describedby` e `aria-invalid`. |
| **4.1.2** | Nome, Função, Valor (Name, Role, Value) | **Conforme** | Componentes interativos declarados com papéis WAI-ARIA válidos. |

---

## 5. Conclusão
O Amigo Secreto (Papelzinho) cumpre integralmente os requisitos **RNF02** e **RNF10**, qualificando-se para o lançamento sem impedimentos técnicos de qualidade, desempenho mobile ou conformidade de acessibilidade.
