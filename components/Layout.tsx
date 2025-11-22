import React, { ReactNode, useState, useEffect } from 'react';
import { HashRouter as Router, Link, useLocation } from 'react-router-dom';
import { Home, User, Users, Calendar, MessageCircle, Menu, Bell, Shield, LogOut, BookOpen, Moon, Sun, CreditCard, AlertTriangle, Clock, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DonationModal } from './DonationModal';
import { requestNotificationPermission } from '../services/notificationService';

// Custom Pray Icon for nav
const PrayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4a3 3 0 0 0-3 3v7c0 1.1.9 2 2 2s2-.9 2-2V7a3 3 0 0 0-3-3z" />
    <path d="M19 11v-1a2 2 0 0 0-2-2h-3v9a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3" />
    <path d="M5 11v-1a2 2 0 0 1 2-2h3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
  </svg>
);

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, hasAccess, daysRemaining, isSubscriptionModalOpen, setSubscriptionModalOpen } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
  };

  const navItems = [
    { path: '/', label: 'Feed', icon: Home },
    { path: '/worship', label: 'Worship', icon: BookOpen },
    { path: '/prayer', label: 'Prayer', icon: PrayIcon },
    { path: '/groups', label: 'Ministries', icon: Users },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/chat', label: 'Messages', icon: MessageCircle },
  ];

  // Only show admin/clerk dashboards to appropriate roles
  if (user?.role === 'clerk') {
    navItems.push({ path: '/clerk', label: 'Clerk', icon: Users });
  }
  if (user?.role === 'pastor' || user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <DonationModal isOpen={isSubscriptionModalOpen} onClose={() => setSubscriptionModalOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 dark:bg-slate-950 text-white fixed h-full z-20 shadow-xl transition-colors">
        <div className="p-6 border-b border-blue-800 dark:border-slate-800 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg shadow-sm">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Seventh-day_Adventist_Church_logo.svg/800px-Seventh-day_Adventist_Church_logo.svg.png" 
              alt="SDA Logo" 
              className="w-8 h-8 object-contain" 
            />
          </div>
          <span className="font-bold text-lg tracking-wide">Adventist Social</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path ? 'bg-amber-400 text-blue-900 font-semibold shadow-md transform scale-105' : 'text-blue-100 hover:bg-blue-800 dark:hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Subscribe Button */}
          {user?.role !== 'clerk' && (
            <button 
              onClick={() => setSubscriptionModalOpen(true)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-bold mt-4 border group ${
                !hasAccess 
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 animate-pulse' 
                  : 'text-amber-300 hover:text-blue-900 hover:bg-amber-400 border-amber-400/30 hover:border-transparent'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>{user?.isSubscribed ? 'Manage Subscription' : (hasAccess ? 'Subscribe' : 'Subscription Expired')}</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800 dark:border-slate-800 space-y-3">
           {!notificationsEnabled && (
            <button 
              onClick={handleEnableNotifications}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-800 dark:hover:bg-slate-800 hover:text-white transition-colors text-sm"
            >
              <BellRing className="w-5 h-5 text-amber-300" />
              <span>Enable Alerts</span>
            </button>
          )}

          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-800 dark:hover:bg-slate-800 hover:text-white transition-colors text-sm"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-800 dark:hover:bg-slate-800 transition-colors group">
            <img src={user?.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs text-blue-200 truncate">{user?.church}</p>
            </div>
          </Link>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-800 dark:hover:bg-slate-800 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-blue-900 dark:bg-slate-950 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded shadow-sm">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Seventh-day_Adventist_Church_logo.svg/800px-Seventh-day_Adventist_Church_logo.svg.png" 
              alt="SDA Logo" 
              className="w-6 h-6 object-contain" 
            />
          </div>
          <span className="font-bold">Adventist Social</span>
        </div>
        <div className="flex items-center gap-4">
          {user?.role !== 'clerk' && (
            <button 
              onClick={() => setSubscriptionModalOpen(true)}
              className={`font-bold text-sm flex items-center gap-1 px-3 py-1.5 rounded-full ${
                !hasAccess ? 'bg-red-600 text-white animate-pulse' : 'text-amber-400 bg-blue-800'
              }`}
            >
              <CreditCard className="w-4 h-4" /> {!hasAccess ? 'Expired' : 'Subscribe'}
            </button>
          )}
          <button onClick={toggleTheme} className="text-blue-100">
             {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-blue-900/95 dark:bg-slate-950/95 pt-20 px-6 space-y-4 animate-fade-in overflow-y-auto transition-colors">
          {navItems.map(item => (
             <Link 
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg text-lg ${location.pathname === item.path ? 'bg-amber-400 text-blue-900 font-bold' : 'text-white'}`}
            >
              <item.icon className="w-6 h-6" />
              <span>{item.label}</span>
            </Link>
          ))}
           
           {!notificationsEnabled && (
              <button 
                onClick={() => {
                  handleEnableNotifications();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg text-amber-400 font-bold border border-amber-400/30"
              >
                <BellRing className="w-6 h-6" />
                <span>Enable Notifications</span>
              </button>
           )}

           {user?.role !== 'clerk' && (
             <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSubscriptionModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg text-amber-400 font-bold border border-amber-400/30"
              >
                <CreditCard className="w-6 h-6" />
                <span>{hasAccess ? 'Subscribe' : 'Renew Subscription'}</span>
              </button>
           )}

           <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 text-white mt-8 border-t border-blue-800 dark:border-slate-800">
             <User className="w-6 h-6" />
             <span>My Profile</span>
           </Link>
           <button 
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }} 
              className="w-full flex items-center gap-3 px-4 py-4 text-red-300 mt-2 hover:bg-blue-800 dark:hover:bg-slate-800 rounded-lg"
            >
             <LogOut className="w-6 h-6" />
             <span>Sign Out</span>
           </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Trial / Status Banner */}
        {(!user?.isSubscribed && user?.role !== 'admin' && user?.role !== 'pastor' && user?.role !== 'clerk') && (
          <div className={`max-w-5xl mx-auto mb-6 rounded-lg p-4 flex items-center justify-between shadow-sm ${
            hasAccess 
              ? 'bg-amber-100 border border-amber-200 text-amber-900' 
              : 'bg-red-100 border border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-3">
              {hasAccess ? <Clock className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <div>
                <p className="font-bold text-sm">
                  {hasAccess ? '7-Day Free Trial Active' : 'Free Trial Expired'}
                </p>
                <p className="text-xs opacity-80">
                  {hasAccess 
                    ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining. Subscribe to keep access.` 
                    : 'Your trial has ended. Please subscribe to post, chat, and interact.'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSubscriptionModalOpen(true)}
              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                hasAccess ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {hasAccess ? 'Upgrade Now' : 'Unlock Access'}
            </button>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
           {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 px-2 z-30 pb-safe transition-colors">
        {navItems.slice(0, 5).map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 ${location.pathname === item.path ? 'text-blue-900 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <item.icon className={`w-6 h-6 ${location.pathname === item.path ? 'fill-blue-100 dark:fill-blue-900' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};