/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';
import { Home } from './components/Home';
import { ContentDetails } from './components/ContentDetails';
import { Login } from './components/Login';
import { MyList } from './components/MyList';
import { Downloads } from './components/Downloads';
import { Search } from './components/Search';
import { Account } from './components/Account';
import { Notifications } from './components/Notifications';
import { NotificationBanner } from './components/NotificationBanner';
import { Loader2 } from 'lucide-react';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};

const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ContentProvider>
          <UserPreferencesProvider>
            <NotificationsProvider>
            <Router>
              <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
                <Routes>
                  <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
                  <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
                  <Route path="/details/:id" element={<ProtectedLayout><ContentDetails /></ProtectedLayout>} />
                  <Route path="/my-list" element={<ProtectedLayout><MyList /></ProtectedLayout>} />
                  <Route path="/downloads" element={<ProtectedLayout><Downloads /></ProtectedLayout>} />
                  <Route path="/search" element={<ProtectedLayout><Search /></ProtectedLayout>} />
                  <Route path="/account" element={<ProtectedLayout><Account /></ProtectedLayout>} />
                  <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <NotificationBanner />
              </div>
            </Router>
            </NotificationsProvider>
          </UserPreferencesProvider>
        </ContentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
