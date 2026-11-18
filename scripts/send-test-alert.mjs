#!/usr/bin/env node
// Disparo de alerta de teste S1 para verificação do canal do Rodrigo (OPS-01)
// Uso: node scripts/send-test-alert.mjs [URL_DO_WEBHOOK]

const webhookUrl = process.argv[2] || process.env.ALERT_WEBHOOK_URL;

if (!webhookUrl) {
  console.error("❌ ERRO: Nenhuma URL de webhook configurada!");
  console.error("Forneça a URL como argumento ou defina ALERT_WEBHOOK_URL no ambiente:");
  console.error("Exemplo: node scripts/send-test-alert.mjs https://discord.com/api/webhooks/xxx/yyy");
  process.exit(1);
}

console.log(`📡 Enviando alerta de teste S1 para: ${webhookUrl.replace(/\/[^/]+$/, "/[REDACTED]")}...`);

const timestamp = new Date().toISOString();
const isDiscord = webhookUrl.includes("discord.com/api/webhooks");
const isSlack = webhookUrl.includes("hooks.slack.com");

let payload;

if (isDiscord) {
  payload = {
    content: "🟢 **[TESTE OPS-01] Verificação do Sistema de Alertas Papelzinho**",
    embeds: [
      {
        title: "Disparo de Teste de Alerta S1",
        description: "O canal de alertas do Rodrigo para https://papelzinho.app foi configurado e validado com sucesso.",
        color: 0x34d399,
        fields: [
          { name: "Ambiente", value: process.env.NODE_ENV || "test", inline: true },
          { name: "Healthcheck", value: "https://papelzinho.app/api/health", inline: true },
          { name: "Horário (UTC)", value: timestamp, inline: false },
        ],
        footer: { text: "Papelzinho Observability (OPS-01)" },
        timestamp,
      },
    ],
  };
} else if (isSlack) {
  payload = {
    text: `🟢 [TESTE OPS-01] Alerta de teste do Papelzinho recebido com sucesso!\nAmbiente: ${process.env.NODE_ENV || "test"} | ${timestamp}`,
  };
} else {
  payload = {
    event: "s1_test_alert",
    severity: "TEST",
    title: "[TESTE OPS-01] Verificação do Sistema de Alertas Papelzinho",
    message: "Canal de alertas validado com sucesso.",
    timestamp,
  };
}

try {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    console.log(`✅ Sucesso! Alerta de teste entregue (HTTP ${response.status}).`);
    process.exit(0);
  } else {
    console.error(`❌ Falha na entrega do alerta: HTTP ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error(`Resposta: ${text}`);
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Falha na conexão com o webhook:", err.message);
  process.exit(1);
}
