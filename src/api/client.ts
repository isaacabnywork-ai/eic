import { env } from '@/config/env';

export type ApiErrorKind = 'config' | 'network' | 'http' | 'parse';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status: number;
  code?: string;
  url: string;
  constructor(kind: ApiErrorKind, message: string, opts: { status?: number; code?: string; url?: string } = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = opts.status ?? 0;
    this.code = opts.code;
    this.url = opts.url ?? '';
  }
}

export interface WpResponse<T> {
  data: T;
  total: number;
  totalPages: number;
}

export type QueryValue = string | number | boolean | (string | number)[] | undefined | null;
export type Query = Record<string, QueryValue>;

export function buildQuery(query: Query = {}): URLSearchParams {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) qs.set(key, value.join(','));
    } else {
      qs.set(key, String(value));
    }
  }
  return qs;
}

/**
 * The ONE function that talks to WordPress. Everything else in src/api builds on it.
 * `path` is relative to /wp-json, e.g. "/wp/v2/posts".
 */
export async function wpGet<T = unknown>(
  path: string,
  query: Query = {},
  opts: { signal?: AbortSignal; perPage?: number; page?: number } = {},
): Promise<WpResponse<T>> {
  const qs = buildQuery(query);

  if (env.useMock) {
    const { mockRequest } = await import('./mock');
    return mockRequest<T>(path, qs);
  }

  if (!env.wpUrl) {
    throw new ApiError(
      'config',
      'VITE_WP_URL is not set. Copy .env.example to .env and set it to your WordPress address.',
    );
  }

  const url = `${env.wpUrl}/wp-json${path}${qs.toString() ? `?${qs}` : ''}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' }, signal: opts.signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(
      'network',
      'Could not reach the content server. Check your connection. (If this keeps happening, the WordPress site may need CORS enabled for this domain — see SETUP.md.)',
      { url },
    );
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    if (res.ok) throw new ApiError('parse', 'The server returned an unexpected response.', { status: res.status, url });
  }

  if (!res.ok) {
    const err = (body ?? {}) as { code?: string; message?: string };
    // Asking for a page past the end is not an error for our UI: it is just "empty".
    if (res.status === 400 && err.code === 'rest_post_invalid_page_number') {
      return { data: [] as unknown as T, total: 0, totalPages: 0 };
    }
    throw new ApiError('http', err.message || `Request failed (${res.status}).`, {
      status: res.status,
      code: err.code,
      url,
    });
  }

  const totalHeader = res.headers.get('X-WP-Total');
  const pagesHeader = res.headers.get('X-WP-TotalPages');
  const data = body as T;
  const length = Array.isArray(data) ? data.length : 1;

  let total = totalHeader ? Number(totalHeader) : NaN;
  let totalPages = pagesHeader ? Number(pagesHeader) : NaN;
  if (Number.isNaN(total) || Number.isNaN(totalPages)) {
    // Headers are hidden by CORS (Access-Control-Expose-Headers) — degrade gracefully.
    const page = opts.page ?? 1;
    const perPage = opts.perPage ?? 10;
    totalPages = length >= perPage ? page + 1 : page;
    total = (page - 1) * perPage + length;
    if (env.isDev && Array.isArray(data)) {
      console.warn(
        '[EIC] X-WP-Total / X-WP-TotalPages headers are not readable. Add them to Access-Control-Expose-Headers (SETUP.md §2). Pagination is approximate until then.',
      );
    }
  }
  return { data, total, totalPages };
}
