import React from 'react';
import {
  Triangle,
  MessageCircle,
  Menu,
  Calendar,
  Hourglass,
  Box,
  Wallet,
  User,
  Users2,
  MapPin,
  ShieldCheck,
  Navigation,
  Bookmark,
  Share2,
  CheckCircle2,
  Send,
  Eye
} from 'lucide-react';
import { Clock } from 'lucide-react';

interface TuitionDetailsProps {
  job: any;
  isBookmarked?: boolean;
  isApplied?: boolean;
  onToggleBookmark?: (id: string) => void;
  onShare?: (job: any) => void;
  onApply?: (job: any) => void;
  hideActions?: boolean;
}

export const TuitionDetails: React.FC<TuitionDetailsProps> = ({
  job,
  isBookmarked = false,
  isApplied = false,
  onToggleBookmark,
  onShare,
  onApply,
  hideActions = false
}) => {
  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* 1. Student Informations Card */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-2xl font-extrabold text-[#84CC16]">
            {job.title || 'Student Informations'}
          </h2>
          <span className="px-3 py-1 rounded-full bg-lime-50 border border-lime-200 text-[#65A30D] text-xs font-bold">
            Job ID: {job.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {/* Category */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <Triangle className="w-5 h-5 fill-[#84CC16] stroke-[#84CC16]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Category</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.category}
              </span>
            </div>
          </div>

          {/* Course */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <MessageCircle className="w-5 h-5 fill-[#84CC16]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Course</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.course}
              </span>
            </div>
          </div>

          {/* Subject */}
          <div className="flex items-start gap-3.5 sm:col-span-1">
            <div className="mt-1 text-[#84CC16]">
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Subject</span>
              <span className="block text-sm font-semibold text-slate-600 leading-snug">
                {Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects}
              </span>
            </div>
          </div>

          {/* Days */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Days</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.daysPerWeek}
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Time</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.time}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <Hourglass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Duration</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.duration}
              </span>
            </div>
          </div>

          {/* Method */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <Box className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Method</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.method}
              </span>
            </div>
          </div>

          {/* Salary */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <Wallet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Salary</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.salary} TK
              </span>
            </div>
          </div>

          {/* Students */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Students</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.studentsCount}
              </span>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-3.5">
            <div className="mt-1 text-[#84CC16]">
              <Users2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900">Gender</span>
              <span className="block text-sm font-semibold text-slate-600">
                {job.studentGender}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tutor Requirements Card */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-xs space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#84CC16]" />
          <span>Tutor Requirements</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Preferred Tutor Gender:</span>
            <strong className="text-slate-900 text-sm">{job.tutorGender}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Expected Start Date:</span>
            <strong className="text-slate-900 text-sm">{job.expectedStartDate}</strong>
          </div>
        </div>

        <div className="p-4 bg-lime-50/50 rounded-xl border border-lime-200 text-xs text-slate-800 space-y-1">
          <span className="font-extrabold text-[#65A30D] block">Parent's Special Instructions:</span>
          <p className="leading-relaxed">{job.notes}</p>
        </div>
      </div>

      {/* 3. Location Details Card */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-xs space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <span>Location Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block">Country:</span>
            <strong className="text-slate-800 font-bold">{job.country}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block">City / Division:</span>
            <strong className="text-slate-800 font-bold">{job.city}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block">Area:</span>
            <strong className="text-slate-800 font-bold">{job.area}</strong>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="text-slate-500 block">Full Address:</span>
          <span className="text-slate-900 font-bold">{job.fullAddress}</span>
        </div>
      </div>

      {/* 4. Action Buttons Box */}
      {!hideActions && (
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(job.location || job.fullAddress || job.area)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#84CC16]" />
              <span>Get Direction</span>
            </a>

            <button
              onClick={() => onToggleBookmark?.(job.id)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={() => onShare?.(job)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Share</span>
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {isApplied ? (
              <div className="px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
                <span>Already Applied</span>
              </div>
            ) : (
              <button
                onClick={() => onApply?.(job)}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-102 cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Apply Now</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Metrics Footer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-around text-xs font-bold text-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Job ID:</span>
          <span className="text-slate-900">{job.id}</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" />
          <span className="text-slate-400">Total Views:</span>
          <span className="text-slate-900">{job.views}</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-[#84CC16]" />
          <span className="text-slate-400">Total Applications:</span>
          <span className="text-slate-900">{job.applications}</span>
        </div>
      </div>
    </div>
  );
};
