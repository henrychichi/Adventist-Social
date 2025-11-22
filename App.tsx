import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Feed } from './components/Feed';
import { PrayerWall } from './components/PrayerWall';
import { Groups } from './components/Groups';
import { Events } from './components/Events';
import { Chat } from './components/Chat';
import { Profile } from './components/Profile';
import { Admin } from './components/Admin';
import { ClerkDashboard } from './components/ClerkDashboard';
import { Devotional } from './components/Devotional';
import { Login } from './components/Login';
import { WorshipHub } from './components/WorshipHub';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const Dashboard: React.FC = () => {
  return (
    <>
      <Devotional />
      <Feed />
    </>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/worship" element={<WorshipHub />} />
          <Route path="/prayer" element={<PrayerWall />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/events" element={<Events />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/clerk" element={<ClerkDashboard />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthenticatedApp />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;