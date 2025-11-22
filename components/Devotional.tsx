import React, { useState, useEffect } from 'react';
import { BookOpen, Share2, Bookmark, Loader2 } from 'lucide-react';
import { generateDevotional } from '../services/geminiService';

export const Devotional: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ title: string; verse: string; content: string } | null>(null);

  useEffect(() => {
    const loadDevotional = async () => {
      setLoading(true);
      // Try to load from local storage first to save API calls in demo
      const savedDate = localStorage.getItem('devotionalDate');
      const savedData = localStorage.getItem('devotionalData');
      const today = new Date().toDateString();

      if (savedDate === today && savedData) {
        setData(JSON.parse(savedData));
        setLoading(false);
      } else {
        const newData = await generateDevotional();
        if (newData) {
          setData(newData);
          localStorage.setItem('devotionalDate', today);
          localStorage.setItem('devotionalData', JSON.stringify(newData));
        } else {
          // Fallback if API fails or no key
          setData({
            title: "The Peace of Sabbath",
            verse: "Exodus 20:8 - Remember the sabbath day, to keep it holy.",
            content: "Rest is not just the absence of work; it is the presence of God. Today, let us find true restoration in His promises."
          });
        }
        setLoading(false);
      }
    };

    loadDevotional();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl text-white p-6 shadow-lg mb-6 relative overflow-hidden">
      {/* Decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-400 rounded-full opacity-20 blur-xl"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <BookOpen className="w-5 h-5 text-amber-300" />
        </div>
        <h2 className="text-lg font-semibold tracking-wide text-amber-300 uppercase text-xs">Daily Devotional</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
          <p className="text-sm text-blue-100">Preparing spiritual food...</p>
        </div>
      ) : data ? (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-2xl font-bold font-serif">{data.title}</h3>
          <blockquote className="border-l-4 border-amber-400 pl-4 italic text-blue-100 my-4">
            "{data.verse}"
          </blockquote>
          <p className="text-blue-50 leading-relaxed text-sm md:text-base opacity-90">
            {data.content}
          </p>

          <div className="flex items-center gap-4 pt-4 mt-4 border-t border-white/10">
            <button className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
              <Bookmark className="w-4 h-4" /> Save
            </button>
            <button className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      ) : (
        <p className="text-red-300">Unable to load devotional at this time.</p>
      )}
    </div>
  );
};