import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

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

interface ContentContextType {
  content: ContentItem[];
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};

type Parts = { movies: ContentItem[]; tv: ContentItem[]; live: ContentItem[] };

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
  const [parts, setParts] = useState<Parts>({ movies: [], tv: [], live: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live-sync the catalog the admin panel publishes to: catalog/{movies,tv,live}
  useEffect(() => {
    if (!uid) {
      setParts({ movies: [], tv: [], live: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const loaded = new Set<string>();
    const sections = ['movies', 'tv', 'live'] as const;

    const stops = sections.map((sec) =>
      onValue(
        ref(db, `catalog/${sec}`),
        (snap) => {
          const val = snap.val();
          const items = val ? (Object.values(val) as any[]).map(normalize) : [];
          setParts((p) => ({ ...p, [sec]: items }));
          loaded.add(sec);
          if (loaded.size === sections.length) setLoading(false);
        },
        (err) => {
          console.warn('catalog sync failed', err);
          setError('Failed to load content.');
          setLoading(false);
        }
      )
    );
    return () => stops.forEach((stop) => stop());
  }, [uid]);

  const content = useMemo(() => [...parts.movies, ...parts.tv, ...parts.live], [parts]);

  // Updates arrive automatically in real time; kept so existing callers still work.
  const refreshContent = async () => {};

  return (
    <ContentContext.Provider value={{ content, loading, error, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
};
