import React, { useState } from 'react';
import { MOCK_SERMONS, MOCK_LESSON, MOCK_STREAM } from '../constants';
import { Play, BookOpen, Tv, Calendar, Clock, Users, Video, ChevronRight, Download, Share2, Radio, MessageCircle, Settings, Link as LinkIcon, Globe, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WorshipHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sabbath-school' | 'sermons' | 'live'>('sabbath-school');
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Live Stream Management State
  const [streamConfig, setStreamConfig] = useState({
    ...MOCK_STREAM,
    embedUrl: '' // Empty by default to show placeholder
  });
  const [isEditingStream, setIsEditingStream] = useState(false);
  const [tempConfig, setTempConfig] = useState(streamConfig);

  const isAdmin = user?.role === 'admin' || user?.role === 'pastor';

  const handleSaveStreamSettings = () => {
    setStreamConfig(tempConfig);
    setIsEditingStream(false);
  };

  // Sabbath School Component
  const SabbathSchoolView = () => {
    const activeDay = MOCK_LESSON.days[activeDayIndex];
    
    return (
      <div className="animate-fade-in">
        {/* Quarterly Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-32 bg-blue-900 relative overflow-hidden">
             <img src={MOCK_LESSON.coverImage} alt="Lesson Cover" className="w-full h-full object-cover opacity-40" />
             <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
               <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">{MOCK_LESSON.quarter}</span>
               <h2 className="text-2xl font-serif font-bold">{MOCK_LESSON.theme}</h2>
               <p className="text-blue-100 text-sm">{MOCK_LESSON.weekTitle}</p>
             </div>
          </div>
          
          {/* Day Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100">
            {MOCK_LESSON.days.map((day, index) => (
              <button
                key={day.day}
                onClick={() => setActiveDayIndex(index)}
                className={`flex-1 min-w-[100px] py-3 px-4 text-center transition-colors border-b-2 ${
                  index === activeDayIndex 
                    ? 'border-blue-900 bg-blue-50 text-blue-900 font-bold' 
                    : 'border-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs uppercase mb-1">{day.day}</div>
                <div className="text-sm font-semibold">{day.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">{activeDay.title}</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {activeDay.verses.map((verse, i) => (
              <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium border border-amber-200">
                {verse}
              </span>
            ))}
          </div>

          <div className="prose prose-blue max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {activeDay.content}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
             <button 
               disabled={activeDayIndex === 0}
               onClick={() => setActiveDayIndex(prev => prev - 1)}
               className="text-sm font-medium text-blue-900 disabled:text-slate-300 flex items-center gap-1"
             >
               Previous Day
             </button>
             <button 
               disabled={activeDayIndex === MOCK_LESSON.days.length - 1}
               onClick={() => setActiveDayIndex(prev => prev + 1)}
               className="text-sm font-medium text-blue-900 disabled:text-slate-300 flex items-center gap-1"
             >
               Next Day <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    );
  };

  // Sermons Component
  const SermonsView = () => {
    const filteredSermons = MOCK_SERMONS.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="animate-fade-in">
        {/* Search */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Sermon Library</h2>
          <input 
            type="text" 
            placeholder="Search sermons..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
          />
        </div>

        {/* Featured Sermon */}
        {!searchQuery && (
          <div className="mb-8 relative rounded-xl overflow-hidden group cursor-pointer shadow-lg">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
            <img src={MOCK_SERMONS[0].thumbnail} alt="Featured" className="w-full h-64 md:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
              <span className="bg-amber-400 text-blue-900 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">LATEST SERMON</span>
              <h3 className="text-3xl font-bold font-serif mb-1">{MOCK_SERMONS[0].title}</h3>
              <p className="text-lg text-slate-200 mb-4">{MOCK_SERMONS[0].speaker}</p>
              <button className="flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors">
                <Play className="w-4 h-4 fill-current" /> Watch Now
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map(sermon => (
            <div key={sermon.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative">
                <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-40 object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {sermon.duration}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-blue-900 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">{sermon.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{sermon.speaker}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {sermon.date}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {sermon.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Livestream Component
  const LivestreamView = () => {
    return (
      <div className="animate-fade-in">
        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6">
            {!isEditingStream ? (
              <button 
                onClick={() => {
                  setTempConfig(streamConfig);
                  setIsEditingStream(true);
                }}
                className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <Settings className="w-4 h-4" /> Manage Stream Settings
              </button>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-600" /> Stream Control Center
                  </h3>
                  <button onClick={() => setIsEditingStream(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stream Title</label>
                      <input 
                        type="text" 
                        value={tempConfig.title}
                        onChange={(e) => setTempConfig({...tempConfig, title: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Broadcast Status</label>
                      <button 
                        onClick={() => setTempConfig({...tempConfig, isLive: !tempConfig.isLive})}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-colors ${
                          tempConfig.isLive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tempConfig.isLive ? '🔴 LIVE - Click to End' : '⚪ OFFLINE - Click to Go Live'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Embed URL (YouTube / Facebook)</label>
                      <div className="relative">
                         <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                         <input 
                          type="text" 
                          value={tempConfig.embedUrl}
                          onChange={(e) => setTempConfig({...tempConfig, embedUrl: e.target.value})}
                          placeholder="https://www.youtube.com/embed/..."
                          className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-900 outline-none text-sm"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Supported: YouTube Embed URL, Facebook Video Embed, Vimeo.
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handleSaveStreamSettings}
                        className="w-full bg-blue-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg group">
              {streamConfig.embedUrl ? (
                <iframe 
                  src={streamConfig.embedUrl} 
                  title="Live Stream"
                  className="w-full h-full" 
                  allowFullScreen 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <>
                  <img src="https://picsum.photos/id/1048/800/450" alt="Live Stream" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <button className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-2 border-white hover:bg-white/30 transition-colors hover:scale-105 transform mb-4 mx-auto">
                          <Play className="w-6 h-6 text-white fill-current ml-1" />
                      </button>
                      {isAdmin && (
                        <p className="text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
                          No stream URL configured. Click "Manage Stream Settings".
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                {streamConfig.isLive ? (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse shadow-sm">
                    <Radio className="w-3 h-3" /> LIVE
                  </span>
                ) : (
                  <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                    OFFLINE
                  </span>
                )}
                <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-sm">
                  <Users className="w-3 h-3" /> {streamConfig.viewerCount} watching
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <h1 className="text-xl font-bold text-slate-900">{streamConfig.title}</h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Started at {streamConfig.startTime}
              </p>
              <div className="flex gap-3 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100">
                  <Download className="w-4 h-4" /> Resources
                </button>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px] lg:h-auto">
            <div className="p-4 border-b border-slate-100 font-bold text-slate-900 flex items-center justify-between">
              <span>Live Chat</span>
              <span className="text-xs font-normal text-slate-500">Top Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {/* Mock Chat Messages */}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800">JD</div>
                <div>
                  <span className="text-xs font-bold text-slate-700">John Doe</span>
                  <p className="text-sm text-slate-800">Happy Sabbath everyone! Greeting from London.</p>
                </div>
              </div>
               <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800">SM</div>
                <div>
                  <span className="text-xs font-bold text-slate-700">Sarah Miller</span>
                  <p className="text-sm text-slate-800">Amen! What a beautiful song.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">PT</div>
                <div>
                  <span className="text-xs font-bold text-slate-700">Pastor Tom</span>
                  <p className="text-sm text-slate-800">Welcome to our online service. Please let us know where you are watching from.</p>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 bg-white rounded-b-xl">
               <div className="relative">
                 <input type="text" placeholder="Say something..." className="w-full bg-slate-100 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                 <button className="absolute right-1 top-1 p-1 text-blue-600 hover:bg-blue-50 rounded-full">
                   <MessageCircle className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2 mb-2">
          <BookOpen className="w-8 h-8" /> Worship Hub
        </h1>
        <p className="text-slate-600">Grow in grace through study, sermons, and fellowship.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sabbath-school')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'sabbath-school' 
              ? 'border-amber-400 text-blue-900' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Sabbath School
        </button>
        <button
          onClick={() => setActiveTab('sermons')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'sermons' 
              ? 'border-amber-400 text-blue-900' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Video className="w-4 h-4" /> Sermons Library
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'live' 
              ? 'border-red-500 text-red-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tv className="w-4 h-4" /> Live Services
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'sabbath-school' && <SabbathSchoolView />}
        {activeTab === 'sermons' && <SermonsView />}
        {activeTab === 'live' && <LivestreamView />}
      </div>
    </div>
  );
};