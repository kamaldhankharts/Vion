import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { cacheGet, cacheSet } from '../utils/cache';

export interface Episode {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  watchUrl: string;
  duration?: string;
  episodeNumber?: number;
  releaseDate?: string;
  rating?: number | string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title?: string;
  overview?: string;
  cover?: string;
  airDate?: string;
  episodes: Episode[];
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  logoUrl?: string;
  type: 'movie' | 'tv' | 'web' | 'live';
  category?: string;
  genre: string[];
  versions?: string[];
  watchUrl?: string;
  seasons?: Season[];
  languages?: string[];
  captions?: string[];
  quality?: string[];
  rating?: number;
  isBanner?: boolean;
  createdAt?: any;
  originalTitle?: string;
  screenshots?: string[];
  cast?: string;
  director?: string;
  releaseDate?: string;
  duration?: string;
  country?: string;
  ageRating?: string;
  tmdbId?: string | number;
  trailerUrl?: string;
  episodeRunTime?: string | number;
  channelNumber?: number;
  epgId?: string;
  tvArchive?: boolean;
  edited?: boolean;
}

export type Section = 'movies' | 'tv' | 'live';

interface ContentContextType {
  content: ContentItem[];
  loading: boolean;
  error: string | null;
  ready: Record<Section, boolean>;
  ensureSection: (sec: Section) => void;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};

type Parts = { movies: ContentItem[]; tv: ContentItem[]; live: ContentItem[] };
const EMPTY: Parts = { movies: [], tv: [], live: [] };
const NOT_READY: Record<Section, boolean> = { movies: false, tv: false, live: false };

// Realtime Database turns arrays into objects and drops empty ones, so rebuild them safely.
const toArr = (v: any): any[] => (!v ? [] : Array.isArray(v) ? v.filter((x) => x != null) : Object.values(v));
const byNum = (k: string) => (a: any, b: any) => (Number(a[k]) || 0) - (Number(b[k]) || 0);

const normalize = (raw: any): ContentItem => ({
  ...raw,
  title: raw.title || 'Untitled',
  description: raw.description || '',
  posterUrl: raw.posterUrl || '',
  genre: toArr(raw.genre),
  languages: raw.languages ? toArr(raw.languages) : undefined,
  quality: raw.quality ? toArr(raw.quality) : undefined,
  screenshots: raw.screenshots ? toArr(raw.screenshots) : undefined,
  seasons: raw.seasons
    ? toArr(raw.seasons)
        .map((s: any) => ({
          ...s,
          seasonNumber: Number(s.seasonNumber) || 0,
          episodes: toArr(s.episodes).sort(byNum('episodeNumber')),
        }))
        .sort(byNum('seasonNumber'))
    : undefined,
});

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [parts, setParts] = useState<Parts>(EMPTY);
  const [ready, setReady] = useState<Record<Section, boolean>>(NOT_READY);
  const [error, setError] = useState<string | null>(null);
  const starters = useRef<Partial<Record<Section, () => void>>>({});

  // 1) Paint instantly from the on-device cache.
  // 2) Movies load first (small), then series and live channels in the background.
  // 3) Everything keeps syncing in real time from catalog/{movies,tv,live}.
  useEffect(() => {
    if (!uid) {
      setParts(EMPTY);
      setReady(NOT_READY);
      starters.current = {};
      return;
    }
    setError(null);
    let cancelled = false;
    const fresh = new Set<Section>();
    const started = new Set<Section>();
    const stops: Array<() => void> = [];

    const apply = (sec: Section, val: any) => {
      const items = val ? (Object.values(val) as any[]).map(normalize) : [];
      setParts((p) => ({ ...p, [sec]: items }));
      setReady((r) => ({ ...r, [sec]: true }));
    };

    (['movies', 'tv', 'live'] as Section[]).forEach((sec) => {
      cacheGet<any>(`catalog:${sec}`).then((c) => {
        if (!cancelled && !fresh.has(sec) && c !== undefined) apply(sec, c);
      });
    });

    let othersTimer: ReturnType<typeof setTimeout> | undefined;
    const startOthers = () => {
      start('tv');
      start('live');
    };

    const start = (sec: Section) => {
      if (started.has(sec)) return;
      started.add(sec);
      stops.push(
        onValue(
          ref(db, `catalog/${sec}`),
          (snap) => {
            const val = snap.val();
            const first = !fresh.has(sec);
            fresh.add(sec);
            apply(sec, val);
            cacheSet(`catalog:${sec}`, val ?? null);
            if (sec === 'movies' && first) othersTimer = setTimeout(startOthers, 150);
          },
          (err) => {
            console.warn('catalog sync failed', err);
            setError('Failed to load content.');
            setReady((r) => ({ ...r, [sec]: true }));
          }
        )
      );
    };

    starters.current = { movies: () => start('movies'), tv: () => start('tv'), live: () => start('live') };
    start('movies');
    const fallback = setTimeout(startOthers, 4000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      if (othersTimer) clearTimeout(othersTimer);
      stops.forEach((stop) => stop());
      starters.current = {};
    };
  }, [uid]);

  const content = useMemo(() => [...parts.movies, ...parts.tv, ...parts.live], [parts]);
  const loading = !!uid && !(ready.movies || ready.tv || ready.live);
  const ensureSection = (sec: Section) => starters.current[sec]?.();

  // Updates arrive automatically in real time; kept so existing callers still work.
  const refreshContent = async () => {};

  return (
    <ContentContext.Provider value={{ content, loading, error, ready, ensureSection, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
};
