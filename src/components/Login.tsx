import React, { useState } from 'react';
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
  const { loginWithEmail, signUpWithEmail, resetPassword } = useAuth();
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

  const inputClass =
    'w-full bg-white/10 border border-transparent rounded-2xl py-3.5 px-5 text-white placeholder-gray-400 focus:outline-none focus:border-white/20';

  return (
    <div className="h-[100dvh] bg-black flex flex-col relative overflow-y-auto">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#7a1010] via-[#3a0505] to-black opacity-90" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10"
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
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl text-center">
              {error}
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
        </form>
      </motion.div>
    </div>
  );
};
