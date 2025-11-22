import React, { useState, useMemo } from 'react';
import { INITIAL_PRAYERS, MOCK_USERS } from '../constants';
import { PrayerRequest } from '../types';
import { Plus, Lock, Globe, Sparkles, X, Filter, Heart, Share2 } from 'lucide-react';
import { generatePrayerEncouragement } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

// Custom icon for praying hands
const PrayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4a3 3 0 0 0-3 3v7c0 1.1.9 2 2 2s2-.9 2-2V7a3 3 0 0 0-3-3z" />
    <path d="M19 11v-1a2 2 0 0 0-2-2h-3v9a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3" />
    <path d="M5 11v-1a2 2 0 0 1 2-2h3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
  </svg>
);

const CATEGORY_COLORS: Record<string, string> = {
  'Health': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Family': 'bg-purple-100 text-purple-800 border-purple-200',
  'Spiritual': 'bg-blue-100 text-blue-800 border-blue-200',
  'General': 'bg-slate-100 text-slate-800 border-slate-200',
};

export const PrayerWall: React.FC = () => {
  const { user: currentUser, guardAction } = useAuth();
  const [prayers, setPrayers] = useState<PrayerRequest[]>(INITIAL_PRAYERS);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Form State
  const [newRequest, setNewRequest] = useState('');
  const [category, setCategory] = useState<'Health' | 'Family' | 'Spiritual' | 'General'>('General');
  const [isPrivate, setIsPrivate] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Logic
  const filteredPrayers = useMemo(() => {
    if (activeCategory === 'All') return prayers;
    return prayers.filter(p => p.category === activeCategory);
  }, [prayers, activeCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim() || !currentUser) return;
    
    guardAction(async () => {
      setIsSubmitting(true);

      // Get AI Encouragement
      const encouragement = await generatePrayerEncouragement(category);
      setAiResponse(encouragement);

      const request: PrayerRequest = {
        id: Date.now().toString(),
        userId: currentUser.id,
        content: newRequest,
        isAnonymous: !isPrivate && Math.random() > 0.5, // Mock logic
        prayerCount: 0,
        timestamp: 'Just now',
        category
      };

      setPrayers([request, ...prayers]);
      
      // Keep form open briefly to show encouragement
      setTimeout(() => {
        setNewRequest('');
        setAiResponse(null);
        setShowForm(false);
        setIsSubmitting(false);
      }, 3000);
    });
  };

  const handlePray = (id: string) => {
    guardAction(() => {
      setPrayers(prayers.map(p => 
        p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p
      ));
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-8 md:p-12 text-white mb-10 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full opacity-10 blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full opacity-10 blur-3xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
            Community Prayer Wall
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">
            Bearing One Another's Burdens
          </h1>
          <p className="text-blue-100 text-lg mb-8 font-light">
            "For where two or three are gathered together in my name, there am I in the midst of them."
          </p>
          <button 
            onClick={() => guardAction(() => setShowForm(true))}
            className="bg-amber-400 hover:bg-amber-500 text-blue-900 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" /> Share a Prayer Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {['All', 'Health', 'Family', 'Spiritual', 'General'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat 
                ? 'bg-blue-900 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {aiResponse ? (
              <div className="p-10 text-center animate-fade-in">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Prayer Received</h3>
                <p className="text-slate-500 mb-6">Your request has been posted to the wall.</p>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-blue-800 font-serif italic text-lg">"{aiResponse}"</p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif">How can we pray for you?</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Request</label>
                    <textarea
                      className="w-full border border-slate-200 rounded-xl p-4 text-base focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-shadow bg-slate-50 resize-none"
                      placeholder="Share your burden or gratitude..."
                      rows={4}
                      value={newRequest}
                      onChange={(e) => setNewRequest(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-900 outline-none"
                      >
                        <option value="General">General</option>
                        <option value="Health">Health</option>
                        <option value="Family">Family</option>
                        <option value="Spiritual">Spiritual</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Visibility</label>
                       <button
                        type="button"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                          isPrivate 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        {isPrivate ? 'Private' : 'Public'}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!newRequest.trim() || isSubmitting}
                    className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors disabled:opacity-70 shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Posting...' : 'Submit Prayer Request'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prayer Grid (Masonry Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {filteredPrayers.map(prayer => {
          const isMe = prayer.userId === currentUser?.id;
          const user = isMe ? currentUser : MOCK_USERS[prayer.userId];
          const categoryStyle = CATEGORY_COLORS[prayer.category];

          return (
            <div 
              key={prayer.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryStyle}`}>
                  {prayer.category}
                </span>
                <span className="text-xs text-slate-400">{prayer.timestamp}</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 mb-6">
                <p className="text-slate-800 text-lg font-serif leading-relaxed">
                  "{prayer.content}"
                </p>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6 border-t border-slate-50 pt-4">
                {prayer.isAnonymous ? (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                ) : (
                  <img src={user?.avatar || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full object-cover" alt="" />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {prayer.isAnonymous ? 'Anonymous Member' : user?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {prayer.isAnonymous ? 'Private Request' : user?.church || 'Adventist Social'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                 <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors">
                   <Share2 className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => handlePray(prayer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 transform active:scale-95 ${
                    prayer.prayerCount > 0 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  <PrayIcon className={`w-4 h-4 ${prayer.prayerCount > 0 ? 'fill-blue-200' : ''}`} />
                  <span className="font-bold">{prayer.prayerCount}</span>
                  <span className="text-xs font-medium">Praying</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredPrayers.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4">
             <Filter className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No prayers found</h3>
          <p className="text-slate-500">Be the first to post in this category.</p>
        </div>
      )}
    </div>
  );
};