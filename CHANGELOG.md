# Changelog — Papelzinho

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-11-28

Primeiro lançamento oficial do **Papelzinho** para o público na web (`https://papelzinho.app`), marcando a entrega completa do MVP para as festividades de fim de ano de 2026.

### Adicionado
- **Criação de Grupos sem Cadastro (GRP-02, GRP-03):** Organizador cria um Amigo Secreto informando apenas o nome do evento, seu próprio nome, data do encontro e valor sugerido para o presente, sem necessidade de login, senhas ou preenchimento de cadastros burocráticos.
- **Compartilhamento Ágil e Convites (GRP-04):** Geração imediata de link público de convite (`/g/[inviteToken]`) com botão de compartilhamento no WhatsApp, cópia de link em um toque e metadados Open Graph personalizados.
- **Entrada Descomplicada de Participantes (PAR-02, PAR-03):** Participantes entram no grupo informando apenas seu nome ou apelido, recebendo imediatamente seu link pessoal de acesso (`/p/[accessToken]`).
- **Área do Participante e Handshake de Cookies (PAR-04, ADR-004):** Acesso seguro ao espaço individual do participante com emissão do cookie `ptk_<groupId>` (`HttpOnly`, `Secure`, `SameSite=Lax`), desacoplando o token de acesso da barra de navegação e garantindo privacidade contra olhares curiosos.
- **Sorteio Justo de Ciclo Único (SRT-01, SRT-02, SRT-03):** Algoritmo matemático garantindo que o sorteio forme um único ciclo fechado (ninguém tira a si mesmo e não há subgrupos isolados de troca mútua), executado de forma transacional e atômica via RPC PostgreSQL `run_draw`.
- **Painel do Organizador (GRP-05, SRT-03):** Painel exclusivo para o organizador acompanhar a lista de participantes confirmados, remover nomes duplicados ou desistentes e disparar o sorteio com tela de confirmação e estados visuais claros (S1 a S7).
- **Revelação do Amigo Secreto (SRT-04):** Cartão interativo "Revelar" com efeito de raspadinha/toque seguro; o resultado é exibido exclusivamente no dispositivo e não persiste aberto após recarregar a tela, com isolamento absoluto de pares entre participantes.
- **Lista de Desejos (LST-01, LST-02, LST-04):** Cada participante pode cadastrar até 3 itens que gostaria de ganhar (com título, categoria e link opcional), visíveis apenas para quem tirou aquele participante após a realização do sorteio.
- **Sugestões de Presentes com Afiliado Amazon (LST-03):** Integração com o programa Amazon Associados (`papelzinho20-20`) para busca de presentes e redirecionamento transparente via rota `/r/[itemId]`.
- **Páginas Institucionais e LGPD (MON-01-APP, MKT-03):** Publicação das páginas `/sobre`, `/privacidade`, `/termos`, `/contato` e `/como-funciona`, contendo identificação do controlador, canais de suporte e guia passo a passo ilustrado.
- **Painel do Dono (MON-03):** Rota `/owner` protegida por autenticação com métricas operacionais agregadas (grupos criados, participantes, sorteios realizados) sem qualquer retenção ou exibição de dados pessoais (PII).
- **Observabilidade e Monitoramento (OPS-01, PEN-11):** Endpoint de verificação de disponibilidade (`/api/health`), notificações de erro de severidade S1 no Discord com debounce automático e script watchdog no cron da VPS a cada 5 minutos.
- **Suporte a Deep Linking para Aplicativo Mobile (APP-OPS-01):** Endpoints de verificação `/.well-known/assetlinks.json` (Android App Links) e `/.well-known/apple-app-site-association` (iOS Universal Links) para transição fluida entre site e app nativo.

### Segurança e Privacidade
- **Conformidade LGPD (Art. 46):** Mecanismo de mascaramento automático (`redact.ts`) que sanitiza URLs de rotas sensíveis (`/p/`, `/admin/`, `/owner/`, `/r/`, `/api/p/hs/`), cookies `ptk_`, tokens de autorização e dados pessoais de logs de erro e payloads de observabilidade.
- **Hardening de Logs no Nginx (SEC05-M02):** Diretiva `access_log off;` ativa em todas as rotas que trafegam credenciais na URL (`^/(p|owner|r|admin|api/p/hs)/`), eliminando persistência em disco de IPs associados a tokens.
- **Proteção Contra Força Bruta e Abuso (SEC-03, SEC-05):** Rate limiter defensivo em memória utilizando HMAC-SHA256 com sal rotativo para conter abusos em criação de grupos, adesões, redirecionamentos e tentativas de sorteio.
- **Cabeçalhos de Segurança HTTP Rígidos:** Política de Segurança de Conteúdo (CSP) restritiva, `Strict-Transport-Security` (HSTS com preload de 2 anos), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy` e `Referrer-Policy: no-referrer` em páginas de token.
- **Controle de Acesso no Banco de Dados (DB-01 a DB-05):** Row Level Security (RLS) habilitada e forçada em todas as tabelas, revogação total de acesso para roles `anon` e `authenticated`, operando estritamente através do `service_role` e funções com `SECURITY DEFINER` e `search_path` restrito.
- **Expurgo Automático de Dados (OPS-02):** Rotina diária via `pg_cron` executando `purge_expired_groups()` para exclusão definitiva e irreversível de grupos e dados associados 60 dias após a data do encontro.
- **Consentimento de Cookies e Anúncios (SEC-04, MON-02):** Banner de cookies compatível com a LGPD e slots do Google AdSense condicionados ao consentimento explícito do usuário (`ADS_ENABLED=false` por padrão até aprovação formal).

### Infraestrutura e Operações
- **Hospedagem em VPS Dedicada (OPS-VPS, PEN-09):** Migração da Vercel para servidor dedicado Ubuntu 26.04 LTS gerenciado via PM2 em modo `fork` e Nginx como reverse proxy com terminação HTTPS via Let's Encrypt para `papelzinho.app`.
- **Pipeline de Integração Contínua (CI/CD):** Pipeline completo no GitHub Actions executando checagem estática, linter, testes de tipos TypeScript, auditoria de segurança de dependências (`npm audit`), testes de banco de dados no Supabase local e suíte end-to-end (E2E) com Playwright em viewport móvel (360px).
