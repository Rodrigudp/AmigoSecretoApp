# Guia de Operações VPS — Papelzinho (OPS-VPS)

Este documento descreve a arquitetura de implantação, os procedimentos de configuração inicial, deploy contínuo via GitHub Actions e rotinas de manutenção/rollback para a aplicação **Papelzinho** na VPS do Product Owner (Ubuntu 26.04).

---

## 1. Visão Geral da Arquitetura

Devido ao limite de 100 deploys/24h da Vercel no plano gratuito e à necessidade de controle de custos, a aplicação foi migrada para a VPS dedicada.

- **Servidor:** Ubuntu 26.04 LTS (2 vCPU, 8 GB RAM, Node 22.23, PM2, Nginx).
- **Diretório da Aplicação:** `/home/<VPS_USER>/papelzinho`
- **Gerenciador de Processos:** PM2 em modo `fork` com 1 instância (`exec_mode: "fork"`, `instances: 1`).
  > **Nota de Segurança & Rate Limit:** O rate limiting do projeto (SEC-03) opera em memória (`globalThis`). Executar em modo `fork` com 1 processo único garante que a contagem de requisições por IP seja centralizada e consistente.
- **Porta Local da Aplicação:** `127.0.0.1:3010` (processo PM2 `papelzinho`).
  > **Nota de Portas:** A porta local 3010 é de uso exclusivo do Papelzinho (consolidada sob o PM2 em `/home/<VPS_USER>/papelzinho`).
- **Reverse Proxy:** Nginx escutando na porta pública **`8090`** (`http://<IP_DA_VPS>:8090`).
  > **Preservação de Serviços:** A porta 8090 foi escolhida para não conflitar com nenhum dos serviços pré-existentes na VPS compartilhada.
  > 
  > **GATE DE SEGURANÇA & LGPD (Art. 46 — OBRIGATÓRIO ANTES DO GO-LIVE):**
  > O endpoint HTTP na porta `:8090` é **restrito à fase de homologação, testes técnicos e smoke tests**. Em conexões HTTP puras, tokens de URL (`/p/[token]`, `/owner/[token]`) e cookies de autenticação (`ptk_<groupId>`, cuja flag `Secure` é omitida pelo runtime quando `APP_URL` começa com `http://`) trafegam em texto claro pela rede. A ativação de domínio com terminação HTTPS (Certbot / SSL — Seção 8) e a definição de `APP_URL=https://...` no `.env.production` são **obrigatórias antes da abertura do sistema a participantes reais**.
- **Cabeçalhos HTTP & Rate Limit:** O Nginx repassa `X-Real-IP: $remote_addr` e `X-Forwarded-For: $proxy_add_x_forwarded_for`. Os cabeçalhos de segurança (CSP, HSTS, etc.) são gerados diretamente pelo Next.js (`next.config.ts`), evitando duplicação. Além disso, `server_tokens off;` está ativo e o logging em `access.log` para rotas sensíveis (`/p/`, `/owner/`, `/r/`, `/admin/`) é desabilitado para não persistir tokens nem IPs em disco.
- **Vercel Decoupling:** `vercel.json` foi configurado com `"git": { "deploymentEnabled": false }`, cessando deploys automáticos na Vercel a cada commit.

---

## 2. Pré-requisitos na VPS

Conecte-se à VPS com o usuário de operações configurado:

```bash
ssh <VPS_USER>@<IP_DA_VPS>
```

Certifique-se de que o Node.js 22, PM2 e Nginx estão instalados:

```bash
node -v   # Deve exibir v22.x
npm -v
pm2 -v
nginx -v
```

---

## 3. Passo a Passo da Instalação Inicial

### Passo 3.1: Clonar o Repositório

```bash
cd /home/<VPS_USER>
if [ ! -d "/home/<VPS_USER>/papelzinho" ]; then
  git clone https://github.com/Rodrigudp/AmigoSecretoApp.git papelzinho
fi
cd /home/<VPS_USER>/papelzinho
git checkout main
```

### Passo 3.2: Configurar o Arquivo de Variáveis de Ambiente (`.env.production`)

```bash
# Definir umask restritiva antes da criação dos arquivos para evitar leitura por outros usuários
umask 077

# Crie o arquivo com as variáveis de produção
nano /home/<VPS_USER>/papelzinho/.env.production

# Restringir permissão estritamente ao usuário da aplicação (LGPD / Segurança)
chmod 600 /home/<VPS_USER>/papelzinho/.env.production
cp /home/<VPS_USER>/papelzinho/.env.production /home/<VPS_USER>/papelzinho/.env.local
chmod 600 /home/<VPS_USER>/papelzinho/.env.local
```

### Passo 3.3: Instalar Dependências e Construir a Aplicação

```bash
cd /home/<VPS_USER>/papelzinho
npm ci
npm run build
```

### Passo 3.4: Iniciar o PM2 e Ativar Inicialização no Boot

```bash
cd /home/<VPS_USER>/papelzinho

# Iniciar processo conforme ecosystem.config.cjs
pm2 start ecosystem.config.cjs

# Verificar status
pm2 status

# Instalar módulo de rotação de logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14

# Salvar lista de processos e configurar startup no boot do sistema
pm2 save
pm2 startup
# (Execute o comando sudo indicado pelo pm2 startup caso seja a primeira vez)
```

### Passo 3.5: Configurar o Nginx

Copie a configuração do repositório para o diretório de sites do Nginx:

```bash
sudo cp /home/<VPS_USER>/papelzinho/ops/nginx-papelzinho.conf /etc/nginx/sites-available/papelzinho.conf
sudo ln -sf /etc/nginx/sites-available/papelzinho.conf /etc/nginx/sites-enabled/papelzinho.conf

# Validar sintaxe da configuração
sudo nginx -t

# Recarregar o Nginx sem derrubar conexões ativas
sudo systemctl reload nginx
```

### Passo 3.6: Ajustar Firewall (UFW)

Liberar a porta pública 8090 no firewall UFW:

```bash
sudo ufw allow 8090/tcp
sudo ufw status
```

Teste o acesso pelo navegador ou curl:

```bash
curl -I http://127.0.0.1:3010
curl -I http://localhost:8090
```

---

## 4. Integração Contínua e Deploy Automático (GitHub Actions)

A cada push na branch `main`, o pipeline de CI do GitHub (`.github/workflows/ci.yml`) executa os jobs:
1. `quality`: Lint, verificação de tipos TypeScript, auditoria de dependências, testes unitários e build Next.js.
2. `db`: Supabase local stack, migrations, testes de banco de dados e testes de rollback.
3. `deploy-migrations`: Aplica migrations no Supabase de Produção (se secrets presentes).
4. `deploy-vps`: Conecta à VPS via SSH e executa o script `ops/deploy-vps.sh` para zero-downtime reload.

### Secrets Necessárias no GitHub (Environment `production`)

Acesse o repositório no GitHub: **Settings > Environments > production > Secrets** e configure:

| Nome do Secret | Descrição | Exemplo |
| :--- | :--- | :--- |
| `VPS_HOST` | Endereço IP ou hostname público da VPS | `192.0.2.1` ou `vps.meudominio.com` |
| `VPS_USER` | Usuário SSH do sistema | `<usuario-ssh>` |
| `VPS_SSH_KEY` | Chave privada SSH autorizada no servidor | Conteúdo de `~/.ssh/id_rsa` |
| `VPS_SSH_PORT` | Porta SSH (opcional, padrão `22`) | `22` |
| `VPS_SSH_KNOWN_HOSTS` | Chave pública do host para validação MITM (`StrictHostKeyChecking=yes`) | Saída de `ssh-keyscan -p 22 -H <IP_DA_VPS>` |

> **Nota de Segurança:** O pipeline de CI utiliza `StrictHostKeyChecking=yes` com a secret `VPS_SSH_KNOWN_HOSTS` e registra um `trap` automático para expurgar a chave privada do runner efêmero ao término da execução, prevenindo ataques Man-in-the-Middle (MITM). Caso as secrets da VPS não estejam configuradas, o job `deploy-vps` emitirá um aviso informativo (`::warning::`) e concluirá sem quebrar o pipeline.

---

## 5. Como Funciona o Script `ops/deploy-vps.sh`

O script de deploy é idempotente e conta com rollback automático:

1. Acessa `/home/<VPS_USER>/papelzinho`.
2. Garante existência e permissão segura (`chmod 600`) do `.env.production`.
3. Registra o commit atual (`PREV_COMMIT`) para recuperação de desastre.
4. Faz `git fetch` e `git reset --hard origin/main`.
5. Executa `npm ci` para sincronizar dependências.
6. Executa `npm run build` para compilar o Next.js.
7. Executa `pm2 reload ecosystem.config.cjs --update-env` (zero downtime).
8. Realiza **health check** (até 15 tentativas em `http://127.0.0.1:3010`).
   - Se o health check falhar, dispara a função `rollback()`: volta para `PREV_COMMIT`, recompila e restaura o processo estável.
9. Executa `pm2 save`.

---

## 6. Procedimento de Deploy Manual e Rollback

### Deploy Manual na VPS

Para rodar uma atualização manual diretamente no servidor:

```bash
bash /home/<VPS_USER>/papelzinho/ops/deploy-vps.sh
```

### Rollback Manual de Emergência

Caso seja necessário reverter para uma versão anterior manualmente:

```bash
cd /home/<VPS_USER>/papelzinho

# Listar os últimos commits
git log -n 5 --oneline

# Fazer checkout do commit estável desejado (ex: a1b2c3d)
git checkout a1b2c3d

# Reinstalar dependências e recompilar
npm ci
npm run build

# Recarregar PM2
pm2 reload ecosystem.config.cjs --update-env

# Verificar status
pm2 status
curl -I http://127.0.0.1:3010
```

---

## 7. Comandos Úteis de Monitoramento e Logs

```bash
# Ver status do processo
pm2 status papelzinho

# Monitoramento em tempo real (CPU, Memória, Métricas)
pm2 monit

# Logs da aplicação em tempo real
pm2 logs papelzinho

# Logs de erro específicos
cat /home/<VPS_USER>/.pm2/logs/papelzinho-error.log | tail -n 50

# Logs de acesso do Nginx
sudo tail -f /var/log/nginx/access.log

# Logs de erro do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 8. Configuração de Domínio e HTTPS (RNF03, PEN-10 e PEN-09)

Conforme decisão técnica registrada no `BOARD.md` (`a1b0b30`), o **RNF03** exige terminação HTTPS antes do lançamento do app para participantes reais. A porta `8090` em HTTP permanece estritamente para homologação interna e testes técnicos.

A VPS já possui certificados Let's Encrypt para `smartsolutionsbr.com.br` e seus subdomínios (`midia.` e `whatsapp.`). Para o Papelzinho, foi definido o subdomínio oficial sem custo:
👉 **`papelzinho.smartsolutionsbr.com.br`** (pendência de apontamento DNS em `PEN-10`).

Futuramente, após aquisição do domínio próprio `papelzinho.app` (`PEN-09`), a mesma estrutura será estendida.

### Ordem Obrigatória de Execução

1. **Propagação de DNS (PEN-10 pelo PO):**
   Criar na zona DNS de `smartsolutionsbr.com.br` o registro tipo `A`:
   `papelzinho` → `<IP_DA_VPS>`.
   Aguarde a propagação antes de rodar o Certbot:
   ```bash
   dig +short papelzinho.smartsolutionsbr.com.br
   ```

2. **Ativar Configuração do Domínio no Nginx:**
   O arquivo `ops/nginx-papelzinho-domain.conf` foi criado de forma totalmente isolada (sem alterar nenhum site existente na VPS):
   ```bash
   sudo cp /home/<VPS_USER>/papelzinho/ops/nginx-papelzinho-domain.conf /etc/nginx/sites-available/papelzinho-domain.conf
   sudo ln -sf /etc/nginx/sites-available/papelzinho-domain.conf /etc/nginx/sites-enabled/
   ```

3. **Emitir Certificado SSL com Certbot:**
   Com o DNS devidamente propagado para a VPS, execute:
   ```bash
   sudo certbot --nginx -d papelzinho.smartsolutionsbr.com.br
   ```

4. **Validar Sintaxe e Recarregar Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Atualizar Variáveis de Produção:**
   No arquivo `/home/<VPS_USER>/papelzinho/.env.production` (e `.env.local`), configure:
   ```env
   APP_URL=https://papelzinho.smartsolutionsbr.com.br
   ```
   E recarregue o processo no PM2:
   ```bash
   pm2 reload ecosystem.config.cjs --update-env
   ```

---

### Domínio Próprio Futuro: `papelzinho.app` (PEN-09)

O template completo com o bloco para `papelzinho.app` já consta comentado ao final de `ops/nginx-papelzinho-domain.conf`. Quando o domínio for adquirido pelo PO:
1. Apontar DNS de `papelzinho.app` para a VPS.
2. Descomentar os blocos do `papelzinho.app` em `/etc/nginx/sites-available/papelzinho-domain.conf`.
3. Executar o Certbot:
   ```bash
   sudo certbot --nginx -d papelzinho.app -d www.papelzinho.app
   ```
4. Testar e recarregar:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## 9. Acesso SSH sem bloqueio (regra obrigatória)

O firewall da VPS tem `ufw limit 22/tcp`: 6 conexões novas em 30 s bloqueiam o IP, e cada nova tentativa durante o bloqueio renova o prazo. O fail2ban (`sshd`, maxretry 6, findtime 600, bantime 3600) também está ativo. Em 18/11 o IP do PO ficou bloqueado depois de várias conexões curtas seguidas, um `ssh-keyscan` (3 conexões ao mesmo tempo) e uma espera que testava a porta a cada 20 s.

- Deploy e manutenção de rotina só pelo GitHub Actions (`deploy-vps`), que entra de outro IP com a chave `papelzinho_ci`.
- Acesso manual: uma única sessão SSH por tarefa, com todos os comandos dentro dela. Nada de abrir uma conexão por comando.
- Não rodar `ssh-keyscan` nem testar a porta 22 em loop. A chave do host já está no segredo `VPS_SSH_KNOWN_HOSTS`.
- Se o SSH cair, esperar pelo menos 2 minutos sem nenhuma tentativa antes de tentar de novo.
- Não colocar IPs em `ignoreip` (IP residencial muda).
