#!/usr/bin/env node

/**
 * ==============================================================================
 * Production Node.js Server for Equip Indian Churches
 * ==============================================================================
 *
 * Designed for VPS Node.js hosting (PM2, systemd, cPanel, CloudPanel, aaPanel, etc.)
 * - Zero external npm dependencies (uses native node:http, node:fs, node:zlib)
 * - Full Single Page Application (SPA) routing fallback to index.html
 * - On-the-fly Brotli and Gzip compression
 * - Vite immutable asset caching (/assets/*)
 * - Security headers & healthcheck endpoint (/healthz)
 * - Graceful shutdown handling
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'admin_db.json');
const DEFAULT_SEED_FILE = path.join(DATA_DIR, 'default_seed.json');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getDbState() {
  let seedEvents = [];
  if (fs.existsSync(DEFAULT_SEED_FILE)) {
    try {
      const seedObj = JSON.parse(fs.readFileSync(DEFAULT_SEED_FILE, 'utf-8'));
      seedEvents = Array.isArray(seedObj.events) ? seedObj.events : [];
    } catch (err) {}
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const existingStr = fs.readFileSync(DB_FILE, 'utf-8');
      const existingObj = JSON.parse(existingStr);
      if (existingObj && Array.isArray(existingObj.events)) {
        if (seedEvents.length > 0) {
          const existingSlugs = new Set(existingObj.events.map((e) => e.slug));
          const missing = seedEvents.filter((e) => !existingSlugs.has(e.slug));
          if (missing.length > 0) {
            existingObj.events = [...existingObj.events, ...missing];
            saveDbState(existingObj);
            return JSON.stringify(existingObj);
          }
        }
        return existingStr;
      }
    } catch (err) {
      console.error('Error reading admin_db.json:', err);
    }
  }
  if (fs.existsSync(DEFAULT_SEED_FILE)) {
    try {
      const seedContent = fs.readFileSync(DEFAULT_SEED_FILE, 'utf-8');
      fs.writeFileSync(DB_FILE, seedContent, 'utf-8');
      return seedContent;
    } catch (err) {
      console.error('Error initializing admin_db.json from seed:', err);
    }
  }
  return JSON.stringify({ events: [], users: [], settings: {} });
}

function saveDbState(stateObj) {
  const tmpFile = path.join(DATA_DIR, `admin_db.tmp.${Date.now()}`);
  fs.writeFileSync(tmpFile, JSON.stringify(stateObj, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Verify that dist/ exists; if missing, auto-build for zero-friction CloudPanel startup
if (!fs.existsSync(INDEX_HTML)) {
  console.log('\n📦 dist/index.html not found. Running "npm run build" automatically...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('✓ Build successful!\n');
  } catch (err) {
    console.error('\n❌ Build failed. Please run "npm run build" manually:\n', err);
    process.exit(1);
  }
}

// MIME Type Map
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=UTF-8',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const COMPRESSIBLE_EXTENSIONS = new Set([
  '.html',
  '.js',
  '.mjs',
  '.css',
  '.json',
  '.svg',
  '.xml',
  '.txt',
]);

/**
 * Send a file with proper caching, security headers, and compression
 */
function serveFile(req, res, filePath, statusCode = 200) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Type', contentType);

    // Caching Strategy
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      // Vite hashed asset - cache immutably for 1 year
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath === INDEX_HTML || filePath.includes('favicon')) {
      // index.html and favicons - revalidate immediately
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      // Other static files (favicon, sitemap, etc.)
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    // Compression negotiation (Brotli > Gzip > Raw)
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const shouldCompress = COMPRESSIBLE_EXTENSIONS.has(ext) && stats.size > 1024;

    if (shouldCompress && /\bbr\b/.test(acceptEncoding)) {
      res.writeHead(statusCode, { 'Content-Encoding': 'br', Vary: 'Accept-Encoding' });
      fs.createReadStream(filePath).pipe(zlib.createBrotliCompress()).pipe(res);
    } else if (shouldCompress && /\bgzip\b/.test(acceptEncoding)) {
      res.writeHead(statusCode, { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
      fs.createReadStream(filePath).pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(statusCode, { 'Content-Length': stats.size });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Admin Database API Endpoint
  if (pathname === '/api/admin/db') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      const dbContent = getDbState();
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Length': Buffer.byteLength(dbContent, 'utf-8'),
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        res.end(dbContent);
      }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 20 * 1024 * 1024) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payload too large' }));
          req.destroy();
        }
      });

      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.events)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid database payload' }));
            return;
          }

          saveDbState(parsed);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }));
        } catch (err) {
          console.error('Error saving admin DB:', err);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }
      });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Live WordPress Authentication Proxy Endpoint
  if (pathname === '/api/admin/auth/wp-login') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 64 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const { usernameOrEmail, password } = JSON.parse(body || '{}');
        const cleanUser = typeof usernameOrEmail === 'string' ? usernameOrEmail.trim() : '';
        const cleanPass = typeof password === 'string' ? password : '';

        if (!cleanUser || !cleanPass) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
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

          res.writeHead(200, { 'Content-Type': 'application/json' });
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

        // Authentication failed - extract WordPress error message
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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: errorMsg,
        }));
      } catch (err) {
        console.error('WP auth proxy error:', err);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Could not connect to WordPress authentication service.',
          unreachable: true,
        }));
      }
    });
    return;
  }

  // Health check endpoint
  if (pathname === '/healthz' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  // Only handle GET and HEAD requests for static SPA assets
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let targetPath = path.join(DIST_DIR, safePath);

  // Check if target is a file in dist
  fs.stat(targetPath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(req, res, targetPath);
    } else if (!err && stats.isDirectory()) {
      const subIndex = path.join(targetPath, 'index.html');
      fs.stat(subIndex, (subErr, subStats) => {
        if (!subErr && subStats.isFile()) {
          serveFile(req, res, subIndex);
        } else {
          // SPA Fallback: serve top-level index.html
          serveFile(req, res, INDEX_HTML);
        }
      });
    } else {
      // SPA Fallback: URL does not match any file, render index.html
      serveFile(req, res, INDEX_HTML);
    }
  });
});

// Start Server
server.listen(PORT, HOST, () => {
  console.log(`
===========================================================
  🚀 Equip Indian Churches Node.js Server Running
===========================================================
  Local:    http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}
  Network:  http://${HOST}:${PORT}
  Serving:  ${DIST_DIR}
  Mode:     Production
===========================================================
`);
});

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force exit if close hangs
  setTimeout(() => {
    console.error('Forcefully exiting after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
