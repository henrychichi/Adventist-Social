
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'member' | 'pastor' | 'admin' | 'elder' | 'clerk';
  church: string;
  bio: string;
  interests: string[];
  phoneNumber?: string;
  gender?: 'Male' | 'Female';
  baptismDate?: string;
  status?: 'active' | 'inactive' | 'pending';
  email?: string;
  joinedDate: string; // ISO Date string
  isSubscribed: boolean;
}

export interface Church {
  id: string;
  name: string;
  district: string;
  location: string;
  status: 'active' | 'pending';
  memberCount: number;
  pastorName?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'verse' | 'testimony';
}

export interface PrayerRequest {
  id: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  prayerCount: number;
  timestamp: string;
  category: 'Health' | 'Family' | 'Spiritual' | 'General';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  image: string;
}

export interface Group {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  audio?: string;
  timestamp: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
}

export interface LessonDay {
  day: string; // e.g., "Saturday", "Sunday"
  title: string;
  date: string;
  content: string;
  verses: string[];
}

export interface SabbathSchoolLesson {
  id: string;
  quarter: string;
  theme: string;
  weekTitle: string;
  coverImage: string;
  days: LessonDay[];
}

export interface StreamInfo {
  isLive: boolean;
  title: string;
  viewerCount: number;
  startTime: string;
}
