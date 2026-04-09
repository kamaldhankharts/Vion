import React from 'react';
import { ArrowDownCircle, Play, Trash2, ChevronRight } from 'lucide-react';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useNavigate } from 'react-router-dom';

export const Downloads: React.FC = () => {
  const { downloads, removeDownload } = useUserPreferences();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-6 bg-black border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Downloads</h1>
      </div>

      {/* Content */}
      <div className="pt-24 px-4">
        {downloads.length > 0 ? (
          <div className="space-y-4">
            {downloads.map((item) => (
              <div 
                key={`${item.contentId}-${item.episode?.id || 'movie'}`}
                className="flex items-center gap-4 bg-[#1a1a1a] p-3 rounded-2xl border border-white/5 group"
              >
                <div 
                  className="relative w-24 aspect-video rounded-lg overflow-hidden bg-white/5 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/details/${item.contentId}`)}
                >
                  <img 
                    src={item.episode?.thumbnailUrl || item.posterUrl} 
                    alt={item.contentTitle} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-white truncate">
                    {item.contentTitle}
                  </h3>
                  {item.episode && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      S{item.episode.id.split('-')[1]} : E{item.episode.id.split('-')[2]} · {item.episode.title}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
                    {item.size} · {item.type === 'tv' ? 'Episode' : 'Movie'}
                  </p>
                </div>

                <button 
                  onClick={() => removeDownload(item.contentId, item.episode?.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <ArrowDownCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Downloads Yet</h2>
            <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
              Content you download for offline viewing will appear here.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Find Something to Watch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
