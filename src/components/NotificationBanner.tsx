import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { typeStyle } from './Notifications';

// Small glass pop-up when the admin sends a new notification while the app is open.
export const NotificationBanner: React.FC = () => {
  const navigate = useNavigate();
  const { incoming, dismissIncoming, markRead } = useNotifications();

  useEffect(() => {
    if (!incoming) return;
    const t = setTimeout(dismissIncoming, 7000);
    return () => clearTimeout(t);
  }, [incoming, dismissIncoming]);

  const { Icon, color } = typeStyle(incoming?.type || 'info');

  return (
    <AnimatePresence>
      {incoming && (
        <motion.div
          key={incoming.id}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="fixed left-3 right-3 z-[80] pointer-events-none"
          style={{ top: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
        >
          <div
            className="pointer-events-auto max-w-md mx-auto flex items-start gap-3 p-3 pr-2 rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 shadow-2xl"
            onClick={() => {
              markRead(incoming.id);
              dismissIncoming();
              navigate('/notifications');
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <b className="block text-sm text-white truncate">{incoming.title}</b>
              <p className="text-xs text-gray-300 line-clamp-2">{incoming.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissIncoming();
              }}
              className="p-2 text-gray-400"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
