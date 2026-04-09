/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';
import { Home } from './components/Home';
import { ContentDetails } from './components/ContentDetails';
import { Login } from './components/Login';
import { MyList } from './components/MyList';
import { Downloads } from './components/Downloads';
import { Search } from './components/Search';
import { Account } from './components/Account';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};

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
    return <Navigate to="/account" replace />;
  }
  
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ContentProvider>
          <UserPreferencesProvider>
            <Router>
              <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
                <Routes>
                  <Route path="/login" element={<Navigate to="/account" replace />} />
                  <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                  <Route path="/details/:id" element={<MainLayout><ContentDetails /></MainLayout>} />
                  <Route path="/my-list" element={<MainLayout><MyList /></MainLayout>} />
                  <Route path="/downloads" element={<MainLayout><Downloads /></MainLayout>} />
                  <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
                  <Route path="/account" element={<MainLayout><Account /></MainLayout>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </UserPreferencesProvider>
        </ContentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
