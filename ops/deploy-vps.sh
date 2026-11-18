#!/usr/bin/env bash
# ==============================================================================
# Script: ops/deploy-vps.sh
# Purpose: Idempotent deployment and zero-downtime reload for Papelzinho on VPS
# Target: /home/smartops/papelzinho
# Port: 127.0.0.1:3010 (PM2 process: papelzinho)
# ==============================================================================
set -euo pipefail

APP_DIR="/home/smartops/papelzinho"
REPO_URL="https://github.com/Rodrigudp/AmigoSecretoApp.git"
BRANCH="main"
HEALTH_CHECK_URL="http://127.0.0.1:3010"
MAX_HEALTH_ATTEMPTS=15
HEALTH_INTERVAL_SEC=2

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

err() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2
}

# 1. Initialize directory if not present
if [ ! -d "$APP_DIR/.git" ]; then
  log "Cloning repository into $APP_DIR..."
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# 2. Preserve environment variables
OLD_UMASK=$(umask)
umask 077

if [ ! -f "$APP_DIR/.env.production" ]; then
  if [ -f "/home/smartops/amigo-secreto/.env.production" ]; then
    log "Copying .env.production from existing amigo-secreto directory..."
    cp "/home/smartops/amigo-secreto/.env.production" "$APP_DIR/.env.production"
    chmod 600 "$APP_DIR/.env.production"
  else
    err "No .env.production found in $APP_DIR or /home/smartops/amigo-secreto!"
    err "Please create $APP_DIR/.env.production with mode 600 before deploying."
    exit 1
  fi
fi

# Ensure permissions on .env.production
chmod 600 "$APP_DIR/.env.production"

# Also symlink or copy to .env.local for Next.js build
cp "$APP_DIR/.env.production" "$APP_DIR/.env.local"
chmod 600 "$APP_DIR/.env.local"
umask "$OLD_UMASK"

# 3. Record previous commit for rollback
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")

log "Fetching latest changes from origin/$BRANCH..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

CURRENT_FULL_COMMIT=$(git rev-parse HEAD)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
log "Deploying commit: $CURRENT_COMMIT"

rollback() {
  err "Deployment failed! Initiating rollback..."
  if [ -n "$PREV_COMMIT" ] && [ "$PREV_COMMIT" != "$CURRENT_FULL_COMMIT" ]; then
    log "Rolling back to commit: $PREV_COMMIT..."
    git checkout "$PREV_COMMIT"
    npm ci
    npm run build
    pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
    log "Rollback completed to commit $PREV_COMMIT."
  else
    err "No previous commit available to rollback to."
  fi
  exit 1
}

# 4. Install dependencies and build
log "Installing dependencies (npm ci)..."
if ! npm ci; then
  err "npm ci failed."
  rollback
fi

log "Building Next.js application (npm run build)..."
if ! npm run build; then
  err "Build failed."
  rollback
fi

# 5. Reload PM2 process without downtime
log "Reloading PM2 process (papelzinho)..."
if pm2 describe papelzinho >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  log "Process not registered yet. Starting new instance..."
  pm2 start ecosystem.config.cjs
fi

# 6. Health check verification
log "Verifying application health at $HEALTH_CHECK_URL..."
HEALTHY=false
for i in $(seq 1 $MAX_HEALTH_ATTEMPTS); do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || true)
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ] || [ "$HTTP_STATUS" = "308" ]; then
    log "Health check passed (HTTP $HTTP_STATUS) on attempt $i."
    HEALTHY=true
    break
  fi
  log "Attempt $i/$MAX_HEALTH_ATTEMPTS: HTTP status $HTTP_STATUS. Waiting ${HEALTH_INTERVAL_SEC}s..."
  sleep "$HEALTH_INTERVAL_SEC"
done

if [ "$HEALTHY" = false ]; then
  err "Health check failed after $MAX_HEALTH_ATTEMPTS attempts."
  rollback
fi

# 7. Persist PM2 state
pm2 save || true

log "=========================================================="
log " Deploy succeeded! App running at $HEALTH_CHECK_URL"
log " Commit: $CURRENT_COMMIT"
log "=========================================================="
exit 0
