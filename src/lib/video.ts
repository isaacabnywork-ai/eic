/** Parse YouTube / Vimeo / direct-file URLs stored in a JetEngine "video URL" field. */
export type VideoProvider = 'youtube' | 'vimeo' | 'file' | 'unknown';

export interface VideoSource {
  provider: VideoProvider;
  /** The original (trimmed) URL */
  url: string;
  id?: string;
  /** iframe src (youtube / vimeo) */
  embedUrl?: string;
  /** Page where the video can be watched on the provider */
  watchUrl: string;
  /** Direct file URL for <video> */
  fileUrl?: string;
  /** Poster for cards; undefined for providers without a public thumbnail URL. */
  thumbnail?: string;
  thumbnailLarge?: string;
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

function parseStart(url: URL): number {
  const t = url.searchParams.get('t') ?? url.searchParams.get('start');
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
}

export function parseVideoUrl(input: unknown): VideoSource | undefined {
  if (typeof input !== 'string') return undefined;
  const raw = input.trim();
  if (!raw) return undefined;

  // JetEngine may store an <iframe> snippet: pull out the src.
  const iframeSrc = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
  const candidate = iframeSrc ?? raw;

  let url: URL;
  try {
    url = new URL(candidate.startsWith('//') ? `https:${candidate}` : candidate);
  } catch {
    return undefined;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '');

  // ---- YouTube --------------------------------------------------------
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    let id: string | undefined;
    const seg = url.pathname.split('/').filter(Boolean);
    if (host === 'youtu.be') id = seg[0];
    else if (url.pathname === '/watch') id = url.searchParams.get('v') ?? undefined;
    else if (['embed', 'shorts', 'live', 'v'].includes(seg[0])) id = seg[1];

    if (id && YT_ID.test(id)) {
      const start = parseStart(url);
      const qs = new URLSearchParams({ rel: '0', modestbranding: '1' });
      if (start) qs.set('start', String(start));
      return {
        provider: 'youtube',
        url: raw,
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${qs}`,
        watchUrl: `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`,
        thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        thumbnailLarge: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      };
    }
    // Playlist-only link
    const list = url.searchParams.get('list');
    if (list && (url.pathname === '/playlist' || !id)) {
      return {
        provider: 'youtube',
        url: raw,
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}&rel=0`,
        watchUrl: `https://www.youtube.com/playlist?list=${encodeURIComponent(list)}`,
      };
    }
    return undefined;
  }

  // ---- Vimeo ----------------------------------------------------------
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const seg = url.pathname.split('/').filter(Boolean);
    const id = seg.find((s) => /^\d+$/.test(s));
    if (id) {
      const hash = url.searchParams.get('h') ?? seg[seg.indexOf(id) + 1];
      const h = hash && /^[a-f0-9]+$/i.test(hash) ? `?h=${hash}` : '';
      return {
        provider: 'vimeo',
        url: raw,
        id,
        embedUrl: `https://player.vimeo.com/video/${id}${h}`,
        watchUrl: `https://vimeo.com/${id}`,
      };
    }
    return undefined;
  }

  // ---- Direct file ----------------------------------------------------
  if (/\.(mp4|webm|ogv|m4v)(\?.*)?$/i.test(url.pathname + url.search)) {
    return { provider: 'file', url: raw, fileUrl: url.toString(), watchUrl: url.toString() };
  }

  return { provider: 'unknown', url: raw, watchUrl: url.toString() };
}

export function isDirectAudio(url: string | undefined): boolean {
  return !!url && /\.(mp3|m4a|ogg|wav|aac)(\?.*)?$/i.test(url);
}
