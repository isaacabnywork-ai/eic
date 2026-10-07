/**
 * Videos and sermons live in ONE WordPress post type. This module decides, from
 * the hierarchical "Video Category" tree, which term ids count as "sermon".
 * Pure functions (no DOM) so scripts/sitemap.js can reuse them.
 */
export interface TermNode {
  id: number;
  slug: string;
  parent: number;
}

/** Ids of every term whose slug is listed, plus (optionally) all their descendants. */
export function collectTermIds(terms: TermNode[], slugs: string[], descendants = true): Set<number> {
  const wanted = new Set(slugs);
  const result = new Set<number>(terms.filter((t) => wanted.has(t.slug)).map((t) => t.id));
  if (!descendants) return result;
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of terms) {
      if (!result.has(t.id) && t.parent && result.has(t.parent)) {
        result.add(t.id);
        grew = true;
      }
    }
  }
  return result;
}

/** 'sermon' when the item sits in any sermon term, otherwise 'video'. */
export function classifyMedia(videoCategoryIds: number[], sermonTermIds: Set<number>): 'sermon' | 'video' {
  return videoCategoryIds.some((id) => sermonTermIds.has(id)) ? 'sermon' : 'video';
}
