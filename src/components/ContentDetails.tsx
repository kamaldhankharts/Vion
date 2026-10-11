import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Download, 
  Share2, 
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { useContent, ContentItem, Episode, Season } from '../context/ContentContext';
import { VideoPlayer } from './VideoPlayer';
import { useUserPreferences } from '../context/UserPreferencesContext';

export const ContentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content } = useContent();
  const { 
    addToMyList, 
    removeFromMyList, 
    isInMyList, 
    addDownload, 
    removeDownload, 
    isDownloaded 
  } = useUserPreferences();

  const [item, setItem] = useState<ContentItem | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id && content.length > 0) {
      const foundItem = content.find(i => i.id === id);
      if (foundItem) {
        setItem(foundItem);
        if (foundItem.seasons && foundItem.seasons.length > 0) {
          setSelectedSeason(foundItem.seasons[0]);
        }
      }
    }
  }, [id, content]);

  if (!item) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleWatch = (url?: string) => {
    const videoUrl = url || item.watchUrl;
    if (!videoUrl) return; // nothing to play: the admin hasn't published a stream for this title
    setActiveVideoUrl(videoUrl);
    setIsPlaying(true);
  };

  const toggleMyList = () => {
    if (isInMyList(item.id)) {
      removeFromMyList(item.id);
    } else {
      addToMyList(item.id);
    }
  };

  const handleDownload = (episode?: Episode) => {
    if (isDownloaded(item.id, episode?.id)) {
      removeDownload(item.id, episode?.id);
    } else {
      addDownload({
        contentId: item.id,
        contentTitle: item.title,
        posterUrl: item.posterUrl,
        type: item.type as 'movie' | 'tv',
        episode,
        downloadedAt: Date.now(),
        size: '450 MB'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 relative">
      {/* Background Backdrop */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <img 
          src={item.bannerUrl || item.posterUrl} 
          alt={item.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Content Info */}
      <div className="px-4 -mt-32 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          {item.logoUrl ? (
            <img src={item.logoUrl} alt={item.title} className="h-20 md:h-28 object-contain mb-4" referrerPolicy="no-referrer" />
          ) : (
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
              {item.title}
            </h1>
          )}
          
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 font-medium mb-6">
            <span>{item.genre.join(', ')}</span>
            <span>•</span>
            <span>2026</span>
            {item.type === 'tv' && item.seasons && (
              <>
                <span>•</span>
                <span>{item.seasons.length} {item.seasons.length === 1 ? 'Season' : 'Seasons'}</span>
              </>
            )}
          </div>

          {/* Main Action Button */}
          <button 
            onClick={() => handleWatch()}
            className="w-full max-w-md bg-white text-black py-4 rounded-full flex items-center justify-center gap-3 font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl"
          >
            <Play className="w-5 h-5 fill-black" />
            {item.type === 'tv' ? 'Start Season 1' : 'Watch Now'}
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex justify-center items-center gap-12 mb-8 border-y border-white/5 py-4">
          <button 
            onClick={toggleMyList}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              {isInMyList(item.id) ? (
                <Check className="w-6 h-6 text-[#ccff00]" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </div>
            <span className={`text-[11px] font-medium uppercase tracking-widest ${isInMyList(item.id) ? 'text-[#ccff00]' : 'text-gray-400'}`}>My List</span>
          </button>
          
          <button 
            onClick={() => item.type === 'movie' && handleDownload()}
            className={`flex flex-col items-center gap-2 group ${item.type === 'tv' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              {isDownloaded(item.id) ? (
                <Check className="w-6 h-6 text-[#ccff00]" />
              ) : (
                <Download className="w-6 h-6 text-white" />
              )}
            </div>
            <span className={`text-[11px] font-medium uppercase tracking-widest ${isDownloaded(item.id) ? 'text-[#ccff00]' : 'text-gray-400'}`}>Download</span>
          </button>

          <button className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Share</span>
          </button>
        </div>

        {/* Description */}
        <div className="mb-10">
          <p className="text-gray-300 text-[15px] leading-relaxed line-clamp-4 md:line-clamp-none">
            {item.description}
          </p>
        </div>

        {/* Episodes Section for TV Series */}
        {item.type === 'tv' && item.seasons && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Episodes
              </h3>
              {item.seasons.length > 1 && (
                <select 
                  value={selectedSeason?.id}
                  onChange={(e) => setSelectedSeason(item.seasons?.find(s => s.id === e.target.value) || null)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none"
                >
                  {item.seasons.map(s => (
                    <option key={s.id} value={s.id}>Season {s.seasonNumber}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-6">
              {selectedSeason?.episodes.map((episode, idx) => (
                <div key={episode.id} className="group">
                  <div 
                    onClick={() => handleWatch(episode.watchUrl)}
                    className="flex gap-4 cursor-pointer"
                  >
                    <div className="relative w-32 md:w-40 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                      <img 
                        src={episode.thumbnailUrl || item.posterUrl} 
                        alt={episode.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-[15px] font-bold text-white truncate">
                          {idx + 1}. {episode.title}
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(episode);
                          }}
                          className="p-1 transition-colors"
                        >
                          {isDownloaded(item.id, episode.id) ? (
                            <Check className="w-5 h-5 text-[#ccff00]" />
                          ) : (
                            <Download className="w-5 h-5 text-gray-400 hover:text-white" />
                          )}
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{episode.duration || '45m'}</span>
                    </div>
                  </div>
                  {episode.description && (
                    <p className="mt-3 text-sm text-gray-400 leading-relaxed line-clamp-2">
                      {episode.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Player Overlay */}
      <AnimatePresence>
        {isPlaying && activeVideoUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="absolute top-6 left-6 z-[110] flex items-center gap-4">
              <button 
                onClick={() => setIsPlaying(false)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-lg font-bold text-white drop-shadow-lg">{item.title}</h2>
            </div>
            
            <div className="flex-1 w-full h-full flex items-center justify-center">
              <VideoPlayer url={activeVideoUrl} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
