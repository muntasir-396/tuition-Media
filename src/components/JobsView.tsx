import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS } from '../data/mockData';
import {
  Play,
  SlidersHorizontal,
  ListFilter,
  Search,
  ChevronDown,
  MapPin,
  Clock,
  Menu,
  Calendar,
  Wallet,
  Users2,
  Bookmark,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';

export const JobsView: React.FC = () => {
  const {
    jobSearchId,
    setJobSearchId,
    selectedCity,
    setSelectedCity,
    selectedMediumFilter,
    setSelectedMediumFilter,
    navigateToJobDetails,
    setIsTutorialModalOpen,
    setIsFilterModalOpen,
    bookmarkedJobIds,
    toggleBookmark,
    applicantCountOverrides,
  } = useApp();

  const [showCityAccordion, setShowCityAccordion] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'latest' | 'salary-high' | 'salary-low'>('latest');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tuitions');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    const handleApplied = (e: any) => {
      const appliedJobId = e?.detail?.jobId;
      if (appliedJobId) {
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === appliedJobId || j.jobCode === appliedJobId
              ? { ...j, applications: (j.applications || 0) + 1 }
              : j
          )
        );
      } else {
        fetchJobs();
      }
    };

    window.addEventListener('tutorlink:job-applied', handleApplied);
    return () => window.removeEventListener('tutorlink:job-applied', handleApplied);
  }, []);

  // Filter jobs dynamically
  const filteredJobs = jobs.filter((job) => {
    // City filter
    if (selectedCity !== 'All' && job.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    // Search by Job ID or keyword
    if (jobSearchId.trim()) {
      const q = jobSearchId.toLowerCase().trim();
      const matchId = job.id.toLowerCase().includes(q);
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchLocation = job.location.toLowerCase().includes(q);
      const matchSubjects = job.subjects.some((s) => s.toLowerCase().includes(q));
      if (!matchId && !matchTitle && !matchLocation && !matchSubjects) return false;
    }
    // Medium filter
    if (selectedMediumFilter !== 'All' && job.category !== selectedMediumFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'salary-high') return b.salary - a.salary;
    if (sortBy === 'salary-low') return a.salary - b.salary;
    return 0; // default latest
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Buttons & Search Inputs matching Screenshot 1 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Tutorial Button & Filter Trigger Button */}
        <div className="flex items-center justify-between gap-3">
          {/* Tutorial Button */}
          <button
            onClick={() => setIsTutorialModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#84CC16] hover:bg-[#65A30D] text-white font-bold text-sm shadow-xs transition-transform hover:scale-102 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white text-[#84CC16] flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 fill-[#84CC16] ml-0.5" />
            </div>
            <span>Tutorial</span>
          </button>

          {/* Filter Trigger Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#84CC16] hover:bg-[#65A30D] text-white font-bold text-sm shadow-xs transition-transform hover:scale-102 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white text-[#84CC16] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Filter</span>
          </button>
        </div>

        {/* Row 2: Jobs Counter Badge + Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* 983 Jobs Counter Pill */}
          <div className="sm:col-span-4 flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-sm shadow-2xs">
            <ListFilter className="w-4 h-4 text-slate-600" />
            <span>{filteredJobs.length} Jobs Available</span>
          </div>

          {/* Enter Job Id Input field */}
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              value={jobSearchId}
              onChange={(e) => setJobSearchId(e.target.value)}
              placeholder="Enter Job Id or keyword..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-hidden focus:border-[#84CC16] transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Row 3: Show City Filter Accordion Toggle */}
        <div className="pt-1 flex flex-col items-center border-t border-slate-100">
          <button
            onClick={() => setShowCityAccordion(!showCityAccordion)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-[#65A30D] py-1 cursor-pointer transition-colors"
          >
            <span>Show City Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                showCityAccordion ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* City Filter Chips Horizontal Scrollable Bar */}
        {(showCityAccordion || true) && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar border-t border-slate-100">
            <button
              onClick={() => setSelectedCity('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCity === 'All'
                  ? 'bg-[#84CC16] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Regions
            </button>
            {CITY_METRICS.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCity.toUpperCase() === city.name
                    ? 'bg-[#84CC16] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {city.name} ({city.tutorCount > 10000 ? `${(city.tutorCount / 1000).toFixed(0)}k` : city.tutorCount})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Stats & Sorting Bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{filteredJobs.length}</strong> tuition requirements
          {selectedCity !== 'All' ? ` in ${selectedCity}` : ''}
        </p>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden"
          >
            <option value="latest">Latest First</option>
            <option value="salary-high">Highest Salary</option>
            <option value="salary-low">Lowest Salary</option>
          </select>
        </div>
      </div>

      {/* Job Cards Grid - Responsive 2 columns on desktop, 1 on mobile */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-medium">
           Loading jobs...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-500 font-medium text-sm">No tuition jobs matched your search criteria.</p>
          <button
            onClick={() => {
              setJobSearchId('');
              setSelectedCity('All');
              setSelectedMediumFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-[#84CC16] text-white font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const isBookmarked = bookmarkedJobIds.includes(job.id);
            const override = (applicantCountOverrides?.[job.id] || 0) + (applicantCountOverrides?.[job.jobCode] || 0);
            const totalApplicants = (job.applications || 0) + override;

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-300/80 p-5 shadow-xs hover:border-[#84CC16] transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header info matching Screenshot 1 */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl line-clamp-1 leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap">
                        <span>Job Id: {job.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {job.postedAt}
                        </span>
                        <span>•</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                          totalApplicants > 0 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          <Users2 className="w-3.5 h-3.5" />
                          <span>{totalApplicants} Applicant{totalApplicants === 1 ? '' : 's'}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Job'}
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Location Pin & Date Line matching Screenshot 1 */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-800 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>

                  {/* 2-Column Specs Grid matching Screenshot 1 */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
                    {/* Subjects */}
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-[#84CC16]">
                        <Menu className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">Subjects</span>
                        <span className="block text-xs font-bold text-slate-800 truncate max-w-[130px]">
                          {job.subjects.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Per Week */}
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-[#84CC16]">
                        <Calendar className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">Per Week</span>
                        <span className="block text-xs font-bold text-slate-800">
                          {job.daysPerWeek}
                        </span>
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-[#84CC16]">
                        <Wallet className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">Salary</span>
                        <span className="block text-xs font-bold text-slate-800">
                          {job.salary} BDT
                        </span>
                      </div>
                    </div>

                    {/* Tutor Gender */}
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-[#84CC16]">
                        <Users2 className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">Tutor Gender</span>
                        <span className="block text-xs font-bold text-slate-800">
                          {job.tutorGender}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom View Details Action Button matching Screenshot 1 dark button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => navigateToJobDetails(job.id)}
                    className="px-6 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
