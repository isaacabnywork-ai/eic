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
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

// Verify that dist/ exists
if (!fs.existsSync(INDEX_HTML)) {
  console.error('\n❌ Error: dist/index.html not found!');
  console.error('Please run "npm run build" before starting the Node.js server.\n');
  process.exit(1);
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
    } else if (filePath === INDEX_HTML) {
      // index.html - never cache so users always get new releases immediately
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
  // Only handle GET and HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

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
