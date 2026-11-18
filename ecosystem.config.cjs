// PM2 Application Configuration for Papelzinho (OPS-VPS)
// Run with: pm2 start ecosystem.config.cjs
// Reload with: pm2 reload ecosystem.config.cjs --update-env

module.exports = {
  apps: [
    {
      name: "papelzinho",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3010 -H 127.0.0.1",
      cwd: "/home/smartops/papelzinho",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3010,
        HOSTNAME: "127.0.0.1",
      },
      error_file: "/home/smartops/.pm2/logs/papelzinho-error.log",
      out_file: "/home/smartops/.pm2/logs/papelzinho-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
