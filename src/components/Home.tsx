import React, { useState, useRef, useEffect } from 'react';
import { MonitorPlay, Menu, User, Tv, Radio, Edit2, X } from 'lucide-react';
import { ContentRow } from './ContentRow';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { content, loading } = useContent();
  const { user, updateUserName } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'movie' | 'tv' | 'live'>('movie');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredContent = content.filter(item => item.type === selectedTab);
  
  // Group content by category
  const contentByCategory = filteredContent.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredContent>);

  // Find banner content for the current tab, fallback to first item if no banner is explicitly set
  const bannerContent = filteredContent.find(item => item.isBanner) || filteredContent[0];

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
        <h1 className="text-[28px] font-bold text-white tracking-wider">ViON</h1>
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {getTabIcon()}
            <span className="text-sm font-medium text-white">{getTabLabel()}</span>
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

      {/* Content Rows */}
      <div className="relative z-20 pb-8 space-y-8">
        {loading || filteredContent.length === 0 ? (
          <>
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
                    <div
                      key={item}
                      className="relative flex-none w-[120px] flex flex-col gap-2"
                    >
                      <div className="w-full aspect-[2/3] rounded-xl bg-white/10 relative overflow-hidden">
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
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Hero Banner */}
            {bannerContent && (
              <div className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden">
                <img 
                  src={bannerContent.bannerUrl || bannerContent.posterUrl} 
                  alt={bannerContent.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end items-center text-center pb-12">
                  {bannerContent.logoUrl ? (
                    <img 
                      src={bannerContent.logoUrl} 
                      alt={bannerContent.title} 
                      className="h-24 md:h-32 object-contain mb-4"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <h2 className="text-6xl md:text-8xl font-black text-[#ccff00] mb-3 tracking-tighter uppercase" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                      {bannerContent.title}
                    </h2>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-4 font-medium">
                    {bannerContent.genre && bannerContent.genre.length > 0 && (
                      <span>{bannerContent.genre[0]}</span>
                    )}
                    {bannerContent.genre && bannerContent.genre.length > 0 && <span>•</span>}
                    <span>2026</span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 max-w-md mx-auto mb-6">
                    {bannerContent.description}
                  </p>
                  <div className="flex justify-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
            )}

            {Object.entries(contentByCategory).map(([category, items]) => (
              <ContentRow key={category} title={category} items={items} />
            ))}
          </>
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
