import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_EVENTS } from '../constants';
import { Calendar as CalendarIcon, MapPin, Clock, List, ChevronLeft, ChevronRight, Check, Bell, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';

// Helper to parse mock date strings like "Oct 15" "10:00 AM"
// Improved to handle past dates for demo continuity
const parseEventDateTime = (dateStr: string, timeStr: string): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();
  let target = new Date(`${dateStr} ${currentYear} ${timeStr}`);
  
  // For demo purposes: if the date has passed this year, assume it's next year
  // so the countdown always has something to show and the event stays "upcoming"
  if (target.getTime() < now.getTime()) {
    target = new Date(`${dateStr} ${currentYear + 1} ${timeStr}`);
  }
  
  return target;
};

const CountdownWidget = ({ event }: { event: Event }) => {
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const target = parseEventDateTime(event.date, event.time);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null); // Event started or passed
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ d, h, m, s });
    };

    calculateTime(); // Initial call
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (!timeLeft) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 text-white mb-8 shadow-lg relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-amber-400 rounded-full opacity-10 blur-2xl"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-300 mb-1 text-sm font-bold uppercase tracking-wider">
            <Timer className="w-4 h-4" />
            Next Up
          </div>
          <h3 className="text-2xl font-bold font-serif">{event.title}</h3>
          <p className="text-blue-200 text-sm mt-1 flex items-center gap-2">
            <Clock className="w-3 h-3" /> {event.date} @ {event.time}
          </p>
        </div>
        
        <div className="flex gap-4 text-center">
          {[
            { label: 'Days', value: timeLeft.d },
            { label: 'Hrs', value: timeLeft.h },
            { label: 'Mins', value: timeLeft.m },
            { label: 'Secs', value: timeLeft.s }
          ].map((item, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-3xl font-bold tabular-nums leading-none">{String(item.value).padStart(2, '0')}</span>
              <span className="text-[10px] uppercase text-blue-300 font-medium tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Events: React.FC = () => {
  const { user, guardAction } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Initialize Events from localStorage to sync with Groups created events
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const saved = localStorage.getItem('sda_app_events');
      return saved ? JSON.parse(saved) : MOCK_EVENTS;
    } catch (e) {
      return MOCK_EVENTS;
    }
  });
  
  // Initialize RSVPs from localStorage to persist state across reloads
  const [rsvps, setRsvps] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('event_rsvps');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Persist RSVPs whenever they change
  useEffect(() => {
    localStorage.setItem('event_rsvps', JSON.stringify(Array.from(rsvps)));
  }, [rsvps]);

  // Persist Events whenever they change (attendee counts, etc)
  useEffect(() => {
    localStorage.setItem('sda_app_events', JSON.stringify(events));
  }, [events]);

  // Calculate next upcoming RSVP'd event using the smart date parser
  const nextEvent = useMemo(() => {
    const now = new Date();
    const attendingEvents = events.filter(e => rsvps.has(e.id));
    
    const upcoming = attendingEvents
      .map(e => ({ 
        ...e, 
        parsedDate: parseEventDateTime(e.date, e.time) 
      }))
      .filter(e => e.parsedDate.getTime() > now.getTime())
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    return upcoming.length > 0 ? upcoming[0] : null;
  }, [events, rsvps]);

  // Helper to parse date number from "Oct 15" string
  const getDateNumber = (dateStr: string) => {
    return parseInt(dateStr.split(' ')[1], 10);
  };

  const sendNotification = async (eventTitle: string, eventTime: string) => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
      return;
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      new Notification(`RSVP Confirmed: ${eventTitle}`, {
        body: `You are all set! We will remind you shortly before ${eventTime}.`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png',
        silent: false,
      });
    }
  };

  const handleRSVP = async (eventId: string) => {
    guardAction(async () => {
      if (!user) return;

      const targetEvent = events.find(e => e.id === eventId);
      const isAttending = rsvps.has(eventId);
      
      // Update RSVP state
      const newRsvps = new Set(rsvps);
      if (isAttending) {
        newRsvps.delete(eventId);
      } else {
        newRsvps.add(eventId);
        // Trigger Notification only when joining
        if (targetEvent) {
          await sendNotification(targetEvent.title, targetEvent.time);
        }
      }
      setRsvps(newRsvps);

      // Update event attendee count locally
      setEvents(events.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            attendees: isAttending ? ev.attendees - 1 : ev.attendees + 1
          };
        }
        return ev;
      }));
    });
  };

  const renderCalendar = () => {
    // Hardcoded for October 2023/2024 structure for demo purposes
    const daysInMonth = 31;
    const startDayOffset = 2; // Tuesday start
    const days = [];

    // Empty slots
    for (let i = 0; i < startDayOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 border border-slate-100"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events.filter(e => getDateNumber(e.date) === day);
      
      days.push(
        <div key={day} className="min-h-[6rem] bg-white border border-slate-100 p-2 hover:bg-blue-50 transition-colors group relative">
          <span className={`text-sm font-semibold ${dayEvents.length > 0 ? 'text-blue-900' : 'text-slate-400'}`}>{day}</span>
          
          <div className="mt-1 space-y-1">
            {dayEvents.map(ev => (
              <div key={ev.id} className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate font-medium cursor-pointer" title={ev.title}>
                {ev.time.split(' ')[0]} - {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <button className="p-1 hover:bg-blue-800 rounded"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-lg">October</span>
          <button className="p-1 hover:bg-blue-800 rounded"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 bg-slate-100 gap-px border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 border-l border-slate-200">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Countdown Widget for next RSVP'd event */}
      {nextEvent && <CountdownWidget event={nextEvent} />}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2 self-start md:self-auto">
          <CalendarIcon className="w-6 h-6" />
          Upcoming Events
        </h2>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200 self-start md:self-auto">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? renderCalendar() : (
        <div className="space-y-4 animate-fade-in">
          {events.map(event => {
            const isAttending = rsvps.has(event.id);
            return (
              <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row group hover:shadow-md transition-all">
                <div className="md:w-48 h-32 md:h-auto relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-center min-w-[60px] shadow-sm">
                    <span className="block text-xs font-bold text-blue-900 uppercase tracking-wider">{event.date.split(' ')[0]}</span>
                    <span className="block text-xl font-bold text-blue-900 leading-none">{event.date.split(' ')[1]}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">{event.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-sm text-slate-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" /> {event.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" /> {event.location}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{event.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white"></div>
                        ))}
                      </div>
                      <span className="text-sm text-slate-500 font-medium">
                        {event.attendees} going
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRSVP(event.id)}
                      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        isAttending 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-blue-900 text-white hover:bg-blue-800 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {isAttending ? (
                        <>
                          <Check className="w-4 h-4" /> Going
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" /> RSVP
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};