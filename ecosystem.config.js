module.exports = {
  apps: [
    {
      name: "kvl-tech",
      script: "server.js",
      cwd: "/opt/kvl-app",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: "3006",
        HOSTNAME: "0.0.0.0",
      },
      // Restart if RAM exceeds 400MB (prevents OOM-caused crashes)
      max_memory_restart: "400M",
      // Faster restart on crash
      exp_backoff_restart_delay: 100,
      // Wait for app to be ready before switching traffic
      listen_timeout: 8000,
      // Grace period before killing old process on restart
      kill_timeout: 5000,
      // Zero-downtime reload support
      wait_ready: false,
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      // Logging
      error_file: "/opt/kvl-app/logs/error.log",
      out_file: "/opt/kvl-app/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
}
