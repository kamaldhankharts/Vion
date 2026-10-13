import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { moviebox, mapItem, mapDetail, ContentItem, Season, Episode } from '../api/moviebox';
import { cacheGet, cacheSet } from '../utils/cache';
import { useAuth } from './AuthContext';

export type { ContentItem, Season, Episode };

export type Section = 'movies' | 'tv' | 'live';

interface HomeSection {
  title: string;
  items: ContentItem[];
}

interface ContentContextType {
  content: ContentItem[];
  homeSections: HomeSection[];
  loading: boolean;
  error: string | null;
  ready: Record<Section, boolean>;
  ensureSection: (sec: Section) => void;
  refreshContent: () => Promise<void>;
  getDetail: (slugOrId: string) => Promise<ContentItem | null>;
  getStreamUrl: (subjectId: string, detailPath: string, se?: number, ep?: number) => Promise<string | null>;
  search: (q: string) => Promise<ContentItem[]>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};

const CACHE_HOME = 'mb:home:v2';
const CACHE_MOVIES = 'mb:movies:v2';
const CACHE_TV = 'mb:tv:v2';

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [tv, setTv] = useState<ContentItem[]>([]);
  const [ready, setReady] = useState<Record<Section, boolean>>({ movies: false, tv: false, live: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHome = useCallback(async (useCache = true) => {
    try {
      if (useCache) {
        const cached = await cacheGet<{ sections: HomeSection[]; ts: number }>(CACHE_HOME);
        if (cached && Date.now() - cached.ts < 30 * 60 * 1000) {
          setHomeSections(cached.sections);
          setLoading(false);
        }
      }

      const res = await moviebox.home();
      const sections: HomeSection[] = (res.sections || []).map((sec) => {
        const isTv =
          /series|tv|animation|anime|nollywood/i.test(sec.section) &&
          !/movie/i.test(sec.section);
        return {
          title: sec.section,
          items: (sec.items || []).map((it) =>
            mapItem(it, sec.section, isTv ? 'tv' : 'movie')
          ),
        };
      });

      // Mark banner items
      if (sections[0]) {
        sections[0].items = sections[0].items.map((i) => ({ ...i, isBanner: true }));
      }

      setHomeSections(sections);
      setReady((r) => ({ ...r, movies: true, tv: true }));
      setError(null);
      await cacheSet(CACHE_HOME, { sections, ts: Date.now() });
    } catch (e: any) {
      console.error('home load failed', e);
      setError(e?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async (sec: 'movies' | 'tv') => {
    try {
      const cacheKey = sec === 'movies' ? CACHE_MOVIES : CACHE_TV;
      const cached = await cacheGet<ContentItem[]>(cacheKey);
      if (cached?.length) {
        if (sec === 'movies') setMovies(cached);
        else setTv(cached);
        setReady((r) => ({ ...r, [sec]: true }));
      }

      const res =
        sec === 'movies'
          ? await moviebox.movies(1, 'RECOMMEND')
          : await moviebox.tvSeries(1, 'RECOMMEND');

      const items = (res.items || []).map((it) =>
        mapItem(it, sec === 'movies' ? 'Movies' : 'TV Series', sec === 'movies' ? 'movie' : 'tv')
      );

      if (sec === 'movies') setMovies(items);
      else setTv(items);
      setReady((r) => ({ ...r, [sec]: true }));
      await cacheSet(cacheKey, items);
    } catch (e) {
      console.warn(`${sec} catalog failed`, e);
      setReady((r) => ({ ...r, [sec]: true }));
    }
  }, []);

  useEffect(() => {
    // Load regardless of auth so guest users also see content after login redirect
    loadHome();
    loadCatalog('movies');
    loadCatalog('tv');
  }, [loadHome, loadCatalog]);

  // Also reload when user logs in (fresh session)
  useEffect(() => {
    if (user) {
      loadHome(false);
    }
  }, [user?.uid]); // eslint-disable-line

  const content = useMemo(() => {
    const fromHome = homeSections.flatMap((s) => s.items);
    const map = new Map<string, ContentItem>();
    [...fromHome, ...movies, ...tv].forEach((i) => {
      if (!map.has(i.id)) map.set(i.id, i);
    });
    return Array.from(map.values());
  }, [homeSections, movies, tv]);

  const ensureSection = useCallback(
    (sec: Section) => {
      if (sec === 'movies' && !ready.movies) loadCatalog('movies');
      if (sec === 'tv' && !ready.tv) loadCatalog('tv');
    },
    [ready, loadCatalog]
  );

  const refreshContent = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadHome(false), loadCatalog('movies'), loadCatalog('tv')]);
    setLoading(false);
  }, [loadHome, loadCatalog]);

  const getDetail = useCallback(async (slugOrId: string): Promise<ContentItem | null> => {
    try {
      // Prefer slug if it looks like one
      let slug = slugOrId;
      const existing = content.find((c) => c.id === slugOrId || c.slug === slugOrId);
      if (existing?.slug) slug = existing.slug;

      const res = await moviebox.detail(slug);
      if (res.code !== 0 || !res.data) return existing || null;
      return mapDetail(res.data);
    } catch (e) {
      console.error('detail failed', e);
      return content.find((c) => c.id === slugOrId || c.slug === slugOrId) || null;
    }
  }, [content]);

  const getStreamUrl = useCallback(
    async (subjectId: string, detailPath: string, se = 1, ep = 1): Promise<string | null> => {
      try {
        const res = await moviebox.stream(subjectId, detailPath, se, ep);
        if (!res.has_resource || !res.sources?.length) return null;
        const best = moviebox.bestSource(res.sources);
        return best?.url || null;
      } catch (e) {
        console.error('stream failed', e);
        return null;
      }
    },
    []
  );

  const search = useCallback(async (q: string): Promise<ContentItem[]> => {
    if (!q.trim()) return [];
    try {
      const res = await moviebox.search(q.trim(), 1);
      return (res.items || []).map((it) => {
        // Heuristic: if name contains Season / S\d → tv
        const isTv = /season|s\d|series/i.test(it.name);
        return mapItem(it, 'Search', isTv ? 'tv' : 'movie');
      });
    } catch (e) {
      console.error('search failed', e);
      return [];
    }
  }, []);

  return (
    <ContentContext.Provider
      value={{
        content,
        homeSections,
        loading,
        error,
        ready,
        ensureSection,
        refreshContent,
        getDetail,
        getStreamUrl,
        search,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
