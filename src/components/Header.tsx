import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Globe, User, GraduationCap, CheckCircle2, Bell, Check, Calendar, Phone, MapPin, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, setIsDrawerOpen, isLoggedIn, currentUser, setActiveTab, setSelectedJob } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/tutor/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      // quiet catch
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'tutor') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/tutor/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      for (const n of notifications.filter(item => !item.isRead)) {
        await fetch(`/api/tutor/notifications/${n.id}/read`, { method: 'POST', credentials: 'include' });
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

            {/* Notification Bell for Tutors */}
            {isLoggedIn && currentUser?.role === 'tutor' && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    fetchNotifications();
                  }}
                  className="relative p-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] leading-none animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#84CC16]" />
                        <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 px-2 py-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 font-medium">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.tuitionId) {
                                setActiveTab('profile');
                                setIsNotifOpen(false);
                              }
                            }}
                            className={`p-3 rounded-xl transition-colors cursor-pointer text-left space-y-1 ${
                              n.isRead ? 'bg-white hover:bg-slate-50 opacity-80' : 'bg-lime-50/50 hover:bg-lime-50 border-l-3 border-[#84CC16]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <h5 className="font-bold text-xs text-slate-900">{n.title}</h5>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Now'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                            {n.scheduledDate && (
                              <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-500 font-semibold flex-wrap">
                                <span className="flex items-center gap-1 text-slate-700">
                                  <Calendar className="w-3.5 h-3.5 text-[#84CC16]" />
                                  <span>{new Date(n.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </span>
                                {n.guardianPhone && (
                                  <span className="flex items-center gap-1 text-slate-700">
                                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{n.guardianPhone}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 px-4 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setIsNotifOpen(false);
                          setActiveTab('profile');
                        }}
                        className="text-xs font-bold text-[#84CC16] hover:text-[#65A30D] cursor-pointer"
                      >
                        View My Assigned Demos in Profile →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
