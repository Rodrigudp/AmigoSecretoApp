const secret = process.env.PUSH_CRON_SECRET;
if (!secret) throw new Error("Missing PUSH_CRON_SECRET");

try {
  const response = await fetch("http://127.0.0.1:3010/api/internal/push/exchange-reminders", {
    method: "POST",
    headers: { Authorization: "Bearer " + secret },
    signal: AbortSignal.timeout(20 * 60_000),
  });
  if (!response.ok) throw new Error("Reminder runner rejected the request");
} catch {
  console.error("Exchange reminder job failed");
  process.exitCode = 1;
}
