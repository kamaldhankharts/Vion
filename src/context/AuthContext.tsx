import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user
    const storedUser = localStorage.getItem('vion_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        const isAdmin = parsedUser.email === 'kamaldhankhararts@gmail.com';
        setUserProfile({
          uid: parsedUser.uid,
          email: parsedUser.email || '',
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date()
        });
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('vion_user', JSON.stringify(newUser));
    
    const isAdmin = newUser.email === 'kamaldhankhararts@gmail.com';
    setUserProfile({
      uid: newUser.uid,
      email: newUser.email || '',
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date()
    });
  };

  const loginWithGoogle = async () => {
    // Mock Google login
    const mockUser: User = {
      uid: 'google_user_' + Date.now(),
      email: 'user@gmail.com',
      displayName: 'Google User'
    };
    handleAuthSuccess(mockUser);
  };

  const loginWithEmail = async (email: string, password: string) => {
    // Mock email login
    const mockUser: User = {
      uid: 'email_user_' + Date.now(),
      email: email,
      displayName: email.split('@')[0]
    };
    handleAuthSuccess(mockUser);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    // Mock email signup
    const mockUser: User = {
      uid: 'email_user_' + Date.now(),
      email: email,
      displayName: name
    };
    handleAuthSuccess(mockUser);
  };

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('vion_user');
  };

  const updateUserName = async (name: string) => {
    if (user) {
      const updatedUser = { ...user, displayName: name };
      setUser(updatedUser);
      localStorage.setItem('vion_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, loginWithGoogle, loginWithEmail, signUpWithEmail, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};
