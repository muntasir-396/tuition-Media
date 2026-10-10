import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalBackButton: React.FC = () => {
  const { activeTab } = useApp();

  // Exclude root tabs and pages that already have a dedicated back button
  const excludedTabs = [
    'home',
    'jobs',
    'tutors',
    'admin-dashboard',
    'admin-login',
    'job-details',
    'admin-tuition-details'
  ];

  if (excludedTabs.includes(activeTab)) {
    return null;
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
    </div>
  );
};
