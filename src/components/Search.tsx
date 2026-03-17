import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export const Search: React.FC = () => {
  const { content, loading } = useContent();
  const [query, setQuery] = useState('');

  // Just showing some content as "Recently Viewed" for now
  const recentlyViewed = content.slice(0, 4);

  const searchResults = query.trim() 
    ? content.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const displayContent = query.trim() ? searchResults : recentlyViewed;
  const displayTitle = query.trim() ? 'Search Results' : 'Recently Viewed';

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Search Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-6 bg-black">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => window.dispatchEvent(new Event('hide-nav'))}
            onBlur={() => window.dispatchEvent(new Event('show-nav'))}
            className="w-full bg-white/10 border border-white/5 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-28 px-4">
        <h2 className="text-lg font-bold text-white mb-4">{displayTitle}</h2>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex flex-col gap-2">
                <div className="aspect-[2/3] rounded-xl bg-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                <div className="flex flex-col gap-1.5 px-0.5 mt-1">
                  <div className="h-3 w-full bg-white/10 rounded overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                  <div className="h-2.5 w-2/3 bg-white/10 rounded overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayContent.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {displayContent.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 cursor-pointer group">
                <div className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg bg-white/5">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col px-0.5">
                  <span className="text-sm font-medium text-white truncate">{item.title}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    {item.genre && item.genre.length > 0 ? item.genre[0] : 'Movie'} · 2026
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-12">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};
