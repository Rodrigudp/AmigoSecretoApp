#!/usr/bin/env bash
# ==============================================================================
# Script: ops/uptime-watchdog.sh
# Purpose: Local watchdog for Papelzinho on VPS (monitors http://127.0.0.1:3010/api/health)
# Executes every 5 minutes via cron (docs/ops/monitoring.md)
# ==============================================================================
set -euo pipefail

HEALTH_URL="http://127.0.0.1:3010/api/health"
APP_DIR="${APP_DIR:-$HOME/papelzinho}"
MAX_RETRIES=3
RETRY_DELAY=2

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# 1. Checagem do healthcheck local
check_health() {
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || true)
  [ "$code" = "200" ]
}

IS_HEALTHY=false
for i in $(seq 1 $MAX_RETRIES); do
  if check_health; then
    IS_HEALTHY=true
    break
  fi
  sleep "$RETRY_DELAY"
done

if [ "$IS_HEALTHY" = true ]; then
  exit 0
fi

log "Healthcheck falhou após $MAX_RETRIES tentativas em $HEALTH_URL!"

# 2. Carregar ALERT_WEBHOOK_URL do .env.production se existir
ALERT_URL=""
if [ -f "$APP_DIR/.env.production" ]; then
  ALERT_URL=$(grep -E '^ALERT_WEBHOOK_URL=' "$APP_DIR/.env.production" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
fi

# 3. Tentar auto-recuperação com PM2
log "Tentando restabelecimento do processo com PM2..."
cd "$APP_DIR"
pm2 reload ecosystem.config.cjs --update-env || pm2 restart papelzinho || true

sleep 5

RECOVERED=false
if check_health; then
  RECOVERED=true
  log "Aplicação restabelecida com sucesso pelo Watchdog."
else
  log "Aplicação CONTINUA fora do ar após tentativa de reload do PM2!"
fi

# 4. Disparar Alerta S1 se webhook configurado (usando stdin no curl para ocultar ALERT_URL de ps/proc)
if [ -n "$ALERT_URL" ]; then
  STATUS_MSG="Aplicação Papelzinho falhou na VPS e foi reiniciada automaticamente com SUCESSO."
  COLOR=15769600 # Amarelo / Atenção
  if [ "$RECOVERED" = false ]; then
    STATUS_MSG="ALERTA CRÍTICO: Papelzinho falhou na VPS e NÃO responde após reinicialização do PM2!"
    COLOR=15673924 # Vermelho / S1 Crítico
  fi

  PAYLOAD=$(cat <<EOF
{
  "content": "🚨 **[S1 ALERTA - VPS WATCHDOG]**",
  "embeds": [
    {
      "title": "Falha detectada no Healthcheck (127.0.0.1:3010/api/health)",
      "description": "$STATUS_MSG",
      "color": $COLOR,
      "fields": [
        { "name": "Servidor", "value": "VPS Ubuntu 26.04", "inline": true },
        { "name": "Status Recuperação", "value": "$RECOVERED", "inline": true },
        { "name": "Horário", "value": "$(date -u '+%Y-%m-%d %H:%M:%S UTC')", "inline": false }
      ],
      "footer": { "text": "Papelzinho Watchdog (OPS-01)" }
    }
  ]
}
EOF
)

  # Passa a URL via config stdin (-K -) para não expor o segredo na lista de processos
  printf 'url = "%s"\n' "$ALERT_URL" | curl -s -S -X POST -H "Content-Type: application/json" -d "$PAYLOAD" -K - >/dev/null || true
fi

if [ "$RECOVERED" = false ]; then
  exit 1
fi

exit 0
