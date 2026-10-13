import React, { useState, useRef, useEffect } from 'react';
import { MonitorPlay, Menu, User, Tv, Radio, Edit2, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentRow } from './ContentRow';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/logo.png';

export const Home: React.FC = () => {
  const { content, homeSections, loading, ready, ensureSection, error } = useContent();
  const { user, updateUserName, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [selectedTab, setSelectedTab] = useState<'movie' | 'tv' | 'live'>('movie');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Banner items from first home section or filtered content
  const bannerItems =
    homeSections[0]?.items?.slice(0, 10) ||
    content.filter((i) => i.isBanner).slice(0, 10) ||
    content.slice(0, 5);

  const bannerContent = bannerItems[currentBannerIndex] || content[0];

  // Sections for current tab
  const displaySections = (() => {
    if (selectedTab === 'live') return [];
    if (homeSections.length > 0) {
      return homeSections
        .slice(1) // skip banner section
        .filter((sec) => {
          if (selectedTab === 'movie') {
            return /movie|nollywood|popular movie/i.test(sec.title) || !/series|tv|animation/i.test(sec.title);
          }
          // tv
          return /series|tv|animation|anime|popular series/i.test(sec.title);
        })
        .map((sec) => ({
          title: sec.title,
          items: sec.items.filter((i) =>
            selectedTab === 'movie' ? i.type === 'movie' || !i.type : i.type === 'tv' || !i.type
          ),
        }))
        .filter((s) => s.items.length > 0);
    }
    // fallback: group by category
    const filtered = content.filter((i) =>
      selectedTab === 'movie' ? i.type === 'movie' : i.type === 'tv'
    );
    const byCat: Record<string, typeof filtered> = {};
    filtered.forEach((item) => {
      const cat = item.category || (selectedTab === 'movie' ? 'Movies' : 'TV Series');
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(item);
    });
    return Object.entries(byCat).map(([title, items]) => ({ title, items }));
  })();

  useEffect(() => {
    if (bannerItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % bannerItems.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [bannerItems.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleTabSelect = (tab: 'movie' | 'tv' | 'live') => {
    setSelectedTab(tab);
    ensureSection(tab === 'movie' ? 'movies' : tab === 'tv' ? 'tv' : 'live');
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
      } catch (e) {
        console.error('Failed to update name', e);
      }
    }
  };

  const handleBannerClick = () => {
    if (bannerContent) navigate(`/details/${bannerContent.slug || bannerContent.id}`);
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

  const isLoading = loading && homeSections.length === 0;

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
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 text-red-400"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-base font-medium">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 pb-8">
        {isLoading ? (
          <div className="space-y-8 pt-24">
            <div className="relative w-full h-[75vh] bg-white/5 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            {[1, 2, 3].map((row) => (
              <div key={row} className="w-full py-2 pl-4">
                <div className="h-5 w-48 bg-white/10 rounded mb-3" />
                <div className="flex gap-3 overflow-x-hidden pb-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="w-[120px] flex-none">
                      <div className="aspect-[2/3] rounded-xl bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error && homeSections.length === 0 ? (
          <div className="pt-32 px-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black rounded-full font-bold"
            >
              Retry
            </button>
          </div>
        ) : selectedTab === 'live' ? (
          <div className="pt-32 px-6 text-center text-gray-400">
            <Radio className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">Live TV coming soon</p>
            <p className="text-sm mt-2">Switch to Movies or TV Series to browse content.</p>
          </div>
        ) : (
          <>
            {/* Hero Banner */}
            {bannerContent && (
              <div
                className="relative w-full h-[70vh] md:h-[80vh] cursor-pointer overflow-hidden"
                onClick={handleBannerClick}
              >
                <img
                  src={bannerContent.bannerUrl || bannerContent.posterUrl}
                  alt={bannerContent.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-16 left-0 right-0 px-6 text-center">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 drop-shadow-lg">
                    {bannerContent.title}
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-6">
                    {bannerContent.year && <span>{bannerContent.year}</span>}
                    {bannerContent.rating ? (
                      <>
                        <span>•</span>
                        <span>★ {Number(bannerContent.rating).toFixed(1)}</span>
                      </>
                    ) : null}
                    {bannerContent.badge && (
                      <>
                        <span>•</span>
                        <span className="text-[#ccff00]">{bannerContent.badge}</span>
                      </>
                    )}
                  </div>
                  <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-base hover:bg-gray-200 transition-colors">
                    Watch Now
                  </button>
                </div>
                {/* Dots */}
                {bannerItems.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
                    {bannerItems.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentBannerIndex(i);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentBannerIndex ? 'bg-white w-4' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Rows */}
            <div className="mt-4 space-y-2">
              {displaySections.map((sec) => (
                <ContentRow key={sec.title} title={sec.title} items={sec.items} />
              ))}
              {displaySections.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-400">
                  No content available for this section.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Name Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#1e1e1e] rounded-3xl p-6 w-full max-w-sm border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Edit Display Name</h3>
              <input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Your name"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-white/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveName}
                  className="flex-1 py-3 rounded-full bg-white text-black font-bold"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
