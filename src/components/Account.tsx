import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, X, Eye, EyeOff, Loader2,
  Monitor, HelpCircle, Star, Link, RefreshCw, Hand, FileText, FileStack, LogOut, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Account: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalContent, setModalContent] = useState<{title: string, message: string} | null>(null);

  const handleOptionClick = (option: string) => {
    setModalContent({
      title: option,
      message: `The ${option} feature is coming soon!`
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Sign-In. Please add it in the Firebase Console.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'An error occurred during Google Sign-In.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && !name) {
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
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="h-[100dvh] bg-black text-white overflow-hidden relative flex flex-col">
        <div className="px-5 py-5 shrink-0 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Account</h1>
          <span className="text-[10px] text-gray-500 font-medium tracking-wide">Made with ♥️ By Blaze</span>
        </div>
        
        <div className="px-4 space-y-4 flex-1 overflow-hidden pb-20 flex flex-col justify-center">
          {/* Group 1 */}
          <div className="bg-[#222222] rounded-2xl overflow-hidden shrink-0">
            <button 
              onClick={() => handleOptionClick('Connecting TV Device')}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
            >
              <Monitor className="w-5 h-5 text-gray-100" />
              <span className="text-base text-gray-100">Connecting TV Device</span>
            </button>
          </div>

          {/* Group 2 */}
          <div className="bg-[#222222] rounded-2xl overflow-hidden flex flex-col shrink-0">
            <button 
              onClick={() => handleOptionClick('Get Help')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <HelpCircle className="w-5 h-5 text-gray-100" />
                <span className="text-base text-gray-100">Get Help</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </button>
            <button 
              onClick={() => handleOptionClick('Rate Us')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Star className="w-5 h-5 text-gray-100" />
                <span className="text-base text-gray-100">Rate Us</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </button>
            <button 
              onClick={() => handleOptionClick('Follow Us')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Link className="w-5 h-5 text-gray-100" />
                <span className="text-base text-gray-100">Follow Us</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </button>
            <button 
              onClick={() => handleOptionClick('Our Apps')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <RefreshCw className="w-5 h-5 text-gray-100" />
                <span className="text-base text-gray-100">Our Apps</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Group 3 */}
          <div className="bg-[#222222] rounded-2xl overflow-hidden flex flex-col shrink-0">
            <button 
              onClick={() => handleOptionClick('Privacy Policy')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Hand className="w-5 h-5 text-gray-100" />
                <span className="text-base text-gray-100">Privacy Policy</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </button>
            <button 
              onClick={() => handleOptionClick('Terms of Service')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-gray-100" />
                <span className="text-base text-gray-100">Terms of Service</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </button>
            <button 
              onClick={() => handleOptionClick('Credits')}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FileStack className="w-5 h-5 text-gray-100" />
                <span className="text-base text-gray-100">Credits</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Group 4 */}
          <div className="bg-[#222222] rounded-2xl overflow-hidden shrink-0">
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
                <p className="text-gray-300 mb-6">{modalContent.message}</p>
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
  }

  return (
    <div className="h-[100dvh] bg-black flex flex-col relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#7a1010] via-[#3a0505] to-black opacity-90" />
      
      {/* Top Bar */}
      <div className="relative z-10 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-6"
      >
        <User className="w-20 h-20 text-white/70 fill-white/70 mb-4" />
        
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
                  className="w-full bg-white/10 border border-transparent rounded-2xl py-3.5 px-5 text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
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
              className="w-full bg-white/10 border border-transparent rounded-2xl py-3.5 px-5 text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
            />
            {email && (
              <button type="button" onClick={() => setEmail('')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 rounded-full p-1">
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-transparent rounded-2xl py-3.5 px-5 text-white placeholder-gray-400 focus:outline-none focus:border-white/20"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          </div>

          {!isSignUp && (
            <div className="flex justify-start w-full pt-1">
              <button type="button" className="text-sm font-bold text-white hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white/60 text-black font-bold rounded-full mt-4 hover:bg-white/70 transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign up' : 'Sign in')}
          </button>

          <div className="flex justify-center w-full pt-2">
            <button 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
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
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-6 bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff"/>
            </svg>
            Continue with Google
          </button>

          <button 
            type="button"
            className="w-full py-3.5 px-6 bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 transition-all mt-3"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.5.05 2.78.8 3.59 2.07-3.11 1.82-2.61 5.98.53 7.21-.71 1.83-1.81 3.71-2.7 4.73zm-2.85-15.4c.67-1.14.76-2.45.28-3.68-1.12.18-2.5.95-3.22 2.07-.64 1.01-.84 2.33-.31 3.56 1.25.13 2.51-.7 3.25-1.95z"/>
            </svg>
            Continue with Apple
          </button>
        </form>
      </motion.div>
    </div>
  );
};
