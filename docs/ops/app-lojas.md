# Guia de Publicação nas Lojas Mobile & CI/CD — Papelzinho (APP-OPS-01)

Este documento orienta o Product Owner (Rodrigo) no processo completo de criação das contas de desenvolvedor pessoa física (Apple e Google), descreve a estratégia de CI/CD via **EAS Build / EAS Submit**, e detalha o funcionamento dos endpoints de verificação de **Deep Linking** (Android App Links e Apple Universal Links) servidos pelo Next.js em `https://papelzinho.app`.

---

## 1. Identificadores e Visão Geral

- **Nome do Aplicativo:** Papelzinho (Amigo Secreto)
- **Package Name (Android):** `app.papelzinho`
- **Bundle Identifier (iOS):** `app.papelzinho`
- **Tecnologia:** Expo (React Native + TypeScript) em subdiretório `mobile/` integrado ao monorepo.
- **Relação com o Site Web:** O site web (`https://papelzinho.app`) segue no ar de forma independente para o lançamento de 28/11/2026. O aplicativo mobile consome a API v1 do backend e é acionado automaticamente quando o usuário abre links de convite (`/g/...`), participante (`/p/...`) ou organizador (`/admin/...`) em dispositivos compatíveis.

---

## 2. Apple Developer Program (Pessoa Física)

Para publicar na App Store e gerar certificados de push notification e Universal Links, é necessário cadastrar uma conta individual no Apple Developer Program.

### 2.1. Pré-requisitos
- **Apple ID Pessoal:** com Autenticação em Dois Fatores (2FA) ativada.
- **Dispositivo Apple:** iPhone, iPad ou Mac com Touch ID, Face ID ou código de acesso configurado.
- **Documento de Identidade:** Documento oficial com foto (RG, CNH ou Passaporte) emitido pelo governo, com nome civil exatamente correspondente aos dados do Apple ID.
- **Cartão de Crédito:** Habilitado para transações internacionais.
- **D-U-N-S Number:** **NÃO é necessário para pessoa física**. O número D-U-N-S é exigido exclusivamente para contas empresariais (Pessoa Jurídica / Organization).

### 2.2. Custos Oficiais e Prazos
- **Custo Oficial:** **US$ 99 por ano** (cobrado em dólares no cartão internacional ou equivalente em moeda local conforme taxa de câmbio/tributos vigentes).
- **Periodicidade:** Anual (renovação automática até cancelamento).
- **Prazos:**
  - Validação de identidade e processamento do pagamento: normalmente de **24 a 48 horas úteis**.
  - Aprovação de revisões de builds (App Review): média de **24 a 48 horas** por versão enviada.
- **Fontes Oficiais:**
  - Inscrição: [Apple Developer Enrollment](https://developer.apple.com/programs/enroll/)
  - Requisitos de Conta Individual: [Apple Support - Enrolling as an Individual](https://developer.apple.com/support/enrollment/)
  - Diretrizes de Revisão da App Store: [App Store Review Guidelines (Guideline 4.2 Minimum Functionality)](https://developer.apple.com/app-store/review/guidelines/)

### 2.3. Passo a Passo de Inscrição (Recomendado via App Apple Developer)
1. Instale o aplicativo **Apple Developer** no iPhone ou iPad através da App Store.
2. Abra o app, acerte as permissões e toque na aba **Conta** (Account).
3. Toque em **Inscrever-se agora** (Enroll Now).
4. Verifique as informações pessoais (Nome, Sobrenome, E-mail, Endereço residencial).
5. Fotografe o documento oficial com foto e confirme a identidade via biometria facial do aparelho.
6. Selecione a opção de conta **Individual / Sole Proprietor**.
7. Leia e aceite os termos do contrato de desenvolvedor (Apple Developer Program License Agreement).
8. Conclua o pagamento de US$ 99 via Apple Pay ou cartão internacional.
9. Após a confirmação, guarde o **Apple Team ID** (código alfanumérico de 10 caracteres visível em [Apple Developer Membership](https://developer.apple.com/account)).

> [!NOTE]
> Em contas individuais da Apple, o nome público que aparece abaixo do aplicativo na App Store é o nome civil do titular (ex: *Rodrigo Del Padre*). Para exibir um nome fantasia, a Apple exige conversão para conta jurídica com CNPJ e D-U-N-S.

---

## 3. Google Play Console (Pessoa Física)

O Google Play Console permite a distribuição do aplicativo para dispositivos Android no mundo inteiro.

### 3.1. Pré-requisitos
- **Conta Google Pessoal:** com verificação em duas etapas (2FA) ativa.
- **Cartão de Crédito ou Débito Internacional:** para pagamento da taxa de registro.
- **Documento Oficial de Identidade:** RG ou CNH válido com foto.
- **Comprovante de Endereço:** Conta de consumo recente (luz, água, telefone, banco) no nome do titular e no país informado.

### 3.2. Custos Oficiais e Prazos
- **Custo Oficial:** Taxa única de **US$ 25** (vitalícia, sem anuidades).
- **Prazos:**
  - Verificação de identidade do desenvolvedor: **24 a 72 horas úteis**.
  - Revisão de novos aplicativos na Play Store: **3 a 7 dias úteis**.
- **Fontes Oficiais:**
  - Como se registrar: [Google Play Console - Como criar uma conta de desenvolvedor](https://support.google.com/googleplay/android-developer/answer/6112465)
  - Requisitos de teste para novas contas pessoais: [Google Play Console - Requisitos de teste para contas pessoais](https://support.google.com/googleplay/android-developer/answer/14151465)

### 3.3. Passo a Passo de Cadastro
1. Acesse o portal [Google Play Console Sign-up](https://play.google.com/console/signup).
2. Selecione a opção **Conta pessoal** (Personal Account).
3. Preencha os dados do desenvolvedor:
   - Nome do desenvolvedor (nome público que aparece na loja, pode ser fantasia, ex: *Papelzinho*).
   - E-mail de contato público e número de telefone celular (validado via código SMS).
4. Aceite os termos do Contrato de Distribuição do Desenvolvedor do Google Play.
5. Efetue o pagamento da taxa única de US$ 25 com cartão internacional.
6. Conclua a verificação de identidade em **Configurações da conta > Verificação de identidade**, enviando foto do RG/CNH e comprovante de residência.

### 3.4. Requisito Crítico: Teste Fechado Obrigatório (12 Testadores / 14 Dias)
> [!IMPORTANT]
> Desde 13 de novembro de 2023, o Google estabeleceu uma regra obrigatória para **todas as novas contas pessoais**: antes de poder publicar o aplicativo em produção, o desenvolvedor deve realizar um **Teste Fechado (Closed Testing)** com:
> - Pelo menos **12 testadores** cadastrados e com adesão ativa (*opt-in*).
> - Duração contínua de no mínimo **14 dias consecutivos**.
>
> Somente após cumprir esse período de teste fechado é que o botão **Solicitar acesso para produção** (*Apply for production*) fica disponível no painel.

**Ação prática recomendada para o PO:**
1. Criar a conta do Google Play Console com antecedência.
2. Assim que o EAS gerar o primeiro build `preview` / `production`, fazer o upload na faixa de **Teste Fechado** (*Closed testing - Alpha*).
3. Convidar uma lista de 15 a 20 pessoas (amigos, familiares e equipe técnica) via e-mail para baixar o app pelo link do Google Play e mantê-lo instalado durante os 14 dias.

---

## 4. Pipeline de CI/CD com Expo Application Services (EAS)

O projeto mobile utiliza **Expo Application Services (EAS)** para compilar os binários nativos na nuvem e enviá-los diretamente para a App Store (TestFlight) e Google Play Console, eliminando a dependência de computadores macOS locais.

### 4.1. Estrutura do `eas.json` (Perfis de Build)

O arquivo `mobile/eas.json` padroniza os três ambientes essenciais:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services-private-key.json",
        "track": "closedTesting"
      },
      "ios": {
        "appleId": "rodrigo21437@gmail.com",
        "ascApiKeyPath": "./AuthKey_ASC.p8",
        "ascApiKeyId": "XXXXXXXXXX",
        "ascApiKeyIssuerId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }
}
```

### 4.2. Gestão de Credenciais e Segredos

| Segredo | Localização | Descrição / Finalidade |
| :--- | :--- | :--- |
| `EXPO_TOKEN` | GitHub Secrets (`mobile-production`) | Token de acesso para execução do CLI do EAS em pipelines automatizados. Gerado em `expo.dev > Account Settings > Access Tokens`. |
| Chaves de Assinatura Android (Keystore) | EAS Credentials Cloud | Gerenciada de forma segura pelo EAS (`eas credentials`). O Google Play App Signing reutiliza essa chave. |
| Certificados iOS / Provisioning Profiles | EAS Credentials Cloud | Gerenciados automaticamente pelo EAS com login na conta Apple Developer (`eas credentials`). |
| Chave da API App Store Connect (`.p8`) | EAS Secrets / GitHub Secrets | Utilizada pelo `eas submit -p ios` para upload headless no TestFlight sem MFA interativo. |
| Service Account JSON (Google Play) | EAS Secrets / GitHub Secrets | Utilizada pelo `eas submit -p android` para upload de pacotes AAB direto nas faixas do Google Play. |

### 4.3. Exemplo de Workflow do GitHub Actions (`.github/workflows/mobile-build.yml`)

```yaml
name: Mobile CI/CD (EAS)

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'
  workflow_dispatch:
    inputs:
      platform:
        description: 'Plataforma para compilação'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - android
          - ios
      profile:
        description: 'Perfil EAS'
        required: true
        default: 'preview'
        type: choice
        options:
          - preview
          - production

jobs:
  build:
    name: EAS Build (${{ inputs.platform || 'all' }})
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: mobile
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Setup Expo and EAS CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Run EAS Build
        run: |
          eas build \
            --platform ${{ inputs.platform || 'all' }} \
            --profile ${{ inputs.profile || 'preview' }} \
            --non-interactive
```

---

## 5. Verificação de Deep Linking no Next.js

Para que o sistema operacional abra o aplicativo nativo diretamente ao clicar em um link (Universal Links no iOS e App Links no Android), o domínio web precisa hospedar dois arquivos JSON especiais com cabeçalho `Content-Type: application/json` e sem redirecionamentos HTTP.

### 5.1. Endpoints Implementados no Next.js

1. **Android App Links:**
   - **URL:** `https://papelzinho.app/.well-known/assetlinks.json`
   - **Arquivo:** `app/.well-known/assetlinks.json/route.ts`
   - **Formato:**
     ```json
     [
       {
         "relation": ["delegate_permission/common.handle_all_urls"],
         "target": {
           "namespace": "android_app",
           "package_name": "app.papelzinho",
           "sha256_cert_fingerprints": [
             "14:6D:E9:01:C3:59:E0:4E:86:11:A6:04:07:04:30:E8:B3:C6:B6:40:51:37:E2:D6:07:08:F3:36:F7:88:83:CB"
           ]
         }
       }
     ]
     ```

2. **iOS Universal Links:**
   - **URL:** `https://papelzinho.app/.well-known/apple-app-site-association` (sem extensão `.json` na URL)
   - **Arquivo:** `app/.well-known/apple-app-site-association/route.ts`
   - **Formato:**
     ```json
     {
       "applinks": {
         "apps": [],
         "details": [
           {
             "appID": "<APPLE_TEAM_ID>.app.papelzinho",
             "paths": ["/g/*", "/p/*", "/admin/*"],
             "components": [
               { "/": "/g/*", "comment": "Group invitation & share link" },
               { "/": "/p/*", "comment": "Participant space link" },
               { "/": "/admin/*", "comment": "Organizer admin link" }
             ]
           }
         ]
       },
       "webcredentials": {
         "apps": ["<APPLE_TEAM_ID>.app.papelzinho"]
       }
     }
     ```

### 5.2. Variáveis de Ambiente e Fallbacks

Ambos os endpoints possuem fallbacks funcionais e seguros para desenvolvimento e homologação, mas podem ser configurados via variáveis de ambiente no `.env.production` da VPS:

| Variável | Padrão (Fallback) | Descrição |
| :--- | :--- | :--- |
| `ANDROID_PACKAGE_NAME` | `app.papelzinho` | Identificador do pacote do aplicativo Android. |
| `ANDROID_SHA256_FINGERPRINTS` | `["14:6D:E9:..."]` | Lista separada por vírgula ou array JSON com os hashes SHA-256 da chave de assinatura do app (disponível no Google Play Console em *Integridade do app / Assinatura do app*). |
| `APPLE_TEAM_ID` | `TEAMID1234` | Team ID de 10 caracteres alfanuméricos da conta Apple Developer do PO. |
| `APPLE_BUNDLE_ID` | `app.papelzinho` | Identificador do bundle do aplicativo iOS registrado no Apple Developer portal. |

### 5.3. Validação dos Endpoints

É possível verificar a disponibilidade e cabeçalhos dos endpoints via terminal:

```bash
# Testar Android Assetlinks
curl -I -s https://papelzinho.app/.well-known/assetlinks.json | grep -i "content-type"
# Esperado: content-type: application/json

# Testar Apple App Site Association
curl -I -s https://papelzinho.app/.well-known/apple-app-site-association | grep -i "content-type"
# Esperado: content-type: application/json
```

**Ferramentas Oficiais de Diagnóstico:**
- Google Digital Asset Links Validator: [Asset Links Tool](https://developers.google.com/digital-asset-links/tools/generator)
- Validador AASA da Apple: [Branch.io AASA Validator](https://branch.io/resources/aasa-validator/) ou [Search.developer.apple.com](https://search.developer.apple.com/appsearch-validation-tool/)

---

## 6. Resumo Executivo para o PO (Próximos Passos)

1. **Conta Apple Developer:** Criar a conta de Pessoa Física pelo app Apple Developer no iPhone/iPad (US$ 99/ano). Obter o **Apple Team ID**.
2. **Conta Google Play Console:** Criar a conta pessoal no Google Play Console (US$ 25 taxa única). Enviar documento de identidade e comprovante de endereço.
3. **Equipe de Testadores:** Pré-selecionar 12 a 15 pessoas para o teste fechado de 14 dias no Google Play.
4. **Configuração dos Certificados:** Inserir `APPLE_TEAM_ID` e o SHA-256 do Google Play no `.env.production` da VPS assim que as contas forem ativadas.
