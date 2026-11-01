import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useBookmarks } from '../../hooks/useBookmarks';
import { formatTimeAgo } from '../../lib/dateUtils';
import {
  Bookmark,
  MapPin,
  Calendar,
  Wallet,
  Users2,
  Menu,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TutorSavedJobsView: React.FC = () => {
  const { setActiveTab, navigateToJobDetails, setJobToApply, setIsApplyModalOpen } = useApp();
  const { toggleBookmark, refreshBookmarks } = useBookmarks();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'salary-high' | 'salary-low'>('recent');
  const [removedJob, setRemovedJob] = useState<any | null>(null);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookmarks?type=tuition');
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load saved jobs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (job: any) => {
    await toggleBookmark('tuition', job.id || job.jobCode);
    setRemovedJob(job);
    setSavedJobs(prev => prev.filter(j => j.id !== job.id && j.jobCode !== job.jobCode));
  };

  const handleUndo = async () => {
    if (!removedJob) return;
    await toggleBookmark('tuition', removedJob.id || removedJob.jobCode);
    setSavedJobs(prev => [removedJob, ...prev]);
    setRemovedJob(null);
  };

  const filteredJobs = savedJobs.filter(job => {
    if (selectedStatus !== 'All') {
      const jobStatus = (job.status || 'OPEN').toUpperCase();
      if (jobStatus !== selectedStatus) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (job.title || '').toLowerCase().includes(q);
      const matchLocation = (job.location || job.area || '').toLowerCase().includes(q);
      const matchSubjects = Array.isArray(job.subjects)
        ? job.subjects.some((s: string) => s.toLowerCase().includes(q))
        : (job.subjects || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLocation && !matchSubjects) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'salary-high') return (b.salary || 0) - (a.salary || 0);
    if (sortBy === 'salary-low') return (a.salary || 0) - (b.salary || 0);
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-[#84CC16] fill-[#84CC16]" />
            <span>Saved Tuition Jobs</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Review and apply to tuitions you saved for later. Stored securely on your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-lime-50 text-[#65A30D] border border-lime-200">
            {savedJobs.length} Saved Job{savedJobs.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Browse More Jobs
          </button>
        </div>
      </div>

      {/* Undo Toast */}
      {removedJob && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
          <span className="text-xs font-semibold">
            Removed <strong>{removedJob.title}</strong> from saved jobs.
          </span>
          <button
            onClick={handleUndo}
            className="px-3 py-1 rounded-lg bg-[#84CC16] text-slate-950 font-bold text-xs hover:bg-[#74b816] transition-colors cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved jobs by subject or area..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#84CC16]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="CONFIRMED">Filled / Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="recent">Recently Saved</option>
            <option value="salary-high">Highest Salary</option>
            <option value="salary-low">Lowest Salary</option>
          </select>
        </div>
      </div>

      {/* Saved Jobs List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-bold text-xs">
          Loading your saved jobs...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No saved jobs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When browsing the Job Board, click the bookmark icon on any tuition job to save it here.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Find Tuition Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const isClosed = job.status === 'CONFIRMED' || job.status === 'ASSIGNED' || job.status === 'CANCELLED';

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#84CC16] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span>Job Id: {job.jobCode || job.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatTimeAgo(job.postedAt || job.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      job.status === 'OPEN' || !job.status
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : job.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {job.status || 'OPEN'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-800 shrink-0" />
                    <span className="truncate">
                      {job.area ? `${job.area}, ${job.city || 'Dhaka'}` : job.location || 'Dhaka'}
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400">Subjects</span>
                      <strong className="block text-slate-800 font-bold truncate">
                        {Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects || 'General'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400">Salary</span>
                      <strong className="block text-slate-800 font-bold truncate">
                        {job.salary} BDT
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400">Days/Week</span>
                      <strong className="block text-slate-800 font-bold truncate">
                        {job.daysPerWeek || '3 days'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleRemove(job)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateToJobDetails(job.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      disabled={isClosed}
                      onClick={() => {
                        setJobToApply(job);
                        setIsApplyModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#84CC16] hover:bg-[#74b816] disabled:opacity-40 disabled:hover:bg-[#84CC16] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {isClosed ? 'Closed' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
