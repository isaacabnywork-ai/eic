import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as seed from '../src/admin/db/seed.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const SEED_FILE = path.join(DATA_DIR, 'default_seed.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const state = {
  users: seed.SEED_ADMIN_USERS,
  events: seed.SEED_EVENTS,
  categories: seed.SEED_CATEGORIES,
  tags: seed.SEED_TAGS,
  speakers: seed.SEED_SPEAKERS,
  organizers: seed.SEED_ORGANIZERS,
  venues: seed.SEED_VENUES,
  headerMenu: seed.SEED_HEADER_MENU,
  footerMenu: seed.SEED_FOOTER_MENU,
  settings: seed.SEED_SETTINGS,
  media: seed.SEED_MEDIA,
  auditLogs: seed.SEED_AUDIT_LOGS,
};

fs.writeFileSync(SEED_FILE, JSON.stringify(state, null, 2), 'utf-8');
console.log(`✓ Exported default seed to ${SEED_FILE} (${fs.statSync(SEED_FILE).size} bytes)`);
