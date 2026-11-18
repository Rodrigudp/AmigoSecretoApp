# Guia de Operações VPS — Papelzinho (OPS-VPS)

Este documento descreve a arquitetura de implantação, os procedimentos de configuração inicial, deploy contínuo via GitHub Actions e rotinas de manutenção/rollback para a aplicação **Papelzinho** na VPS do Product Owner (Ubuntu 26.04).

---

## 1. Visão Geral da Arquitetura

Devido ao limite de 100 deploys/24h da Vercel no plano gratuito e à necessidade de controle de custos, a aplicação foi migrada para a VPS dedicada.

- **Servidor:** Ubuntu 26.04 LTS (2 vCPU, 8 GB RAM, Node 22.23, PM2, Nginx).
- **Diretório da Aplicação:** `/home/smartops/papelzinho`
- **Gerenciador de Processos:** PM2 em modo `fork` com 1 instância (`exec_mode: "fork"`, `instances: 1`).
  > **Nota de Segurança & Rate Limit:** O rate limiting do projeto (SEC-03) opera em memória (`globalThis`). Executar em modo `fork` com 1 processo único garante que a contagem de requisições por IP seja centralizada e consistente.
- **Porta Local da Aplicação:** `127.0.0.1:3010` (processo PM2 `papelzinho`).
- **Reverse Proxy:** Nginx escutando na porta pública **`8090`** (`http://<IP_DA_VPS>:8090`).
  > **Preservação de Serviços:** A porta 8090 foi escolhida para não conflitar com nenhum dos serviços já existentes na VPS (portas 22, 80, 443, 3005, 3010, 3030, 3085, 3306, 33060, 5000, 5555, 8080, 8082, 8443, 8790).
- **Cabeçalhos HTTP & Rate Limit:** O Nginx repassa `X-Real-IP: $remote_addr` e `X-Forwarded-For: $proxy_add_x_forwarded_for`. Os cabeçalhos de segurança (CSP, HSTS, etc.) são gerados diretamente pelo Next.js (`next.config.ts`), evitando duplicação.
- **Vercel Decoupling:** `vercel.json` foi configurado com `"git": { "deploymentEnabled": false }`, cessando deploys automáticos na Vercel a cada commit.

---

## 2. Pré-requisitos na VPS

Conecte-se à VPS como o usuário `smartops`:

```bash
ssh smartops@<IP_DA_VPS>
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
cd /home/smartops
if [ ! -d "/home/smartops/papelzinho" ]; then
  git clone https://github.com/Rodrigudp/AmigoSecretoApp.git papelzinho
fi
cd /home/smartops/papelzinho
git checkout main
```

### Passo 3.2: Configurar o Arquivo de Variáveis de Ambiente (`.env.production`)

Se já existir um arquivo configurado na pasta `/home/smartops/amigo-secreto`, copie-o:

```bash
if [ -f "/home/smartops/amigo-secreto/.env.production" ]; then
  cp /home/smartops/amigo-secreto/.env.production /home/smartops/papelzinho/.env.production
else
  # Crie o arquivo manualmente com as variáveis de produção
  nano /home/smartops/papelzinho/.env.production
fi

# Restringir permissão estritamente ao usuário smartops (LGPD / Segurança)
chmod 600 /home/smartops/papelzinho/.env.production
cp /home/smartops/papelzinho/.env.production /home/smartops/papelzinho/.env.local
chmod 600 /home/smartops/papelzinho/.env.local
```

### Passo 3.3: Instalar Dependências e Construir a Aplicação

```bash
cd /home/smartops/papelzinho
npm ci
npm run build
```

### Passo 3.4: Iniciar o PM2 e Ativar Inicialização no Boot

```bash
cd /home/smartops/papelzinho

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
sudo cp /home/smartops/papelzinho/ops/nginx-papelzinho.conf /etc/nginx/sites-available/papelzinho.conf
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
| `VPS_USER` | Usuário SSH do sistema | `smartops` |
| `VPS_SSH_KEY` | Chave privada SSH autorizada no servidor | Conteúdo de `~/.ssh/id_rsa` |
| `VPS_SSH_PORT` | Porta SSH (opcional, padrão `22`) | `22` |

> **Nota:** Caso as secrets da VPS não estejam configuradas, o job `deploy-vps` emitirá um aviso informativo (`::warning::`) e concluirá sem quebrar o pipeline.

---

## 5. Como Funciona o Script `ops/deploy-vps.sh`

O script de deploy é idempotente e conta com rollback automático:

1. Acessa `/home/smartops/papelzinho`.
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
bash /home/smartops/papelzinho/ops/deploy-vps.sh
```

### Rollback Manual de Emergência

Caso seja necessário reverter para uma versão anterior manualmente:

```bash
cd /home/smartops/papelzinho

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
cat /home/smartops/.pm2/logs/papelzinho-error.log | tail -n 50

# Logs de acesso do Nginx
sudo tail -f /var/log/nginx/access.log

# Logs de erro do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 8. Configuração Futura de Domínio Próprio e SSL (Certbot)

Quando um domínio próprio (ex: `papelzinho.com.br`) for apontado para o IP da VPS:

1. Abra `/etc/nginx/sites-available/papelzinho.conf`.
2. Descomente o bloco de redirecionamento HTTP -> HTTPS e o bloco SSL na porta 443 configurados no template do arquivo.
3. Gere os certificados com Let's Encrypt:
   ```bash
   sudo certbot --nginx -d papelzinho.com.br -d www.papelzinho.com.br
   ```
4. Teste e recarregue o Nginx:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
