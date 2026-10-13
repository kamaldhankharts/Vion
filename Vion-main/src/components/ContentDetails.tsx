import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Play,
  Plus,
  Download,
  Share2,
  Check,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useContent, ContentItem, Episode, Season } from '../context/ContentContext';
import { VideoPlayer } from './VideoPlayer';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { openLink } from '../utils/openLink';

export const ContentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content, getDetail, getStreamUrl } = useContent();
  const {
    addToMyList,
    removeFromMyList,
    isInMyList,
    addDownload,
    removeDownload,
    isDownloaded,
  } = useUserPreferences();

  const [item, setItem] = useState<ContentItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoadingDetail(true);
      setStreamError(null);

      // Instant paint from cache if available
      const cached = content.find((c) => c.id === id || c.slug === id);
      if (cached) {
        setItem(cached);
        if (cached.seasons?.length) setSelectedSeason(cached.seasons[0]);
      }

      // Always fetch full detail
      const full = await getDetail(id);
      if (!cancelled && full) {
        setItem(full);
        if (full.seasons?.length) {
          setSelectedSeason(full.seasons[0]);
        }
      }
      if (!cancelled) setLoadingDetail(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]); // eslint-disable-line

  const handleWatch = async (episode?: Episode, seOverride?: number, epOverride?: number) => {
    if (!item) return;
    setStreamLoading(true);
    setStreamError(null);

    const se = seOverride ?? selectedSeason?.seasonNumber ?? 1;
    const ep = epOverride ?? episode?.episodeNumber ?? 1;

    try {
      const url = await getStreamUrl(item.subjectId || item.id, item.detailPath || item.slug, se, ep);
      if (!url) {
        setStreamError('No stream available for this title right now.');
        setStreamLoading(false);
        return;
      }
      setActiveVideoUrl(url);
      setIsPlaying(true);
    } catch {
      setStreamError('Failed to load stream. Please try again.');
    } finally {
      setStreamLoading(false);
    }
  };

  const toggleMyList = () => {
    if (!item) return;
    if (isInMyList(item.id)) removeFromMyList(item.id);
    else addToMyList(item.id);
  };

  const handleDownload = (episode?: Episode) => {
    if (!item) return;
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
        size: '—',
      });
    }
  };

  if (loadingDetail && !item) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-400">Content not found</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-white text-black rounded-full font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24 relative">
      {/* Fullscreen player */}
      <AnimatePresence>
        {isPlaying && activeVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveVideoUrl(null);
              }}
              className="absolute top-6 left-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <VideoPlayer url={activeVideoUrl} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <img
          src={item.bannerUrl || item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="px-4 -mt-32 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-gray-400 font-medium mb-6">
            {item.genre?.length > 0 && <span>{item.genre.slice(0, 3).join(', ')}</span>}
            {item.releaseDate && (
              <>
                <span>•</span>
                <span>{String(item.releaseDate).slice(0, 4)}</span>
              </>
            )}
            {Number(item.rating) > 0 && (
              <>
                <span>•</span>
                <span>★ {Number(item.rating).toFixed(1)}</span>
              </>
            )}
            {item.type === 'tv' && item.seasons && (
              <>
                <span>•</span>
                <span>
                  {item.seasons.length} {item.seasons.length === 1 ? 'Season' : 'Seasons'}
                </span>
              </>
            )}
          </div>

          {/* Play button */}
          <button
            onClick={() => handleWatch()}
            disabled={streamLoading}
            className="w-full max-w-md bg-white text-black py-4 rounded-full flex items-center justify-center gap-3 font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl disabled:opacity-60"
          >
            {streamLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5 fill-black" />
            )}
            {streamLoading
              ? 'Loading…'
              : item.type === 'tv'
                ? `Play S${selectedSeason?.seasonNumber || 1} E1`
                : 'Watch Now'}
          </button>

          {streamError && (
            <p className="mt-3 text-sm text-red-400">{streamError}</p>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex justify-center items-center gap-12 mb-8 border-y border-white/5 py-4">
          <button onClick={toggleMyList} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              {isInMyList(item.id) ? (
                <Check className="w-6 h-6 text-[#ccff00]" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </div>
            <span
              className={`text-[11px] font-medium uppercase tracking-widest ${
                isInMyList(item.id) ? 'text-[#ccff00]' : 'text-gray-400'
              }`}
            >
              My List
            </span>
          </button>

          <button
            onClick={() => item.type === 'movie' && handleDownload()}
            className={`flex flex-col items-center gap-2 group ${
              item.type === 'tv' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              {isDownloaded(item.id) ? (
                <Check className="w-6 h-6 text-[#ccff00]" />
              ) : (
                <Download className="w-6 h-6 text-white" />
              )}
            </div>
            <span
              className={`text-[11px] font-medium uppercase tracking-widest ${
                isDownloaded(item.id) ? 'text-[#ccff00]' : 'text-gray-400'
              }`}
            >
              Download
            </span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: item.title, url: window.location.href }).catch(() => {});
              }
            }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
              Share
            </span>
          </button>
        </div>

        {/* Description */}
        <div className="mb-10 space-y-3">
          {item.description && (
            <p className="text-gray-300 text-[15px] leading-relaxed line-clamp-5 md:line-clamp-none">
              {item.description}
            </p>
          )}
          {[
            ['Cast', item.cast],
            ['Director', item.director],
            ['Duration', item.duration],
            ['Country', item.country],
            ['Languages', item.languages?.slice(0, 8).join(', ')],
          ].map(([label, value]) =>
            value ? (
              <p key={label as string} className="text-sm">
                <span className="text-gray-500">{label}: </span>
                <span className="text-gray-300">{value}</span>
              </p>
            ) : null
          )}
          {item.trailerUrl && (
            <button
              onClick={() => openLink(item.trailerUrl!)}
              className="mt-1 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-semibold"
            >
              Watch trailer
            </button>
          )}
        </div>

        {/* Episodes */}
        {item.type === 'tv' && item.seasons && item.seasons.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Episodes</h3>
              {item.seasons.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedSeason?.id}
                    onChange={(e) =>
                      setSelectedSeason(
                        item.seasons?.find((s) => s.id === e.target.value) || null
                      )
                    }
                    className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-sm font-medium focus:outline-none"
                  >
                    {item.seasons.map((s) => (
                      <option key={s.id} value={s.id}>
                        Season {s.seasonNumber}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {selectedSeason?.episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleWatch(episode)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{episode.title}</p>
                    <p className="text-xs text-gray-400">
                      S{selectedSeason.seasonNumber} · E{episode.episodeNumber}
                    </p>
                  </div>
                  {streamLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
