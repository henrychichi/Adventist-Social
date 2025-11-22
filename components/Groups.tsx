import React, { useState, useEffect, useRef } from 'react';
import { MOCK_GROUPS, MOCK_USERS, MOCK_EVENTS } from '../constants';
import { Users, ArrowRight, ArrowLeft, Send, MoreVertical, Pin, Trash2, MicOff, Shield, Check, Mic, Smile, Plus, Calendar, MapPin, Clock, X, Square, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Group, Event } from '../types';

interface GroupMessage {
  id: string;
  senderId: string;
  text: string;
  audio?: string;
  timestamp: string;
  pinned?: boolean;
  reactions: Record<string, string[]>; // emoji -> list of userIds
}

const QUICK_REACTIONS = ["👍", "❤️", "🙏", "😂", "😮", "😢"];

export const Groups: React.FC = () => {
  const { user, guardAction } = useAuth();
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'events'>('chat');
  
  // Create Group State
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '' });
  
  // Mock State for Chat
  const [messages, setMessages] = useState<GroupMessage[]>([
    { 
      id: 'm1', 
      senderId: 'u2', 
      text: 'Welcome to the group everyone! Please check the schedule for next Sabbath.', 
      timestamp: 'Yesterday', 
      pinned: true,
      reactions: { '🙏': ['u1', 'u3'], '❤️': ['u1'] }
    },
    { 
      id: 'm2', 
      senderId: 'u3', 
      text: 'Thanks for organizing this, Sister Sarah.', 
      timestamp: '10:30 AM',
      reactions: { '👍': ['u2'] }
    },
    { 
      id: 'm3', 
      senderId: 'u1', 
      text: 'Can we start with prayer requests before the meeting?', 
      timestamp: '11:00 AM',
      reactions: {} 
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Mock State for Group Events
  const [groupEvents, setGroupEvents] = useState<Event[]>([
    {
      id: 'ge1',
      title: 'Weekly Practice',
      date: 'Oct 22',
      time: '7:00 PM',
      location: 'Choir Room',
      description: 'Preparing for the upcoming communion service.',
      attendees: 12,
      image: 'https://picsum.photos/id/401/600/300' // Reusing generic image logic
    }
  ]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  // Determine if current user has admin rights for this group (Simulated)
  const isAdmin = user?.role === 'pastor' || user?.role === 'admin' || user?.role === 'elder';

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      // This logic is handled by the stopping propagation on the elements themselves
      // But we can add a global click handler here if needed to clear states
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    guardAction(() => {
      if (!inputText.trim() || !user) return;
      
      if (mutedUsers.has(user.id)) {
        return; // Muted users cannot send
      }

      const newMsg: GroupMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        text: inputText,
        timestamp: 'Just now',
        reactions: {}
      };

      setMessages([...messages, newMsg]);
      setInputText('');
    });
  };

  const startRecording = async () => {
    guardAction(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access is required to send audio messages.");
      }
    });
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
      audioChunksRef.current = [];
    }
  };

  const finishRecording = () => {
    if (mediaRecorderRef.current && isRecording && user) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          
          const msg: GroupMessage = {
            id: Date.now().toString(),
            senderId: user.id,
            text: 'Audio Message',
            audio: base64Audio,
            timestamp: 'Just now',
            reactions: {}
          };
          
          setMessages([...messages, msg]);
        };
      };

      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePin = (msgId: string) => {
    setMessages(messages.map(m => m.id === msgId ? { ...m, pinned: !m.pinned } : m));
    setActiveActionId(null);
  };

  const deleteMessage = (msgId: string) => {
    setMessages(messages.filter(m => m.id !== msgId));
    setActiveActionId(null);
  };

  const toggleMuteUser = (userId: string) => {
    const newMuted = new Set(mutedUsers);
    if (newMuted.has(userId)) {
      newMuted.delete(userId);
    } else {
      newMuted.add(userId);
    }
    setMutedUsers(newMuted);
    setActiveActionId(null);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    guardAction(() => {
      if (!user) return;
      if (mutedUsers.has(user.id)) return;

      setMessages(messages.map(msg => {
        if (msg.id !== msgId) return msg;

        const newReactions = { ...msg.reactions };
        const userList = newReactions[emoji] ? [...newReactions[emoji]] : [];

        if (userList.includes(user.id)) {
          // Remove reaction
          const filtered = userList.filter(id => id !== user.id);
          if (filtered.length === 0) {
            delete newReactions[emoji];
          } else {
            newReactions[emoji] = filtered;
          }
        } else {
          // Add reaction
          newReactions[emoji] = [...userList, user.id];
        }

        return { ...msg, reactions: newReactions };
      }));

      setShowReactionPicker(null);
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    guardAction(() => {
      if (!selectedGroup) return;

      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        description: newEvent.description,
        attendees: 1, // Creator is attending
        image: selectedGroup.image || 'https://picsum.photos/id/119/600/300' 
      };

      // 1. Update Local Group Events state (for immediate view)
      setGroupEvents([...groupEvents, event]);
      
      // 2. Update Global App Events storage (so it appears in main Events calendar)
      try {
        const storedEvents = localStorage.getItem('sda_app_events');
        const currentGlobalEvents: Event[] = storedEvents ? JSON.parse(storedEvents) : MOCK_EVENTS;
        const updatedGlobalEvents = [...currentGlobalEvents, event];
        localStorage.setItem('sda_app_events', JSON.stringify(updatedGlobalEvents));
      } catch (err) {
        console.error("Failed to sync event to global calendar", err);
      }

      setShowCreateEvent(false);
      setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setGroupEvents(groupEvents.filter(e => e.id !== id));
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    guardAction(() => {
        const newGroup: Group = {
            id: Date.now().toString(),
            name: newGroupData.name,
            description: newGroupData.description,
            memberCount: 1,
            image: `https://picsum.photos/seed/${Date.now()}/200/200` // Random image based on timestamp
        };
        setGroups([...groups, newGroup]);
        setShowCreateGroup(false);
        setNewGroupData({ name: '', description: '' });
    });
  };

  if (selectedGroup) {
    const pinnedMessages = messages.filter(m => m.pinned);
    const isUserMuted = user && mutedUsers.has(user.id);

    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedGroup(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <img src={selectedGroup.image} alt={selectedGroup.name} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <h2 className="font-bold text-slate-900">{selectedGroup.name}</h2>
                  <p className="text-xs text-slate-500">{selectedGroup.memberCount} Members</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Moderator
                </span>
              )}
              <button className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4 gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`pb-3 px-1 transition-colors ${activeTab === 'chat' ? 'text-blue-900 border-b-2 border-blue-900' : 'hover:text-slate-900'}`}
            >
              Group Chat
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`pb-3 px-1 transition-colors ${activeTab === 'events' ? 'text-blue-900 border-b-2 border-blue-900' : 'hover:text-slate-900'}`}
            >
              Group Events
            </button>
          </div>
        </div>

        {/* Tab Content: Chat */}
        {activeTab === 'chat' && (
          <>
            {/* Pinned Messages Area */}
            {pinnedMessages.length > 0 && (
              <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-start gap-2 shadow-sm z-10">
                <Pin className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                <div className="flex-1 overflow-x-auto flex gap-4 scrollbar-hide">
                  {pinnedMessages.map(msg => (
                    <div key={msg.id} className="text-sm text-amber-900 whitespace-nowrap flex items-center gap-1">
                      <span className="font-semibold">{MOCK_USERS[msg.senderId]?.name || 'Unknown'}:</span> 
                      <span className="truncate max-w-[200px]">{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30" 
              onClick={() => {
                setActiveActionId(null);
                setShowReactionPicker(null);
              }}
            >
              {messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                const sender = MOCK_USERS[msg.senderId] || { name: 'Unknown', avatar: '' };
                const showMenu = activeActionId === msg.id;
                const showEmojiPicker = showReactionPicker === msg.id;
                
                // Sort reactions by count
                const sortedReactions = (Object.entries(msg.reactions) as [string, string[]][]).sort((a, b) => b[1].length - a[1].length);

                return (
                  <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-6" />
                    )}
                    
                    <div className="max-w-[75%] relative">
                      {!isMe && <p className="text-xs text-slate-500 ml-1 mb-1">{sender.name}</p>}
                      
                      <div className={`p-3 rounded-2xl text-sm relative ${
                        isMe 
                          ? 'bg-blue-900 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      } ${msg.pinned ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}>
                        {msg.audio ? (
                           <div className="flex items-center gap-2 min-w-[200px]">
                             <audio controls src={msg.audio} className="w-full h-8 max-w-[240px]" />
                           </div>
                        ) : (
                          msg.text
                        )}
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {msg.pinned && <Pin className="w-3 h-3" />}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      {/* Reactions Display */}
                      {sortedReactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {sortedReactions.map(([emoji, userIds]) => {
                            const hasReacted = userIds.includes(user?.id || '');
                            return (
                              <button
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReaction(msg.id, emoji);
                                }}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                                  hasReacted 
                                    ? 'bg-blue-100 border-blue-200 text-blue-800' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-semibold">{userIds.length}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Message Actions (Hover) */}
                      <div className={`absolute top-0 ${isMe ? '-left-14' : '-right-14'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReactionPicker(showEmojiPicker ? null : msg.id);
                            setActiveActionId(null);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors bg-white shadow-sm border border-slate-100"
                          title="Add Reaction"
                        >
                          <Smile className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionId(showMenu ? null : msg.id);
                              setShowReactionPicker(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors bg-white shadow-sm border border-slate-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Emoji Picker Popup */}
                      {showEmojiPicker && (
                        <div className={`absolute bottom-full ${isMe ? 'right-0' : 'left-0'} mb-2 bg-white rounded-full shadow-lg border border-slate-200 p-1 flex gap-1 z-20 animate-fade-in`}>
                          {QUICK_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReaction(msg.id, emoji);
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-lg transition-transform hover:scale-125"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Admin Menu */}
                      {showMenu && isAdmin && (
                        <div className={`absolute top-8 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} bg-white rounded-lg shadow-xl border border-slate-100 z-20 w-40 py-1 overflow-hidden animate-fade-in`}>
                          <button 
                            onClick={() => togglePin(msg.id)}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <Pin className="w-3 h-3" /> {msg.pinned ? 'Unpin' : 'Pin Message'}
                          </button>
                          
                          {!isMe && (
                            <button 
                              onClick={() => toggleMuteUser(msg.senderId)}
                              className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 text-orange-600"
                            >
                              {mutedUsers.has(msg.senderId) ? (
                                <><Mic className="w-3 h-3" /> Unmute User</>
                              ) : (
                                <><MicOff className="w-3 h-3" /> Mute User</>
                              )}
                            </button>
                          )}
                          
                          <button 
                            onClick={() => deleteMessage(msg.id)}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-slate-50"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              {isUserMuted ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <MicOff className="w-4 h-4" />
                  You have been muted by a group administrator.
                </div>
              ) : (
                <div className="flex gap-2">
                  {isRecording ? (
                    <div className="flex-1 flex items-center gap-3 bg-red-50 p-2 rounded-full border border-red-100 animate-pulse">
                      <div className="w-3 h-3 bg-red-500 rounded-full ml-2"></div>
                      <span className="flex-1 text-sm font-medium text-red-700">Recording {formatTime(recordingTime)}</span>
                      <button 
                        onClick={cancelRecording}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                        title="Cancel"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={finishRecording}
                        className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 transition-colors shadow-sm"
                        title="Send Audio"
                      >
                        <Send className="w-5 h-5 pl-0.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                      <button 
                        type="button"
                        onClick={startRecording}
                        className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors border border-transparent hover:border-slate-200"
                        title="Record Audio"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                      <input 
                        type="text"
                        value={inputText}
                        onClick={() => guardAction(() => {})} // Guard focus
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Message ${selectedGroup.name}...`}
                        className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button 
                        type="submit"
                        disabled={!inputText.trim()}
                        className="bg-blue-900 text-white p-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors shadow-sm hover:shadow"
                      >
                        <Send className="w-5 h-5 pl-0.5" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab Content: Events */}
        {activeTab === 'events' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {/* Events List Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Upcoming Group Activities</h3>
              {isAdmin && (
                <button 
                  onClick={() => setShowCreateEvent(true)}
                  className="flex items-center gap-2 bg-amber-400 text-blue-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-500 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create Event
                </button>
              )}
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {groupEvents.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No upcoming events planned.</p>
                </div>
              ) : (
                groupEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-50 w-16 h-16 rounded-lg flex flex-col items-center justify-center text-blue-900 flex-shrink-0">
                      <span className="text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
                      <span className="text-xl font-bold">{event.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-slate-900">{event.title}</h4>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{event.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {event.attendees} Attending
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create Event Modal */}
            {showCreateEvent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                  <div className="px-6 py-4 bg-blue-900 text-white flex justify-between items-center">
                    <h3 className="font-bold">Schedule New Event</h3>
                    <button onClick={() => setShowCreateEvent(false)} className="hover:text-amber-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Event Title</label>
                      <input 
                        required
                        type="text" 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="e.g. Choir Practice"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                        <input 
                          required
                          type="text" 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                          value={newEvent.date}
                          onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                          placeholder="e.g. Oct 24"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Time</label>
                        <input 
                          required
                          type="text" 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                          value={newEvent.time}
                          onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                          placeholder="e.g. 7:00 PM"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location</label>
                      <input 
                        required
                        type="text" 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        value={newEvent.location}
                        onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        placeholder="e.g. Fellowship Hall"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                      <textarea 
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        rows={3}
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                        placeholder="What's this event about?"
                      />
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setShowCreateEvent(false)}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium"
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Group List View
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Ministries & Groups
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <div 
            key={group.id} 
            onClick={() => setSelectedGroup(group)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <img src={group.image} alt={group.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{group.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{group.memberCount} Members</p>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{group.description}</p>
                <div className="text-blue-600 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Group <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Group Placeholder */}
        <div 
            onClick={() => guardAction(() => setShowCreateGroup(true))}
            className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer h-32 md:h-auto"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 text-slate-400">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-600">Start a New Ministry</span>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                  <div className="px-6 py-4 bg-blue-900 text-white flex justify-between items-center">
                      <h3 className="font-bold">Start New Ministry</h3>
                      <button onClick={() => setShowCreateGroup(false)} className="hover:text-amber-400">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4 border border-blue-100">
                          Creating a group allows you to organize ministry events, chat with members, and coordinate service activities.
                      </div>
                      
                      <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ministry Name</label>
                          <input 
                              required
                              type="text" 
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                              value={newGroupData.name}
                              onChange={e => setNewGroupData({...newGroupData, name: e.target.value})}
                              placeholder="e.g. Prison Ministry"
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                          <textarea 
                              required
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                              rows={3}
                              value={newGroupData.description}
                              onChange={e => setNewGroupData({...newGroupData, description: e.target.value})}
                              placeholder="What is the purpose of this group?"
                          />
                      </div>

                      <div className="pt-2 flex gap-3">
                          <button 
                              type="button" 
                              onClick={() => setShowCreateGroup(false)}
                              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit" 
                              className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium flex items-center justify-center gap-2"
                          >
                              <Plus className="w-4 h-4" /> Create Ministry
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};