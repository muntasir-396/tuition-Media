import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  User,
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { setUserRole, setIsLoggedIn, setActiveTab, currentUser, setCurrentUser } = useApp();

  const [activeRole, setActiveRole] = useState<UserRole>('tutor');
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [fullName, setFullName] = useState<string>('');
  const [university, setUniversity] = useState<string>('BUET');
  
  const [submittedMessage, setSubmittedMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = isSignUpMode ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignUpMode 
      ? { role: activeRole, fullName, phoneOrEmail, password, university }
      : { role: activeRole, phoneOrEmail, password };
      
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUserRole(activeRole);
        setIsLoggedIn(true);
        // We must also set the currentUser so the UI knows WHO is logged in!
        // We will fetch the me endpoint or use data.user
        
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        
        if (meData && meData.user) {
           setCurrentUser(meData.user);
        }

        setSubmittedMessage(
          isSignUpMode
            ? `Account successfully created as ${activeRole.toUpperCase()}!`
            : `Signed in successfully as ${activeRole.toUpperCase()}!`
        );
    
        setTimeout(() => {
          setActiveTab(activeRole === 'tutor' ? 'profile' : 'guardian-dashboard');
        }, 1000);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (e) {
      console.error("Auth error", e);
      alert('Network error during authentication');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6 pb-20">
      {/* Container Card */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-lg space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#84CC16] text-white flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {isSignUpMode ? 'Create New Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            {isSignUpMode
              ? 'Join TutorLink matching platform'
              : 'Sign in to access your tuition jobs & profile'}
          </p>
        </div>

        {/* 1. Role Switcher Tabs */}
        <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-2 text-xs font-extrabold text-slate-700">
          <button
            type="button"
            onClick={() => setActiveRole('parent')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeRole === 'parent'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-blue-500" />
            <span>Parents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('tutor')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeRole === 'tutor'
                ? 'bg-[#84CC16] text-slate-950 shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tutor</span>
          </button>
        </div>

        {submittedMessage ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm">{submittedMessage}</p>
            <p className="text-xs text-emerald-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Conditional fields based on SignUp & Role */}
            {isSignUpMode && (
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                      placeholder={activeRole === 'tutor' ? 'Tanvir Hossain' : 'Abdur Rahman'}
                    />
                  </div>
                </div>

                {/* Additional Tutor Fields */}
                {activeRole === 'tutor' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      University/Institution
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                        placeholder="e.g. BUET, DU, NSU"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact or Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Phone Number or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                  placeholder={activeRole === 'tutor' ? '01712... or name@example.com' : '01712...'}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center justify-between">
                <span>Password</span>
                {!isSignUpMode && (
                  <a href="#" className="text-blue-500 hover:underline capitalize text-[10px]">Forgot?</a>
                )}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#84CC16] focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors mt-2 cursor-pointer"
            >
              <span>{isSignUpMode ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Switch Mode */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-600">
          {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
        </p>
        <button
          onClick={() => setIsSignUpMode(!isSignUpMode)}
          className="mt-1 text-sm font-bold text-[#84CC16] hover:text-[#65A30D] transition-colors cursor-pointer inline-block border-b-2 border-transparent hover:border-[#84CC16]"
        >
          {isSignUpMode ? 'Sign in instead' : 'Create a free account'}
        </button>
      </div>
    </div>
  );
};
