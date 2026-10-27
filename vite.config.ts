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

        // Live WordPress Authentication Proxy Endpoint
        if (url === '/api/admin/auth/wp-login') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
            return;
          }

          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const { usernameOrEmail, password } = JSON.parse(body || '{}');
              const cleanUser = typeof usernameOrEmail === 'string' ? usernameOrEmail.trim() : '';
              const cleanPass = typeof password === 'string' ? password : '';

              if (!cleanUser || !cleanPass) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Please enter both username/email and password.' }));
                return;
              }

              const wpUrl = 'https://admin.equipindianchurches.com/wp-login.php';
              const params = new URLSearchParams();
              params.set('log', cleanUser);
              params.set('pwd', cleanPass);
              params.set('wp-submit', 'Log In');
              params.set('redirect_to', 'https://admin.equipindianchurches.com/wp-admin/');
              params.set('testcookie', '1');

              const wpRes = await fetch(wpUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Cookie': 'wordpress_test_cookie=WP%20Cookie%20check',
                },
                body: params.toString(),
                redirect: 'manual',
              });

              const location = wpRes.headers.get('location') || '';
              const cookies = typeof wpRes.headers.getSetCookie === 'function'
                ? wpRes.headers.getSetCookie()
                : [wpRes.headers.get('set-cookie') || ''];

              const hasLoggedInCookie = cookies.some((c) => c && c.includes('wordpress_logged_in_'));
              const isRedirectToAdmin = (wpRes.status === 302 || wpRes.status === 301 || wpRes.status === 303) && location.includes('wp-admin');

              if (isRedirectToAdmin || hasLoggedInCookie) {
                let resolvedUsername = cleanUser;
                for (const c of cookies) {
                  if (c && c.includes('wordpress_logged_in_')) {
                    const match = c.match(/wordpress_logged_in_[a-f0-9]+=([^;%|]+)/i);
                    if (match && match[1]) {
                      try {
                        resolvedUsername = decodeURIComponent(match[1]);
                      } catch {
                        resolvedUsername = match[1];
                      }
                    }
                    break;
                  }
                }

                const displayName = resolvedUsername.charAt(0).toUpperCase() + resolvedUsername.slice(1);
                const email = resolvedUsername.includes('@')
                  ? resolvedUsername
                  : `${resolvedUsername}@equipindianchurches.com`;

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  user: {
                    username: resolvedUsername,
                    displayName,
                    email: email.toLowerCase(),
                    role: 'administrator',
                  },
                }));
                return;
              }

              const html = await wpRes.text();
              const errMatch = html.match(/<div id=["']login_error["'][^>]*>([\s\S]*?)<\/div>/i);
              let errorMsg = 'Invalid WordPress username, email, or password.';
              if (errMatch && errMatch[1]) {
                errorMsg = errMatch[1]
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/&rsaquo;|&lsaquo;|&amp;|&bull;/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: errorMsg,
              }));
            } catch (err) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: 'Could not connect to WordPress authentication service.',
                unreachable: true,
              }));
            }
          });
          return;
        }

        if (url !== '/api/admin/db') {
          return next();
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET' || req.method === 'HEAD') {
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
          if (req.method === 'HEAD') {
            res.end();
          } else {
            res.end(content);
          }
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
