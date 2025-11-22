import React, { useState, useRef, useEffect } from 'react';
import { MOCK_CHATS, MOCK_USERS } from '../constants';
import { Send, MoreVertical, Search, Mic, Square, Trash2, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';
import { sendPushNotification } from '../services/notificationService';

export const Chat: React.FC = () => {
  const { user: currentUser, guardAction } = useAuth();
  const [activeChat, setActiveChat] = useState('u2'); // Default chat with Sister Sarah
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHATS);
  const [newMessage, setNewMessage] = useState('');
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const simulationTimerRef = useRef<any>(null);

  const activeUser = MOCK_USERS[activeChat];

  useEffect(() => {
    // Simulate an incoming message notification after 5 seconds for demo purposes
    simulationTimerRef.current = setTimeout(() => {
      if (currentUser) {
         const incomingMsg: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'u2',
            text: "Are you coming to the prayer meeting tonight?",
            timestamp: "Just now"
         };
         
         // Only add if we are in that chat, otherwise just notify
         if (activeChat === 'u2') {
             setMessages(prev => [...prev, incomingMsg]);
         }
         sendPushNotification('New Message', 'Sister Sarah: Are you coming to the prayer meeting tonight?');
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    };
  }, [currentUser, activeChat]);

  const handleSend = () => {
    guardAction(() => {
      if (!newMessage.trim() || !currentUser) return;
      
      const msg: ChatMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        text: newMessage,
        timestamp: 'Just now'
      };
      
      setMessages([...messages, msg]);
      setNewMessage('');
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
    if (mediaRecorderRef.current && isRecording && currentUser) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          
          const msg: ChatMessage = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            text: 'Audio Message',
            audio: base64Audio,
            timestamp: 'Just now'
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

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] flex overflow-hidden max-w-4xl mx-auto">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-300"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {Object.values(MOCK_USERS).filter(u => u.id !== currentUser.id).map(user => (
            <div 
              key={user.id}
              onClick={() => setActiveChat(user.id)}
              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-white transition-colors ${activeChat === user.id ? 'bg-white border-l-4 border-blue-900 shadow-sm' : 'border-l-4 border-transparent'}`}
            >
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h4>
                <p className="text-xs text-slate-500 truncate">Happy Sabbath!</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={activeUser.avatar} alt={activeUser.name} className="w-8 h-8 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{activeUser.name}</h3>
              <p className="text-xs text-green-600 flex items-center gap-1">Online</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-blue-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                  {msg.audio ? (
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <audio controls src={msg.audio} className="w-full h-8 max-w-[240px]" />
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white relative">
          {isRecording ? (
            <div className="flex items-center gap-3 bg-red-50 p-2 rounded-full border border-red-100 animate-pulse">
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
            <div className="flex gap-2">
              <button 
                onClick={startRecording}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title="Record Audio"
              >
                <Mic className="w-5 h-5" />
              </button>
              <input 
                type="text"
                value={newMessage}
                onClick={() => guardAction(() => {})} // Guard input focus
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button 
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="bg-amber-400 hover:bg-amber-500 text-blue-900 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 pl-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};