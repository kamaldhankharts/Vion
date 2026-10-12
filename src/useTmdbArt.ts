import { useEffect, useState } from 'react';
import { ArtItem, TmdbArt, getTmdbArt, peekTmdbArt } from './tmdb';

interface State {
  forId?: string;
  art: TmdbArt;
  ready: boolean;
}

// ready = artwork lookup finished (or timed out), so the banner can pick its final image.
export function useTmdbArt(item?: ArtItem | null): { art: TmdbArt; ready: boolean } {
  const id = item?.id;
  const [st, setSt] = useState<State>(() => {
    const c = peekTmdbArt(id);
    return { forId: id, art: c || {}, ready: !!c };
  });

  useEffect(() => {
    if (!item) {
      setSt({ forId: undefined, art: {}, ready: true });
      return;
    }
    const cached = peekTmdbArt(item.id);
    if (cached) {
      setSt({ forId: item.id, art: cached, ready: true });
      return;
    }
    setSt({ forId: item.id, art: {}, ready: false });
    let alive = true;
    const timer = setTimeout(() => alive && setSt((s) => (s.forId === item.id ? { ...s, ready: true } : s)), 2500);
    getTmdbArt(item).then((a) => {
      if (alive) setSt({ forId: item.id, art: a, ready: true });
    });
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id]);

  return st.forId === id ? { art: st.art, ready: st.ready } : { art: {}, ready: false };
}
