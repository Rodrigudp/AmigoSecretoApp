# Procedimento de Release — Versão 1.0.0 (REL-02)

Este documento estabelece o roteiro operacional, o checklist de verificação e os procedimentos de rollback para o lançamento oficial do **Papelzinho** na web (`https://papelzinho.app`), agendado para o dia **28/11/2026**.

> [!IMPORTANT]
> **ATENÇÃO:** A tag `v1.0.0` e o GitHub Release **NÃO** devem ser criados com antecedência. Este roteiro deve ser executado rigorosamente na data do lançamento (28/11/2026) pela equipe de operações/devops e orquestração.

---

## 1. Cronograma e Responsabilidades do Dia (28/11/2026)

| Horário Previsto | Fase / Ação | Responsável |
| :--- | :--- | :--- |
| **08:00 - 08:30** | Fase 1: Congelamento de Código (Code Freeze) e Checagem de Ambiente | 00 Orquestrador / 14 DevOps |
| **08:30 - 09:30** | Fase 2: Bateria de Regressão Automatizada e Manual (REL-02-QA) | 13 QA |
| **09:30 - 09:45** | Fase 3: Criação da Tag Git `v1.0.0` e GitHub Release | 14 DevOps |
| **09:45 - 10:00** | Fase 4: Deploy em Produção e Health Check | 14 DevOps |
| **10:00 - 10:30** | Fase 5: Validação Pós-Deploy e Liberação Oficial | 00 Orquestrador / PO |

---

## 2. Fase 1: Congelamento de Código e Pré-Requisitos

1. **Code Freeze na branch `main`:**
   - Nenhum novo Pull Request deve ser mergeado na branch `main`, exceto correções emergenciais de severidade S1/S2 aprovadas pelo Tech Lead.
   - Conferir que o último commit na `main` possui todos os checks do CI verdes:
     ```bash
     gh run list --branch main --limit 3
     ```
2. **Conferência de Secrets de Produção (GitHub):**
   - Acesse **Settings > Environments > production > Secrets** e verifique a presença de:
     - `VPS_HOST`: IP da VPS (`2.25.252.45`)
     - `VPS_USER`: `smartops`
     - `VPS_SSH_KEY`: Chave privada SSH autorizada
     - `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço para migrações
     - `DISCORD_ALERT_WEBHOOK`: Webhook para alertas S1 (PEN-11)

---

## 3. Fase 2: Regressão de Qualidade (REL-02-QA)

Antes de gerar a tag final, o responsável de QA (Agente 13) executa a validação completa:

1. **Bateria E2E Playwright:**
   - Executar os cenários de ponta a ponta (HU01 a HU05):
     - Criação de grupo pelo organizador (`/`).
     - Compartilhamento de link e adesão de múltiplos participantes (`/g/[token]`).
     - Cadastro de listas de desejos individuais (`/p/[token]`).
     - Disparo do sorteio no painel administrativo (`/admin/[token]`).
     - Revelação individual do amigo secreto (`/p/[token]`) garantindo que nenhum participante veja o resultado de outro.
2. **Auditoria de Responsividade Mobile (360px):**
   - Verificar ausência de overflow horizontal e clique em alvos táteis em telas pequenas (conforme auditado no QA-05).
3. **Validação de Páginas Legais (PEN-01 / PEN-02):**
   - Garantir que as páginas `/sobre`, `/privacidade`, `/termos` e `/contato` estão preenchidas com as informações de contato do controlador sem marcadores de pendência.

---

## 4. Fase 3: Criação da Tag Git `v1.0.0` e GitHub Release

Com a aprovação formal do QA, execute a criação da tag anotada a partir da `main`:

```bash
# 1. Atualizar repositório local
git checkout main
git pull origin main

# 2. Criar a tag anotada v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0 - Lançamento Oficial Papelzinho"

# 3. Enviar a tag para o repositório remoto
git push origin v1.0.0

# 4. Criar o Release oficial no GitHub utilizando o CHANGELOG.md
gh release create v1.0.0 \
  --title "v1.0.0 — Lançamento Oficial Papelzinho" \
  --notes-file CHANGELOG.md
```

---

## 5. Fase 4: Deploy em Produção e Verificação Operacional

O push da tag ou commit na `main` dispara o job `deploy-vps` do workflow `.github/workflows/ci.yml`.

### 5.1. Acompanhamento do Deploy via GitHub Actions
```bash
gh run watch $(gh run list --workflow=ci.yml --limit=1 --json databaseId --jq '.[0].databaseId')
```

### 5.2. Deploy Manual na VPS (Alternativa de Contingência)
Se o deploy automatizado pelo Actions não for acionado ou apresentar instabilidade de rede, realize o deploy manual em **sessão SSH única** (conforme `docs/ops/vps.md` §9):

```bash
ssh smartops@<IP_DA_VPS> "bash /home/smartops/papelzinho/ops/deploy-vps.sh"
```

### 5.3. Validação dos Health Checks em Produção
Execute os seguintes testes externos para validar que o aplicativo subiu corretamente:

```bash
# 1. Healthcheck da aplicação Next.js
curl -i https://papelzinho.app/api/health
# Resposta esperada: HTTP 200, status "ok", version "0.1.0" ou superior

# 2. Teste do domínio e terminação HTTPS
curl -I https://papelzinho.app/
# Resposta esperada: HTTP/2 200

# 3. Redirecionamento de domínios legados
curl -I https://papelzinho.smartsolutionsbr.com.br/
# Resposta esperada: HTTP/2 301 com Location: https://papelzinho.app/

# 4. Endpoints de Deep Linking
curl -I https://papelzinho.app/.well-known/assetlinks.json
curl -I https://papelzinho.app/.well-known/apple-app-site-association
# Resposta esperada: HTTP/2 200, Content-Type: application/json
```

### 5.4. Verificação de Processos e Logs no Servidor
Em sessão SSH na VPS:
```bash
# Verificar status do PM2
pm2 status papelzinho

# Verificar serviço Nginx
systemctl is-active nginx

# Verificar execução do watchdog cron
tail -n 20 /home/smartops/.pm2/logs/watchdog.log
```

---

## 6. Fase 5: Plano de Contingência e Rollback de Emergência

Caso ocorra falha crítica em produção após o deploy (ex: erro 500 generalizado, falha nas chamadas de banco de dados, quebra do sorteio), execute o procedimento de rollback imediato:

### 6.1. Rollback Rápido via Script de Deploy
O script `ops/deploy-vps.sh` possui rollback automático integrado caso o health check falhe durante a compilação.

### 6.2. Rollback Manual para o Commit Anterior
Para forçar o retorno à versão estável anterior em **uma única sessão SSH**:

```bash
ssh smartops@<IP_DA_VPS> "bash -c '
  set -e
  cd /home/smartops/papelzinho
  
  # Identificar commit estável anterior
  PREV_COMMIT=\$(git rev-parse HEAD~1)
  echo \"Iniciando rollback para o commit \$PREV_COMMIT...\"
  
  git checkout \$PREV_COMMIT
  npm ci
  npm run build
  pm2 reload ecosystem.config.cjs --update-env
  
  # Verificar saúde
  sleep 3
  curl -I http://127.0.0.1:3010/api/health
'"
```

### 6.3. Comunicação de Incidente
Se for necessário acionar o rollback:
1. Registre o incidente no canal de monitoramento / Discord (ou através do script de alerta).
2. Notifique imediatamente o Orquestrador com o hash do commit revertido e o log de erro coletado (`/home/smartops/.pm2/logs/papelzinho-error.log`).
