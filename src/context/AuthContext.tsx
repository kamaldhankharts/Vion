import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  getAdditionalUserInfo,
  User as FirebaseUser,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { ref, update, onValue } from 'firebase/database';
import { auth, db } from '../firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  notice: string | null;
  clearNotice: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const toUser = (u: FirebaseUser): User => ({
  uid: u.uid,
  email: u.email,
  displayName: u.displayName,
});

// Saving the profile must never block login, so errors are only logged.
const saveProfile = async (uid: string, data: Record<string, any>) => {
  try {
    await update(ref(db, `users/${uid}/profile`), data);
  } catch (e) {
    console.warn('Could not save profile to Realtime Database', e);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Firebase restores the saved session, then tells us who is signed in.
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(toUser(fbUser));
        setUserProfile({
          uid: fbUser.uid,
          email: fbUser.email || '',
          createdAt: fbUser.metadata.creationTime
            ? new Date(fbUser.metadata.creationTime)
            : new Date(),
        });
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    let result;
    if (Capacitor.isNativePlatform()) {
      // Native Google account picker, then hand the token to the Firebase JS SDK
      const native = await FirebaseAuthentication.signInWithGoogle();
      const idToken = native.credential?.idToken;
      if (!idToken) throw new Error('Google sign-in did not return a token. Please try again.');
      result = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    } else {
      result = await signInWithPopup(auth, new GoogleAuthProvider());
    }
    const u = result.user;
    const isNew = getAdditionalUserInfo(result)?.isNewUser;
    await saveProfile(u.uid, {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName || null,
      ...(isNew ? { createdAt: Date.now() } : {}),
      lastLoginAt: Date.now(),
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await saveProfile(cred.user.uid, {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || null,
      lastLoginAt: Date.now(),
    });
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    setUser(toUser(cred.user));
    await saveProfile(cred.user.uid, {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name.trim(),
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    });
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await FirebaseAuthentication.signOut();
      } catch (e) {
        // ignore: not signed in natively
      }
    }
    await signOut(auth);
  };

  // The admin can deactivate a user: sign them out straight away.
  useEffect(() => {
    if (!user?.uid) return;
    return onValue(
      ref(db, `userStatus/${user.uid}`),
      (snap) => {
        if (snap.val()?.disabled === true) {
          setNotice('Your account has been deactivated. Please contact support.');
          logout();
        }
      },
      () => {}
    );
  }, [user?.uid]);

  const clearNotice = () => setNotice(null);

  const updateUserName = async (name: string) => {
    const current = auth.currentUser;
    if (!current) return;
    await updateProfile(current, { displayName: name.trim() });
    setUser(toUser(current));
    await saveProfile(current.uid, { displayName: name.trim() });
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, notice, clearNotice, loginWithGoogle, loginWithEmail, signUpWithEmail, resetPassword, logout, updateUserName }}
    >
      {children}
    </AuthContext.Provider>
  );
};
