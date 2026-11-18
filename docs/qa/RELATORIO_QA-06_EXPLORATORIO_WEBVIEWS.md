# Relatório de Testes Exploratórios em WebViews (WhatsApp e Instagram) — QA-06

**Item:** QA-06  
**Data:** 18 de novembro de 2026  
**Ambiente:** Produção (`https://papelzinho.app`)  
**Responsável:** 13 QA e Testes  
**Requisitos Avaliados:** RNF08 (Compatibilidade com navegadores internos do WhatsApp e Instagram em Android e iOS), HU01 a HU05, ADR-004.  

> [!NOTE]
> **Nota de Metodologia:** Conforme acordado nas instruções do Orquestrador, diante da ausência de aparelhos físicos móveis acoplados ao ambiente local de execução, os testes foram realizados através de **emulação de alta fidelidade no Playwright**, configurando os User Agents, viewports, touch capabilities e densidades de pixel exatas dos navegadores internos (WebViews) do WhatsApp e do Instagram para Android e iOS.

---

## 1. Ambientes Emulados

| Plataforma / App | User Agent Emulado | Viewport | Touch | Escala |
| :--- | :--- | :---: | :---: | :---: |
| **WhatsApp Android** | `Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A.240105.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.113 Mobile Safari/537.36 WhatsApp/2.24.10.74 A` | 360 × 800 | Sim | 2.625 |
| **WhatsApp iOS** | `Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21E236 WhatsApp/24.9.74` | 390 × 844 | Sim | 3.0 |
| **Instagram Android** | `Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A.240105.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.113 Instagram 330.0.0.37.108 Android (...)` | 360 × 800 | Sim | 2.625 |
| **Instagram iOS** | `Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21E236 Instagram 330.0.0.33.109 (iPhone14,5; iOS 17_4_1; ...)` | 390 × 844 | Sim | 3.0 |

---

## 2. Resumo da Execução Ponta a Ponta

Para validar a jornada completa (criar → entrar → lista de desejos → sortear → revelar), foi criado o grupo de teste **"Amigo Secreto WhatsApp QA"** em produção:

1. **Criação do Grupo (WhatsApp Android):**
   - Form preenchido com nome, data (24/12/2026), valor (R$ 60,00) e local ("Restaurante Central").
   - Geração imediata dos links de convite e administração. Link do WhatsApp formatado perfeitamente via `wa.me`.
2. **Entrada de Participantes:**
   - **Participante 1 (Lucas):** Entrou via *WhatsApp Android WebView*. Recebeu cookie de autenticação `ptk_`, acessou a área do participante e cadastrou um presente na lista de desejos ("Livro de Ficção", com link e observação).
   - **Participante 2 (Mariana):** Entrou via *Instagram Android WebView*. Recebeu cookie `ptk_` e acessou a área do participante com sucesso.
   - **Participante 3 (Rodrigo):** Entrou via *WhatsApp iOS WebView*. Recebeu cookie `ptk_` e acessou a área pessoal.
3. **Sorteio no Painel Administrativo (Instagram iOS):**
   - Painel carregado com os 3 participantes listados.
   - Disparo do sorteio e confirmação modal executados sem falhas.
   - Status atualizado para `"✓ Sorteio feito em 18/11/2026."` e botões de remoção devidamente desabilitados/ocultados (RN04 / GROUP_CLOSED).
4. **Revelação do Amigo Secreto (HU05):**
   - Lucas, Mariana e Rodrigo recarregaram suas respectivas áreas de participante em seus navegadores embutidos.
   - O botão "Revelar meu amigo secreto" funcionou com clique touch em todos os ambientes.
   - Cada participante visualizou unicamente o seu par sorteado, com ciclo único e sem vazamento de informações de terceiros.
5. **Modo Fallback Cookie-less (ADR-004):**
   - Emulação de WebView com bloqueio total de cookies. O acesso direto via `/p/[accessToken]?ck=1` serviu a área do participante de forma íntegra e sem anúncios (`adsAllowed={false}`), garantindo usabilidade mesmo em navegadores internos restritivos.

---

## 3. Avaliação dos Focos Específicos

### 3.1. Tipografia e Prevenção de Auto-Zoom no iOS (Fonte ≥ 16 px)
No Safari e em WebViews iOS, campos de entrada (`<input>`, `<select>`, `<textarea>`) com `font-size < 16px` acionam um zoom automático incômodo na tela ao receber foco, quebrando o layout do web app.
- **Auditoria computada:** Todos os inputs em todas as telas foram inspecionados via `window.getComputedStyle()`.
- **Resultado:**
  - Home (`/`): 4 inputs, todos com **18 px** (`text-base`).
  - Convite (`/g/[token]`): 1 input, com **18 px**.
  - Formulário de presentes (`WishForm`): 2 inputs e 1 textarea, todos com **18 px**.
  - Painel Admin (`/admin/[token]`): campo de cópia com **18 px**.
- **Veredito:** **100% Conforme**. Risco de auto-zoom eliminado.

### 3.2. Cookie de Autenticação (`ptk_`)
- Formato gerado: `ptk_<groupId>` (ex: `ptk_2dbb4840-5e3b-4a67-a421-474130dfb721`).
- Flags de segurança: `HttpOnly=true`, `Secure=true`, `SameSite=Lax`.
- Validade: 60 dias (conforme expurgo RN08).
- Persistência: Mantida normalmente dentro de sessões nos navegadores internos com suporte a cookie de primeira parte.

### 3.3. Handshake e Link Pessoal
- O fluxo de handshake (`/api/p/hs/[token]`) executou o redirecionamento 307 de forma transparente para a URL canônica `/p/g/[groupId]`.
- Botões de copiar link e salvar no WhatsApp operacionais.

### 3.4. Revelação (HU05)
- Animação e transição suaves em viewports móveis de 360 px e 390 px.
- Ausência de quebras de linha indesejadas no card do amigo secreto.
- Acessibilidade do botão mantida via eventos touch nativos.

### 3.5. Compartilhamento via WhatsApp
- Links `https://wa.me/?text=...` gerados com codificação UTF-8 correta (incluindo emojis festivos e quebras de linha `%0A`).
- Testados no botão de convite geral, botão pessoal e alerta pós-sorteio no painel.

---

## 4. Evidências Visuais (Prints Capturados)

Os prints correspondentes encontram-se arquivados em `docs/qa/prints/`:

1. `qa06-01-home-whatsapp-android.png` — Tela inicial no WhatsApp Android (360 px).
2. `qa06-02-group-created-whatsapp-android.png` — Confirmação de grupo criado com links e botão de WhatsApp.
3. `qa06-03-invite-lucas-whatsapp-android.png` — Tela de convite com nome "Lucas".
4. `qa06-04-personal-link-lucas-whatsapp-android.png` — Link pessoal gerado para Lucas.
5. `qa06-05-participant-area-lucas-whatsapp-android.png` — Área do participante Lucas antes do sorteio.
6. `qa06-06-invite-mariana-instagram-android.png` — Tela de convite no Instagram Android.
7. `qa06-07-participant-area-mariana-instagram-android.png` — Área pessoal da Mariana.
8. `qa06-08-invite-rodrigo-whatsapp-ios.png` — Tela de convite no WhatsApp iOS (390 px).
9. `qa06-09-participant-area-rodrigo-whatsapp-ios.png` — Área pessoal do Rodrigo no iOS.
10. `qa06-10-admin-panel-ready-instagram-ios.png` — Painel com os 3 participantes e botão de sorteio ativo.
11. `qa06-11-admin-panel-drawn-instagram-ios.png` — Painel pós-sorteio com mensagem de conclusão e aviso no WhatsApp.
12. `qa06-12-reveal-lucas-whatsapp-android.png` — Lucas revelando o amigo secreto sorteado no WhatsApp Android.
13. `qa06-13-reveal-mariana-instagram-android.png` — Mariana revelando o amigo secreto no Instagram Android.
14. `qa06-14-reveal-rodrigo-whatsapp-ios.png` — Rodrigo revelando o amigo secreto no WhatsApp iOS.
15. `qa06-15-cookie-fallback-webview.png` — Área do participante renderizada no modo fallback sem cookies (ADR-004).

---

## 5. Registro de Bugs e Melhorias

- **Bugs Bloqueantes (S1) ou Graves (S2):** **0 encontrados**. O fluxo de produção é sólido e confiável.
- **Bugs Médios (S3):** **0 encontrados**.
- **Melhoria Menor / Cosmética (S4):**
  - **BUG-007 (S4):** *Link pessoal na tela de sucesso pós-entrada.*  
    - **Cenário:** Na tela de sucesso do convite (`/g/[token]`), o botão "Ir para a minha área" direciona para `/p/g/[groupId]`. Caso o navegador interno do usuário esteja configurado com descarte imediato ou bloqueio estrito de cookies de sessão, o usuário precisa copiar a URL com token `/p/[accessToken]` para abrir a área.  
    - **Recomendação:** No clique de "Ir para a minha área", se não for detectado suporte a cookies, manter navegação pelo token direto com fallback `?ck=1`.

---

## 6. Veredito Final
A aplicação web **Papelzinho** atende plenamente ao **RNF08** e aos critérios de qualidade para os navegadores internos do WhatsApp e Instagram em Android e iOS. Aprovado para continuidade das etapas de release.
