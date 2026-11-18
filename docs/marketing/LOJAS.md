# Fichas das Lojas e Privacidade — Papelzinho (APP-MKT-01)

Documento de referência para a publicação do aplicativo móvel **Papelzinho** na **Apple App Store** e no **Google Play Console**.
Responsável: Marketing · Revisores: 16 Designer (textos e capturas) e 15 Segurança (questionários de privacidade) · Versão: 18/11/2026.

Referências normativas e técnicas:
- Arquitetura: [ADR-005](../arquitetura/adr/005-app-mobile.md)
- Telas nativas e fluxos: [app-telas.md](../features/app-telas.md)
- Contrato da API e Push: [API-V1.md](../arquitetura/API-V1.md) (§5)
- Política de privacidade: [Política de Privacidade](../../app/privacidade/page.tsx) / `https://papelzinho.app/privacidade`
- Guia de publicação das lojas: [app-lojas.md](../ops/app-lojas.md)
- Diretriz de monetização: v1 lançada **sem anúncios (sem SDKs)** e **sem links de afiliados** ([APP-MON-01](../features/app-monetizacao.md)).

---

## 1. Dados cadastrais e metadados gerais

| Item | App Store (iOS) | Google Play Store (Android) |
|---|---|---|
| **Nome do aplicativo** | `Papelzinho: Amigo Secreto` (25 caracteres) | `Papelzinho: Amigo Secreto` (25 caracteres) |
| **Identificador (Bundle / Package)** | `app.papelzinho` | `app.papelzinho` |
| **Idioma principal** | Português (Brasil) — `pt-BR` | Português (Brasil) — `pt-BR` |
| **Categoria principal** | `Entretenimento` (Entertainment) | `Entretenimento` |
| **Categoria secundária** | `Estilo de Vida` (Lifestyle) | `Estilo de vida` / `Eventos` |
| **Classificação etária sugerida** | `4+` (Livre para todas as idades — avaliado pelo 15 Segurança) | `Livre` (Classificação IARC Livre — avaliado pelo 15 Segurança) |
| **Modelo de preço** | Gratuito (`Free`) | Gratuito (`Free`) |
| **Contém anúncios?** | Não (v1 sem SDK de anúncios) | Não (v1 sem SDK de anúncios) |
| **Compras no app (IAP)** | Não possui | Não possui |
| **URL da Política de Privacidade** | `https://papelzinho.app/privacidade` | `https://papelzinho.app/privacidade` |
| **URL de Suporte / Contato** | `https://papelzinho.app/contato` (ou `suporte@papelzinho.app`) | `suporte@papelzinho.app` |
| **URL de Marketing / Site Oficial** | `https://papelzinho.app` | `https://papelzinho.app` |

---

## 2. Ficha da Apple App Store (iOS)

### 2.1. Nome e Subtítulo
- **Nome do App (Title, máx. 30 caracteres):**
  `Papelzinho: Amigo Secreto`
  *(Contagem: 25 caracteres — dentro do limite de 30).*
- **Subtítulo (Subtitle, máx. 30 caracteres):**
  `Amigo secreto sem cadastro`
  *(Contagem: 26 caracteres — dentro do limite de 30).*

### 2.2. Palavras-chave (Keywords, máx. 100 bytes)
Termos separados exclusivamente por vírgula, sem espaços extras. "Amigo secreto" foi removido por já compor o título do aplicativo.
`amigo oculto,sorteio,presentes,natal,confraternização,festa,grupo,troca de presentes,fim de ano`
*(Contagem: 95 caracteres · 97 bytes em codificação UTF-8 — dentro do limite estrito de 100 bytes).*

### 2.3. Texto "O que há de novo" (What's New)
*Nota técnica: Na primeira submissão de um aplicativo novo na App Store (versão 1.0.0), o campo "O que há de novo" não existe no App Store Connect. O texto abaixo fica registrado como base para a primeira atualização pública (v1.0.1).*

```text
O Papelzinho é o jeito mais simples de organizar seu amigo secreto em família, com amigos ou no trabalho:
- Sem cadastro e sem senha: cada pessoa entra apenas com o nome.
- Compartilhamento fácil: envie o convite pelo menu nativo para o WhatsApp e outros apps.
- Avisos úteis: ative as notificações para saber quando o sorteio for realizado e lembrar da data do encontro.
- Lista de desejos: anote sugestões de presentes para orientar quem tirou você.
- Cada pessoa vê só quem tirou. O painel do organizador não mostra os pares.
```

### 2.4. Descrição Completa (Description, até 4.000 caracteres)
```text
Organize seu amigo secreto sem cadastro e sem complicação.

O Papelzinho foi feito para reunir famílias, turmas de amigos e equipes de trabalho em um amigo secreto leve, seguro e simples. Aqui ninguém precisa criar conta, digitar e-mail ou inventar senhas: basta criar o grupo, compartilhar o convite e cada participante entra apenas com o nome.

COMO FUNCIONA
1. Crie o grupo: informe o nome do grupo, valor máximo do presente e data do encontro (o local é opcional).
2. Compartilhe o convite: envie o link de convite pelo menu de compartilhamento (WhatsApp e outros aplicativos).
3. Cada pessoa entra: os participantes entram pelo link e informam apenas o nome.
4. Faça o sorteio: com pelo menos 3 participantes, o organizador confirma o sorteio.
5. Descubra quem tirou: cada participante abre o app para ver quem tirou. Cada pessoa vê só quem tirou. O painel do organizador não mostra os pares.

POR QUE ESCOLHER O PAPELZINHO?
• Sem cadastro e sem senha: você não precisa preencher formulários longos, lembrar de senhas nem confirmar e-mail.
• Sorteio protegido: cada pessoa vê só quem tirou. O painel do organizador não mostra os pares.
• Lista de desejos simples: adicione ideias de presentes (com links ou anotações) para orientar quem tirou você.
• Meus grupos reunidos: acompanhe todos os amigos secretos em que você está participando ou organizando no mesmo aparelho.
• Avisos no celular: ative as notificações para receber um aviso quando o sorteio for realizado e um lembrete antes da data do encontro (os avisos dependem da permissão do aparelho).
• 100% gratuito e sem anúncios: experiência limpa e focada no que importa, pensada para funcionar bem para qualquer idade.

PRIVACIDADE E SEGURANÇA
No Papelzinho, não exigimos dados bancários, documentos, telefone ou e-mail. Suas credenciais de acesso ficam guardadas de forma segura e criptografada no seu próprio dispositivo.

Dúvidas ou sugestões? Escreva para suporte@papelzinho.app.
```

---

## 3. Ficha do Google Play Console (Android)

### 3.1. Nome e Descrição Curta
- **Nome do App (Title, máx. 30 caracteres):**
  `Papelzinho: Amigo Secreto`
  *(Contagem: 25 caracteres — dentro do limite de 30).*
- **Descrição Curta (Short Description, máx. 80 caracteres):**
  `Amigo secreto sem cadastro e sem senha. Crie o grupo e faça o sorteio.`
  *(Contagem: exatamente 70 caracteres — dentro do limite de 80).*

### 3.2. Texto de Novidades da Versão (Release Notes — Versão 1.0.0)
```text
Chegou o Papelzinho para Android!
Organize seu amigo secreto sem cadastro e sem senha. Crie o grupo, compartilhe o convite pelo WhatsApp, monte sua lista de desejos e receba notificação quando o sorteio for feito (com permissão ativada).
```

### 3.3. Descrição Completa (Full Description, até 4.000 caracteres)
```text
Organize seu amigo secreto sem cadastro e sem complicação.

O Papelzinho foi feito para reunir famílias, turmas de amigos e equipes de trabalho em um amigo secreto leve, seguro e simples. Aqui ninguém precisa criar conta, digitar e-mail ou inventar senhas: basta criar o grupo, compartilhar o convite e cada participante entra apenas com o nome.

COMO FUNCIONA
1. Crie o grupo: informe o nome do grupo, valor máximo do presente e data do encontro (o local é opcional).
2. Compartilhe o convite: envie o link de convite pelo menu de compartilhamento (WhatsApp e outros aplicativos).
3. Cada pessoa entra: os participantes entram pelo link e informam apenas o nome.
4. Faça o sorteio: com pelo menos 3 participantes, o organizador confirma o sorteio.
5. Descubra quem tirou: cada participante abre o app para ver quem tirou. Cada pessoa vê só quem tirou. O painel do organizador não mostra os pares.

POR QUE USAR O PAPELZINHO?
• Sem cadastro e sem senha: esqueça cadastros chatos e senhas perdidas. O acesso é prático e direto.
• Sorteio protegido: cada pessoa vê só quem tirou. O painel do organizador não mostra os pares.
• Lista de desejos simples: anote sugestões de presentes para ajudar quem tirou você na brincadeira.
• Todos os seus grupos no mesmo lugar: organize o amigo secreto da família e participe do amigo secreto da empresa no mesmo aparelho.
• Avisos no celular: ative as notificações para receber um aviso quando o sorteio for realizado e um lembrete antes da data do encontro (os avisos dependem da permissão do aparelho).
• Gratuito e sem anúncios: visual limpo no Estilo Notion, acessível e fácil de usar para todas as idades.

PRIVACIDADE E SEGURANÇA
O Papelzinho respeita sua privacidade. Não pedimos e-mail, telefone, documentos ou dados bancários. Suas credenciais ficam salvas de forma segura no seu próprio aparelho.

Contato e suporte: suporte@papelzinho.app
```

---

## 4. Plano de 5 Capturas de Tela (Screenshots)

O plano de capturas segue o visual nativo especificado em `docs/features/app-telas.md` e o Estilo Notion (fundo papel quente, cartões brancos com borda fina, tipografia clara do sistema e sem ilustrações genéricas).

### 4.1. Requisitos Técnicos e Resoluções das Lojas
- **Origem das imagens:** Devem ser geradas exclusivamente a partir da build candidata de cada plataforma (iOS e Android), rodando em simuladores/emuladores oficiais ou dispositivos de teste.
- **Privacidade e fidelidade:** Devem utilizar estritamente dados fictícios ("Família Silva", "Turma da Escola", "Ana", "Rafael", "Joana"). Nunca expor tokens reais, links de acesso privados ou dados de pessoas reais.
- **Dimensões aceitas na Apple App Store:**
  - 1290 × 2796 pixels (iPhone 6.7" / tela cheia) é um tamanho aceito, não o único.
  - 1242 × 2208 pixels (iPhone 5.5" / proporção 16:9 tradicional) também é aceito e exigido para telas de 5.5", conforme as [especificações oficiais da Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) (outras resoluções homologadas incluem 1242 × 2688 px para 6.5" e 1320 × 2868 px para 6.9").
  - iPad Pro (se habilitado para tablets): 2048 × 2732 pixels.
  - Formato: PNG ou JPEG sem canal alfa (RGB).
- **Dimensões aceitas no Google Play Console:**
  - De 2 a 8 capturas de telefone (smartphones).
  - Dimensões entre 320 px e 3840 px (lado maior não pode exceder o dobro do lado menor).
  - Resolução padrão recomendada: 1080 × 1920 pixels (proporção 9:16 vertical).
  - Formato: JPEG ou PNG de 24 bits, até 8 MB por imagem.

### 4.2. Roteiro das 5 Capturas Oficiais

| # | Tela base (`app-telas.md`) | Título no topo (Cartaz) | Mensagem de apoio / Subtítulo | Elementos da interface visíveis na captura |
|---|---|---|---|---|
| **1** | **Criar grupo** (`mobile/app/create.tsx`) | **Crie o seu grupo** | Sem cadastro, sem senha e sem formulários demorados. | Cabeçalho com botão voltar "< Meus grupos", título "Criar grupo", campos preenchidos: Nome do grupo ("Família Silva"), Valor máximo ("R$ 50,00"), Data do encontro ("20/12/2026"), Local do encontro ("Casa da vó" com indicação visual de opcional) e botão principal ativo "Criar grupo". |
| **2** | **Compartilhar convite** (Confirmação pós-criação) | **Compartilhe o convite** | Envie para o grupo pelo WhatsApp ou por outro aplicativo. | Cartão de confirmação "Grupo criado", botão em destaque "Compartilhar convite" (acionando a folha/menu de compartilhamento nativo do sistema operacional, exibindo WhatsApp e outros apps como opção de envio) e botão secundário "Copiar link". |
| **3** | **Meus grupos** (`mobile/app/index.tsx`) | **Todos os seus grupos reunidos** | Acompanhe família, amigos e trabalho no mesmo aparelho. | Tela inicial com logo Papelzinho, botão "Criar grupo" no topo e dois cartões de grupos salvos no SecureStore: "Família Silva" (Organizador · Entradas abertas · Encontro em 20/12/2026) e "Turma da Escola" (Participante · Sorteio feito · Encontro em 22/12/2026). |
| **4** | **Painel do organizador** (`mobile/app/admin/[adminToken].tsx`) | **Sorteio protegido** | Com 3 ou mais pessoas, faça o sorteio. O painel do organizador não mostra os pares. | Estado estritamente **pré-sorteio** (sem avisos de encerramento de entradas ou de pós-sorteio): detalhes do grupo (data do encontro, valor máximo, local opcional), botões de convite ("Compartilhar convite" e "Copiar link"), contador de participantes ("Participantes (3 de 100)"), lista com nomes fictícios ("Ana", "Rafael", "Joana") com botão "Remover", e o botão ativo "Fazer o sorteio". |
| **5** | **Área do participante** (`mobile/app/p/g/[groupId].tsx`) | **Descubra quem tirou e dê dicas** | Cada pessoa vê só quem tirou. Monte sua lista de presentes. | Área do participante após sorteio com rótulos reais de interface: cartão de revelação fechado com botão de ação **"Revelar meu amigo secreto"** (sem exibir o resultado na foto de vitrine); seção intitulada **"Lista de desejos"** com 2 itens fictícios cadastrados e botão **"Adicionar presente"**. |

---

## 5. Questionários de Privacidade das Lojas

As respostas abaixo refletem fielmente a arquitetura sem cadastro do Papelzinho, a política publicada em `https://papelzinho.app/privacidade` e o contrato da API v1 (`docs/arquitetura/API-V1.md` §5). Submetido para revisão e validação final da Segurança (15 Segurança & LGPD).

### Arquitetura de Infraestrutura e Processamento de Dados
O aplicativo Papelzinho opera com a seguinte infraestrutura técnica:
- **Servidor do Papelzinho (Next.js):** hospeda a aplicação web e executa as rotas da API v1 consumidas pelo aplicativo móvel.
- **Supabase:** banco de dados PostgreSQL relacional gerenciado e criptografado para persistência de dados.
- **Expo (EAS Push Notifications):** serviço de mensageria para tráfego e entrega técnica de notificações push aos serviços oficiais da Apple (APNs) e Google (FCM).

---

### 5.1. Apple App Store — Rótulo de Privacidade (App Privacy Details)

> **Diretriz da Apple:** Nas regras da App Store ([Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)), não existe a exceção de que prestador de serviço não seja compartilhamento. A Apple exige que toda coleta realizada pelo próprio aplicativo ou por bibliotecas/parceiros integrados (como Expo e Supabase) seja declarada. Declara-se, portanto, a coleta dos dados para a finalidade de Funcionalidade do App (`App Functionality`), com o respectivo vínculo ao participante (`Data Linked to You`) e categoricamente sem rastreamento (`No Tracking`).

#### A. O app realiza rastreamento de usuários (Data Used to Track You)?
- **Resposta:** **NÃO**.
- **Justificativa:** O aplicativo não utiliza identificador de publicidade (IDFA), não conecta dados do usuário com dados de terceiros para publicidade direcionada e não compartilha dados com corretores de dados (data brokers).

#### B. Os dados coletados são vinculados à pessoa (Data Linked to You)?
- **Resposta:** **SIM**.
- **Justificativa:** Embora o Papelzinho não exija cadastro, senha ou dados civis (CPF, e-mail), perante a modelagem da Apple os dados operacionais coletados (token push gerenciado pelo Expo, nome e lista de desejos armazenados no banco Supabase) ficam vinculados ao mesmo registro do participante no grupo.

#### C. Detalhamento dos dados vinculados à pessoa (Data Linked to You):

1. **Identificadores (Identifiers) — ID do Dispositivo (Device ID):**
   - **Coletado?** **SIM** (condicionado ao consentimento explícito do usuário nas notificações).
   - **Qual dado:** `ExpoPushToken` (token de notificação push emitido pelo Expo para entrega via APNs).
   - **Finalidade:** **Funcionalidade do App (App Functionality)** — enviar avisos de sorteio realizado e lembrete da data do encontro.
   - **Vinculado à pessoa (Data Linked to You)?** **SIM**.
   - **Usado para rastreamento (Tracking)?** **NÃO**.
   - **Observação:** O registro só ocorre se o usuário autorizar explicitamente a permissão de notificações do sistema operacional. O participante pode a qualquer momento clicar em "Desativar avisos" na área pessoal do app (`mobile/app/p/g/[groupId].tsx`), o que revoga e apaga imediatamente o cadastro deste aparelho no servidor.

2. **Informações de Contato (Contact Info) — Nome (Name):**
   - **Coletado?** **SIM**.
   - **Qual dado:** Nome ou apelido informado informalmente pelo participante ao entrar no grupo.
   - **Finalidade:** **Funcionalidade do App (App Functionality)** — identificar o participante no grupo e viabilizar o sorteio.
   - **Vinculado à pessoa (Data Linked to You)?** **SIM**.
   - **Usado para rastreamento (Tracking)?** **NÃO**.

3. **Conteúdo do Usuário (User Content) — Outro Conteúdo do Usuário (Other User Content):**
   - **Coletado?** **SIM** (opcional).
   - **Qual dado:** Sugestões cadastradas na lista de desejos (título, observação e link opcional) fornecidas voluntariamente pelo participante.
   - **Finalidade:** **Funcionalidade do App (App Functionality)** — orientar quem tirou a pessoa no amigo secreto.
   - **Vinculado à pessoa (Data Linked to You)?** **SIM**.
   - **Usado para rastreamento (Tracking)?** **NÃO**.

#### D. Dados não vinculados à pessoa (Data Not Linked to You):

1. **Diagnóstico e Dados de Uso (Diagnostics / Usage Data):**
   - **Coletado?** **SIM** (apenas dados técnicos operacionais agregados).
   - **Qual dado:** Registros anônimos de requisições ao servidor Next.js da API (status HTTP, contadores operacionais agregados).
   - **Finalidade:** **Funcionalidade do App (App Functionality)** e manutenção da estabilidade do serviço.
   - **Vinculado à pessoa?** **NÃO**.
   - **Usado para rastreamento?** **NÃO**.

---

### 5.2. Google Play Store — Seção de Segurança de Dados (Data Safety Section)

> **Diretriz do Google Play sobre Prestadores de Serviço:** Conforme as diretrizes oficiais do Google Play ([Google Play Data Safety Help](https://support.google.com/googleplay/android-developer/answer/10787469), seção *Data sharing / Service Providers*), a transferência de dados para parceiros técnicos (como Supabase para banco de dados e Expo para push) **não é considerada compartilhamento de dados (Data Sharing)** quando o prestador processa os dados estritamente em nome do desenvolvedor e sob suas instruções contratuais. Portanto, na seção de compartilhamento declara-se **NÃO**.

#### A. Coleta e Compartilhamento de Dados (Data Collection and Sharing)
- **O app coleta ou compartilha algum dos tipos de dados de usuários necessários?** **SIM** (coleta apenas; não compartilha dados com terceiros).
- **Todos os dados coletados pelo app são criptografados em trânsito?** **SIM** (todas as comunicações entre o app, o servidor Next.js e o banco utilizam exclusivamente HTTPS/TLS criptografado).
- **O app oferece aos usuários uma forma de solicitar a exclusão de seus dados?** **SIM**, operacionalizado por três canais e mecanismos complementares:
  1. **Revogação imediata do push no app:** A pessoa participante usa a opção "Desativar avisos" na área pessoal do app (`mobile/app/p/g/[groupId].tsx`), o que revoga e apaga imediatamente o cadastro deste aparelho e seu token push no servidor.
  2. **Canal de exclusão sob demanda:** A pessoa usuária pode solicitar a exclusão antecipada de seus dados a qualquer momento pelo canal oficial de suporte via e-mail: `suporte@papelzinho.app`.
  3. **Exclusão automática por ciclo de vida:** Todos os dados do grupo (participantes, nomes, listas de desejos e metadados) são permanentemente expurgados do banco de dados 60 dias após a data do encontro (sem prometer prazo fixo contado da data de coleta, visto que os dados acompanham o ciclo de vida do evento; a v1 do app não possui recurso manual de "remover grupo").

#### B. Detalhamento dos tipos de dados coletados (nenhum é compartilhado com terceiros):

1. **Informações pessoais (Personal info):**
   - **Dado:** Nome (`Name`).
   - **Coletado:** Sim (nome informal ou apelido fornecido ao participar de um grupo).
   - **Compartilhado:** Não. O banco de dados (Supabase) atua estritamente como prestador de serviço de processamento sob contrato e em nome do desenvolvedor.
   - **Finalidade:** Funcionalidade do app (`App functionality`).
   - **Opcional ou Obrigatório:** Obrigatório para participar do sorteio no grupo.

2. **Conteúdo gerado pelo usuário (User content):**
   - **Dado:** Outro conteúdo gerado pelo usuário (itens e observações da lista de desejos).
   - **Coletado:** Sim.
   - **Compartilhado:** Não.
   - **Finalidade:** Funcionalidade do app (`App functionality`).
   - **Opcional ou Obrigatório:** Opcional (o participante pode ou não cadastrar sugestões de presentes).

3. **IDs do dispositivo ou outros (Device or other IDs):**
   - **Dado:** ID do dispositivo (token de notificação push `ExpoPushToken`).
   - **Coletado:** Sim (apenas com permissão explícita de notificação concedida no aparelho).
   - **Compartilhado:** Não. O envio do token ao Expo ocorre exclusivamente na qualidade de prestador de serviço técnico para despacho de notificações aos serviços FCM/APNs sob instruções do desenvolvedor, enquadrando-se na exceção oficial de Service Providers do Google Play.
   - **Finalidade:** Funcionalidade do app (`App functionality`).
   - **Opcional ou Obrigatório:** Opcional (o usuário pode recusar notificações e utilizar o app normalmente).

#### C. Declaração do Programa para Famílias (Target Audience & Content):
- **Faixa etária principal:** 18 anos ou mais / Público geral.
- **O app é direcionado a crianças?** **Não**. O aplicativo é para uso geral (famílias e amigos de todas as idades), sem temas infantis específicos.
- **Anúncios no app:** **Não** (o aplicativo v1 não contém anúncios).

---

## 6. Checklist de Validação Pré-Submissão

- [ ] Caixa de entrada e recebimento de e-mails de suporte (`suporte@papelzinho.app`) confirmados pelo Rodrigo antes da submissão às lojas.
- [ ] URL da política de privacidade (`https://papelzinho.app/privacidade`) ativa e acessível publicamente.
- [ ] Endpoints de verificação de Universal Links (`/.well-known/apple-app-site-association`) e App Links (`/.well-known/assetlinks.json`) validados em produção.
- [ ] Contas de desenvolvedor ativas (Apple Developer Program e Google Play Console com período de testes fechados de 14 dias concluído).
- [ ] Versão de build compilada via EAS Build sem referências a SDKs de publicidade ou bibliotecas de rastreamento de terceiros.
- [ ] Fichas revisadas e aprovadas pelo 16 Designer (textos e capturas) e 15 Segurança (declarações de privacidade).
