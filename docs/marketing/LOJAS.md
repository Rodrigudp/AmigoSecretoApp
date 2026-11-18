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
| **Classificação etária sugerida** | `4+` (Livre para todas as idades) | `Livre` (Classificação IARC Livre) |
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

### 2.2. Palavras-chave (Keywords, máx. 100 caracteres)
Termos separados exclusivamente por vírgula, sem espaços extras para otimização de espaço:
`amigo secreto,amigo oculto,sorteio,presentes,natal,confraternização,festa,grupo,troca de presentes`
*(Contagem: 98 caracteres — dentro do limite de 100).*

### 2.3. Texto "O que há de novo" (What's New — Versão 1.0.0)
```text
Bem-vindo ao Papelzinho!

O jeito mais simples e rápido de organizar seu amigo secreto em família, com amigos ou no trabalho:
- Sem cadastro e sem senha: cada pessoa entra apenas com o nome.
- Compartilhamento fácil: envie o convite direto para o WhatsApp.
- Notificações úteis: saiba na hora em que o sorteio for realizado e receba lembrete antes do encontro.
- Lista de desejos: anote sugestões de presentes para ajudar quem tirou você.
- Sigilo garantido: o painel não mostra os pares e cada um só vê o seu próprio resultado.
```

### 2.4. Descrição Completa (Description, até 4.000 caracteres)
```text
Organize seu amigo secreto em 2 minutos, sem cadastro e sem complicação.

O Papelzinho foi feito para reunir famílias, turmas de amigos e equipes de trabalho em uma troca de presentes leve, segura e rápida. Aqui ninguém precisa criar conta, digitar e-mail ou inventar senhas: basta criar o grupo, enviar o convite pelo WhatsApp e cada participante entra apenas com o nome.

COMO FUNCIONA
1. Crie o grupo: informe o nome do grupo, valor máximo do presente, data e local do encontro.
2. Compartilhe o convite: envie o link de convite direto no grupo do WhatsApp da família ou dos amigos.
3. Cada pessoa entra: os participantes entram pelo link e informam apenas o nome.
4. Faça o sorteio: quando todo mundo tiver entrado (a partir de 3 pessoas), o organizador faz o sorteio com um toque.
5. Descubra quem tirou: cada participante abre o app e vê o seu sorteado em segredo.

POR QUE ESCOLHER O PAPELZINHO?
• Sem cadastro e sem senha: você não precisa preencher formulários longos, lembrar de senhas nem confirmar e-mail.
• Sigilo absoluto: o sorteio é protegido. Nem o organizador nem os participantes conseguem ver os pares sorteados.
• Lista de desejos simples: adicione ideias de presentes (com links ou anotações) para orientar quem tirou você.
• Meus grupos reunidos: acompanhe todos os amigos secretos em que você está participando ou organizando no mesmo aparelho.
• Notificações no celular: receba um aviso assim que o organizador fizer o sorteio e um lembrete antes do dia do encontro.
• 100% gratuito e sem anúncios: experiência limpa e focada no que importa, pensada para funcionar bem para qualquer idade.

PRIVACIDADE E SEGURANÇA
No Papelzinho, seus dados pessoais não são vendidos nem compartilhados. Não exigimos dados bancários, documentos, telefone ou e-mail. Suas credenciais de acesso ficam guardadas de forma segura e criptografada no seu próprio dispositivo.

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
  *(Contagem: 71 caracteres — dentro do limite de 80).*

### 3.2. Texto de Novidades da Versão (Release Notes — Versão 1.0.0)
```text
Chegou o Papelzinho para Android!
Organize seu amigo secreto em 2 minutos, sem cadastro e sem senha. Crie o grupo, envie o convite pelo WhatsApp, monte sua lista de desejos e receba notificação assim que o sorteio for feito.
```

### 3.3. Descrição Completa (Full Description, até 4.000 caracteres)
```text
Organize seu amigo secreto em 2 minutos, sem cadastro e sem complicação.

O Papelzinho foi feito para reunir famílias, turmas de amigos e equipes de trabalho em uma troca de presentes leve, segura e rápida. Aqui ninguém precisa criar conta, digitar e-mail ou inventar senhas: basta criar o grupo, enviar o convite pelo WhatsApp e cada participante entra apenas com o nome.

COMO FUNCIONA
1. Crie o grupo: informe o nome do grupo, valor máximo do presente, data e local do encontro.
2. Compartilhe o convite: envie o link de convite direto no grupo do WhatsApp da família ou dos amigos.
3. Cada pessoa entra: os participantes entram pelo link e informam apenas o nome.
4. Faça o sorteio: quando todo mundo tiver entrado (a partir de 3 pessoas), o organizador faz o sorteio com um toque.
5. Descubra quem tirou: cada participante abre o app e vê o seu sorteado em segredo.

POR QUE USAR O PAPELZINHO?
• Sem cadastro e sem senha: esqueça cadastros chatos e senhas perdidas. O acesso é prático e direto.
• Sigilo absoluto: o algoritmo garante um sorteio justo onde ninguém tira a si mesmo e ninguém vê os pares além do próprio sorteado.
• Lista de desejos simples: anote sugestões de presentes para ajudar quem tirou você na brincadeira.
• Todos os seus grupos no mesmo lugar: organize o amigo secreto da família e participe do amigo secreto da empresa no mesmo aparelho.
• Notificações no celular: seja avisado na hora quando o sorteio acontecer e receba lembretes sobre a data da troca.
• Gratuito e sem anúncios: visual limpo no Estilo Notion, acessível e fácil de usar para todas as idades.

PRIVACIDADE E RESPEITO AOS SEUS DADOS
O Papelzinho respeita sua privacidade. Não coletamos dados de contato desnecessários, não vendemos informações e não exibimos publicidade.

Contato e suporte: suporte@papelzinho.app
```

---

## 4. Plano de 5 Capturas de Tela (Screenshots)

O plano de capturas segue o visual nativo especificado em `docs/features/app-telas.md` e o Estilo Notion (fundo papel quente, cartões brancos com borda fina, tipografia clara e sem elementos genéricos de IA). Dimensões recomendadas: iPhone 6.7" (1290 × 2796 px) e 6.5" (1242 × 2688 px); Android Smartphone (1080 × 2400 px).

| # | Tela base (`app-telas.md`) | Título no topo (Cartaz) | Mensagem de apoio / Subtítulo | Elementos da interface visíveis na captura |
|---|---|---|---|---|
| **1** | **Criar grupo** (`create.tsx`) | **Crie em 2 minutos** | Sem cadastro, sem senha e sem formulários demorados. | Formulário limpo com campos: Nome do grupo ("Família Silva"), Valor máximo ("R$ 50,00"), Data do encontro ("20/12/2026"), Local ("Casa da vó") e o botão principal "Criar grupo". |
| **2** | **Compartilhar convite** (`created`) | **Convide pelo WhatsApp** | Envie o convite para o grupo. Cada pessoa entra só com o nome. | Cartão de confirmação de grupo criado com botão em destaque "Compartilhar convite" (acionando o menu de compartilhamento do sistema) e "Copiar link". |
| **3** | **Meus grupos** (`index.tsx`) | **Todos os seus grupos reunidos** | Acompanhe família, amigos e trabalho no mesmo aparelho. | Tela inicial listando dois cartões reais de grupos: "Família Silva" (Organizador · Entradas abertas · Encontro em 20/12) e "Turma da Escola" (Participante · Sorteio feito · Encontro em 22/12). |
| **4** | **Painel do organizador** (`admin/[adminToken].tsx`) | **Sorteio justo e secreto** | Com 3 ou mais pessoas, faça o sorteio. Ninguém vê os pares. | Cabeçalho do grupo, contador de participantes ("3 de 100"), lista com nomes (Ana, Rafael, Joana) e botão ativo "Fazer o sorteio", com o aviso de que o painel não mostra os resultados. |
| **5** | **Área do participante** (`p/[accessToken].tsx`) | **Descubra quem tirou e dê dicas** | Cartão de revelação secreto e lista de desejos para ajudar seu par. | Cartão pêssego com botão "Revelar" para ver quem tirou, seguido pela seção "Sua lista de desejos" com 2 sugestões cadastradas e botão "+ Adicionar presente". |

---

## 5. Questionários de Privacidade das Lojas

As respostas abaixo refletem fielmente a arquitetura sem cadastro do Papelzinho, a política publicada em `https://papelzinho.app/privacidade` e o contrato da API v1 (`docs/arquitetura/API-V1.md` §5).

### 5.1. Apple App Store — Rótulo de Privacidade (App Privacy Details)

#### A. O app realiza rastreamento de usuários (Data Used to Track You)?
- **Resposta:** **NÃO**.
- **Justificativa:** O aplicativo não utiliza identificador de publicidade (IDFA), não conecta dados do usuário com dados de terceiros para publicidade direcionada e não compartilha dados com corretores de dados (data brokers).

#### B. Os dados coletados são vinculados à identidade do usuário (Data Linked to You)?
- **Resposta:** **NÃO**.
- **Justificativa:** O aplicativo não possui contas pessoais, autenticação federada (Google/Apple/Facebook), e-mail de login, CPF ou número de telefone. As credenciais locais são geradas aleatoriamente por grupo e mantidas no SecureStore do aparelho.

#### C. Dados coletados pelo app (Data Not Linked to You):

1. **Identificadores (Identifiers) — ID do Dispositivo (Device ID):**
   - **Coletado?** **SIM**, condicionado ao consentimento do usuário.
   - **Qual dado:** `ExpoPushToken` (token de notificação push do aparelho, emitido pelo serviço do Expo).
   - **Finalidade:** **Funcionalidade do App (App Functionality)** — exclusivamente para enviar avisos do sorteio realizado e lembrete do encontro.
   - **Vinculado à identidade?** **Não**.
   - **Usado para rastreamento?** **Não**.
   - **Observação:** O registro só ocorre se o usuário autorizar explicitamente a permissão de notificações do sistema operacional. O token é revogado e apagado do servidor assim que o usuário exclui o grupo ou remove a permissão.

2. **Conteúdo do Usuário (User Content):**
   - **Coletado?** **SIM**.
   - **Qual dado:**
     - **Nome ou apelido:** informado informalmente pelo participante ao entrar no grupo.
     - **Lista de desejos:** título do item, observação e link opcional informados voluntariamente pelo participante.
   - **Finalidade:** **Funcionalidade do App (App Functionality)** — viabilizar o sorteio e permitir que o amigo secreto veja o nome e as preferências do sorteado.
   - **Vinculado à identidade?** **Não** (não há verificação de identidade civil, nem associação com perfil).
   - **Usado para rastreamento?** **Não**.

3. **Diagnóstico e Dados de Uso (Diagnostics / Usage Data):**
   - **Coletado?** **SIM** (apenas dados técnicos de infraestrutura).
   - **Qual dado:** Registros anônimos de requisições à API (status HTTP, contadores operacionais agregados de grupos criados e sorteios realizados).
   - **Finalidade:** **Funcionalidade do App (App Functionality)** e manutenção da estabilidade do serviço.
   - **Vinculado à identidade?** **Não**.
   - **Usado para rastreamento?** **Não**.

---

### 5.2. Google Play Store — Seção de Segurança de Dados (Data Safety Section)

#### A. Coleta e Compartilhamento de Dados (Data Collection and Sharing)
- **O app coleta ou compartilha algum dos tipos de dados de usuários necessários?** **SIM** (coleta apenas; não compartilha).
- **Todos os dados coletados pelo app são criptografados em trânsito?** **SIM** (todas as comunicações com o servidor utilizam exclusivamente HTTPS/TLS).
- **O app oferece aos usuários uma forma de solicitar a exclusão de seus dados?** **SIM** (o participante pode remover seu token push no app, e todos os dados de grupos, participantes e listas são permanentemente expurgados do banco de dados 60 dias após a data do encontro).

#### B. Detalhamento dos tipos de dados coletados (nenhum é compartilhado com terceiros):

1. **Informações pessoais (Personal info):**
   - **Dado:** Nome (`Name`).
   - **Coletado:** Sim (nome informal ou apelido fornecido ao participar de um grupo).
   - **Compartilhado:** Não.
   - **Finalidade:** Funcionalidade do app (`App functionality`).
   - **Opcional ou Obrigatório:** Obrigatório para participar do sorteio no grupo.

2. **Conteúdo gerado pelo usuário (User content):**
   - **Dado:** Outro conteúdo gerado pelo usuário (itens e observações da lista de desejos).
   - **Coletado:** Sim.
   - **Compartilhado:** Não.
   - **Finalidade:** Funcionalidade do app (`App functionality`).
   - **Opcional ou Obrigatório:** Opcional (o participante pode ou não cadastrar sugestões de presentes).

3. **IDs do dispositivo ou outros (Device or other IDs):**
   - **Dado:** ID do dispositivo (token de notificação push).
   - **Coletado:** Sim (apenas com permissão de notificação concedida).
   - **Compartilhado:** Não.
   - **Finalidade:** Funcionalidade do app (`App functionality`).
   - **Opcional ou Obrigatório:** Opcional (o usuário pode recusar notificações e continuar usando o app normalmente).

#### C. Declaração do Programa para Famílias (Target Audience & Content):
- **Faixa etária principal:** 18 anos ou mais / Público geral.
- **O app é direcionado a crianças?** **Não**. O aplicativo é para uso geral (famílias e amigos de todas as idades), sem temas infantis específicos.
- **Anúncios no app:** **Não** (o aplicativo v1 não contém anúncios).

---

## 6. Checklist de Validação Pré-Submissão

- [ ] URLs de suporte (`suporte@papelzinho.app`) e privacidade (`https://papelzinho.app/privacidade`) ativas e acessíveis.
- [ ] Endpoints de verificação de Universal Links (`/.well-known/apple-app-site-association`) e App Links (`/.well-known/assetlinks.json`) validados em produção.
- [ ] Contas de desenvolvedor ativas (Apple Developer Program e Google Play Console com período de testes fechados de 14 dias concluído).
- [ ] Versão de build compilada via EAS Build sem referências a SDKs de publicidade ou bibliotecas de rastreamento de terceiros.
- [ ] Fichas revisadas e aprovadas pelo 16 Designer (textos e capturas) e 15 Segurança (declarações de privacidade).
