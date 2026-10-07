import type { ContentKey, TaxKey } from '@/config/content';
import type { VideoSource } from '@/lib/video';

/** Raw WordPress REST object (only what we touch is typed). */
export type WpRaw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface ImageInfo {
  src: string;
  /** Smaller rendition for grids */
  thumb?: string;
  srcSet?: string;
  width?: number;
  height?: number;
  alt: string;
  caption?: string;
}

export interface Person {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  description?: string;
}

export interface Term {
  id: number;
  name: string;
  slug: string;
  taxonomy: TaxKey;
  count?: number;
  parent?: number;
  description?: string;
}

/** Normalised content item used by every card and page. */
export interface ContentItem {
  id: number;
  type: ContentKey;
  slug: string;
  title: string;
  /** Plain-text summary (may be empty, e.g. videos have no excerpt). */
  excerpt: string;
  /** Raw (unsanitised!) HTML. Always render through <RichContent>. */
  html: string;
  date: string;
  modified: string;
  sticky: boolean;
  image?: ImageInfo;
  author?: Person;
  /** Embedded terms grouped by taxonomy (needs ?_embed) */
  terms: Partial<Record<TaxKey, Term[]>>;
  /** Term ids straight from the item (always present, even without _embed) */
  termIds: Partial<Record<TaxKey, number[]>>;
  meta: Record<string, unknown>;

  // videos & sermons
  video?: VideoSource;
  audioUrl?: string;
  speaker?: string;
  // book reviews
  bookTitle?: string;
  bookAuthor?: string;
  rating?: number;
  buyUrl?: string;
  // gallery
  galleryMeta?: unknown;
  // events
  eventDate?: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
}

export interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
  author?: number;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'title' | 'relevance' | 'modified' | 'id';
  include?: number[];
  exclude?: number[];
  slug?: string;
  sticky?: boolean;
  /** Filter by term ids per taxonomy (OR within a taxonomy, AND between taxonomies). */
  terms?: Partial<Record<TaxKey, number[]>>;
  /** Slim payload for list views (no full content). Default true. */
  lite?: boolean;
}

export interface TermParams {
  page?: number;
  perPage?: number;
  search?: string;
  slug?: string;
  orderby?: 'name' | 'count' | 'id';
  order?: 'asc' | 'desc';
  hideEmpty?: boolean;
  parent?: number;
  include?: number[];
}

export interface UserParams {
  page?: number;
  perPage?: number;
  search?: string;
}
