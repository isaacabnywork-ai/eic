/**
 * ONE place for every endpoint name, taxonomy, meta-field key and "featured"
 * rule. Values below were verified against the live site with
 * `npm run discover` (see scripts/discover.js).
 *
 * Adding a new post type = add one entry to `contentTypes` (+ a route/page).
 * Erasable TypeScript only (no enums) so Node can import this file directly.
 */
import { env } from './env.ts';

/* ------------------------------------------------------------------ */
/* Taxonomies                                                          */
/* ------------------------------------------------------------------ */

export interface TaxonomyConfig {
  /** Taxonomy slug as registered in WordPress (appears in `_embedded['wp:term']`). */
  slug: string;
  /** REST base: used for /wp/v2/<restBase> AND as the filter query parameter name. */
  restBase: string;
  label: string;
  plural: string;
  hierarchical?: boolean;
}

export const taxonomies = {
  category: { slug: 'category', restBase: 'categories', label: 'Category', plural: 'Categories', hierarchical: true },
  tag: { slug: 'post_tag', restBase: 'tags', label: 'Tag', plural: 'Tags' },
  /** JetEngine "Series". NOTE: currently attached to Posts only (see SETUP.md §1.4). */
  series: { slug: 'series', restBase: 'series', label: 'Series', plural: 'Series' },
  topic: { slug: 'topics', restBase: 'topics', label: 'Topic', plural: 'Topics' },
  videoCategory: {
    slug: 'video-category',
    restBase: 'video-category',
    label: 'Category',
    plural: 'Categories',
    hierarchical: true,
  },
  churchState: { slug: 'church-state', restBase: 'church-state', label: 'State', plural: 'States' },
  churchCity: { slug: 'church-city', restBase: 'church-city', label: 'City', plural: 'Cities' },
  worshipLanguage: {
    slug: 'worship-language',
    restBase: 'worship-language',
    label: 'Worship language',
    plural: 'Worship languages',
  },
} as const satisfies Record<string, TaxonomyConfig>;

export type TaxKey = keyof typeof taxonomies;

/** WordPress taxonomy slug -> our key (used to read `_embedded['wp:term']`). */
export const taxonomyKeyBySlug: Record<string, TaxKey> = Object.fromEntries(
  (Object.keys(taxonomies) as TaxKey[]).map((k) => [taxonomies[k].slug, k]),
);

/* ------------------------------------------------------------------ */
/* Content types                                                       */
/* ------------------------------------------------------------------ */

export type ContentKey =
  | 'article'
  | 'video'
  | 'sermon'
  | 'media' // every item of the "Videos" post type, unsplit (search, author pages)
  | 'bookReview'
  | 'gallery'
  | 'event'
  | 'church';

/** How a "featured" item is chosen. Strategies are tried in order, first match wins. */
export type FeaturedRule =
  | { by: 'sticky' }
  | { by: 'term'; taxonomy: TaxKey; slug: string }
  /** Client-side check of a boolean/"1"/"yes" meta field among the newest 30 items. */
  | { by: 'meta'; key: string }
  | { by: 'latest' };

export interface ContentTypeConfig {
  key: ContentKey;
  label: string;
  singular: string;
  /** Post type slug in WordPress / JetEngine. */
  postType: string;
  /** rest_base from /wp-json/wp/v2/types */
  restBase: string;
  /** First path segment on this site, e.g. "articles" -> /articles, /articles/:slug */
  route: string;
  /** Taxonomies that can be used to filter this type (must be attached in WordPress). */
  taxonomies: TaxKey[];
  perPage: number;
  /** semantic name -> JetEngine meta field key. Missing keys trigger a dev warning. */
  meta: Partial<Record<string, string>>;
  /** Which taxonomies to use (in order) when looking for "related" content. */
  related: TaxKey[];
  featured: FeaturedRule[];
  /** Show only a subset of the post type, defined by terms. */
  scope?: { taxonomy: TaxKey; slugs: string[]; mode: 'include' | 'exclude'; descendants?: boolean };
  enabled: boolean;
}

/**
 * Videos AND sermons share one WordPress post type (`sermon`). They are split by
 * the hierarchical "Video Category" taxonomy: anything inside (or below) these
 * terms is a SERMON, everything else is a VIDEO. Edit this list to re-balance.
 * (Real terms on the live site: aipc, regional-conferences, monthly-meetings,
 *  a2eic, sermon-clips, book-reviews)
 */
export const SERMON_CATEGORY_SLUGS = ['aipc', 'regional-conferences', 'monthly-meetings'];

/** Events are Posts tagged/categorised with this term. */
export const EVENTS_TERM = { taxonomy: 'tag' as TaxKey, slug: 'events' };

const VIDEO_META = {
  /** JetEngine field "video_paste_url" (verified on live site) */
  videoUrl: 'video_paste_url',
  /** JetEngine field "audio_paste_url" (verified on live site) */
  audioUrl: 'audio_paste_url',
  /**
   * Optional. If you add a JetEngine "speaker" text field (Show in REST API),
   * put its key here. Until then the WordPress post author is shown as speaker.
   */
  speaker: undefined,
};

export const contentTypes: Record<ContentKey, ContentTypeConfig> = {
  article: {
    key: 'article',
    label: 'Articles',
    singular: 'Article',
    postType: 'post',
    restBase: 'posts',
    route: 'articles',
    taxonomies: ['category', 'series', 'topic', 'tag'],
    perPage: 12,
    meta: {},
    related: ['series', 'topic', 'category'],
    featured: [{ by: 'sticky' }, { by: 'term', taxonomy: 'tag', slug: 'featured' }, { by: 'latest' }],
    enabled: true,
  },

  video: {
    key: 'video',
    label: 'Videos',
    singular: 'Video',
    postType: 'sermon',
    restBase: 'sermon', // NOT "videos" — verified via /wp/v2/types
    route: 'videos',
    taxonomies: ['videoCategory', 'topic'],
    perPage: 12,
    meta: VIDEO_META,
    related: ['videoCategory', 'topic'],
    featured: [{ by: 'term', taxonomy: 'videoCategory', slug: 'featured' }, { by: 'latest' }],
    scope: { taxonomy: 'videoCategory', slugs: SERMON_CATEGORY_SLUGS, mode: 'exclude', descendants: true },
    enabled: true,
  },

  sermon: {
    key: 'sermon',
    label: 'Sermons',
    singular: 'Sermon',
    postType: 'sermon',
    restBase: 'sermon',
    route: 'sermons',
    taxonomies: ['videoCategory', 'topic'],
    perPage: 12,
    meta: VIDEO_META,
    related: ['videoCategory', 'topic'],
    featured: [{ by: 'term', taxonomy: 'videoCategory', slug: 'featured' }, { by: 'latest' }],
    scope: { taxonomy: 'videoCategory', slugs: SERMON_CATEGORY_SLUGS, mode: 'include', descendants: true },
    enabled: true,
  },

  /** Unsplit view of the Videos post type. Internal: search + author pages. */
  media: {
    key: 'media',
    label: 'Videos & Sermons',
    singular: 'Video',
    postType: 'sermon',
    restBase: 'sermon',
    route: 'videos',
    taxonomies: ['videoCategory', 'topic'],
    perPage: 12,
    meta: VIDEO_META,
    related: ['videoCategory', 'topic'],
    featured: [{ by: 'latest' }],
    enabled: true,
  },

  bookReview: {
    key: 'bookReview',
    label: 'Book Reviews',
    singular: 'Book review',
    postType: 'book-review',
    restBase: 'book-review', // NOT "book-reviews"
    route: 'book-reviews',
    taxonomies: [], // none attached today. Add e.g. 'topic' after attaching it in JetEngine.
    perPage: 12,
    meta: {
      /**
       * None of these exist in the REST response yet (the post type does not even
       * support Custom Fields). Create the fields in JetEngine, enable "Show in
       * REST API", and keep the keys below. Until then the book author is parsed
       * from titles like "The Unfolding Mystery by Edmund Clowney".
       */
      bookAuthor: 'book_author',
      rating: 'rating',
      buyUrl: 'buy_url',
    },
    related: [],
    featured: [{ by: 'latest' }],
    enabled: true,
  },

  gallery: {
    key: 'gallery',
    label: 'Gallery',
    singular: 'Album',
    postType: 'gallery',
    restBase: 'gallery',
    route: 'gallery',
    taxonomies: [],
    perPage: 12,
    meta: {
      /**
       * Optional JetEngine "Gallery" field holding the album images. Leave
       * undefined to use the automatic fallbacks (images in content -> media
       * attached to the album -> featured image), which work for most albums today.
       */
      images: undefined,
    },
    related: [],
    featured: [{ by: 'latest' }],
    enabled: true,
  },

  /** Posts that carry the "events" term. No post type of its own. */
  event: {
    key: 'event',
    label: 'Events',
    singular: 'Event',
    postType: 'post',
    restBase: 'posts',
    route: 'events',
    taxonomies: ['category', 'topic'],
    perPage: 12,
    meta: {
      /** Optional JetEngine date field (Show in REST API) holding the event date. */
      eventDate: undefined,
    },
    related: [],
    featured: [{ by: 'latest' }],
    scope: { taxonomy: EVENTS_TERM.taxonomy, slugs: [EVENTS_TERM.slug], mode: 'include' },
    enabled: true,
  },

  /** Private / Directorist based: hidden unless VITE_ENABLE_CHURCH_DIRECTORY=true. */
  church: {
    key: 'church',
    label: 'Church Directory',
    singular: 'Church',
    postType: 'church-listing',
    restBase: 'church-listing',
    route: 'churches',
    taxonomies: ['churchState', 'churchCity', 'worshipLanguage'],
    perPage: 12,
    meta: {},
    related: [],
    featured: [{ by: 'latest' }],
    enabled: env.enableChurchDirectory,
  },
};

/** Content types that appear in global search (events are posts, so already covered). */
export const searchableTypes: ContentKey[] = ['article', 'media', 'bookReview', 'gallery'];

/** Types that can be grouped inside a Series (taxonomy must be attached in WordPress). */
export const seriesTypes: ContentKey[] = (Object.values(contentTypes) as ContentTypeConfig[])
  .filter((t) => t.enabled && t.key !== 'media' && t.taxonomies.includes('series'))
  .map((t) => t.key);

/* ------------------------------------------------------------------ */
/* Other tunables                                                      */
/* ------------------------------------------------------------------ */

export const homeConfig = {
  /** Which content type feeds the hero's featured card. */
  heroSource: 'article' as ContentKey,
  latestArticles: 8,
  featuredSeriesCount: 3,
  /** Series slugs never shown in "Featured Series" (e.g. a catch-all). */
  hiddenSeriesSlugs: ['general'],
  /** If set, these series are featured (in this order) instead of the most-used ones. */
  featuredSeriesSlugs: [] as string[],
  bookReviews: 4,
  galleryPreview: 6,
  events: 3,
};

/** How many ms a response is considered fresh by TanStack Query. */
export const QUERY_STALE_MS = 5 * 60 * 1000;

/** Media endpoint settings for gallery albums. */
export const galleryConfig = { maxImagesPerAlbum: 100 };

/** Pages that live in WordPress and are linked from the header/footer. */
export const wpPages = {
  about: '/about/',
  whatIsEic: '/what-is-eic/',
  whatWeBelieve: '/what-we-believe/',
  contact: '/contact-us/',
  privacy: '/privacy-policy/',
  terms: '/terms-and-conditions/',
  podcasts: '/podcasts/',
};
