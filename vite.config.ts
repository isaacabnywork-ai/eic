import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

function adminDbDevPlugin(): Plugin {
  const rootDir = fileURLToPath(new URL('.', import.meta.url));
  const dataDir = path.join(rootDir, 'data');
  const dbFile = path.join(dataDir, 'admin_db.json');
  const seedFile = path.join(dataDir, 'default_seed.json');

  return {
    name: 'admin-db-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url !== '/api/admin/db') {
          return next();
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }
          let content = '{}';
          if (fs.existsSync(dbFile)) {
            content = fs.readFileSync(dbFile, 'utf-8');
          } else if (fs.existsSync(seedFile)) {
            content = fs.readFileSync(seedFile, 'utf-8');
            fs.writeFileSync(dbFile, content, 'utf-8');
          }
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(content);
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }
              const tmpFile = path.join(dataDir, `admin_db.tmp.${Date.now()}`);
              fs.writeFileSync(tmpFile, JSON.stringify(parsed, null, 2), 'utf-8');
              fs.renameSync(tmpFile, dbFile);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end('Method Not Allowed');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), adminDbDevPlugin()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
});
