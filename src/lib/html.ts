import DOMPurify from 'dompurify';
import type { ImageInfo } from '@/api/types';
import { wpLinkToRoute } from './routes';
import { env } from '@/config/env';

/* ---- entities / text ------------------------------------------------ */

let decoder: HTMLTextAreaElement | null = null;

/** Decode HTML entities ("&#8217;" -> ’) without ever executing markup. */
export function decodeEntities(input: string | undefined | null): string {
  if (!input) return '';
  if (!input.includes('&')) return input;
  decoder ??= document.createElement('textarea');
  decoder.innerHTML = input;
  return decoder.value;
}

/** Plain text from HTML (safe: parsed in an inert document). */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** WordPress excerpts end with "[…]". Return clean text. */
export function cleanExcerpt(html: string | undefined | null, maxChars = 220): string {
  let text = stripHtml(html).replace(/\s*\[(?:…|\.\.\.|&hellip;)\]\s*$/, '…');
  if (text.length > maxChars) text = text.slice(0, maxChars).replace(/\s+\S*$/, '') + '…';
  return text;
}

export function readingTimeMinutes(html: string | undefined | null): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ---- sanitising ----------------------------------------------------- */

const ALLOWED_IFRAME_SRC =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|open\.spotify\.com|w\.soundcloud\.com)\//i;

let hooksInstalled = false;

function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const src = (node as Element).getAttribute('src') ?? '';
      if (!ALLOWED_IFRAME_SRC.test(src)) node.parentNode?.removeChild(node);
    }
  });

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const el = node as Element;
    switch (el.tagName) {
      case 'A': {
        const href = el.getAttribute('href');
        if (!href) break;
        const route = wpLinkToRoute(href);
        if (route) {
          el.setAttribute('data-route', route);
        } else if (/^https?:\/\//i.test(href)) {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
        break;
      }
      case 'IMG':
        el.setAttribute('loading', 'lazy');
        el.setAttribute('decoding', 'async');
        if (!el.hasAttribute('alt')) el.setAttribute('alt', '');
        break;
      case 'IFRAME':
        el.setAttribute('loading', 'lazy');
        el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        if (!el.getAttribute('title')) el.setAttribute('title', 'Embedded content');
        break;
    }
  });
}

/** Sanitise WordPress HTML before rendering it with dangerouslySetInnerHTML. */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  installHooks();
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading', 'target', 'referrerpolicy'],
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'script'],
    FORBID_ATTR: ['style'],
  });
}

/** Re-use the same safe rules for tiny inline snippets. */
export const safeWpUrl = (u: string): string => (env.wpUrl && u.startsWith('/') ? env.wpUrl + u : u);

/* ---- image extraction ----------------------------------------------- */

/** <img> tags found in post content (used for gallery albums). */
export function extractImages(html: string | undefined | null): ImageInfo[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out: ImageInfo[] = [];
  const seen = new Set<string>();
  doc.querySelectorAll('img').forEach((img) => {
    const full = img.getAttribute('data-full-url') || img.getAttribute('data-orig-file');
    const src = full || img.getAttribute('src');
    if (!src || seen.has(src)) return;
    seen.add(src);
    const w = Number(img.getAttribute('width')) || undefined;
    const h = Number(img.getAttribute('height')) || undefined;
    out.push({
      src,
      thumb: img.getAttribute('src') || src,
      srcSet: full ? undefined : img.getAttribute('srcset') || undefined,
      width: w,
      height: h,
      alt: img.getAttribute('alt') || '',
    });
  });
  return out;
}
