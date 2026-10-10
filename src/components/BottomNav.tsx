import React from 'react';
import { useApp } from '../context/AppContext';
import { PageTab } from '../types';
import { SquarePen, Briefcase, Home, UserCheck, LayoutGrid, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isLoggedIn, setIsDrawerOpen, currentUser } = useApp();

  const handleTabClick = (tab: PageTab) => {
    if (tab === 'menu') {
      setIsDrawerOpen(true);
    } else {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  let profileTabId: PageTab = 'login';
  let profileTabLabel = 'Sign In';

  if (isLoggedIn) {
     if (currentUser?.role === 'admin' || currentUser?.role === 'super-admin') {
        profileTabId = 'admin-dashboard';
        profileTabLabel = 'Admin';
     } else if (currentUser?.role === 'parent') {
        profileTabId = 'guardian-dashboard';
        profileTabLabel = 'Dashboard';
     } else {
        profileTabId = 'profile';
        profileTabLabel = 'Profile';
     }
  }

  const navItems = [
    {
      id: profileTabId,
      label: profileTabLabel,
      icon: isLoggedIn ? User : SquarePen,
    },
    {
      id: 'jobs' as PageTab,
      label: 'Jobs',
      icon: Briefcase,
    },
    {
      id: 'home' as PageTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'tutors' as PageTab,
      label: 'Tutors',
      icon: UserCheck,
    },
    {
      id: 'menu' as PageTab,
      label: 'Menu',
      icon: LayoutGrid,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg sm:hidden">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'jobs' && activeTab === 'job-details') ||
            (item.id === 'tutors' && activeTab === 'profile' && activeTab !== 'home');

          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="flex flex-col items-center justify-center cursor-pointer transition-colors pt-1"
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-lime-100 text-[#65A30D] scale-110'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              </div>
              <span
                className={`text-[10px] font-medium mt-1 transition-all ${
                  isActive ? 'text-[#65A30D] font-bold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
