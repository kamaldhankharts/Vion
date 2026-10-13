/**
 * MovieBox Pure API client
 * Base: https://web-production-31785.up.railway.app
 */

const BASE = (import.meta as any).env?.VITE_MOVIEBOX_API || 'https://web-production-31785.up.railway.app';

async function get<T = any>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : `${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MbItem {
  name: string;
  poster_url: string;
  slug: string;
  subject_id: string;
  badge?: string;
  rating?: string | number;
  year?: string;
}

export interface MbSection {
  section: string;
  count: number;
  items: MbItem[];
}

export interface MbHomeResponse {
  status: string;
  sections: MbSection[];
}

export interface MbSearchResponse {
  query: string;
  page: number;
  total: number;
  items: MbItem[];
}

export interface MbCatalogResponse {
  page: number;
  per_page: number;
  total: number;
  items: MbItem[];
}

export interface MbStreamSource {
  resolution: string;
  format: string;
  url: string;
  size: string;
  duration: number;
  codec: string;
}

export interface MbStreamResponse {
  subject_id: string;
  se: number;
  ep: number;
  has_resource: boolean;
  sources: MbStreamSource[];
  hls: any[];
  dash: any[];
  free_episodes: number;
  limited: boolean;
  note: string | null;
}

export interface MbCaption {
  id: string;
  lan: string;
  lanName: string;
  url: string;
  size: string;
  delay: number;
}

export interface MbCaptionsResponse {
  subject_id: string;
  se: number;
  ep: number;
  count: number;
  captions: MbCaption[];
}

export interface MbSeasonResource {
  se: number;
  maxEp: number;
  allEp: string;
  resolutions: { resolution: number; epNum: number }[];
}

export interface MbDetailData {
  subject: {
    subjectId: string;
    subjectType: number;
    title: string;
    description: string;
    releaseDate: string;
    duration: number;
    genre: string;
    cover: { url: string; width?: number; height?: number; blurHash?: string };
    countryName: string;
    imdbRatingValue: string;
    imdbRatingCount?: number;
    subtitles: string;
    hasResource: boolean;
    trailer?: { videoAddress?: { url: string }; cover?: { url: string } };
    detailPath: string;
    season: number;
    dubs?: { subjectId: string; lanName: string; lanCode: string; original: boolean; detailPath: string }[];
    isPornographic?: boolean;
  };
  stars?: { staffId: string; staffType: number; name: string; character: string; avatarUrl: string }[];
  resource?: {
    seasons: MbSeasonResource[];
    source?: string;
    uploadBy?: string;
  };
  metadata?: { title: string; description: string; image: string };
  accessStrategy?: {
    ruleType: number;
    requiredVipLevel: number;
    freeEpisodeCount: number;
    previewSeconds: number;
  };
}

export interface MbDetailResponse {
  code: number;
  message: string;
  data: MbDetailData;
}

// ─── App-facing types (compatible with existing ContentItem) ─────────────────

export interface ContentItem {
  id: string;                 // subject_id
  slug: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  logoUrl?: string;
  type: 'movie' | 'tv' | 'web' | 'live';
  category?: string;
  genre: string[];
  rating?: number;
  releaseDate?: string;
  duration?: string;
  country?: string;
  languages?: string[];
  quality?: string[];
  cast?: string;
  director?: string;
  trailerUrl?: string;
  isBanner?: boolean;
  seasons?: Season[];
  watchUrl?: string;          // for movies after stream resolve
  subjectId: string;
  detailPath: string;
  hasResource?: boolean;
  badge?: string;
  year?: string;
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  watchUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title?: string;
  maxEp: number;
  allEp: string;
  resolutions: number[];
  episodes: Episode[];
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapItem(raw: MbItem, category?: string, type: 'movie' | 'tv' = 'movie'): ContentItem {
  const rating = raw.rating ? parseFloat(String(raw.rating)) : undefined;
  return {
    id: raw.subject_id,
    slug: raw.slug,
    title: raw.name,
    description: '',
    posterUrl: raw.poster_url || '',
    type,
    category: category || undefined,
    genre: [],
    rating: isNaN(rating as number) ? undefined : rating,
    year: raw.year,
    releaseDate: raw.year,
    badge: raw.badge,
    subjectId: raw.subject_id,
    detailPath: raw.slug,
    isBanner: false,
  };
}

export function mapDetail(data: MbDetailData): ContentItem {
  const s = data.subject;
  const genres = (s.genre || '').split(',').map((g) => g.trim()).filter(Boolean);
  const langs = (s.subtitles || '').split(',').map((l) => l.trim()).filter(Boolean);

  const stars = data.stars || [];
  const directors = stars.filter((x) => x.staffType === 2).map((x) => x.name);
  const cast = stars.filter((x) => x.staffType === 1).map((x) => x.name);

  const seasons: Season[] = (data.resource?.seasons || []).map((se) => {
    const eps: Episode[] = [];
    const max = se.maxEp || 0;
    for (let i = 1; i <= max; i++) {
      eps.push({
        id: `${s.subjectId}-s${se.se}-e${i}`,
        title: `Episode ${i}`,
        episodeNumber: i,
      });
    }
    return {
      id: `season-${se.se}`,
      seasonNumber: se.se,
      title: `Season ${se.se}`,
      maxEp: se.maxEp,
      allEp: se.allEp || '',
      resolutions: (se.resolutions || []).map((r) => r.resolution),
      episodes: eps,
    };
  });

  const isTv = seasons.length > 0 || s.subjectType === 2;

  return {
    id: s.subjectId,
    slug: s.detailPath,
    title: s.title,
    description: s.description || '',
    posterUrl: s.cover?.url || '',
    bannerUrl: s.cover?.url || data.metadata?.image,
    type: isTv ? 'tv' : 'movie',
    genre: genres,
    rating: s.imdbRatingValue ? parseFloat(s.imdbRatingValue) : undefined,
    releaseDate: s.releaseDate,
    duration: s.duration ? `${Math.round(s.duration / 60)} min` : undefined,
    country: s.countryName,
    languages: langs.slice(0, 12),
    cast: cast.slice(0, 8).join(', '),
    director: directors.slice(0, 4).join(', '),
    trailerUrl: s.trailer?.videoAddress?.url,
    seasons: seasons.length ? seasons : undefined,
    subjectId: s.subjectId,
    detailPath: s.detailPath,
    hasResource: s.hasResource,
  };
}

// ─── API methods ─────────────────────────────────────────────────────────────

export const moviebox = {
  home: () => get<MbHomeResponse>('/home'),

  search: (q: string, page = 1) =>
    get<MbSearchResponse>('/search', { q, page }),

  suggest: (q: string) =>
    get<{ suggestions: { title: string }[] }>('/search/suggest', { q }),

  movies: (page = 1, sort = 'RECOMMEND') =>
    get<MbCatalogResponse>('/movies', { page, sort }),

  tvSeries: (page = 1, sort = 'RECOMMEND') =>
    get<MbCatalogResponse>('/tv-series', { page, sort }),

  animation: (page = 1, sort = 'RECOMMEND') =>
    get<MbCatalogResponse>('/animation', { page, sort }),

  detail: (slug: string) =>
    get<MbDetailResponse>(`/detail/${encodeURIComponent(slug)}`),

  stream: (subjectId: string, detailPath: string, se = 1, ep = 1) =>
    get<MbStreamResponse>(`/api/stream/${subjectId}`, {
      detail_path: detailPath,
      se,
      ep,
    }),

  captions: (subjectId: string, detailPath: string, se = 1, ep = 1) =>
    get<MbCaptionsResponse>(`/api/stream/${subjectId}/captions`, {
      detail_path: detailPath,
      se,
      ep,
    }),

  /** Pick best available MP4 (prefer highest resolution) */
  bestSource(sources: MbStreamSource[]): MbStreamSource | null {
    if (!sources?.length) return null;
    const order = ['1080p', '720p', '480p', '360p'];
    for (const res of order) {
      const found = sources.find((s) => s.resolution === res);
      if (found) return found;
    }
    return sources[0];
  },
};

export default moviebox;
