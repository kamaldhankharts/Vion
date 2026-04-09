import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myList, setMyList] = useState<string[]>(() => {
    const saved = localStorage.getItem('vion_my_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [downloads, setDownloads] = useState<DownloadedItem[]>(() => {
    const saved = localStorage.getItem('vion_downloads');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vion_my_list', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    localStorage.setItem('vion_downloads', JSON.stringify(downloads));
  }, [downloads]);

  const addToMyList = (id: string) => {
    setMyList(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeFromMyList = (id: string) => {
    setMyList(prev => prev.filter(item => item !== id));
  };

  const isInMyList = (id: string) => myList.includes(id);

  const addDownload = (item: DownloadedItem) => {
    setDownloads(prev => {
      const exists = prev.find(d => 
        d.contentId === item.contentId && 
        (!item.episode || d.episode?.id === item.episode.id)
      );
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeDownload = (contentId: string, episodeId?: string) => {
    setDownloads(prev => prev.filter(d => 
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
