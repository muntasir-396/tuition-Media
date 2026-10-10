import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  CreditCard,
  MessageSquarePlus,
  ShieldCheck,
  HelpCircle,
  Briefcase,
  FileCheck2,
  Share2,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Phone,
  BookOpen,
  Award,
  Layers,
} from 'lucide-react';

export const SidebarDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isLoggedIn,
    setIsLoggedIn,
    currentUser,
    activeTab,
    setActiveTab,
    setIsTutorialModalOpen,
    setIsFilterModalOpen,
    
    logoutAdmin,
    handleLogout,
  } = useApp();

  if (!isDrawerOpen) return null;

  const handleNavigate = (tab: any) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#84CC16] flex items-center justify-center text-slate-900">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-bold text-base tracking-tight">Navigation Menu</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Banner */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              {isLoggedIn ? (
                (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin')) ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white border-2 border-slate-700 shadow-xs">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                          {currentUser.role.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : currentUser ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#84CC16] shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-lime-100 text-[#65A30D] text-[10px] font-bold uppercase">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-slate-500">ID: {currentUser.id}</span>
                      </div>
                    </div>
                  </div>
                ) : null
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-slate-600">
                    Sign in to access your profile & apply to tuition jobs!
                  </p>
                  <button
                    onClick={() => handleNavigate('login')}
                    className="w-full py-2 px-3 rounded-lg bg-[#84CC16] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-[#65A30D] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In / Register</span>
                  </button>
                </div>
              )}
            </div>

            {/* Links Sections */}
            <div className="p-4 space-y-5">
              {/* Authenticated Fast Navigation */}
              <div>
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Main Navigation
                </h5>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-[#84CC16]" /> Home Page
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleNavigate('jobs')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-[#84CC16]" /> Tuition Jobs Feed
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleNavigate('tutors')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-[#84CC16]" /> Tutors Directory
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  {isLoggedIn && currentUser?.role === 'parent' && (
                    <button
                      onClick={() => handleNavigate('guardian-dashboard')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#84CC16]" /> Parent Dashboard
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                  {isLoggedIn && currentUser?.role === 'tutor' && (
                    <button
                      onClick={() => handleNavigate('profile')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#84CC16]" /> My Profile & CV
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* My Payments */}
              <div>
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  My Payments
                </h5>
                <div className="space-y-1">
                  <div onClick={() => handleNavigate('payment')} className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs cursor-pointer transition-colors">
                    <span className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-blue-500" /> Make Payment
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-xs">
                      bKash / Nagad
                    </span>
                  </div>
                  <div onClick={() => handleNavigate('sms')} className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs cursor-pointer transition-colors">
                    <span className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-amber-500" /> SMS Recharge
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* My Requests */}
              <div>
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  My Requests
                </h5>
                <div className="space-y-1">
                  <div onClick={() => handleNavigate('premium')} className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs cursor-pointer transition-colors">
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Premium Request
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-xs">
                      PRO
                    </span>
                  </div>
                  <div onClick={() => handleNavigate('verify')} className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs cursor-pointer transition-colors">
                    <span className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verification Request (NID)
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Useful Links & Support */}
              <div>
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Help & Support
                </h5>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsTutorialModalOpen(true);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Watch Video Tutorial
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <div onClick={() => handleNavigate('support')} className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs cursor-pointer transition-colors">
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-slate-500" /> FAQ & Support Center
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Admin Panel (Visible for Admin) */}
              {(currentUser?.role === 'admin' || currentUser?.role === 'super-admin') && activeTab.startsWith('admin-') && (
                <div>
                  <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-[#84CC16] mb-2">
                    Admin Panel
                  </h5>
                  <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <button onClick={() => handleNavigate('admin-dashboard')} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors">
                      <span className="flex items-center gap-2.5">Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={() => handleNavigate('admin-tutors')} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors">
                      <span className="flex items-center gap-2.5">Tutors</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={() => handleNavigate('admin-guardians')} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors">
                      <span className="flex items-center gap-2.5">Guardians</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={() => handleNavigate('admin-tuitions')} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors">
                      <span className="flex items-center gap-2.5">Tuitions & Workflow</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={() => handleNavigate('admin-demos')} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors">
                      <span className="flex items-center gap-2.5">Demo Classes</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={() => handleNavigate('admin-payments')} className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors">
                      <span className="flex items-center gap-2.5">Payments & Fees</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    
                    
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
            {isLoggedIn && currentUser?.role !== 'admin' && currentUser?.role !== 'super-admin' && (
              <button
                onClick={() => handleLogout()}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Account</span>
              </button>
            )}
            
            {isLoggedIn && (currentUser?.role === 'admin' || currentUser?.role === 'super-admin') && (
              <button
                onClick={() => {
                  logoutAdmin();
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Admin ({currentUser.name})</span>
              </button>
            )}
            
            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500 font-medium mb-1">
                © 2026 TutorLink. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
