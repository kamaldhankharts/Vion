// TMDB lookups for banner artwork: the title logo (PNG) and a plain, text-free background.
const TMDB_KEY = '1b82a827bcab978b159d5255bdcc8a51';
const API = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';
const CACHE_KEY = 'vion_tmdb_v1';
const FOUND_TTL = 30 * 24 * 3600 * 1000;
const EMPTY_TTL = 2 * 24 * 3600 * 1000;

export interface TmdbArt {
  logo?: string;
  backdrop?: string;
}

export interface ArtItem {
  id: string;
  type: string;
  title: string;
  releaseDate?: string;
  tmdbId?: string | number;
}

type Entry = TmdbArt & { t: number };

let mem: Record<string, Entry> | null = null;
const load = (): Record<string, Entry> => {
  if (mem) return mem;
  try {
    mem = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    mem = {};
  }
  return mem!;
};
const save = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(mem || {}));
  } catch {
    // ignore
  }
};

const fresh = (e?: Entry) => !!e && Date.now() - e.t < (e.logo || e.backdrop ? FOUND_TTL : EMPTY_TTL);

export function peekTmdbArt(id?: string): TmdbArt | null {
  if (!id) return null;
  const e = load()[id];
  return fresh(e) ? { logo: e!.logo, backdrop: e!.backdrop } : null;
}

// Provider titles often look like "EN | Movie Name (2021) [HD]".
export function cleanTitle(raw: string): string {
  let t = raw || '';
  t = t.replace(/^[A-Z]{2,3}\s*(\||\s-\s|:)\s*/, '');
  t = t.replace(/[\[(][^\])]*[\])]/g, ' ');
  t = t.replace(/\b(4k|uhd|fhd|hd|sd|hevc|x265|multi|dual|vostfr|1080p|720p|2160p)\b/gi, ' ');
  return t.replace(/\s+[-–|]\s*$/, '').replace(/\s+/g, ' ').trim();
}

export function guessYear(item: ArtItem): string {
  const m = /\((\d{4})\)/.exec(item.title || '') || /^(\d{4})/.exec(String(item.releaseDate || ''));
  return m ? m[1] : '';
}

const getJson = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error('TMDB ' + r.status);
  return r.json();
};

export function pickLogo(logos: any[] = []): string | undefined {
  const pngs = logos.filter((l) => /\.png$/i.test(l.file_path || ''));
  pngs.sort(
    (a, b) =>
      Number(b.iso_639_1 === 'en') - Number(a.iso_639_1 === 'en') ||
      (b.vote_average || 0) - (a.vote_average || 0) ||
      (b.width || 0) - (a.width || 0)
  );
  return pngs[0] ? `${IMG}/w500${pngs[0].file_path}` : undefined;
}

// Prefer backdrops with no language (no printed title), then the best-rated.
export function pickBackdrop(backs: any[] = []): string | undefined {
  const big = backs.filter((b) => (b.width || 0) >= 1000);
  const pool = big.length ? big : backs;
  const sorted = [...pool].sort(
    (a, b) =>
      Number(b.iso_639_1 == null) - Number(a.iso_639_1 == null) ||
      (b.vote_average || 0) - (a.vote_average || 0) ||
      (b.width || 0) - (a.width || 0)
  );
  return sorted[0] ? `${IMG}/w1280${sorted[0].file_path}` : undefined;
}

async function findId(item: ArtItem, kind: 'movie' | 'tv'): Promise<number | null> {
  const given = Number(item.tmdbId);
  if (given > 0) return given;
  const q = cleanTitle(item.title);
  if (!q) return null;
  const year = guessYear(item);
  const yp = year ? (kind === 'movie' ? `&year=${year}` : `&first_air_date_year=${year}`) : '';
  const base = `${API}/search/${kind}?api_key=${TMDB_KEY}&include_adult=false&query=${encodeURIComponent(q)}`;
  let res = (await getJson(base + yp)).results || [];
  if (!res.length && yp) res = (await getJson(base)).results || [];
  return res[0]?.id ?? null;
}

const inflight = new Map<string, Promise<TmdbArt>>();
const failedAt = new Map<string, number>();

export function getTmdbArt(item: ArtItem): Promise<TmdbArt> {
  const hit = peekTmdbArt(item.id);
  if (hit) return Promise.resolve(hit);
  if (item.type !== 'movie' && item.type !== 'tv') return Promise.resolve({});
  if (Date.now() - (failedAt.get(item.id) || 0) < 60000) return Promise.resolve({});
  const running = inflight.get(item.id);
  if (running) return running;

  const kind = item.type === 'movie' ? 'movie' : 'tv';
  const p = (async () => {
    try {
      const id = await findId(item, kind);
      let art: TmdbArt = {};
      if (id) {
        const imgs = await getJson(`${API}/${kind}/${id}/images?api_key=${TMDB_KEY}&include_image_language=en,null`);
        art = { logo: pickLogo(imgs.logos), backdrop: pickBackdrop(imgs.backdrops) };
      }
      load()[item.id] = { ...art, t: Date.now() };
      save();
      return art;
    } catch {
      failedAt.set(item.id, Date.now());
      return {};
    } finally {
      inflight.delete(item.id);
    }
  })();
  inflight.set(item.id, p);
  return p;
}

// Warm the cache and the image cache for upcoming banner slides.
export function prefetchTmdbArt(items: ArtItem[]) {
  items.forEach((it) =>
    getTmdbArt(it).then((a) => {
      [a.backdrop, a.logo].forEach((u) => {
        if (u) new Image().src = u;
      });
    })
  );
}
