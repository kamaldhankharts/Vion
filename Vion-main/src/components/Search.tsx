import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContent, ContentItem } from '../context/ContentContext';

export const Search: React.FC = () => {
  const { content, search } = useContent();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const recentlyViewed = content.slice(0, 12);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await search(query.trim());
        setResults(items);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const displayContent = query.trim() ? results : recentlyViewed;
  const displayTitle = query.trim()
    ? searching
      ? 'Searching…'
      : searched
        ? `Results for "${query}"`
        : 'Search Results'
    : 'Trending Now';

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Search Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-6 bg-black">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies & series…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => window.dispatchEvent(new Event('hide-nav'))}
            onBlur={() => window.dispatchEvent(new Event('show-nav'))}
            className="w-full bg-white/10 border border-white/5 rounded-full py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-28 px-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-white">{displayTitle}</h2>
          {searching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        {searching && results.length === 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex flex-col gap-2">
                <div className="aspect-[2/3] rounded-xl bg-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        ) : displayContent.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {displayContent.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 cursor-pointer group"
                onClick={() => navigate(`/details/${item.slug || item.id}`)}
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg bg-white/5">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {item.badge && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-black/70 px-1.5 py-0.5 rounded text-[#ccff00]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-col px-0.5">
                  <span className="text-sm font-medium text-white truncate">{item.title}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    {item.type === 'tv' ? 'Series' : 'Movie'}
                    {item.year ? ` · ${item.year}` : ''}
                    {item.rating ? ` · ★ ${Number(item.rating).toFixed(1)}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : searched ? (
          <div className="text-center text-gray-400 mt-12">
            No results found for &ldquo;{query}&rdquo;
          </div>
        ) : null}
      </div>
    </div>
  );
};
