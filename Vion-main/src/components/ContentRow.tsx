import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentItem {
  id: string;
  title: string;
  posterUrl: string;
  type: string;
  genre?: string[];
  rating?: number;
  watchUrl?: string;
  releaseDate?: string;
}

interface ContentRowProps {
  title?: string;
  items: ContentItem[];
  variant?: 'default' | 'numbered';
}

export const ContentRow: React.FC<ContentRowProps> = ({ title, items, variant = 'default' }) => {
  const navigate = useNavigate();
  const [count, setCount] = useState(24);

  const handlePrefetch = (url?: string) => {
    if (!url) return;
    if (!document.querySelector(`link[href="${url}"]`)) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'video';
      document.head.appendChild(link);
    }
  };

  const handleClick = (item: ContentItem) => {
    navigate(`/details/${(item as any).slug || item.id}`);
  };

  return (
    <div className="w-full py-2" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 280px' }}>
      {title && (
        <div className="flex items-center gap-1 mb-3 cursor-pointer group px-4">
          <h2 className="text-[15px] font-bold text-white uppercase tracking-wide">
            {title}
          </h2>
          <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </div>
      )}
      
      <div 
        className={`flex ${variant === 'numbered' ? 'gap-10 pl-8 pr-4' : 'gap-3 px-4'} overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4`}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (count < items.length && el.scrollLeft + el.clientWidth > el.scrollWidth - 400) {
            setCount((c) => c + 24);
          }
        }}
      >
        {items.slice(0, count).map((item, index) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => handlePrefetch(item.watchUrl)}
            onClick={() => handleClick(item)}
            className={`relative flex-none ${variant === 'numbered' ? 'w-[105px]' : 'w-[120px]'} flex flex-col gap-2 snap-start cursor-pointer`}
          >
            <div className="relative flex items-end">
              {variant === 'numbered' && (
                <span 
                  className="absolute -left-5 -bottom-3 text-[110px] font-black leading-none text-transparent select-none z-20" 
                  style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.8)', textShadow: '0 0 15px rgba(0,0,0,0.5)' }}
                >
                  {index + 1}
                </span>
              )}
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg bg-white/5 z-10">
                <img 
                  src={item.posterUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="flex flex-col px-0.5">
              <span className="text-sm font-medium text-white truncate">{item.title}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {item.genre && item.genre.length > 0 ? item.genre[0] : (item.type === 'tv' ? 'TV Series' : 'Movie')}{/^\d{4}/.test(String(item.releaseDate || '')) ? ` · ${String(item.releaseDate).slice(0, 4)}` : ''}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
