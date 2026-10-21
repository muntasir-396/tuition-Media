import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SidebarDrawer } from './components/SidebarDrawer';
import { HomeView } from './components/HomeView';
import { JobsView } from './components/JobsView';
import { JobDetailsView } from './components/JobDetailsView';
import { TutorsView } from './components/TutorsView';
import { TutorProfileView } from './components/TutorProfileView';
import { AuthView } from './components/AuthView';
import { Modals } from './components/Modals';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminTutorsView } from './components/AdminTutorsView';
import { AdminGuardiansView } from './components/AdminGuardiansView';
import { AdminTuitionsView } from './components/AdminTuitionsView';
import { AdminTuitionDetailsView } from './components/AdminTuitionDetailsView';
import { AdminDemosView } from './components/AdminDemosView';
import { AdminPaymentsView } from './components/AdminPaymentsView';
import { AdminTimelineView } from './components/AdminTimelineView';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminUsersView } from './components/AdminUsersView';
import { GuardianDashboardView } from './components/GuardianDashboardView';
import { GeneralPageView } from './components/GeneralPageView';
import { VerificationView } from './components/VerificationView';
import { PremiumView } from './components/PremiumView';
import { RequestTutorView } from './components/RequestTutorView';
import { GlobalBackButton } from './components/GlobalBackButton';
import { CreditCard, Phone, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

const MainContent: React.FC = () => {
  
  const { activeTab, setActiveTab, isLoggedIn, userRole, authLoading, selectedTutor, currentUser } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#84CC16]"></div></div>;
  }

  const isAdminTab = activeTab.startsWith('admin-') && activeTab !== 'admin-login';
  const isTutorTab = activeTab === 'profile';
  const isGuardianTab = activeTab === 'guardian-dashboard';

  if (isAdminTab) {
    if (!isLoggedIn || (userRole !== 'admin' && userRole !== 'super-admin')) {
       return (
         <div className="flex flex-col items-center justify-center p-12 space-y-4">
           <h2 className="text-xl font-black text-rose-500">403 Forbidden</h2>
           <p className="text-slate-500 font-medium text-sm">You do not have permission to view this page.</p>
         </div>
       );
    }
  }

  if (isTutorTab) {
     const isViewingSpecificTutor = !!selectedTutor;
     const isAdmin = userRole === 'admin' || userRole === 'super-admin' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

     // If viewing an inspected tutor's profile or if the user is an admin, allow full access
     if (!isViewingSpecificTutor && !isAdmin) {
       if (!isLoggedIn) {
           return (
              <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
                <h2 className="text-2xl font-black text-slate-800">Authentication Required</h2>
                <p className="text-slate-500 text-sm">Please sign in to access your tutor profile and applications.</p>
                <button 
                  onClick={() => {
                    setActiveTab('login');
                  }}
                  className="px-6 py-3 bg-[#84CC16] text-white font-bold rounded-xl shadow-sm hover:bg-[#65A30D]"
                >
                   Sign In / Register
                </button>
              </div>
           );
       }
       if (userRole !== 'tutor') {
           return (
              <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
                <h2 className="text-2xl font-black text-slate-800">Access Denied</h2>
                <p className="text-slate-500 text-sm">This page is available only to Tutor accounts.</p>
                <button 
                  onClick={() => {
                    const target = userRole === 'parent' ? 'guardian-dashboard' : 'home';
                    setActiveTab(target as import('./types').PageTab);
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                   Go to Dashboard
                </button>
              </div>
           );
       }
     }
  }

  if (isGuardianTab) {
     if (!isLoggedIn) {
         return (
            <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
              <h2 className="text-2xl font-black text-slate-800">Authentication Required</h2>
              <p className="text-slate-500 text-sm">Please sign in to access your parent dashboard.</p>
              <button 
                onClick={() => {
                  setActiveTab('login');
                }}
                className="px-6 py-3 bg-[#84CC16] text-white font-bold rounded-xl shadow-sm hover:bg-[#65A30D]"
              >
                 Sign In / Register
              </button>
            </div>
         );
     }
     if (userRole !== 'parent') {
         return (
            <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
              <h2 className="text-2xl font-black text-slate-800">Access Denied</h2>
              <p className="text-slate-500 text-sm">This page is available only to Guardian accounts.</p>
              <button 
                onClick={() => {
                  const target = userRole === 'tutor' ? 'profile' : 'home';
                  setActiveTab(target as import('./types').PageTab);
                }}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
              >
                 Go to Dashboard
              </button>
            </div>
         );
     }
}

  return (
    <main className="max-w-7xl mx-auto px-4 py-3 sm:px-6 md:px-8 sm:py-6 pb-24 sm:pb-8 overflow-x-hidden">
      <GlobalBackButton />
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'jobs' && <JobsView />}
      {activeTab === 'job-details' && <JobDetailsView />}
      {activeTab === 'tutors' && <TutorsView />}
      {activeTab === 'profile' && <TutorProfileView />}
      {activeTab === 'guardian-dashboard' && <GuardianDashboardView />}
      {activeTab === 'login' && <AuthView />}
      {activeTab === 'request-tutor' && <RequestTutorView />}
      {activeTab === 'payment' && <GeneralPageView title="Make Payment" description="Make secure payments via bKash, Nagad, or Bank Transfer." icon={<CreditCard className="w-8 h-8" />} />}
      {activeTab === 'sms' && <GeneralPageView title="SMS Recharge" description="Recharge your SMS balance to communicate with parents/tutors." icon={<Phone className="w-8 h-8" />} />}
      {activeTab === 'premium' && <PremiumView />}
      {activeTab === 'verify' && <VerificationView />}
      {activeTab === 'support' && <GeneralPageView title="Help & Support" description="Browse FAQs or contact our 24/7 support team." icon={<HelpCircle className="w-8 h-8" />} />}
      {activeTab === 'admin-login' && <AdminLoginView />}
      {activeTab === 'admin-dashboard' && <AdminDashboardView />}
      {activeTab === 'admin-tutors' && <AdminTutorsView />}
      {activeTab === 'admin-guardians' && <AdminGuardiansView />}
      {activeTab === 'admin-tuitions' && <AdminTuitionsView />}
      {activeTab === 'admin-tuition-details' && <AdminTuitionDetailsView />}
      {activeTab === 'admin-demos' && <AdminDemosView />}
      {activeTab === 'admin-payments' && <AdminPaymentsView />}
      {activeTab === 'admin-timeline' && <AdminTimelineView />}
      {activeTab === 'admin-users' && <AdminUsersView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased selection:bg-lime-200 selection:text-slate-900 overflow-x-hidden max-w-full">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <SidebarDrawer />
        <Modals />
        <BottomNav />
      </div>
    </AppProvider>
  );
}
