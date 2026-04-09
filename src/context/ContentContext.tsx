import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Episode {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  watchUrl: string;
  duration?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title?: string;
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

const parseM3U = (m3uText: string) => {
  const lines = m3uText.split('\n');
  const items = [];
  let currentItem: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentItem = { type: 'live' }; // Default to live TV for M3U
      
      // Extract attributes
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/);
      
      if (tvgIdMatch && tvgIdMatch[1]) currentItem.id = tvgIdMatch[1];
      if (tvgNameMatch && tvgNameMatch[1]) currentItem.title = tvgNameMatch[1];
      if (tvgLogoMatch && tvgLogoMatch[1]) currentItem.posterUrl = tvgLogoMatch[1];
      if (groupTitleMatch && groupTitleMatch[1]) currentItem.genre = [groupTitleMatch[1]];
      
      // Extract channel name (after the comma)
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        const nameAfterComma = line.substring(commaIndex + 1).trim();
        if (nameAfterComma && !currentItem.title) {
          currentItem.title = nameAfterComma;
        }
      }
    } else if (line.startsWith('http') && currentItem) {
      currentItem.watchUrl = line;
      
      // Generate an ID if missing
      if (!currentItem.id) {
        currentItem.id = `m3u_channel_${i}_${Date.now()}`;
      }
      
      if (!currentItem.title) {
        currentItem.title = `Channel ${items.length + 1}`;
      }
      
      if (!currentItem.genre) {
        currentItem.genre = ['Live TV'];
      }
      
      items.push(currentItem);
      currentItem = null;
    }
  }
  
  return items;
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const contentUrl = localStorage.getItem('vion_content_url');
      if (!contentUrl) {
        // Provide default mock data if no URL is set
        const mockData: ContentItem[] = [
          // TV Series - Banners (10 items)
          ...Array.from({ length: 10 }).map((_, i) => ({
            id: `tv-banner-${i}`,
            title: i === 0 ? 'THE LAST OF US' : (i === 1 ? 'KING & CONQUEROR' : `EPIC TV SERIES ${i + 1}`),
            description: i === 0 
              ? 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.'
              : i === 1
              ? 'The story of a clash that defined the future of a country and a continent for a thousand years. Harold of Wessex and William of Normandy were two men destined to meet at the Battle of Hastings in 1066. These two former allies with no design on the British throne found themselves forced by circumstance and personal obsession into a war for possession of its crown.'
              : 'A gripping television series that will keep you on the edge of your seat. Follow the journey of unforgettable characters in this award-winning production.',
            posterUrl: i === 1 ? 'https://picsum.photos/seed/king-poster/800/1200' : `https://picsum.photos/seed/tv-banner-poster-${i}/800/1200`,
            bannerUrl: i === 1 ? 'https://picsum.photos/seed/king-banner/1920/1080' : `https://picsum.photos/seed/tv-banner-${i}/1920/1080`,
            type: 'tv' as const,
            category: 'Recommended',
            genre: i === 1 ? ['Drama', 'Action', 'Adventure'] : ['Drama', 'Thriller'],
            isBanner: true,
            seasons: i === 1 ? [
              {
                id: 'king-s1',
                seasonNumber: 1,
                episodes: [
                  {
                    id: 'king-s1-e1',
                    title: 'Invitation',
                    duration: '50m',
                    description: 'Harold of Wessex warns his father, Earl Godwin, of a rival\'s treachery - but he is ignored.',
                    thumbnailUrl: 'https://picsum.photos/seed/king-e1/640/360',
                    watchUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
                  },
                  {
                    id: 'king-s1-e2',
                    title: 'The Sins of the Father',
                    duration: '44m',
                    description: 'Threatened by those in power in France and England, William and Harold each face grave danger, their families in peril.',
                    thumbnailUrl: 'https://picsum.photos/seed/king-e2/640/360',
                    watchUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
                  },
                  {
                    id: 'king-s1-e3',
                    title: 'Brothers',
                    duration: '46m',
                    description: 'Harold risks returning to Wessex for his wife, while William plots against Henry in France as home truths compromise family ties.',
                    thumbnailUrl: 'https://picsum.photos/seed/king-e3/640/360',
                    watchUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
                  },
                  {
                    id: 'king-s1-e4',
                    title: 'So Be It',
                    duration: '49m',
                    description: 'Crowned heads are endangered as Harold fights for his family\'s rights and William tracks his royal foe.',
                    thumbnailUrl: 'https://picsum.photos/seed/king-e4/640/360',
                    watchUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
                  }
                ]
              }
            ] : undefined
          })),
          // Movies - Banners (10 items)
          ...Array.from({ length: 10 }).map((_, i) => ({
            id: `banner-${i}`,
            title: i === 0 ? 'MERCY' : `BLOCKBUSTER MOVIE ${i + 1}`,
            description: i === 0 
              ? 'In the near future, a detective stands on trial accused of murdering his wife. He has ninety minutes to prove his innocence to the advanced AI Judge he once championed, before it determines his fate.'
              : 'An epic adventure awaits in this cinematic masterpiece. Experience the thrill and emotion of this highly anticipated release.',
            posterUrl: i === 0 ? 'https://picsum.photos/seed/mercy-poster/800/1200' : `https://picsum.photos/seed/banner-poster-${i}/800/1200`,
            bannerUrl: i === 0 ? 'https://picsum.photos/seed/mercy-banner/1920/1080' : `https://picsum.photos/seed/banner-${i}/1920/1080`,
            type: 'movie' as const,
            category: 'Recommended',
            genre: i === 0 ? ['Science Fiction', 'Action', 'Thriller', 'Crime'] : ['Sci-Fi', 'Action'],
            isBanner: true
          })),
          // Recommended TV
          ...Array.from({ length: 6 }).map((_, i) => ({
            id: `tv-rec-${i}`,
            title: `Recommended TV ${i + 1}`,
            description: 'A great show you should watch.',
            posterUrl: `https://picsum.photos/seed/tv-rec-${i}/400/600`,
            type: 'tv' as const,
            category: 'Recommended',
            genre: ['Drama']
          })),
          // Popular TV (10 items)
          ...Array.from({ length: 10 }).map((_, i) => ({
            id: `tv-pop-${i}`,
            title: `Popular TV ${i + 1}`,
            description: 'Everyone is watching this show.',
            posterUrl: `https://picsum.photos/seed/tv-pop-${i}/400/600`,
            type: 'tv' as const,
            category: 'Popular',
            genre: ['Action']
          })),
          // Trending TV
          ...Array.from({ length: 6 }).map((_, i) => ({
            id: `tv-trend-${i}`,
            title: `Trending TV ${i + 1}`,
            description: 'Trending show right now.',
            posterUrl: `https://picsum.photos/seed/tv-trend-${i}/400/600`,
            type: 'tv' as const,
            category: 'Trending',
            genre: ['Sci-Fi']
          })),
          // Recommended
          ...Array.from({ length: 6 }).map((_, i) => ({
            id: `rec-${i}`,
            title: `Recommended Movie ${i + 1}`,
            description: 'A great movie you should watch.',
            posterUrl: `https://picsum.photos/seed/rec-${i}/400/600`,
            type: 'movie' as const,
            category: 'Recommended',
            genre: ['Action']
          })),
          // Popular (10 items)
          ...Array.from({ length: 10 }).map((_, i) => ({
            id: `pop-${i}`,
            title: `Popular Movie ${i + 1}`,
            description: 'Everyone is watching this.',
            posterUrl: `https://picsum.photos/seed/pop-${i}/400/600`,
            type: 'movie' as const,
            category: 'Popular',
            genre: ['Drama']
          })),
          // Trending
          ...Array.from({ length: 6 }).map((_, i) => ({
            id: `trend-${i}`,
            title: `Trending Movie ${i + 1}`,
            description: 'Trending right now.',
            posterUrl: `https://picsum.photos/seed/trend-${i}/400/600`,
            type: 'movie' as const,
            category: 'Trending',
            genre: ['Comedy']
          })),
          // Live TV
          ...Array.from({ length: 12 }).map((_, i) => ({
            id: `live-${i}`,
            title: `Channel ${i + 1}`,
            description: 'Live broadcast.',
            posterUrl: `https://picsum.photos/seed/live-${i}/400/600`,
            type: 'live' as const,
            category: 'Live TV',
            genre: ['News'],
            watchUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
          }))
        ];
        setContent(mockData);
        setLoading(false);
        return;
      }

      let response;
      let rawData;
      
      const fetchStrategies = [
        () => fetch(contentUrl),
        () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(contentUrl)}`),
        () => fetch(`https://corsproxy.io/?${encodeURIComponent(contentUrl)}`),
        () => fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(contentUrl)}`)
      ];

      let lastError: any;
      for (const strategy of fetchStrategies) {
        try {
          response = await strategy();
          if (response.ok) {
            const text = await response.text();
            try {
              rawData = JSON.parse(text);
            } catch (e) {
              if (text.trim().startsWith('#EXTM3U')) {
                rawData = parseM3U(text);
              } else {
                throw new Error("Content is neither valid JSON nor a valid M3U playlist.");
              }
            }
            break; // Success!
          }
        } catch (err) {
          lastError = err;
          console.warn("Fetch strategy failed, trying next...", err);
        }
      }

      if (!rawData) {
        throw new Error(`Failed to fetch from URL and all proxies. Last error: ${lastError?.message || 'Unknown error'}`);
      }

      let data: any[] = [];
      if (Array.isArray(rawData)) {
        data = rawData;
      } else if (typeof rawData === 'object' && rawData !== null) {
        Object.values(rawData).forEach((val) => {
          if (Array.isArray(val)) {
            data = [...data, ...val];
          }
        });
      }

      const maxItems = localStorage.getItem('vion_max_items');
      if (maxItems && Number(maxItems) > 0) {
        data = data.slice(0, Number(maxItems));
      }

      setContent(data);
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, error, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
};
