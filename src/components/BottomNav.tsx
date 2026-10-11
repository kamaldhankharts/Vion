import React, { useState, useEffect } from 'react';
import { MonitorPlay, Bookmark, ArrowDownCircle, Search, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isHidden, setIsHidden] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleHide = () => setIsHidden(true);
    const handleShow = () => setIsHidden(false);

    window.addEventListener('hide-nav', handleHide);
    window.addEventListener('show-nav', handleShow);

    let lastHeight = window.visualViewport?.height || window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      
      // If height increased significantly (keyboard closed)
      if (currentHeight > lastHeight + 100) {
        setIsHidden(false);
        if (
          document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement
        ) {
          document.activeElement.blur();
        }
      }
      
      lastHeight = currentHeight;
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('hide-nav', handleHide);
      window.removeEventListener('show-nav', handleShow);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (path === '/account' && (!user || user.email === 'kamaldhankhararts@gmail.com')) return null;
  if (isHidden) return null;

  const navItems = [
    { path: '/', label: 'Watch Next', icon: MonitorPlay },
    { path: '/my-list', label: 'My List', icon: Bookmark },
    { path: '/downloads', label: 'Downloads', icon: ArrowDownCircle },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/account', label: 'Account', icon: User },
  ];

  return (
    <div
      className="fixed left-0 right-0 z-50 px-4 pointer-events-none"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Glassmorphism bar, same look as the Cover/List and Movies pills */}
      <div className="pointer-events-auto max-w-md mx-auto bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl px-2 py-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = path === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 w-16">
                <div className={`px-5 py-1 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white/20 backdrop-blur-md' : ''}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white fill-white' : 'text-gray-300'}`} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className={`text-[10px] ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
