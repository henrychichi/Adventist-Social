
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { MOCK_USERS, CURRENT_USER } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  upgradeAccount: () => void;
  loading: boolean;
  hasAccess: boolean;
  daysRemaining: number;
  guardAction: (action: () => void) => void;
  isSubscriptionModalOpen: boolean;
  setSubscriptionModalOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Subscription & Access State
  const [hasAccess, setHasAccess] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedUserId = localStorage.getItem('sda_auth_user_id');
      if (storedUserId) {
        const allUsers = Object.values(MOCK_USERS);
        const foundUser = allUsers.find(u => u.id === storedUserId);
        if (foundUser) {
          setUser(foundUser);
        } else {
          localStorage.removeItem('sda_auth_user_id');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Calculate access whenever user changes
  useEffect(() => {
    if (user) {
      if (user.isSubscribed || user.role === 'admin' || user.role === 'pastor') {
        setHasAccess(true);
        setDaysRemaining(999);
      } else {
        // Check trial
        const joined = new Date(user.joinedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - joined.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        const daysLeft = 8 - diffDays; // 7 day trial, but we count day 1
        
        setDaysRemaining(Math.max(0, daysLeft));
        setHasAccess(daysLeft > 0);
      }
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const allUsers = Object.values(MOCK_USERS);
      
      // Check against email or specific mock IDs
      let foundUser = allUsers.find(u => 
        (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
        u.id === email // fallback for testing like 'admin1'
      );

      // Admin/Clerk shortcuts
      if (!foundUser && email === 'admin') {
        foundUser = MOCK_USERS['admin1'];
      }
      if (!foundUser && email === 'clerk') {
        foundUser = MOCK_USERS['c1'];
      }

      if (foundUser) {
        if (foundUser.status !== 'active' && foundUser.status !== undefined) {
             alert("This account is pending approval or inactive.");
             return false;
        }
        setUser(foundUser);
        localStorage.setItem('sda_auth_user_id', foundUser.id);
        return true;
      }
      
      // Generic error for security
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sda_auth_user_id');
    setHasAccess(true); // Reset for next user login
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
  };

  const upgradeAccount = () => {
    if (!user) return;
    const updatedUser = { ...user, isSubscribed: true };
    setUser(updatedUser);
    // In real app, we'd save to DB here
    setHasAccess(true);
  };

  // Wrapper function to protect interactive elements
  const guardAction = (action: () => void) => {
    if (hasAccess) {
      action();
    } else {
      setSubscriptionModalOpen(true);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateProfile, 
      loading,
      upgradeAccount,
      hasAccess,
      daysRemaining,
      guardAction,
      isSubscriptionModalOpen,
      setSubscriptionModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
