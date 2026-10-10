import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CITY_METRICS } from '../data/mockData';
import {
  Users,
  Search,
  CheckCircle2,
  Star,
  GraduationCap,
  MapPin,
  Sparkles,
  Award,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const TutorsView: React.FC = () => {
  const {
    tutorSearchQuery,
    setTutorSearchQuery,
    selectedCity,
    setSelectedCity,
    navigateToTutorProfile,
  } = useApp();

  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [tutors, setTutors] = useState<any[]>([]);
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [rateFilter, setRateFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const res = await fetch('/api/tutors');
      const data = await res.json();
      setTutors(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter tutors dynamically
  const filteredTutors = tutors.filter((tutor) => {
    if (selectedCity !== 'All' && tutor.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (genderFilter !== 'All' && tutor.gender !== genderFilter) {
      return false;
    }
    if (experienceFilter !== 'All') {
      const exp = tutor.tutoringExperience || 0;
      if (experienceFilter === '1+' && exp < 1) return false;
      if (experienceFilter === '3+' && exp < 3) return false;
      if (experienceFilter === '5+' && exp < 5) return false;
    }
    if (rateFilter !== 'All') {
      const min = tutor.expectedSalaryMin || 0;
      if (rateFilter === '< 5000' && min >= 5000) return false;
      if (rateFilter === '5000 - 10000' && (min < 5000 || min > 10000)) return false;
      if (rateFilter === '> 10000' && min <= 10000) return false;
    }
    if (subjectFilter.trim()) {
      const sq = subjectFilter.toLowerCase().trim();
      const matchSubject = tutor.subjects && tutor.subjects.some((s: string) => s.toLowerCase().includes(sq));
      if (!matchSubject) return false;
    }
    if (tutorSearchQuery.trim()) {
      const q = tutorSearchQuery.toLowerCase().trim();
      const matchName = tutor.name.toLowerCase().includes(q);
      const matchId = tutor.id.toLowerCase().includes(q);
      const matchUni = (tutor.university || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchUni) return false;
    }
    return true;
  });

  const exclusiveTutors = filteredTutors.filter((t) => t.exclusive);

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-20">
      {/* SIDEBAR FILTERS */}
      <div className="w-full lg:w-64 shrink-0 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#84CC16]" /> Subjects
            </h4>
            <input 
              type="text" 
              placeholder="e.g., Math, Physics..."
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:bg-white transition-all"
            />
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#84CC16]" /> Experience
            </h4>
            <div className="space-y-2">
              {['All', '1+', '3+', '5+'].map(exp => (
                <label key={exp} onClick={() => setExperienceFilter(exp)} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${experienceFilter === exp ? 'border-[#84CC16]' : 'border-slate-300 group-hover:border-[#84CC16]'}`}>
                    {experienceFilter === exp && <div className="w-2 h-2 rounded-full bg-[#84CC16]" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{exp === 'All' ? 'Any Experience' : `${exp} Years`}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#84CC16]" /> Hourly Rate
            </h4>
            <div className="space-y-2">
              {['All', '< 5000', '5000 - 10000', '> 10000'].map(rate => (
                <label key={rate} onClick={() => setRateFilter(rate)} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${rateFilter === rate ? 'border-[#84CC16]' : 'border-slate-300 group-hover:border-[#84CC16]'}`}>
                    {rateFilter === rate && <div className="w-2 h-2 rounded-full bg-[#84CC16]" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{rate === 'All' ? 'Any Rate' : `${rate} BDT`}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 space-y-8">
      {/* 1. City Region Filter Bar with live counts */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#84CC16]" /> Select City Region
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Active Tutors by Region
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCity('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCity === 'All'
                ? 'bg-[#84CC16] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Bangladesh (250k+)
          </button>
          {CITY_METRICS.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCity(c.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCity.toUpperCase() === c.name
                  ? 'bg-[#84CC16] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name} ({c.tutorCount.toLocaleString()})
            </button>
          ))}
        </div>
      </div>

      {/* 2. Demographic Metrics 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 min-w-0 w-full">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block truncate">Total Registered Tutors</span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 truncate">250,000+</h4>
            <span className="text-[10px] text-emerald-600 font-bold">100% NID Verified</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-lime-100 text-[#65A30D] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setGenderFilter('Male')}
          className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between gap-3 min-w-0 w-full cursor-pointer transition-all ${
            genderFilter === 'Male'
              ? 'bg-blue-50/60 border-blue-400'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block truncate">Male Tutors</span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 truncate">145,000+</h4>
            <span className="text-[10px] text-blue-600 font-bold">58% of Total</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setGenderFilter('Female')}
          className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between gap-3 min-w-0 w-full cursor-pointer transition-all ${
            genderFilter === 'Female'
              ? 'bg-purple-50/60 border-purple-400'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-500 block truncate">Female Tutors</span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 truncate">105,000+</h4>
            <span className="text-[10px] text-purple-600 font-bold">42% of Total</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Tutor Search Bar & Gender Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={tutorSearchQuery}
            onChange={(e) => setTutorSearchQuery(e.target.value)}
            placeholder="Search by Tutor ID (e.g. TT-131861), BUET, DU, Physics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-hidden focus:border-[#84CC16]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Gender:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setGenderFilter('All')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                genderFilter === 'All' ? 'bg-white text-slate-900 shadow-2xs' : ''
              }`}
            >
              All
            </button>
            <button
              onClick={() => setGenderFilter('Male')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                genderFilter === 'Male' ? 'bg-white text-slate-900 shadow-2xs' : ''
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGenderFilter('Female')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                genderFilter === 'Female' ? 'bg-white text-slate-900 shadow-2xs' : ''
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </div>

      {/* 4. Exclusive / Featured Tutors Carousel Section */}
      {exclusiveTutors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>Exclusive & Featured Tutors</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Top University Mentors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exclusiveTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-amber-200 p-5 shadow-sm space-y-4 hover:border-amber-400 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Photo with status ring */}
                  <div className="relative shrink-0">
                    <img
                      src={tutor.avatar}
                      alt={tutor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#84CC16] p-0.5 shadow-xs"
                    />
                    <span
                      className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                      title="Online / Active"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-extrabold text-slate-900 text-base truncate flex items-center gap-1.5">
                        {tutor.name}
                        {tutor.verified && (
                          <CheckCircle2 className="w-4 h-4 text-[#84CC16] fill-lime-100 shrink-0" />
                        )}
                      </h4>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        PRO
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#84CC16]" />
                      <span className="truncate">{tutor.university}</span>
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      ID: <strong className="text-slate-800">{tutor.id}</strong> • {tutor.experienceYears} Years Exp
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  {tutor.subjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{tutor.rating}</span>
                    <span className="text-slate-400 font-normal">({tutor.reviewsCount})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Tutor ID: ${tutor.id}`)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Tutor
                    </button>
                    <button
                      onClick={() => navigateToTutorProfile(tutor.id)}
                      className="px-4 py-2 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      View Tutor CV
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. All Tutors Directory Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900">
          All Tutors ({filteredTutors.length})
        </h3>

        {filteredTutors.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 space-y-3">
            <p className="text-slate-500 font-medium text-sm">No tutors match your filter.</p>
            <button
              onClick={() => {
                setTutorSearchQuery('');
                setSelectedCity('All');
                setGenderFilter('All');
                setExperienceFilter('All');
                setRateFilter('All');
                setSubjectFilter('');
              }}
              className="px-4 py-2 rounded-xl bg-[#84CC16] text-white font-bold text-xs"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-lime-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tutor.avatar}
                      alt={tutor.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                        {tutor.name}
                        {tutor.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#84CC16] fill-lime-100 shrink-0" />
                        )}
                      </h4>
                      <p className="text-xs text-[#65A30D] font-bold truncate">{tutor.university}</p>
                      <p className="text-[11px] text-slate-500">
                        {tutor.city} • ID: {tutor.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">
                      Subjects: {tutor.subjects.join(', ')}
                    </p>
                    <p className="text-slate-500">Expected: {tutor.expectedSalary}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {tutor.rating}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Tutor ID: ${tutor.id}`)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Tutor
                    </button>
                    <button
                      onClick={() => navigateToTutorProfile(tutor.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
