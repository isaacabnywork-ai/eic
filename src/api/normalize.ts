import { contentTypes, taxonomies, taxonomyKeyBySlug } from '@/config/content';
import type { ContentKey, TaxKey } from '@/config/content';
import { classifyMedia } from '@/lib/videoGroups';
import { parseVideoUrl } from '@/lib/video';
import { cleanExcerpt, decodeEntities } from '@/lib/html';
import { warnOnce } from '@/lib/devWarn';
import { normalizePersonRaw } from './people';
import type { ContentItem, ImageInfo, Term, WpRaw } from './types';

export interface NormalizeCtx {
  /** Term ids that make a Videos-type item a "sermon" (see config SERMON_CATEGORY_SLUGS). */
  sermonTermIds?: Set<number>;
}

/* ---- helpers --------------------------------------------------------- */

/** Read a JetEngine meta value from `meta`, `acf` or `jet` (whichever exposes it). */
export function readMeta(raw: WpRaw, key: string | undefined): unknown {
  if (!key) return undefined;
  for (const bag of ['meta', 'acf', 'jet']) {
    const v = raw[bag];
    if (v && !Array.isArray(v) && typeof v === 'object' && key in v) return (v as WpRaw)[key];
  }
  return undefined;
}

const asString = (v: unknown): string | undefined => {
  if (typeof v === 'string') return v.trim() || undefined;
  if (typeof v === 'number') return String(v);
  return undefined;
};

/** Build an ImageInfo from a /wp/v2/media object (embedded or fetched). */
export function mediaToImage(media: WpRaw | undefined, fallbackAlt = ''): ImageInfo | undefined {
  if (!media || typeof media.source_url !== 'string') return undefined;
  const details = media.media_details ?? {};
  const sizes: Record<string, WpRaw> = details.sizes ?? {};
  const list = Object.values(sizes)
    .filter((s) => s?.source_url && s?.width)
    .sort((a, b) => a.width - b.width);
  const full: ImageInfo = {
    src: media.source_url,
    width: details.width,
    height: details.height,
    alt: decodeEntities(media.alt_text) || fallbackAlt,
  };
  if (!list.length) return full;
  const pick = (w: number) => list.find((s) => s.width >= w) ?? list[list.length - 1];
  const large = sizes.large ?? pick(1024);
  const src = large?.source_url ?? full.src;
  const srcSet = list.map((s) => `${s.source_url} ${s.width}w`).join(', ');
  return {
    src,
    thumb: pick(500).source_url,
    srcSet: sizes.full ? srcSet : `${srcSet}, ${full.src} ${full.width ?? 2000}w`,
    width: large?.width ?? details.width,
    height: large?.height ?? details.height,
    alt: full.alt,
    caption: typeof media.caption?.rendered === 'string' ? cleanExcerpt(media.caption.rendered, 300) : undefined,
  };
}

const normalizePerson = normalizePersonRaw;

export function normalizeTerm(t: WpRaw, fallbackTax?: TaxKey): Term | undefined {
  const taxonomy = taxonomyKeyBySlug[t.taxonomy as string] ?? fallbackTax;
  if (!taxonomy || typeof t.id !== 'number') return undefined;
  return {
    id: t.id,
    name: decodeEntities(t.name),
    slug: t.slug,
    taxonomy,
    count: t.count,
    parent: t.parent,
    description: typeof t.description === 'string' ? decodeEntities(t.description.replace(/<[^>]+>/g, '')) : undefined,
  };
}

/** Parse "The Unfolding Mystery by Edmund Clowney" into title + author. */
export function splitBookTitle(title: string): { bookTitle: string; bookAuthor?: string } {
  const m = title.match(/^(.*\S)\s+by\s+(.+?)\s*$/i);
  return m ? { bookTitle: m[1], bookAuthor: m[2] } : { bookTitle: title };
}

/* ---- dev-time warnings ----------------------------------------------- */

function checkMeta(raw: WpRaw, type: ContentKey) {
  const cfg = contentTypes[type];
  const entries = Object.entries(cfg.meta).filter((e): e is [string, string] => !!e[1]);
  if (!entries.length) return;

  const hasAnyBag = ['meta', 'acf', 'jet'].some(
    (b) => raw[b] && !Array.isArray(raw[b]) && typeof raw[b] === 'object',
  );
  if (!hasAnyBag) {
    warnOnce(
      `nometa:${cfg.postType}`,
      `"${cfg.label}" (post type "${cfg.postType}") returns no meta object at all. In JetEngine > Post Types > ${cfg.label} > Advanced Settings turn ON "Custom Fields" under Supports, then enable "Show in REST API" on field(s): ${entries.map((e) => e[1]).join(', ')}.`,
    );
    return;
  }
  for (const [name, key] of entries) {
    if (readMeta(raw, key) === undefined) {
      warnOnce(
        `meta:${cfg.postType}:${key}`,
        `Meta field "${key}" (used for "${name}" on ${cfg.label}) is missing from the REST response. In JetEngine > Meta Fields, edit the field "${key}" and turn ON "Show in REST API".`,
      );
    }
  }
}

/* ---- main ------------------------------------------------------------- */

export function normalizeItem(raw: WpRaw, requested: ContentKey, ctx: NormalizeCtx = {}): ContentItem {
  const embedded: WpRaw = raw._embedded ?? {};

  // Term ids (always present) + embedded term objects (when ?_embed=1).
  const termIds: ContentItem['termIds'] = {};
  (Object.keys(taxonomies) as TaxKey[]).forEach((k) => {
    const ids = raw[taxonomies[k].restBase];
    if (Array.isArray(ids) && ids.length) termIds[k] = ids.filter((n): n is number => typeof n === 'number');
  });
  const terms: ContentItem['terms'] = {};
  for (const group of (embedded['wp:term'] ?? []) as WpRaw[][]) {
    for (const t of group ?? []) {
      const term = normalizeTerm(t);
      if (term) (terms[term.taxonomy] ??= []).push(term);
    }
  }

  // Resolve the concrete type for the shared Videos post type.
  let type: ContentKey = requested;
  if (requested === 'video' || requested === 'sermon' || requested === 'media') {
    type = classifyMedia(termIds.videoCategory ?? [], ctx.sermonTermIds ?? new Set());
  }

  checkMeta(raw, type === 'sermon' ? 'video' : type);
  const cfg = contentTypes[type];
  const title = decodeEntities(raw.title?.rendered);
  const author = normalizePerson(embedded.author?.[0]);
  const featured = embedded['wp:featuredmedia']?.[0] as WpRaw | undefined;

  const item: ContentItem = {
    id: raw.id,
    type,
    slug: raw.slug,
    title,
    excerpt: cleanExcerpt(raw.excerpt?.rendered),
    html: raw.content?.rendered ?? '',
    date: raw.date,
    modified: raw.modified ?? raw.date,
    sticky: !!raw.sticky,
    image: mediaToImage(featured, title),
    author,
    terms,
    termIds,
    meta: raw.meta && !Array.isArray(raw.meta) ? raw.meta : {},
  };

  if (type === 'video' || type === 'sermon') {
    item.video = parseVideoUrl(readMeta(raw, cfg.meta.videoUrl));
    item.audioUrl = asString(readMeta(raw, cfg.meta.audioUrl));
    item.speaker = asString(readMeta(raw, cfg.meta.speaker)) ?? author?.name;
    // Videos have no featured image on this site: use the provider thumbnail.
    if (!item.image && item.video?.thumbnail) {
      item.image = {
        src: item.video.thumbnailLarge ?? item.video.thumbnail,
        thumb: item.video.thumbnail,
        alt: title,
        width: 320,
        height: 180,
      };
    }
  }

  if (type === 'bookReview') {
    const parsed = splitBookTitle(title);
    item.bookTitle = parsed.bookTitle;
    item.bookAuthor = asString(readMeta(raw, cfg.meta.bookAuthor)) ?? parsed.bookAuthor;
    const rating = Number(readMeta(raw, cfg.meta.rating));
    if (Number.isFinite(rating) && rating > 0) item.rating = Math.min(5, rating);
    item.buyUrl = asString(readMeta(raw, cfg.meta.buyUrl));
  }

  if (type === 'gallery') item.galleryMeta = readMeta(raw, cfg.meta.images);
  if (type === 'event') item.eventDate = asString(readMeta(raw, cfg.meta.eventDate));

  return item;
}
