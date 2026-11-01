import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatTimeAgo } from '../lib/dateUtils';
import { BD_AREAS } from '../data/mockData';
import {
  Play,
  SlidersHorizontal,
  ListFilter,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  MapPin,
  Clock,
  Menu,
  Calendar,
  Wallet,
  Users2,
  Bookmark,
  ArrowUpDown,
} from 'lucide-react';

const CITIES_LIST = [
  'All',
  'Dhaka',
  'Chittagong',
  'Khulna',
  'Gazipur',
  'Naraynganj',
  'Sylhet',
  'Cumilla',
  'Barishal',
  'Rajshahi',
  'Rangpur',
  'Mymensingh',
];

const DHAKA_AREAS = [
  'All Areas',
  'Mohammadpur',
  'Mirpur',
  'Dhanmondi',
  'Uttara',
  'Gulshan',
  'Banani',
  'Badda',
  'Bashundhara R/A',
  'Khilgaon',
  'Malibagh',
  'Farmgate',
  'Old Dhaka / Lalbagh',
  'Shantinagar',
  'Motijheel',
  'Rampura',
  'Baridhara',
  'Moghbazar',
];

const CHITTAGONG_AREAS = [
  'All Areas',
  'Agrabad',
  'GEC Circle',
  'Chawkbazar',
  'Halishahar',
  'Nasirabad',
  'Khulshi',
  'Panchlaish',
  'Muradpur',
  'Kotwali',
  'Bakalia',
  'Bayazid',
];

const SYLHET_AREAS = [
  'All Areas',
  'Zindabazar',
  'Amberkhana',
  'Shibganj',
  'Upashahar',
  'Subidbazar',
  'Kumarpara',
  'Tilagarh',
  'Pathantula',
  'Bandar Bazar',
  'South Surma',
  'Shahjalal Uposhohor',
];

const RAJSHAHI_AREAS = [
  'All Areas',
  'Boalia',
  'Motihar',
  'Rajpara',
  'Shah Makhdum',
  'Kazla',
  'Shaheb Bazar',
  'Talaimari',
  'Upashahar',
  'Laxmipur',
  'Binodpur',
  'Shirothoil',
];

const KHULNA_AREAS = [
  'All Areas',
  'Sonadanga',
  'Khalishpur',
  'Daulatpur',
  'Khan Jahan Ali',
  'Boyra',
  'Shibbari',
  'Gollamari',
  'Rupsha',
  'Mujgunni',
  'KDA Avenue',
  'Choto Boyra',
];

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

  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [showCityAccordion, setShowCityAccordion] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'latest' | 'salary-high' | 'salary-low'>('latest');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tuitions');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
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

  // Compute areas based on active city
  const currentAreasList = React.useMemo(() => {
    const city = (selectedCity || '').toLowerCase().trim();
    if (city === 'chittagong') return CHITTAGONG_AREAS;
    if (city === 'sylhet') return SYLHET_AREAS;
    if (city === 'rajshahi') return RAJSHAHI_AREAS;
    if (city === 'khulna') return KHULNA_AREAS;
    return DHAKA_AREAS;
  }, [selectedCity]);

  // Filter jobs dynamically
  const filteredJobs = jobs.filter((job) => {
    // City filter
    if (selectedCity && selectedCity !== 'All') {
      const target = selectedCity.toLowerCase().trim();
      const jobCity = (job.city || '').toLowerCase();
      const jobDistrict = (job.district || '').toLowerCase();
      const jobLocation = (job.location || job.fullAddress || '').toLowerCase();
      const jobArea = (job.area || '').toLowerCase();
      const matches =
        jobCity === target ||
        jobDistrict === target ||
        jobLocation.includes(target) ||
        jobArea.includes(target);
      if (!matches) return false;
    }

    // Area / Thana filter
    if (selectedArea && selectedArea !== 'All' && selectedArea !== 'All Areas') {
      const targetArea = selectedArea.toLowerCase().trim();
      const parts = targetArea.split('/').map((p) => p.trim());
      const jobArea = (job.area || '').toLowerCase();
      const jobLocation = (job.location || job.fullAddress || '').toLowerCase();
      const matchesArea = parts.some((p) => jobArea.includes(p) || jobLocation.includes(p));
      if (!matchesArea) return false;
    }

    // Search by Job ID or keyword
    if (jobSearchId.trim()) {
      const q = jobSearchId.toLowerCase().trim();
      const matchId =
        (job.id || '').toLowerCase().includes(q) ||
        (job.jobCode || '').toLowerCase().includes(q);
      const matchTitle = (job.title || '').toLowerCase().includes(q);
      const matchLocation = (job.location || job.fullAddress || '').toLowerCase().includes(q);
      const matchSubjects = Array.isArray(job.subjects)
        ? job.subjects.some((s: string) => s.toLowerCase().includes(q))
        : (job.subjects || '').toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchLocation && !matchSubjects) return false;
    }

    // Medium filter
    if (
      selectedMediumFilter !== 'All' &&
      job.category !== selectedMediumFilter &&
      job.curriculum !== selectedMediumFilter
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'salary-high') return (b.salary || 0) - (a.salary || 0);
    if (sortBy === 'salary-low') return (a.salary || 0) - (b.salary || 0);
    return 0; // default latest
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Buttons & Search Inputs matching Tuition Terminal design */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Watch Tutorial Button & Filter Button */}
        <div className="flex items-center justify-between gap-3">
          {/* Watch Tutorial Button */}
          <button
            onClick={() => setIsTutorialModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-2xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-sm shadow-xs transition-transform hover:scale-102 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-white text-[#84CC16] flex items-center justify-center shrink-0">
              <Play className="w-3 h-3 fill-[#84CC16] ml-0.5" />
            </div>
            <span>Watch Tutorial</span>
          </button>

          {/* Filter Trigger Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-2xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-sm shadow-xs transition-transform hover:scale-102 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-white text-[#84CC16] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span>Filter</span>
          </button>
        </div>

        {/* Row 2: Jobs Counter Badge + Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Jobs Counter Pill */}
          <div className="sm:col-span-4 flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-sm shadow-2xs">
            <ListFilter className="w-4 h-4 text-slate-700 shrink-0" />
            <span>{filteredJobs.length} Jobs found</span>
          </div>

          {/* Enter Job Id Input field */}
          <div className="sm:col-span-8 relative">
            <input
              type="text"
              value={jobSearchId}
              onChange={(e) => setJobSearchId(e.target.value)}
              placeholder="Enter Job Id"
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-hidden focus:border-[#84CC16] transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Row 3: Hide City Filter / Show City Filter Toggle */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={() => setShowCityAccordion(!showCityAccordion)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-950 cursor-pointer select-none py-0.5"
          >
            <span>{showCityAccordion ? 'Hide City Filter' : 'Show City Filter'}</span>
            {showCityAccordion ? (
              <ChevronUp className="w-4 h-4 text-slate-800 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-800 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* City Filter & Area Filter Checkbox Cards Grid */}
        {showCityAccordion && (
          <div className="space-y-4 pt-1">
            {/* 6-Column City Checkbox Cards Grid matching Image 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {CITIES_LIST.map((cityName) => {
                const isSelected =
                  cityName === 'All'
                    ? selectedCity === 'All'
                    : selectedCity.toLowerCase() === cityName.toLowerCase();

                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => {
                      setSelectedCity(cityName);
                      setSelectedArea('All');
                    }}
                    className={`rounded-lg py-2.5 px-3 flex items-center gap-2.5 text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-slate-800 bg-slate-50/70 shadow-2xs ring-1 ring-slate-800/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {cityName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Thana / Area Checkbox Cards Grid (Sub-district filtering) */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Select Area / Thana {selectedCity !== 'All' ? `(${selectedCity})` : ''}</span>
                </span>
                {selectedArea !== 'All' && selectedArea !== 'All Areas' && (
                  <button
                    type="button"
                    onClick={() => setSelectedArea('All')}
                    className="text-xs font-semibold text-[#84CC16] hover:underline cursor-pointer"
                  >
                    Clear Area Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {currentAreasList.map((areaName) => {
                  const isSelected =
                    areaName === 'All Areas'
                      ? selectedArea === 'All' || selectedArea === 'All Areas'
                      : selectedArea.toLowerCase() === areaName.toLowerCase();

                  return (
                    <button
                      key={areaName}
                      type="button"
                      onClick={() => {
                        setSelectedArea(areaName === 'All Areas' ? 'All' : areaName);
                      }}
                      className={`rounded-lg py-2.5 px-3 flex items-center gap-2.5 text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-slate-800 bg-slate-50/70 shadow-2xs ring-1 ring-slate-800/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 truncate" title={areaName}>
                        {areaName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Stats & Sorting Bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{filteredJobs.length}</strong> tuition requirements
          {selectedCity !== 'All' ? ` in ${selectedCity}` : ''}
          {selectedArea !== 'All' && selectedArea !== 'All Areas' ? ` (${selectedArea})` : ''}
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

      {/* Job Cards Grid - Responsive 2 columns on desktop */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-medium">
          Loading jobs...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-500 font-medium text-sm">No tuition jobs matched your search criteria.</p>
          <button
            onClick={() => {
              setJobSearchId('');
              setSelectedCity('All');
              setSelectedArea('All');
              setSelectedMediumFilter('All');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74b816] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const isBookmarked = bookmarkedJobIds.includes(job.id);
            const override =
              (applicantCountOverrides?.[job.id] || 0) +
              (applicantCountOverrides?.[job.jobCode] || 0);
            const totalApplicants = (job.applications || 0) + override;
            const dateStr = new Date(job.postedAt || job.createdAt || Date.now()).toLocaleDateString(
              'en-GB',
              { day: '2-digit', month: 'short', year: 'numeric' }
            );

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-300/80 p-5 shadow-xs hover:border-[#84CC16] transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header info matching Image 2 */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-lg sm:text-xl line-clamp-1 leading-tight">
                        {job.title}
                      </h3>
                      {totalApplicants > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border bg-indigo-50 text-indigo-700 border-indigo-200">
                          <Users2 className="w-3 h-3" />
                          <span>{totalApplicants} Applicant{totalApplicants === 1 ? '' : 's'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-right shrink-0">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">
                          Job Id: {job.jobCode || job.id}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs text-slate-500 font-medium mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          <span>{formatTimeAgo(job.postedAt || job.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(job.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors ml-1"
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Job'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Location Pin & Date Line matching Image 2 */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-800 shrink-0" />
                    <span className="truncate">
                      {job.area
                        ? `${job.area} , ${job.city || job.district || 'Dhaka'}`
                        : job.location || 'Dhaka'}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 shrink-0">{dateStr}</span>
                  </div>

                  {/* 3-Column Specs Grid matching Image 2 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 pt-2 border-t border-slate-100">
                    {/* Subjects */}
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-[#84CC16] shrink-0">
                        <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-500">Subjects</span>
                        <span
                          className="block text-xs font-bold text-slate-800 truncate"
                          title={Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects}
                        >
                          {Array.isArray(job.subjects)
                            ? job.subjects.join(', ')
                            : job.subjects || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Per Week */}
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-[#84CC16] shrink-0">
                        <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-500">Per Week</span>
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          {job.daysPerWeek || '3 days'}
                        </span>
                      </div>
                    </div>

                    {/* Tutoring Mode */}
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-[#84CC16] shrink-0">
                        <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-500">Tutoring Mode</span>
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          {job.method || 'Home Tutoring'}
                        </span>
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-[#84CC16] shrink-0">
                        <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-500">Salary</span>
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          {job.salary}
                        </span>
                      </div>
                    </div>

                    {/* Tutor Gender */}
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-[#84CC16] shrink-0">
                        <Users2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-500">Tutor Gender</span>
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          {job.tutorGender || job.preferredTutorGender || 'Male'}
                        </span>
                      </div>
                    </div>

                    {/* Tutoring Time */}
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-[#84CC16] shrink-0">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-500">Tutoring Time</span>
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          {job.preferredTime || '4:00 PM'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom View Details Action Button matching Image 2 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => navigateToJobDetails(job.id)}
                    className="px-5 py-2 rounded-lg bg-[#1E293B] hover:bg-slate-900 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
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
