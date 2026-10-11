import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Megaphone, Sparkles, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { useNotifications, AppNotification } from '../context/NotificationsContext';
import { openLink } from '../utils/openLink';

const timeAgo = (t?: number) => {
  if (!t) return '';
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)} d ago`;
  return new Date(t).toLocaleDateString();
};

export const typeStyle = (type: AppNotification['type']) => {
  switch (type) {
    case 'update':
      return { Icon: Sparkles, color: 'text-green-300 bg-green-500/15' };
    case 'promo':
      return { Icon: Megaphone, color: 'text-yellow-300 bg-yellow-500/15' };
    case 'alert':
      return { Icon: AlertTriangle, color: 'text-red-300 bg-red-500/15' };
    default:
      return { Icon: Info, color: 'text-blue-300 bg-blue-500/15' };
  }
};

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isRead, markRead, markAllRead } = useNotifications();

  const open = (n: AppNotification) => {
    markRead(n.id);
    if (n.link) openLink(n.link);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <div className="sticky top-0 z-30 px-4 py-5 flex items-center gap-3 bg-gradient-to-b from-black via-black/90 to-transparent">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-semibold text-white/80 hover:text-white">
            Mark all read
          </button>
        )}
      </div>

      <div className="px-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-400 pt-28">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-white/70" />
            </div>
            <p className="font-medium text-gray-300">No notifications yet</p>
            <p className="text-sm mt-1">Updates from the Vion team will show up here.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { Icon, color } = typeStyle(n.type);
            const unread = !isRead(n.id);
            return (
              <button
                key={n.id}
                onClick={() => open(n)}
                className={`w-full text-left flex gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-colors ${
                  unread ? 'bg-[#1a1a1a]/70 border-white/20' : 'bg-[#1a1a1a]/40 border-white/10'
                }`}
              >
                {n.imageUrl ? (
                  <img
                    src={n.imageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                ) : (
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <b className="text-[15px] leading-snug flex-1">{n.title}</b>
                    {unread && <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-300 mt-1 whitespace-pre-line break-words">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{timeAgo(n.createdAt)}</span>
                    {n.link && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <ExternalLink className="w-3 h-3" /> Open link
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
