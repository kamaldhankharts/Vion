import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle, Star, Link, RefreshCw, Hand, FileText, FileStack, LogOut, ArrowUpRight, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Account: React.FC = () => {
  const { logout } = useAuth();
  const [modalContent, setModalContent] = useState<{title: string, message: string} | null>(null);

  const handleOptionClick = (option: string) => {
    setModalContent({
      title: option,
      message: `The ${option} feature is coming soon!`
    });
  };

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
};
