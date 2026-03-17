import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { motion } from 'motion/react';
import { Settings, Save, Database, Users, Activity, PlayCircle, LogOut, Trash2, Loader2, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { content, refreshContent } = useContent();
  const navigate = useNavigate();
  
  const [contentUrl, setContentUrl] = useState('');
  const [maxItems, setMaxItems] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({ users: 1, content: 0, movies: 0, series: 0 });

  useEffect(() => {
    if (userProfile && userProfile.role !== 'admin') {
      navigate('/');
    }
  }, [userProfile, navigate]);

  useEffect(() => {
    const savedUrl = localStorage.getItem('vion_content_url');
    const savedMaxItems = localStorage.getItem('vion_max_items');
    if (savedUrl) setContentUrl(savedUrl);
    if (savedMaxItems) setMaxItems(Number(savedMaxItems));
  }, []);

  useEffect(() => {
    setStats({
      users: 1, // Local only
      content: content.length,
      movies: content.filter(c => c.type === 'movie').length,
      series: content.filter(c => c.type === 'series').length
    });
  }, [content]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      localStorage.setItem('vion_content_url', contentUrl);
      if (maxItems) {
        localStorage.setItem('vion_max_items', maxItems.toString());
      } else {
        localStorage.removeItem('vion_max_items');
      }
      
      await refreshContent();
      setMessage({ text: 'Settings saved and content refreshed successfully!', type: 'success' });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ text: 'Error saving settings. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = () => {
    if (!window.confirm('Are you absolutely sure you want to clear the content URL? This will remove all content from the app.')) {
      return;
    }

    localStorage.removeItem('vion_content_url');
    localStorage.removeItem('vion_max_items');
    setContentUrl('');
    setMaxItems('');
    refreshContent();
    setMessage({ text: 'Content cleared successfully.', type: 'success' });
  };

  if (userProfile?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-12 px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Manage ViON platform settings and content</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Users', value: stats.users.toLocaleString(), icon: Users, trend: 'Local' },
            { label: 'Total Content', value: stats.content.toLocaleString(), icon: Database, trend: 'Local' },
            { label: 'Movies', value: stats.movies.toLocaleString(), icon: PlayCircle, trend: 'Local' },
            { label: 'TV Series', value: stats.series.toLocaleString(), icon: Tv, trend: 'Local' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between h-40"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-white/10">
                  <stat.icon className="w-5 h-5 text-gray-300" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-bold tracking-tighter mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Database className="w-5 h-5" /> Content Source Configuration
              </h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Master Content URL (JSON or M3U)
                    </label>
                    <input
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="https://api.example.com/vion-content.json"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      This URL should point to a JSON file or M3U playlist containing the catalog.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Items to Fetch (Optional)
                    </label>
                    <input
                      type="number"
                      value={maxItems}
                      onChange={(e) => setMaxItems(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g., 500"
                      min="1"
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Limit the number of items fetched to improve performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                  {message.text && (
                    <div className={`text-sm p-3 rounded-xl ${
                      message.type === 'error' ? 'bg-red-500/20 text-red-400' : 
                      message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {message.text}
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save & Fetch Content
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleDeleteAll}
                      className="flex items-center justify-center gap-2 bg-red-500/20 text-red-500 py-3 px-6 rounded-xl font-semibold hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      Clear Content
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Activity className="w-5 h-5" /> System Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-gray-400">Local Storage</span>
                  <span className="text-emerald-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-gray-400">Content Source</span>
                  <span className={contentUrl ? "text-emerald-400" : "text-yellow-400"}>
                    {contentUrl ? "Configured" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
