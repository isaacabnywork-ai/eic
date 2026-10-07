import { galleryConfig } from '@/config/content';
import { extractImages } from '@/lib/html';
import { wpGet } from './client';
import { mediaToImage } from './normalize';
import type { ContentItem, ImageInfo, WpRaw } from './types';

const MEDIA_FIELDS = 'id,source_url,alt_text,caption,media_details,mime_type';

async function fetchMedia(query: Record<string, string | number | number[]>): Promise<ImageInfo[]> {
  const { data } = await wpGet<WpRaw[]>('/wp/v2/media', {
    per_page: galleryConfig.maxImagesPerAlbum,
    media_type: 'image',
    orderby: 'id',
    order: 'asc',
    _fields: MEDIA_FIELDS,
    ...query,
  });
  return data.map((m) => mediaToImage(m)).filter((i): i is ImageInfo => !!i);
}

/** JetEngine gallery fields can be "1,2,3", [1,2], [{id,url}] or URLs. */
export function parseGalleryMeta(value: unknown): { ids: number[]; images: ImageInfo[] } {
  const ids: number[] = [];
  const images: ImageInfo[] = [];
  const push = (v: unknown) => {
    if (typeof v === 'number') ids.push(v);
    else if (typeof v === 'string') {
      const s = v.trim();
      if (/^\d+$/.test(s)) ids.push(Number(s));
      else if (/^https?:\/\//i.test(s)) images.push({ src: s, alt: '' });
      else if (s.includes(',')) s.split(',').forEach(push);
    } else if (v && typeof v === 'object') {
      const o = v as WpRaw;
      if (typeof o.id === 'number' || /^\d+$/.test(String(o.id ?? ''))) ids.push(Number(o.id));
      else if (typeof o.url === 'string') images.push({ src: o.url, alt: String(o.alt ?? '') });
    }
  };
  if (Array.isArray(value)) value.forEach(push);
  else push(value);
  return { ids, images };
}

/**
 * Images of a gallery album. Tries, in order:
 *  1. the JetEngine gallery meta field (if configured and exposed in REST)
 *  2. <img> tags inside the post content
 *  3. media files uploaded to (attached to) the album
 *  4. the featured image
 */
export async function fetchGalleryImages(item: ContentItem): Promise<ImageInfo[]> {
  const meta = parseGalleryMeta(item.galleryMeta);
  if (meta.ids.length) {
    const byId = await fetchMedia({ include: meta.ids });
    if (byId.length) return byId;
  }
  if (meta.images.length) return meta.images;

  const inContent = extractImages(item.html);
  if (inContent.length) return inContent;

  const attached = await fetchMedia({ parent: item.id });
  if (attached.length) return attached;

  return item.image ? [item.image] : [];
}
