import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Share2,
  Bookmark
} from 'lucide-react';
import { TuitionDetails } from './tuition/TuitionDetails';

export const JobDetailsView: React.FC = () => {
  const {
    selectedJob,
    setSelectedJob,
    setActiveTab,
    bookmarkedJobIds,
    toggleBookmark,
    appliedJobIds,
    setJobToApply,
    setIsApplyModalOpen,
    setIsShareModalOpen,
  } = useApp();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedJob && selectedJob.id) {
      const fetchFreshData = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/tuitions/${selectedJob.id}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedJob(data);
          }
        } catch (e) {
          console.error('Failed to refresh job', e);
        } finally {
          setLoading(false);
        }
      };
      fetchFreshData();
    }
  }, [selectedJob?.id, setSelectedJob]);

  if (!selectedJob) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-slate-500 font-medium">No job selected.</p>
        <button
          onClick={() => setActiveTab('jobs')}
          className="px-4 py-2 bg-[#84CC16] text-white font-bold text-xs rounded-xl"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarkedJobIds.includes(selectedJob.id);
  const isApplied = appliedJobIds.includes(selectedJob.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('jobs')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            title="Share Job"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleBookmark(selectedJob.id)}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      <TuitionDetails 
        job={selectedJob} 
        isBookmarked={isBookmarked}
        isApplied={isApplied}
        onToggleBookmark={toggleBookmark}
        onShare={() => setIsShareModalOpen(true)}
        onApply={(job) => {
          setJobToApply(job);
          setIsApplyModalOpen(true);
        }}
      />
    </div>
  );
};

