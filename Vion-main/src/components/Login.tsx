import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/logo.png';

const friendlyError = (err: any): string => {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase.';
    default:
      return err?.message || 'Something went wrong. Please try again.';
  }
};

export const Login: React.FC = () => {
  const { loginWithEmail, signUpWithEmail, resetPassword, loginWithGoogle, notice, clearNotice } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotice();
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearNotice();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error(err);
      const msg = String(err?.message || '').toLowerCase();
      if (msg.includes('cancel') || err?.code === 'auth/popup-closed-by-user') return;
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your email above, then tap "Forgot password?"');
      return;
    }
    try {
      await resetPassword(email);
      setInfo('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(friendlyError(err));
    }
  };

  // Lock the page itself so the whole login screen can't slide up/down.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = { h: html.style.overflow, b: body.style.overflow };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev.h;
      body.style.overflow = prev.b;
    };
  }, []);

  const inputClass =
    'w-full bg-white/10 border border-transparent rounded-2xl py-3.5 px-5 text-white placeholder-gray-400 focus:outline-none focus:border-white/20';

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#7a1010] via-[#3a0505] to-black opacity-90" />

      {/* Only scrolls if the content doesn't fit (e.g. keyboard open) */}
      <div className="relative z-10 h-full overflow-y-auto overscroll-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-full flex flex-col items-center justify-center px-6 py-10"
      >
        <img src={logo} alt="ViON" className="h-14 w-auto object-contain mb-6" />

        <h1 className="text-2xl font-bold text-white mb-1">
          {isSignUp ? 'Create Account' : 'Sign in'}
        </h1>
        <p className="text-gray-300 text-center mb-6 text-xs px-4">
          {isSignUp
            ? 'Sign up to create playlists and save your watchlist'
            : 'Sign into your account to access playlists and watchlist'}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
          {(error || notice) && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl text-center">
              {error || notice}
            </div>
          )}
          {info && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 text-xs p-3 rounded-xl text-center">
              {info}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
                {name && (
                  <button type="button" onClick={() => setName('')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 rounded-full p-1">
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              className={inputClass}
            />
            {email && (
              <button type="button" onClick={() => setEmail('')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 rounded-full p-1">
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          </div>

          {!isSignUp && (
            <div className="flex justify-start w-full pt-1">
              <button type="button" onClick={handleForgot} className="text-sm font-bold text-white hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white/60 text-black font-bold rounded-full mt-4 hover:bg-white/70 transition-all flex justify-center items-center disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign up' : 'Sign in')}
          </button>

          <div className="flex justify-center w-full pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setInfo('');
              }}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New user? Sign up'}
            </button>
          </div>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 transition-all disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </motion.div>
      </div>
    </div>
  );
};
