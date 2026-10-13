import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ref, onValue, set, update, query, limitToLast } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'update' | 'promo' | 'alert';
  imageUrl?: string;
  link?: string;
  audience: 'all' | 'user';
  targetUid?: string;
  createdAt: number;
  expiresAt?: number;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  incoming: AppNotification | null;
  dismissIncoming: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.uid;

  const [raw, setRaw] = useState<AppNotification[]>([]);
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [incoming, setIncoming] = useState<AppNotification | null>(null);
  const [now, setNow] = useState(Date.now());

  const seen = useRef<Set<string> | null>(null);
  const readRef = useRef(read);
  readRef.current = read;

  // Re-check expiry once a minute.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!uid) {
      setRaw([]);
      setRead({});
      setIncoming(null);
      seen.current = null;
      return;
    }
    seen.current = null;

    const stopNotifs = onValue(
      query(ref(db, 'notifications'), limitToLast(100)),
      (snap) => {
        const list: AppNotification[] = [];
        snap.forEach((ch) => {
          const v = ch.val();
          if (v) list.push({ ...v, id: ch.key as string });
        });
        setRaw(list);

        const mine = list.filter((n) => n.audience === 'all' || n.targetUid === uid);
        if (seen.current === null) {
          // First load: only the unread badge, no pop-up for old messages.
          seen.current = new Set(mine.map((n) => n.id));
          return;
        }
        const fresh = mine.filter((n) => !seen.current!.has(n.id));
        fresh.forEach((n) => seen.current!.add(n.id));
        const latest = fresh
          .filter((n) => !(n.expiresAt && n.expiresAt < Date.now()) && !readRef.current[n.id])
          .sort((a, b) => b.createdAt - a.createdAt)[0];
        if (latest) setIncoming(latest);
      },
      (err) => console.warn('notifications sync failed', err)
    );

    const stopRead = onValue(
      ref(db, `users/${uid}/readNotifications`),
      (snap) => setRead(snap.val() || {}),
      (err) => console.warn('read state sync failed', err)
    );

    return () => {
      stopNotifs();
      stopRead();
    };
  }, [uid]);

  const notifications = useMemo(
    () =>
      raw
        .filter((n) => (n.audience === 'all' || n.targetUid === uid) && !(n.expiresAt && n.expiresAt < now))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [raw, uid, now]
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !read[n.id]).length, [notifications, read]);
  const isRead = useCallback((id: string) => !!read[id], [read]);

  const markRead = useCallback(
    (id: string) => {
      if (!uid || readRef.current[id]) return;
      setRead((r) => ({ ...r, [id]: true }));
      set(ref(db, `users/${uid}/readNotifications/${id}`), true).catch((e) => console.warn('markRead failed', e));
    },
    [uid]
  );

  const markAllRead = useCallback(() => {
    if (!uid) return;
    const ups: Record<string, boolean> = {};
    notifications.forEach((n) => {
      if (!readRef.current[n.id]) ups[n.id] = true;
    });
    if (!Object.keys(ups).length) return;
    setRead((r) => ({ ...r, ...ups }));
    update(ref(db, `users/${uid}/readNotifications`), ups).catch((e) => console.warn('markAllRead failed', e));
  }, [uid, notifications]);

  const dismissIncoming = useCallback(() => setIncoming(null), []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, isRead, markRead, markAllRead, incoming, dismissIncoming }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
