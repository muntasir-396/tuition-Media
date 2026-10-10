import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Globe, User, GraduationCap, CheckCircle2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, setIsDrawerOpen, isLoggedIn, currentUser, setActiveTab } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* Brand Logo matching reference screenshot */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#84CC16] to-[#65A30D] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none truncate">
                  Tutor<span className="text-[#84CC16]">Link</span>
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5 truncate">
                Be Better | Learn Better
              </span>
            </div>
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] sm:text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#84CC16]" />
                <span>{language === 'EN' ? 'ENG' : 'বাংলা'}</span>
              </button>
            </div>

            {/* Profile Pill (Desktop / Mobile Header) */}
            {isLoggedIn ? (
              (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin')) ? (
                 <button
                   onClick={() => setActiveTab('admin-dashboard')}
                   className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                 >
                   <span className="text-xs font-bold truncate max-w-[100px]">
                     {currentUser.name || 'Admin'}
                   </span>
                 </button>
              ) : currentUser ? (
                 <button
                   onClick={() => setActiveTab(currentUser.role === 'parent' ? 'guardian-dashboard' : 'profile')}
                   className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-lime-50 border border-lime-200 text-slate-800 hover:bg-lime-100 transition-colors cursor-pointer"
                 >
                   <img
                     src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                     alt={currentUser.name}
                     className="w-7 h-7 rounded-full object-cover border border-lime-500"
                   />
                   <span className="text-xs font-bold truncate max-w-[100px]">
                     {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                   </span>
                   <CheckCircle2 className="w-3.5 h-3.5 text-[#84CC16] fill-lime-100" />
                 </button>
              ) : null
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#84CC16] text-white font-bold text-xs shadow-xs hover:bg-[#65A30D] transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
