import React from 'react';
import { useApp } from '../context/AppContext';
import { SERVICE_CATEGORIES } from '../data/mockData';
import {
  Search,
  Users,
  FileCheck2,
  Tv2,
  HeartHandshake,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  MapPin,
  CheckCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Star,
  Globe,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    setActiveTab,
    setJobSearchId,
    setSelectedMediumFilter,
    navigateToJobDetails,
    navigateToTutorProfile,
  } = useApp();

  const [searchInput, setSearchInput] = React.useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setJobSearchId(searchInput.trim());
      setActiveTab('jobs');
    } else {
      setActiveTab('jobs');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 lg:p-14 shadow-xl">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#84CC16]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 gap-8 items-center max-w-3xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[#84CC16] text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>Bangladesh's Premier Tutor Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Country's <span className="text-[#84CC16]">#1 Tutor Matching</span> & Learning Platform
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Connect with 250,000+ verified expert tutors for Bangla Medium, English Medium, O/A Levels, and University Admission test preparations across Bangladesh.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleHeroSearch} className="pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 p-2 bg-white rounded-2xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 px-3 py-2 w-full">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by Job ID, Subject, or Area (e.g. 80703, Physics, Mirpur)"
                    className="w-full text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Find Tutor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#84CC16]" /> 100% NID Verified Tutors
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#84CC16]" /> Zero Commission Fee for Parents
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#84CC16]" /> Quick Match within 24 Hours
              </span>
            </div>
          </div>
        </div>
      </section>

      
      {/* Quick Access Links */}
      <section className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setActiveTab('request-tutor')} 
          className="relative overflow-hidden flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl border-none shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all text-left group cursor-pointer"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl -ml-8 -mb-8" />
          
          <div className="relative z-10">
            <span className="text-[11px] font-extrabold text-blue-200 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400"></span>
              </span>
              For Parents
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">Hire a Tutor Now</h3>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 font-medium max-w-[200px] sm:max-w-xs leading-relaxed">
              Post your requirements and get matched with qualified tutors within 24 hours.
            </p>
          </div>
          <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-inner backdrop-blur-md">
            <ArrowRight className="w-6 h-6 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </section>

      {/* 2. Platform Metrics Banner (4-card statistics grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-lime-400 transition-all w-full min-w-0">
          <div className="w-12 h-12 rounded-xl bg-lime-100 text-[#65A30D] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">250,000+</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Verified Tutors</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-lime-400 transition-all w-full min-w-0">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">1,840,000+</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Applications Submitted</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-lime-400 transition-all w-full min-w-0">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Tv2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">15,200+</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Active Live Tuitions</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-lime-400 transition-all w-full min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">95,000+</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Parents & Stakeholders</p>
          </div>
        </div>
      </section>

      {/* 3. Call to Action Banner: "Want to Become a TUTOR" */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#84CC16]/20 text-[#84CC16] text-xs font-bold">
            <GraduationCap className="w-4 h-4" /> Earn Monthly Income
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Want to Become a <span className="text-[#84CC16]">TUTOR</span>?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Create your free tutor profile today. Apply to top-paying tuition jobs near your preferred location and start teaching students in Bangladesh.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('login')}
            className="px-6 py-3 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-bold text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
          >
            Sign Up As Tutor
          </button>
          <button
            onClick={() => setActiveTab('tutors')}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-600 transition-colors cursor-pointer"
          >
            Explore Tutors
          </button>
        </div>
      </section>

      {/* 4. Service Categories Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Tutoring Categories & Mediums
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose your preferred educational curriculum to view available tutors & jobs
            </p>
          </div>
          <button
            onClick={() => setActiveTab('jobs')}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#65A30D] hover:underline"
          >
            View All Jobs <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedMediumFilter(cat.name);
                setActiveTab('jobs');
              }}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-[#84CC16] hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl border ${cat.color} shrink-0`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#65A30D] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {cat.tutorCount}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
