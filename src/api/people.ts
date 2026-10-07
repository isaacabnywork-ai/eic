import { decodeEntities } from '@/lib/html';
import type { Person, WpRaw } from './types';

/** Person from a /wp/v2/users object (also works for embedded authors). */
export function normalizePersonRaw(a: WpRaw | undefined): Person | undefined {
  if (!a || typeof a.id !== 'number' || !a.name) return undefined;
  const urls: Record<string, string> = a.avatar_urls ?? {};
  return {
    id: a.id,
    name: decodeEntities(a.name),
    slug: a.slug ?? String(a.id),
    avatar: urls['96'] ?? urls['48'] ?? urls['24'],
    description: typeof a.description === 'string' ? decodeEntities(a.description) : undefined,
  };
}
