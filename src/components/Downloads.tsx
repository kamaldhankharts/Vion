import React from 'react';
import { ArrowDownCircle } from 'lucide-react';

export const Downloads: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-6 bg-black">
        <h1 className="text-2xl font-bold text-white tracking-tight">Downloads</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <ArrowDownCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Downloaded Content Will Appear Here</h2>
        <p className="text-gray-400 text-sm">
          Save content to watch offline.
        </p>
      </div>
    </div>
  );
};
