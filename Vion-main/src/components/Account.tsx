import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { openLink } from '../utils/openLink';
import {
  HelpCircle, Star, Link as LinkIcon, RefreshCw, Hand, FileText, FileStack, LogOut, ArrowUpRight,
  Monitor, Mail, Globe, Info, Heart, Bell, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Icon names used by the admin panel's "Account page options".
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  monitor: Monitor,
  'help-circle': HelpCircle,
  star: Star,
  link: LinkIcon,
  'refresh-cw': RefreshCw,
  hand: Hand,
  'file-text': FileText,
  'file-stack': FileStack,
  mail: Mail,
  globe: Globe,
  info: Info,
  heart: Heart,
};

interface AccountItem {
  id: string;
  label: string;
  type?: 'link' | 'email' | 'text';
  value?: string;
  title?: string;
  icon?: string;
  group?: number;
  enabled?: boolean;
  order?: number;
}

export const Account: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [items, setItems] = useState<AccountItem[]>([]);
  const [footerText, setFooterText] = useState('');
  const [modalContent, setModalContent] = useState<{ title: string; message: string } | null>(null);

  // Live from the admin panel: appSettings/general and appSettings/accountItems
  useEffect(
    () =>
      onValue(
        ref(db, 'appSettings'),
        (snap) => {
          const v = snap.val() || {};
          setFooterText(v.general?.footerText || '');
          setItems(Object.entries(v.accountItems || {}).map(([id, x]: [string, any]) => ({ ...x, id })));
        },
        (err) => console.warn('appSettings sync failed', err)
      ),
    []
  );

  const groups = useMemo(() => {
    const visible: AccountItem[] = items.filter((i) => i.enabled !== false && i.label);
    const nums: number[] = Array.from(new Set<number>(visible.map((i) => i.group || 1))).sort((a, b) => a - b);
    return nums.map((g) =>
      visible.filter((i) => (i.group || 1) === g).sort((a, b) => (a.order || 0) - (b.order || 0))
    );
  }, [items]);

  const handleItem = (it: AccountItem) => {
    const value = (it.value || '').trim();
    if (it.type === 'text') {
      setModalContent({ title: it.title || it.label, message: value || 'Nothing to show yet.' });
      return;
    }
    if (!value) {
      setModalContent({ title: it.label, message: "This isn't available yet." });
      return;
    }
    openLink(it.type === 'email' ? `mailto:${value}` : value);
  };

  return (
    <div className="h-[100dvh] bg-black text-white overflow-hidden relative flex flex-col">
      <div className="px-5 py-5 shrink-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Account</h1>
        <span className="text-[10px] text-gray-500 font-medium tracking-wide">
          {footerText || 'Made with ♥️ By Blaze'}
        </span>
      </div>

      <div className="px-4 space-y-4 flex-1 overflow-y-auto pb-32">
        {/* Notifications */}
        <div className="bg-[#222222] rounded-2xl overflow-hidden">
          <button
            onClick={() => navigate('/notifications')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-gray-100" />
              <span className="text-base text-gray-100">Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-xs font-bold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </button>
        </div>

        {/* Groups published by the admin */}
        {groups.map((group, gi) => (
          <div key={gi} className="bg-[#222222] rounded-2xl overflow-hidden flex flex-col">
            {group.map((it) => {
              const Icon = ICONS[it.icon || 'link'] || LinkIcon;
              return (
                <button
                  key={it.id}
                  onClick={() => handleItem(it)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Icon className="w-5 h-5 text-gray-100 shrink-0" />
                    <span className="text-base text-gray-100 truncate">{it.label}</span>
                  </div>
                  {it.type !== 'text' && <ArrowUpRight className="w-5 h-5 text-gray-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        ))}

        {/* Sign out */}
        <div className="bg-[#222222] rounded-2xl overflow-hidden">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-100" />
            <span className="text-base text-gray-100">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalContent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#222222] rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">{modalContent.title}</h3>
              <p className="text-gray-300 mb-6 whitespace-pre-line">{modalContent.message}</p>
              <button
                onClick={() => setModalContent(null)}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
