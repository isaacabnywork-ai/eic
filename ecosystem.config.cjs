// ==============================================================================
// PM2 Ecosystem Configuration for Equip Indian Churches
// Usage: pm2 start ecosystem.config.cjs
// ==============================================================================

module.exports = {
  apps: [
    {
      name: 'equipindianchurches',
      script: './server.js',
      instances: 'max', // Multi-core cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        VITE_WP_URL: 'https://admin.equipindianchurches.com',
        VITE_SITE_URL: 'https://equipindianchurches.com',
      },
    },
  ],
};
