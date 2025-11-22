import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoggingIn(true);
    setLoginError(null);

    const success = await login(email);
    
    if (!success) {
      setIsLoggingIn(false);
      setLoginError("Invalid credentials. Please try again.");
    }
    // If success, App.tsx will handle the redirect
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Left Side - Visual & Spiritual Context (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop" 
          alt="Worship Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-slate-900/90"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div>
            <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 mb-6">
               <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Seventh-day_Adventist_Church_logo.svg/800px-Seventh-day_Adventist_Church_logo.svg.png" 
                alt="SDA Logo" 
                className="w-8 h-8 object-contain brightness-0 invert" 
              />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Adventist Social</h1>
            <p className="text-blue-200 text-lg">Connecting the body of Christ globally.</p>
          </div>

          <div className="space-y-6">
            <blockquote className="border-l-4 border-amber-400 pl-6">
              <p className="text-2xl font-serif italic text-slate-100 leading-relaxed mb-4">
                "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters."
              </p>
              <footer className="text-amber-400 font-bold tracking-wider uppercase text-sm">
                — Psalm 23:1-2
              </footer>
            </blockquote>
          </div>

          <div className="text-xs text-blue-300/60">
            © {new Date().getFullYear()} Adventist Social Platform. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="absolute top-6 left-6 lg:hidden">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Seventh-day_Adventist_Church_logo.svg/800px-Seventh-day_Adventist_Church_logo.svg.png" 
            alt="SDA Logo" 
            className="w-8 h-8 object-contain" 
          />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Please sign in to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                <ShieldCheck className="w-4 h-4" /> {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Username or Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-slate-50 focus:bg-white"
                  placeholder="Enter your email or username"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                Keep me signed in
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Don't have an account?</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-slate-600">
                  Contact your local Church Clerk to create your profile and receive login credentials.
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};