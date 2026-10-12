import React, { useState, useRef, useEffect } from 'react';
import { MonitorPlay, Menu, User, Tv, Radio, Edit2, X, Search as SearchIcon, LayoutGrid, List, LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentRow } from './ContentRow';
import { useContent } from '../context/ContentContext';
import { useTmdbArt } from '../useTmdbArt';
import { prefetchTmdbArt } from '../tmdb';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/logo.png';

export const Home: React.FC = () => {
  const { content, loading, ready, ensureSection } = useContent();
  const { user, updateUserName, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [selectedTab, setSelectedTab] = useState<'movie' | 'tv' | 'live'>('movie');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [liveTvView, setLiveTvView] = useState<'cover' | 'list'>('cover');
  const [liveTvSearch, setLiveTvSearch] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [liveShown, setLiveShown] = useState(60);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredContent = content.filter(item => {
    if (selectedTab === 'live') return item.type === 'live';
    return item.type === selectedTab;
  });

  const bannerItems = filteredContent.filter(item => item.isBanner).slice(0, 10);
  const bannerContent = bannerItems[currentBannerIndex] || filteredContent[0];

  // TMDB: title logo PNG + plain (text-free) background for the banner
  const { art: bannerArt, ready: bannerArtReady } = useTmdbArt(bannerContent);
  const bannerKey = bannerItems.map((i) => i.id).join(',');
  useEffect(() => {
    prefetchTmdbArt(bannerItems);
  }, [bannerKey]);
  const bannerImage = bannerArtReady
    ? bannerArt.backdrop || bannerContent?.bannerUrl || bannerContent?.posterUrl
    : '';
  const bannerLogo = bannerArt.logo || bannerContent?.logoUrl;
  const bannerYear = /^\d{4}/.test(String(bannerContent?.releaseDate || ''))
    ? String(bannerContent?.releaseDate).slice(0, 4)
    : '';

  useEffect(() => {
    if (bannerItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % bannerItems.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [bannerItems.length]);

  const liveTvContent = content.filter(item => item.type === 'live');
  const searchedLiveTv = liveTvContent.filter(item => 
    item.title.toLowerCase().includes(liveTvSearch.toLowerCase())
  );
  
  // Group content by category for movies/tv
  const contentByCategory = filteredContent.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredContent>);

  // Ensure Recommended, Popular, Trending are always present if they exist in data
  const permanentCategories = ['Recommended', 'Popular', 'Trending'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleTabSelect = (tab: 'movie' | 'tv' | 'live') => {
    setSelectedTab(tab);
    ensureSection(tab === 'movie' ? 'movies' : tab);
    setCurrentBannerIndex(0);
    setIsMenuOpen(false);
  };

  const handleEditClick = () => {
    setNewUserName(user?.displayName || '');
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSaveName = async () => {
    if (newUserName.trim()) {
      try {
        await updateUserName(newUserName.trim());
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Failed to update name", error);
      }
    }
  };

  const handleBannerClick = () => {
    if (bannerContent) {
      navigate(`/details/${bannerContent.id}`);
    }
  };

  const getTabIcon = () => {
    switch (selectedTab) {
      case 'movie': return <MonitorPlay className="w-4 h-4 text-white fill-white" />;
      case 'tv': return <Tv className="w-4 h-4 text-white fill-white" />;
      case 'live': return <Radio className="w-4 h-4 text-white" />;
    }
  };

  const getTabLabel = () => {
    switch (selectedTab) {
      case 'movie': return 'Movies';
      case 'tv': return 'TV Series';
      case 'live': return 'Live TV';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <img src={logo} alt="ViON" className="h-9 w-auto object-contain" />
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {getTabIcon()}
            <span className="text-sm font-medium text-white">{getTabLabel()}</span>
          </button>
          <button className="p-1 relative" onClick={() => navigate('/notifications')} aria-label="Notifications">
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button className="p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[#1e1e1e] rounded-3xl p-3 shadow-2xl border border-white/5 z-50">
              <div className="flex items-center justify-between mb-2 p-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <button 
                  onClick={handleEditClick}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full"
                >
                  <Edit2 className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Edit</span>
                </button>
              </div>

              <div className="space-y-1">
                <button 
                  onClick={() => handleTabSelect('movie')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${selectedTab === 'movie' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <MonitorPlay className={`w-6 h-6 ${selectedTab === 'movie' ? 'text-white fill-white' : 'text-gray-400'}`} />
                  <span className={`text-base font-medium ${selectedTab === 'movie' ? 'text-white' : 'text-gray-300'}`}>Movies</span>
                </button>
                <button 
                  onClick={() => handleTabSelect('tv')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${selectedTab === 'tv' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <Tv className={`w-6 h-6 ${selectedTab === 'tv' ? 'text-white fill-white' : 'text-gray-400'}`} />
                  <span className={`text-base font-medium ${selectedTab === 'tv' ? 'text-white' : 'text-gray-300'}`}>TV Series</span>
                </button>
                <button 
                  onClick={() => handleTabSelect('live')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${selectedTab === 'live' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <Radio className={`w-6 h-6 ${selectedTab === 'live' ? 'text-white' : 'text-gray-400'}`} />
                  <span className={`text-base font-medium ${selectedTab === 'live' ? 'text-white' : 'text-gray-300'}`}>Live TV</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-20 pb-8">
        {loading || !ready[selectedTab === 'movie' ? 'movies' : selectedTab] ? (
          <div className="space-y-8 pt-24">
            {/* Hero Banner Skeleton */}
            <div className="relative w-full h-[75vh] md:h-[85vh] bg-white/5 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            
            {/* Content Rows Skeletons */}
            {[1, 2, 3].map((row) => (
              <div key={row} className="w-full py-2 pl-4">
                <div className="h-5 w-48 bg-white/10 rounded mb-3 overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                <div className="flex gap-3 overflow-x-hidden pb-4 pr-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="relative flex-none w-[120px] flex flex-col gap-2">
                      <div className="w-full aspect-[2/3] rounded-xl bg-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : selectedTab === 'live' ? (
          <div className="pt-24 px-4 space-y-6">
            {/* Live TV Search */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search"
                value={liveTvSearch}
                onChange={(e) => { setLiveTvSearch(e.target.value); setLiveShown(60); }}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/10"
              />
            </div>

            {/* Live TV Content */}
            <div className="pb-20">
              {liveTvView === 'cover' ? (
                <div className="grid grid-cols-3 gap-3">
                  {searchedLiveTv.slice(0, liveShown).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/details/${item.id}`)}
                      className="flex flex-col gap-2 text-left"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                        {item.posterUrl && (
                          <img src={item.posterUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <span className="text-xs text-gray-300 truncate w-full">{item.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchedLiveTv.slice(0, liveShown).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/details/${item.id}`)}
                      className="w-full flex items-center gap-4 bg-[#1a1a1a] p-3 rounded-2xl border border-white/5 text-left"
                    >
                      <div className="w-16 aspect-square rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {item.posterUrl && (
                          <img src={item.posterUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{item.title}</div>
                        <div className="text-xs text-gray-500 truncate">{item.category || 'Live TV'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchedLiveTv.length === 0 && (
                <p className="text-center text-gray-500 pt-10">No channels found.</p>
              )}
              {searchedLiveTv.length > liveShown && (
                <button
                  onClick={() => setLiveShown((n) => n + 60)}
                  className="w-full mt-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-sm font-semibold"
                >
                  Show more ({searchedLiveTv.length - liveShown} left)
                </button>
              )}
            </div>

            {/* View Toggle Floating Button */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-1 shadow-2xl">
                <button 
                  onClick={() => setLiveTvView('cover')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${liveTvView === 'cover' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm font-bold">Cover</span>
                </button>
                <button 
                  onClick={() => setLiveTvView('list')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${liveTvView === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm font-bold">List</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Banner Carousel */}
            <div 
              className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden cursor-pointer"
              onClick={handleBannerClick}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={bannerContent?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {bannerImage && (
                    <motion.img
                      src={bannerImage}
                      alt=""
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ opacity: { duration: 0.6 }, scale: { duration: 6, ease: "linear" } }}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end items-center text-center pb-12"
                  >
                    {bannerLogo && (
                      <img
                        src={bannerLogo}
                        alt=""
                        className="h-20 md:h-28 max-w-[75%] object-contain mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-4 font-medium">
                      {bannerContent?.genre && bannerContent.genre.length > 0 && (
                        <span>{bannerContent.genre[0]}</span>
                      )}
                      {bannerYear && (<>{bannerContent?.genre && bannerContent.genre.length > 0 && <span>•</span>}<span>{bannerYear}</span></>)}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 max-w-md mx-auto mb-6">
                      {bannerContent?.description}
                    </p>
                    <div className="flex justify-center gap-2 mb-2">
                      {bannerItems.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentBannerIndex ? 'bg-white w-4' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Permanent Sections */}
            {permanentCategories.map(category => {
              const items = contentByCategory[category];
              if (!items) return null;
              return (
                <ContentRow 
                  key={category} 
                  title={category} 
                  items={items} 
                  variant={category === 'Popular' ? 'numbered' : 'default'} 
                />
              );
            })}

            {/* Other Sections */}
            {Object.entries(contentByCategory)
              .filter(([category]) => !permanentCategories.includes(category))
              .map(([category, items]) => (
                <ContentRow key={category} title={category} items={items} />
              ))
            }
          </div>
        )}
      </div>

      {/* Edit Name Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a1a] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Profile Name</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
              
              <button
                onClick={handleSaveName}
                disabled={!newUserName.trim()}
                className="w-full bg-white text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
