/**
 * Runtime environment (all values come from VITE_* variables, see .env.example).
 *
 * This file is also imported by Node scripts (scripts/sitemap.js), so it must
 * work both under Vite (import.meta.env) and plain Node (process.env).
 */
type EnvBag = Record<string, string | boolean | undefined>;

const raw: EnvBag =
  (import.meta as unknown as { env?: EnvBag }).env ??
  (typeof process !== 'undefined' ? (process.env as EnvBag) : {});

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const bool = (v: unknown): boolean => v === true || str(v).toLowerCase() === 'true' || str(v) === '1';
const noTrailingSlash = (v: string): string => v.replace(/\/+$/, '');

export const env = {
  /** WordPress origin, e.g. https://equipindianchurches.com (never hardcoded in code). */
  wpUrl: noTrailingSlash(str(raw.VITE_WP_URL)),
  /** Public URL of THIS React site (canonical links, OG tags, sitemap). */
  siteUrl: noTrailingSlash(
    str(raw.VITE_SITE_URL) || (typeof window !== 'undefined' ? window.location.origin : ''),
  ),
  /** Serve generated, WordPress-shaped demo data instead of calling the API. */
  useMock: bool(raw.VITE_USE_MOCK),
  /** Feature flag: church directory page (/churches). Off by default. */
  enableChurchDirectory: bool(raw.VITE_ENABLE_CHURCH_DIRECTORY),
  /** Vite dev server (enables console warnings about missing REST fields). */
  isDev: raw.DEV === true,

  newsletterActionUrl: str(raw.VITE_NEWSLETTER_ACTION_URL),
  newsletterEmailField: str(raw.VITE_NEWSLETTER_EMAIL_FIELD) || 'email',
  contactEmail: str(raw.VITE_CONTACT_EMAIL),
  social: {
    youtube: str(raw.VITE_SOCIAL_YOUTUBE),
    facebook: str(raw.VITE_SOCIAL_FACEBOOK),
    instagram: str(raw.VITE_SOCIAL_INSTAGRAM),
    x: str(raw.VITE_SOCIAL_X),
  },
} as const;
