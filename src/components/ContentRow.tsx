import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  posterUrl: string;
  type: string;
  genre?: string[];
  rating?: number;
  watchUrl?: string;
}

interface ContentRowProps {
  title?: string;
  items: ContentItem[];
}

export const ContentRow: React.FC<ContentRowProps> = ({ title, items }) => {
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

  return (
    <div className="w-full py-2 pl-4">
      {title && (
        <div className="flex items-center gap-1 mb-3 cursor-pointer group">
          <h2 className="text-[15px] font-bold text-white uppercase tracking-wide">
            {title}
          </h2>
          <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </div>
      )}
      
      <div 
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 pr-4"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => handlePrefetch(item.watchUrl)}
            className="relative flex-none w-[120px] flex flex-col gap-2 snap-start cursor-pointer"
          >
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg bg-white/5">
              <img 
                src={item.posterUrl} 
                alt={item.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col px-0.5">
              <span className="text-sm font-medium text-white truncate">{item.title}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {item.genre && item.genre.length > 0 ? item.genre[0] : 'Movie'} · 2026
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
