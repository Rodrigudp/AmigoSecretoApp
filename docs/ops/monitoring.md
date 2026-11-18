# Monitoramento, Uptime e Alertas S1 — Papelzinho (OPS-01)

Este documento especifica a arquitetura de observabilidade, monitoramento de disponibilidade (uptime), sanitização LGPD e canal de alertas de severidade S1 para a aplicação **Papelzinho** em produção (`https://papelzinho.app`).

---

## 1. Visão Geral e Princípios

- **Sem Custo Adicional:** Baseado em ferramentas gratuitas (UptimeRobot / Better Uptime, Discord/Telegram Webhooks, script watchdog local no cron da VPS).
- **Privacidade e LGPD (Art. 46):** Toda URL com tokens de acesso (`/p/[token]`, `/admin/[token]`, `/owner/[token]`, `/r/[token]`, `/g/[token]`) e parâmetros query sensíveis são obrigatoriamente mascarados antes de qualquer registro em log ou envio de alerta.
- **Classificação S1 (ISO/IEC 14764):**
  - **S1 — Crítica:** Site fora do ar, falha no sorteio, vazamento de dados ou erro de infraestrutura bloqueante.
  - **SLA de Resposta:** Imediata; MTTR esperado < 4 horas.

---

## 2. Componentes da Solução

```
                    ┌──────────────────────────────────────────────┐
                    │               UptimeRobot                    │
                    │   (Monitor externo gratuito a cada 5 min)    │
                    └──────────────────────┬───────────────────────┘
                                           │ ping HTTP GET
                                           ▼
┌──────────────────────┐           ┌───────────────────────────────┐           ┌──────────────────────┐
│  VPS Cron Watchdog   │           │    Next.js (papelzinho.app)   │           │  Canal de Alertas S1 │
│ ops/uptime-watchdog  ├──────────►│        /api/health            ├──────────►│   Rodrigo (Discord,  │
│ (local cada 5 min)   │           │                               │ Webhook   │   Telegram ou Slack) │
└──────────────────────┘           └───────────────────────────────┘           └──────────────────────┘
```

### 2.1 Endpoint de Healthcheck (`/api/health`)
- **Rota:** `GET https://papelzinho.app/api/health`
- **Resposta:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-18T14:15:00.000Z",
    "uptime": 12345,
    "version": "0.1.0"
  }
  ```
- **Cabeçalhos:** `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` (sempre consulta o runtime real).

### 2.2 Sanitização e Proteção LGPD (`redact.ts`)
- Todas as rotas que trafegam credenciais em path são convertidas automaticamente:
  - `/p/[token]` → `/p/[REDACTED]`
  - `/admin/[token]` → `/admin/[REDACTED]`
  - `/owner/[token]` → `/owner/[REDACTED]`
  - `/r/[token]` → `/r/[REDACTED]`
  - `/g/[token]` → `/g/[REDACTED]`
- Parâmetros `token`, `adminToken`, `participantToken`, `password`, `key`, `secret`, `email`, `phone` são substituídos por `[REDACTED]`.

### 2.3 Sistema de Notificações e Webhooks (`alerts.ts`)
- Variável de ambiente: `ALERT_WEBHOOK_URL` (configurada no `.env.production` e nos Secrets do GitHub Actions).
- Detecta automaticamente o provedor:
  - **Discord:** Envia mensagem rica com embeds formatados (vermelho para S1, verde para teste).
  - **Slack:** Envia blocos formatados.
  - **Telegram:** Envia mensagem markdown via Bot API.
  - **Genérico:** Envia payload JSON estruturado.
- **Alert Throttling:** Proteção de debounce de 5 minutos em memória para evitar tempestade de notificações no caso de erros contínuos.

---

## 3. Como Configurar o Canal de Alertas do Rodrigo (PEN-11)

### Opção Recomendada: Discord Webhook (Zero custo, 1 minuto)

1. Crie ou abra um servidor privado no Discord.
2. Crie um canal de texto exclusivo (ex: `#alertas-papelzinho`).
3. Clique na engrenagem do canal > **Integrações** > **Criar Webhook**.
4. Defina o nome como `Papelzinho Monitor` e copie a **URL do Webhook**.
5. Cadastre a URL:
   - No GitHub: **Settings > Environments > production > Secrets** > `ALERT_WEBHOOK_URL`.
   - Na VPS: Adicione `ALERT_WEBHOOK_URL="https://discord.com/api/webhooks/..."` no `/home/<VPS_USER>/papelzinho/.env.production` (modo 600).

---

## 4. Teste do Alerta S1

Para verificar que os alertas chegam corretamente ao Rodrigo, execute o teste via CLI (não expomos rota HTTP de teste para evitar qualquer risco de SSRF ou exposição de chaves mestre):

### Localmente (com a URL do webhook):
```bash
npm run alert:test <URL_DO_WEBHOOK>
```

### Na VPS (utilizando `ALERT_WEBHOOK_URL` do `.env.production`):
```bash
cd /home/<VPS_USER>/papelzinho
node scripts/send-test-alert.mjs
```


---

## 5. Configuração do Monitoramento Externo (UptimeRobot)

1. Crie uma conta gratuita em [UptimeRobot](https://uptimerobot.com/).
2. Adicione um novo monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Papelzinho Produção
   - **URL (or IP):** `https://papelzinho.app/api/health`
   - **Monitoring Interval:** 5 minutos
3. Em **Alert Contacts**, adicione o e-mail ou webhook do Discord do Rodrigo.

---

## 6. Configuração do Watchdog Local na VPS (Sessão SSH Única)

Conforme a regra do projeto (§9 de `docs/ops/vps.md`), execute em **uma única sessão SSH**:

```bash
# 1. Conectar na VPS
ssh <VPS_USER>@<IP_DA_VPS>

# 2. Testar execução do watchdog
bash /home/<VPS_USER>/papelzinho/ops/uptime-watchdog.sh

# 3. Adicionar cron job para rodar a cada 5 minutos
(crontab -l 2>/dev/null; echo "*/5 * * * * bash /home/<VPS_USER>/papelzinho/ops/uptime-watchdog.sh >> /home/<VPS_USER>/.pm2/logs/watchdog.log 2>&1") | crontab -

# 4. Conferir crontab
crontab -l
```

---

## 7. Protocolo de Resposta a Incidentes S1 (ISO/IEC 14764)

Ao receber um alerta S1:
1. **Triagem Imediata:** Verificar logs em `/home/<VPS_USER>/.pm2/logs/papelzinho-error.log` e status com `pm2 status papelzinho`.
2. **Registro de Incidente:** Criar `BUG-xxx` no Kanban do projeto (`docs/board/BOARD.md`).
3. **Contenção / Recuperação:** Se a aplicação estiver instável, executar rollback para o commit anterior:
   ```bash
   bash /home/<VPS_USER>/papelzinho/ops/deploy-vps.sh # ou git checkout <hash> && pm2 reload ecosystem.config.cjs
   ```
4. **Pós-Incidente:** Documentar análise sem culpados em `docs/processo/incidentes/AAAA-MM-DD-slug.md`.
