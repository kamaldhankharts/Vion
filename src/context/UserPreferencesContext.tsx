import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { ContentItem, Episode } from './ContentContext';

interface DownloadedItem {
  contentId: string;
  contentTitle: string;
  posterUrl: string;
  type: 'movie' | 'tv';
  episode?: Episode;
  downloadedAt: number;
  size: string;
}

interface UserPreferencesContextType {
  myList: string[];
  downloads: DownloadedItem[];
  addToMyList: (id: string) => void;
  removeFromMyList: (id: string) => void;
  isInMyList: (id: string) => boolean;
  addDownload: (item: DownloadedItem) => void;
  removeDownload: (contentId: string, episodeId?: string) => void;
  isDownloaded: (contentId: string, episodeId?: string) => boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  return context;
};

// Realtime Database drops undefined values with an error, so strip them first.
const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const toArray = <T,>(val: any): T[] => {
  if (!val) return [];
  return Array.isArray(val) ? val.filter(Boolean) : (Object.values(val) as T[]);
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.uid;

  const [myList, setMyList] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);

  // Always-current copies so quick consecutive taps don't use stale state.
  const myListRef = useRef<string[]>([]);
  const downloadsRef = useRef<DownloadedItem[]>([]);

  // Live-sync this user's data from Realtime Database: users/<uid>/...
  useEffect(() => {
    if (!uid) {
      myListRef.current = [];
      downloadsRef.current = [];
      setMyList([]);
      setDownloads([]);
      return;
    }

    const stopList = onValue(
      ref(db, `users/${uid}/myList`),
      (snap) => {
        const list = toArray<string>(snap.val());
        myListRef.current = list;
        setMyList(list);
      },
      (err) => console.warn('myList sync failed', err)
    );

    const stopDownloads = onValue(
      ref(db, `users/${uid}/downloads`),
      (snap) => {
        const list = toArray<DownloadedItem>(snap.val());
        downloadsRef.current = list;
        setDownloads(list);
      },
      (err) => console.warn('downloads sync failed', err)
    );

    return () => {
      stopList();
      stopDownloads();
    };
  }, [uid]);

  const saveMyList = (next: string[]) => {
    myListRef.current = next;
    setMyList(next);
    if (uid) set(ref(db, `users/${uid}/myList`), clean(next)).catch((e) => console.warn('save myList failed', e));
  };

  const saveDownloads = (next: DownloadedItem[]) => {
    downloadsRef.current = next;
    setDownloads(next);
    if (uid) set(ref(db, `users/${uid}/downloads`), clean(next)).catch((e) => console.warn('save downloads failed', e));
  };

  const addToMyList = (id: string) => {
    const cur = myListRef.current;
    if (cur.includes(id)) return;
    saveMyList([...cur, id]);
  };

  const removeFromMyList = (id: string) => {
    saveMyList(myListRef.current.filter(item => item !== id));
  };

  const isInMyList = (id: string) => myList.includes(id);

  const addDownload = (item: DownloadedItem) => {
    const cur = downloadsRef.current;
    const exists = cur.find(d =>
      d.contentId === item.contentId &&
      (!item.episode || d.episode?.id === item.episode.id)
    );
    if (exists) return;
    saveDownloads([...cur, item]);
  };

  const removeDownload = (contentId: string, episodeId?: string) => {
    saveDownloads(downloadsRef.current.filter(d =>
      !(d.contentId === contentId && (!episodeId || d.episode?.id === episodeId))
    ));
  };

  const isDownloaded = (contentId: string, episodeId?: string) => {
    return !!downloads.find(d =>
      d.contentId === contentId && (!episodeId || d.episode?.id === episodeId)
    );
  };

  return (
    <UserPreferencesContext.Provider value={{
      myList,
      downloads,
      addToMyList,
      removeFromMyList,
      isInMyList,
      addDownload,
      removeDownload,
      isDownloaded
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
