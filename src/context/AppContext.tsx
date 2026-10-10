import React, { useEffect, createContext, useContext, useState } from 'react';
import { PageTab, UserRole, UserProfile, TuitionJob, TutorProfile, AdminUser, AdminPermission } from '../types';


interface AppContextType {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  selectedJob: TuitionJob | null;
  setSelectedJob: (job: TuitionJob | null) => void;
  selectedTutor: TutorProfile | null;
  setSelectedTutor: (tutor: TutorProfile | null) => void;
  
  // Auth state
  isLoggedIn: boolean;
  authLoading: boolean;
  setIsLoggedIn: (status: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  
  // Admin Auth state
    adminSelectedTuitionId: string | null;
  setAdminSelectedTuitionId: (id: string | null) => void;
  loginAdmin: (role: 'super-admin' | 'admin', username: string, user?: any) => void;
  logoutAdmin: () => void;
  handleLogout: () => void;
  hasPermission: (perm: AdminPermission) => boolean;
  
  // Search & Filter state
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  jobSearchId: string;
  setJobSearchId: (id: string) => void;
  tutorSearchQuery: string;
  setTutorSearchQuery: (query: string) => void;
  selectedMediumFilter: string;
  setSelectedMediumFilter: (medium: string) => void;
  
  // Interactivity
  bookmarkedJobIds: string[];
  toggleBookmark: (jobId: string) => void;
  appliedJobIds: string[];
  applyToJob: (jobId: string) => void;
  
  // Modals & UI Controls
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isTutorialModalOpen: boolean;
  setIsTutorialModalOpen: (open: boolean) => void;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
  isApplyModalOpen: boolean;
  setIsApplyModalOpen: (open: boolean) => void;
  jobToApply: TuitionJob | null;
  setJobToApply: (job: TuitionJob | null) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  isCvModalOpen: boolean;
  setIsCvModalOpen: (open: boolean) => void;
  
  // Language
  language: 'EN' | 'BN';
  setLanguage: (lang: 'EN' | 'BN') => void;
  
  // Navigation helper
  navigateToJobDetails: (jobId: string) => void;
  navigateToTutorProfile: (tutorId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<PageTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as PageTab;
    
    // Support pathname routing
    const pathname = window.location.pathname.replace(/\/$/, '');
    if (pathname === '/request-tutor' || pathname === '/guardian' || pathname.startsWith('/guardian/')) {
      return 'request-tutor';
    }
    if (pathname === '/admin' || pathname === '/admin-login' || pathname.startsWith('/admin/')) {
      return 'admin-login';
    }
    if (pathname === '/tutor' || pathname === '/login' || pathname === '/tutor-login' || pathname.startsWith('/tutor/')) {
      return 'login';
    }
    
    return tabParam || 'home';
  });
  const [selectedJob, setSelectedJob] = useState<TuitionJob | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data && data.user) {
           setIsLoggedIn(true);
           if (data.user.role === 'admin' || data.user.role === 'super-admin') {
              setUserRole('admin');
              setCurrentUser(data.user);
           } else {
              setUserRole(data.user.role);
              setCurrentUser(data.user);
           }
        } else {
           setIsLoggedIn(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('tutor');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [jobSearchId, setJobSearchId] = useState<string>('');
  const [tutorSearchQuery, setTutorSearchQuery] = useState<string>('');
  const [selectedMediumFilter, setSelectedMediumFilter] = useState<string>('All');
  
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<string[]>(['80703']);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [jobToApply, setJobToApply] = useState<TuitionJob | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState<boolean>(false);

  const [language, setLanguage] = useState<'EN' | 'BN'>('EN');

  const [adminSelectedTuitionId, setAdminSelectedTuitionId] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as PageTab;
      const pathname = window.location.pathname.replace(/\/$/, '');
      let newTab: PageTab = tabParam || 'home';
      
      if (pathname === '/request-tutor' || pathname === '/guardian' || pathname.startsWith('/guardian/')) {
        newTab = 'request-tutor';
      } else if (pathname === '/admin' || pathname === '/admin-login' || pathname.startsWith('/admin/')) {
        newTab = 'admin-login';
      } else if (pathname === '/tutor' || pathname === '/login' || pathname === '/tutor-login' || pathname.startsWith('/tutor/')) {
        newTab = 'login';
      }
      setActiveTab(newTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (activeTab.startsWith('admin-') && activeTab !== 'admin-login' && !(currentUser?.role === 'admin' || currentUser?.role === 'super-admin')) {
      setActiveTab('admin-login');
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'admin-login');
      window.history.replaceState({}, '', url);
    } else if (activeTab === 'admin-login' && (currentUser?.role === 'admin' || currentUser?.role === 'super-admin')) {
      setActiveTab('admin-dashboard');
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'admin-dashboard');
      window.history.replaceState({}, '', url);
    }
  }, [activeTab, currentUser]);

  const handleSetActiveTab = (tab: PageTab) => {
    if (tab.startsWith('admin-') && tab !== 'admin-login') {
      if (!(currentUser?.role === 'admin' || currentUser?.role === 'super-admin')) {
        setActiveTab('admin-login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsDrawerOpen(false);
        return;
      }
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsDrawerOpen(false);
    
    // Update URL to support sharing deep links
    const url = new URL(window.location.href);
    if (tab === 'request-tutor') {
      url.pathname = '/guardian';
      url.search = '';
    } else if (tab === 'login') {
      url.pathname = '/tutor';
      url.search = '';
    } else if (tab === 'admin-login') {
      url.pathname = '/admin';
      url.search = '';
    } else if (tab.startsWith('admin-')) {
      // Keep admin paths as query for now or map them
      url.pathname = '/';
      url.searchParams.set('tab', tab);
    } else {
      url.pathname = '/';
      url.searchParams.set('tab', tab);
    }
    window.history.pushState({}, '', url);
  };

  const loginAdmin = (role: 'super-admin' | 'admin', username: string, user?: any) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (user) {
       setCurrentUser(user);
    } else {
       setCurrentUser({
         id: 'ADM-01',
         name: role === 'super-admin' ? 'Super Administrator' : 'Co-Administrator',
         email: 'admin@bangladeshtuition.com',
         phone: '01700000000',
         role: role,
         avatar: 'https://i.pravatar.cc/150?u=admin',
         completionRate: 100,
         isVerified: true
       });
    }
    setActiveTab('admin-dashboard');
    setIsDrawerOpen(false);
  };

  
  const logoutAdmin = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole('tutor');
    setActiveTab('admin-login');
    setIsDrawerOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole('tutor');
    setActiveTab('home');
    setIsDrawerOpen(false);
  };

  const hasPermission = (perm: AdminPermission) => {

    if (!(currentUser?.role === 'admin' || currentUser?.role === 'super-admin')) return false;
    if (currentUser.role === 'super-admin') return true;
    return (currentUser as any).permissions?.includes(perm);
  };

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const applyToJob = (jobId: string) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds((prev) => [...prev, jobId]);
    }
  };

  const navigateToJobDetails = async (jobId: string) => {
    try {
      const res = await fetch(`/api/tuitions/${jobId}`);
      if (res.ok) {
        const job = await res.json();
        setSelectedJob(job);
        handleSetActiveTab('job-details');
      }
    } catch(e) {}
  };

  const navigateToTutorProfile = async (tutorId: string) => {
    try {
      const res = await fetch(`/api/tutors`);
      if (res.ok) {
        const tutors = await res.json();
        const found = tutors.find((t: any) => t.id === tutorId);
        if (found) {
          setSelectedTutor(found);
          handleSetActiveTab('profile');
        }
      }
    } catch(e) {}
  };

  return (
    <AppContext.Provider
      value={{
        authLoading,
        activeTab,
        setActiveTab: handleSetActiveTab,
        selectedJob,
        setSelectedJob,
        selectedTutor,
        setSelectedTutor,
        isLoggedIn,
        setIsLoggedIn,
        userRole,
        setUserRole,
        currentUser,
        setCurrentUser,
        selectedCity,
        setSelectedCity,
        jobSearchId,
        setJobSearchId,
        tutorSearchQuery,
        setTutorSearchQuery,
        selectedMediumFilter,
        setSelectedMediumFilter,
        bookmarkedJobIds,
        toggleBookmark,
        appliedJobIds,
        applyToJob,
        isDrawerOpen,
        setIsDrawerOpen,
        isTutorialModalOpen,
        setIsTutorialModalOpen,
        isFilterModalOpen,
        setIsFilterModalOpen,
        isApplyModalOpen,
        setIsApplyModalOpen,
        jobToApply,
        setJobToApply,
        isShareModalOpen,
        setIsShareModalOpen,
        isCvModalOpen,
        setIsCvModalOpen,
        language,
        setLanguage,
        adminSelectedTuitionId,
        setAdminSelectedTuitionId,
        loginAdmin,
        logoutAdmin,
        handleLogout,
        hasPermission,
        navigateToJobDetails,
        navigateToTutorProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
