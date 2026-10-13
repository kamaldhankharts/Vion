import React from 'react';
import { Bookmark, Play, Trash2 } from 'lucide-react';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useContent } from '../context/ContentContext';
import { useNavigate } from 'react-router-dom';

export const MyList: React.FC = () => {
  const { myList, removeFromMyList } = useUserPreferences();
  const { content } = useContent();
  const navigate = useNavigate();

  const listItems = content.filter(item => myList.includes(item.id));

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-6 bg-black border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">My List</h1>
      </div>

      {/* Content */}
      <div className="pt-24 px-4">
        {listItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {listItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 group">
                <div 
                  className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-lg bg-white/5 cursor-pointer"
                  onClick={() => navigate(`/details/${(item as any).slug || item.id}`)}
                >
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromMyList(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col px-0.5">
                  <span className="text-sm font-medium text-white truncate">{item.title}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    {item.genre && item.genre.length > 0 ? item.genre[0] : 'Movie'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Bookmark className="w-8 h-8 text-gray-400 fill-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your List is Empty</h2>
            <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
              Add movies and shows to your list to keep track of what you want to watch.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Browse Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
