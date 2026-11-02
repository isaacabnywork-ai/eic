import { decodeEntities } from '@/lib/html';
import type { Person, WpRaw } from './types';

/** Person from a /wp/v2/users object (also works for embedded authors). */
export function normalizePersonRaw(a: WpRaw | undefined): Person | undefined {
  if (!a || typeof a.id !== 'number' || !a.name) return undefined;
  const urls: Record<string, string> = a.avatar_urls ?? {};
  const rawAvatar = urls['96'] ?? urls['48'] ?? urls['24'];

  const nameLower = (a.name || '').toLowerCase();
  const slugLower = (a.slug || '').toLowerCase();
  const isEicOrg =
    a.id === 1 ||
    slugLower === 'equipindianchurches' ||
    slugLower.includes('equip-indian') ||
    nameLower.includes('equip indian churches');

  // Never show the agency ABNY Gravatar image for Equip Indian Churches
  const hasAbnyGravatar =
    rawAvatar &&
    rawAvatar.includes('65a67fa6a0b1633d84249fd53ff904a5487aa030906bd7dc844362a25e9e8a88');

  const avatar = isEicOrg || hasAbnyGravatar ? undefined : rawAvatar;

  return {
    id: a.id,
    name: decodeEntities(a.name),
    slug: a.slug ?? String(a.id),
    avatar,
    description: typeof a.description === 'string' ? decodeEntities(a.description) : undefined,
  };
}
