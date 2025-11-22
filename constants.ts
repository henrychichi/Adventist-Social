
import { User, Post, PrayerRequest, Event, Group, ChatMessage, Sermon, SabbathSchoolLesson, StreamInfo, Church } from './types';

// Helper to get date X days ago
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// Updated Current User:
// joinedDate is 8 days ago -> This forces the "Expired Trial" state immediately for testing.
// isSubscribed is false.
export const CURRENT_USER: User = {
  id: 'admin1',
  name: 'Elder James Admin',
  avatar: 'https://picsum.photos/id/1005/200/200', 
  role: 'admin',
  church: 'Conference HQ',
  bio: 'Overseeing digital evangelism.',
  interests: ['Technology', 'Leadership'],
  phoneNumber: '555-9999',
  email: 'admin@church.org',
  gender: 'Male',
  status: 'active',
  baptismDate: '1990-01-15',
  joinedDate: daysAgo(8), // TRIAL EXPIRED (8 days ago)
  isSubscribed: false
};

export const MOCK_USERS: Record<string, User> = {
  'u1': {
    id: 'u1',
    name: 'Brother David',
    avatar: 'https://picsum.photos/id/64/200/200',
    role: 'member',
    church: 'Central SDA Church',
    bio: 'Lover of hymns and nature. AY Leader.',
    interests: ['Youth Ministry', 'Music', 'Community Service'],
    email: 'david@example.com',
    joinedDate: daysAgo(20),
    isSubscribed: true // Paid member
  },
  'u2': {
    id: 'u2',
    name: 'Sister Sarah',
    avatar: 'https://picsum.photos/id/65/200/200',
    role: 'member',
    church: 'Central SDA Church',
    bio: 'Choir director.',
    interests: ['Music'],
    email: 'sarah@example.com',
    joinedDate: daysAgo(2),
    isSubscribed: false // On Trial
  },
  'u3': {
    id: 'u3',
    name: 'Pastor Michael',
    avatar: 'https://picsum.photos/id/1005/200/200',
    role: 'pastor',
    church: 'Central SDA Church',
    bio: 'Serving the Lord with gladness.',
    interests: ['Evangelism', 'Preaching'],
    email: 'pastor@church.org',
    joinedDate: daysAgo(100),
    isSubscribed: true
  },
  'c1': {
    id: 'c1',
    name: 'Sister Mary Clerk',
    avatar: 'https://picsum.photos/id/64/200/200',
    role: 'clerk',
    church: 'Central SDA Church',
    bio: 'Serving the church administration with joy.',
    interests: ['Administration', 'Welcome Ministry'],
    phoneNumber: '555-0123',
    email: 'clerk@church.org',
    gender: 'Female',
    status: 'active',
    baptismDate: '1995-06-15',
    joinedDate: daysAgo(50),
    isSubscribed: true
  },
  'admin1': CURRENT_USER
};

export const MOCK_PENDING_MEMBERS: User[] = [
  {
    id: 'p1',
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/150',
    role: 'member',
    church: 'Central SDA Church',
    bio: 'New to the area, looking to transfer membership.',
    interests: [],
    phoneNumber: '555-9876',
    gender: 'Male',
    status: 'pending',
    baptismDate: '2010-05-20',
    email: 'john.doe@example.com',
    joinedDate: daysAgo(0),
    isSubscribed: false
  },
  {
    id: 'p2',
    name: 'Jane Smith',
    avatar: 'https://via.placeholder.com/150',
    role: 'member',
    church: 'Central SDA Church',
    bio: 'Recently baptized!',
    interests: [],
    phoneNumber: '555-5432',
    gender: 'Female',
    status: 'pending',
    baptismDate: '2023-10-01',
    email: 'jane.smith@example.com',
    joinedDate: daysAgo(0),
    isSubscribed: false
  }
];

export const MOCK_PENDING_CLERKS: User[] = [
  {
    id: 'pc1',
    name: 'Brother Thomas',
    avatar: 'https://via.placeholder.com/150',
    role: 'clerk',
    church: 'Northside SDA',
    bio: 'Applying for clerk position.',
    interests: ['Administration'],
    phoneNumber: '555-1111',
    email: 'thomas@example.com',
    gender: 'Male',
    status: 'pending',
    joinedDate: daysAgo(1),
    isSubscribed: false
  },
  {
    id: 'pc2',
    name: 'Sister Ruth',
    avatar: 'https://via.placeholder.com/150',
    role: 'clerk',
    church: 'Maranatha District',
    bio: 'District secretary.',
    interests: [],
    phoneNumber: '555-2222',
    email: 'ruth@example.com',
    gender: 'Female',
    status: 'pending',
    joinedDate: daysAgo(2),
    isSubscribed: false
  }
];

export const MOCK_CHURCHES: Church[] = [
  {
    id: 'ch1',
    name: 'Central SDA Church',
    district: 'Metro District',
    location: '123 Faith Ave, Cityville',
    status: 'active',
    memberCount: 450,
    pastorName: 'Pastor Michael'
  },
  {
    id: 'ch2',
    name: 'Hope Community SDA',
    district: 'Metro District',
    location: '45 Hope St, Suburbia',
    status: 'active',
    memberCount: 120,
    pastorName: 'Pastor David'
  },
  {
    id: 'ch3',
    name: 'New Life Company',
    district: 'West District',
    location: 'Community Center, Room B',
    status: 'pending',
    memberCount: 25,
    pastorName: 'Elder James'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u3',
    content: 'Happy Sabbath church family! Remember that rest is a gift from God. Looking forward to seeing you all tomorrow.',
    likes: 45,
    comments: 12,
    timestamp: '2 hours ago',
    type: 'text'
  },
  {
    id: 'p2',
    userId: 'u2',
    content: 'The choir practice was amazing tonight. Getting ready for the Easter cantata!',
    image: 'https://picsum.photos/id/453/600/400',
    likes: 32,
    comments: 5,
    timestamp: '5 hours ago',
    type: 'image'
  },
  {
    id: 'p3',
    userId: 'u1',
    content: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11',
    likes: 89,
    comments: 8,
    timestamp: '1 day ago',
    type: 'verse'
  }
];

export const INITIAL_PRAYERS: PrayerRequest[] = [
  {
    id: 'pr1',
    userId: 'u2',
    content: 'Please pray for my mother who is undergoing surgery next week.',
    isAnonymous: false,
    prayerCount: 15,
    timestamp: '3 hours ago',
    category: 'Health'
  },
  {
    id: 'pr2',
    userId: 'u1',
    content: 'Praying for guidance in my career decisions.',
    isAnonymous: true,
    prayerCount: 7,
    timestamp: '6 hours ago',
    category: 'General'
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Community Health Fair',
    date: 'Oct 15',
    time: '10:00 AM',
    location: 'Church Parking Lot',
    description: 'Free blood pressure checks and health consultations.',
    attendees: 42,
    image: 'https://picsum.photos/id/201/600/300'
  },
  {
    id: 'e2',
    title: 'Youth Vespers',
    date: 'Oct 20',
    time: '7:00 PM',
    location: 'Youth Hall',
    description: 'Join us to close the Sabbath with songs and testimony.',
    attendees: 25,
    image: 'https://picsum.photos/id/302/600/300'
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Pathfinders Club',
    memberCount: 120,
    description: 'Building character and skills for service.',
    image: 'https://picsum.photos/id/400/100/100'
  },
  {
    id: 'g2',
    name: 'Sanctuary Choir',
    memberCount: 45,
    description: 'Singing praises to the King.',
    image: 'https://picsum.photos/id/401/100/100'
  },
  {
    id: 'g3',
    name: 'Family Life Ministry',
    memberCount: 80,
    description: 'Strengthening families for eternity.',
    image: 'https://picsum.photos/id/402/100/100'
  }
];

export const MOCK_CHATS: ChatMessage[] = [
  { id: 'm1', senderId: 'u2', text: 'Happy Sabbath Brother David!', timestamp: 'Fri 6:00 PM' },
  { id: 'm2', senderId: 'u1', text: 'Happy Sabbath Sister Sarah! See you at church?', timestamp: 'Fri 6:05 PM' },
];

export const MOCK_SERMONS: Sermon[] = [
  {
    id: 's1',
    title: 'The Great Hope',
    speaker: 'Pastor Michael',
    date: 'Oct 14, 2023',
    duration: '45:20',
    thumbnail: 'https://picsum.photos/id/1015/600/400',
    videoUrl: '#',
    views: 1203
  },
  {
    id: 's2',
    title: 'Walking in Faith',
    speaker: 'Dr. Elizabeth Chen',
    date: 'Oct 07, 2023',
    duration: '38:15',
    thumbnail: 'https://picsum.photos/id/1025/600/400',
    videoUrl: '#',
    views: 856
  },
  {
    id: 's3',
    title: 'Sabbath Rest in a Busy World',
    speaker: 'Elder James Wilson',
    date: 'Sep 30, 2023',
    duration: '42:10',
    thumbnail: 'https://picsum.photos/id/1040/600/400',
    videoUrl: '#',
    views: 945
  }
];

export const MOCK_LESSON: SabbathSchoolLesson = {
  id: 'q4-2023',
  quarter: '4th Quarter 2023',
  theme: "God's Mission - My Mission",
  weekTitle: "Lesson 3: God's Call to Mission",
  coverImage: 'https://picsum.photos/id/20/800/400',
  days: [
    {
      day: 'Saturday',
      title: 'Afternoon',
      date: 'Oct 14',
      content: "Read for This Week's Study: Gen. 11:1–9, Gen. 12:1–3, Dan. 9:24–27, Matt. 1:21, Gen. 12:10–13:1, Acts 8:1–4, Acts 1:8.\n\nMemory Text: “Now the Lord had said to Abram: ‘Get out of your country, from your family and from your father’s house, to a land that I will show you. I will make you a great nation; I will bless you and make your name great; and you shall be a blessing’ ” (Genesis 12:1, 2, NKJV).",
      verses: ['Gen. 12:1-2']
    },
    {
      day: 'Sunday',
      title: 'Moving Beyond Our Comfort Zone',
      date: 'Oct 15',
      content: "It is one thing to talk about mission; it is another thing to actually do it. Often, doing mission requires us to move out of our comfort zones. This was certainly the case for Abraham. He was comfortable in Ur, but God called him to leave everything behind.\n\nConsider the challenges Abraham faced. He didn't know where he was going, but he knew Who he was following. That is the essence of faith.",
      verses: ['Gen. 11:31', 'Heb. 11:8']
    },
    {
      day: 'Monday',
      title: 'Becoming a Blessing',
      date: 'Oct 16',
      content: "God didn't just call Abraham to save him; He called him to be a channel of blessing to others. 'In you all the families of the earth shall be blessed.' This is the covenant. We are blessed to bless others.\n\nThink about your own life. In what ways has God blessed you, not just for your own enjoyment, but so that you can be a blessing to those around you?",
      verses: ['Gen. 12:2-3']
    },
    {
      day: 'Tuesday',
      title: 'The Call to the Nations',
      date: 'Oct 17',
      content: "The scope of God's mission is universal. It started with one man, but the goal was always the 'nations'. The gospel is for every tribe, tongue, and people.",
      verses: ['Rev. 14:6']
    },
    {
      day: 'Wednesday',
      title: 'Mission in the Old Testament',
      date: 'Oct 18',
      content: "We often think of mission as a New Testament concept, but the OT is full of it. Jonah, Daniel, Esther - they were all missionaries in their own contexts.",
      verses: ['Jonah 1:1-3']
    },
    {
      day: 'Thursday',
      title: 'Your Personal Mission Field',
      date: 'Oct 19',
      content: "You don't have to go overseas to be a missionary. Your mission field is right where you are - your workplace, your school, your neighborhood.",
      verses: ['Acts 1:8']
    },
    {
      day: 'Friday',
      title: 'Further Thought',
      date: 'Oct 20',
      content: "Read Ellen G. White, 'The Call of Abraham,' pp. 125-131, in Patriarchs and Prophets.\n\nDiscussion Question: What holds us back from fully embracing God's mission for our lives? Is it fear? Comfort? Lack of understanding?",
      verses: []
    }
  ]
};

export const MOCK_STREAM: StreamInfo = {
  isLive: true,
  title: "Divine Service: The Power of Grace",
  viewerCount: 245,
  startTime: "11:00 AM"
};
