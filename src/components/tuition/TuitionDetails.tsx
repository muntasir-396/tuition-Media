import React, { useState, useEffect } from 'react';
import {
  Triangle,
  MessageCircle,
  Menu,
  Calendar,
  Hourglass,
  Box,
  Wallet,
  User,
  Users,
  Users2,
  MapPin,
  ShieldCheck,
  Navigation,
  Bookmark,
  Share2,
  CheckCircle2,
  Send,
  Eye,
  Sparkles,
  GraduationCap,
  X,
  MessageSquare,
  Clock
} from 'lucide-react';
import { formatTimeAgo } from '../../lib/dateUtils';
import { useApp } from '../../context/AppContext';

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

  const { userRole, isLoggedIn } = useApp();
  const isAuthorizedGuardian = isLoggedIn && (userRole === 'guardian' || userRole === 'admin' || userRole === 'super-admin');

  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [selectedTutorForDemo, setSelectedTutorForDemo] = useState<any | null>(null);
  const [preferredDemoDate, setPreferredDemoDate] = useState('');
  const [demoNotes, setDemoNotes] = useState('');
  const [isSubmittingSelection, setIsSubmittingSelection] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState('');

  const fetchApplicants = async () => {
    const id = job.id || job.jobCode;
    if (!id || !isAuthorizedGuardian) return;
    setLoadingApplicants(true);
    try {
      const res = await fetch(`/api/guardian/tuitions/${id}/applicants`);
      if (res.ok) {
        const data = await res.json();
        setApplicants(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedGuardian) {
      fetchApplicants();
    } else {
      setApplicants([]);
    }
  }, [job?.id, job?.jobCode, isAuthorizedGuardian]);

  const handleConfirmSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorForDemo) return;
    setIsSubmittingSelection(true);
    try {
      const res = await fetch(`/api/guardian/tuitions/${job.id || job.jobCode}/select-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: selectedTutorForDemo.tutorCode || selectedTutorForDemo.tutorId || selectedTutorForDemo.id,
          preferredDate: preferredDemoDate,
          notes: demoNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectionMessage(data.message || 'Tutor selected! Sent to Admin for demo assignment.');
        setSelectedTutorForDemo(null);
        setPreferredDemoDate('');
        setDemoNotes('');
        await fetchApplicants();
      } else {
        alert(data.error || 'Failed to select tutor');
      }
    } catch (e) {
      alert('Error requesting demo');
    } finally {
      setIsSubmittingSelection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Informations Card */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-[#84CC16]">
              {job.title || 'Student Informations'}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Published {formatTimeAgo(job.postedAt || job.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full bg-lime-50 border border-lime-200 text-[#65A30D] text-xs font-bold">
              Job ID: {job.id}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5" />
              <span>{(job.applications || (job.appliedTutors ? job.appliedTutors.length : 0) || 0)} Applicant{(job.applications || (job.appliedTutors ? job.appliedTutors.length : 0) || 0) === 1 ? '' : 's'}</span>
            </span>
          </div>
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

      {/* 3.5 Applied Tutors Card (Strictly Guardian / Admin View) */}
      {isAuthorizedGuardian && applicants.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-lime-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] animate-ping" />
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#84CC16]" /> Tutors Who Applied ({applicants.length || job.applications || 0})
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review the tutors who applied for this tuition. You can select your preferred tutor to request a trial/demo class from Admin.
              </p>
            </div>
            {applicants.length > 0 && (
              <span className="text-xs font-black text-[#65A30D] bg-lime-50 px-3 py-1 rounded-full border border-lime-200 self-start sm:self-auto">
                {applicants.length} Applicant{applicants.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {selectionMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{selectionMessage}</span>
            </div>
          )}

          {loadingApplicants ? (
            <div className="py-8 text-center text-xs text-slate-400 font-bold">
              Loading applied tutors...
            </div>
          ) : applicants.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium">
              Applications are being processed.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {applicants.map((tutor) => {
                const isSelected = tutor.isSelected || (job.guardianSelectedTutorId === (tutor.tutorCode || tutor.tutorId));
                return (
                  <div 
                    key={tutor.id || tutor.tutorCode}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-purple-300 bg-purple-50/50 shadow-xs' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#84CC16]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={tutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutor.name)}`}
                          alt={tutor.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-slate-900 text-sm">{tutor.name}</h4>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-200 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-[#65A30D]" /> {tutor.tutorCode || 'VERIFIED'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            <span>{tutor.university} {tutor.department ? `• ${tutor.department}` : ''}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                            <span>💼 {tutor.experience || '2+ years exp'}</span>
                            <span>•</span>
                            <span>📍 {tutor.area || 'Dhaka'}</span>
                            {tutor.expectedSalary && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-emerald-700">Demand: ৳ {tutor.expectedSalary}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {isSelected ? (
                          <div className="px-3.5 py-1.5 rounded-xl bg-purple-100 text-purple-800 font-black text-xs flex items-center gap-1.5 border border-purple-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                            <span>Selected for Demo</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedTutorForDemo(tutor)}
                            className="px-4 py-2 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-98 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Select for Demo</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {tutor.message && (
                      <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-slate-100 text-xs text-slate-600 italic">
                        "{tutor.message}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Demo Selection Confirmation Modal */}
      {selectedTutorForDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#84CC16]" /> Select Tutor for Demo Class
              </h3>
              <button 
                onClick={() => setSelectedTutorForDemo(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-lime-50/70 border border-lime-200 flex items-center gap-3">
              <img 
                src={selectedTutorForDemo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedTutorForDemo.name)}`}
                alt={selectedTutorForDemo.name}
                className="w-12 h-12 rounded-xl object-cover bg-white"
              />
              <div>
                <h4 className="font-black text-slate-900 text-sm">{selectedTutorForDemo.name}</h4>
                <p className="text-xs text-slate-600 font-medium">{selectedTutorForDemo.university}</p>
                <p className="text-[11px] text-[#65A30D] font-bold">Demand: ৳ {selectedTutorForDemo.expectedSalary || job.salary}/mo</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              When you submit, your preference is sent to the <strong>TutorLink Administrator</strong> who will coordinate and assign the demo class schedule with this tutor.
            </p>

            <form onSubmit={handleConfirmSelect} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Date & Time (Optional)
                </label>
                <input 
                  type="text" 
                  value={preferredDemoDate}
                  onChange={(e) => setPreferredDemoDate(e.target.value)}
                  placeholder="e.g. Next Monday at 5:00 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#84CC16] outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Notes for Admin (Optional)
                </label>
                <textarea 
                  value={demoNotes}
                  onChange={(e) => setDemoNotes(e.target.value)}
                  placeholder="e.g. Please arrange trial online via Google Meet or in-person"
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#84CC16] outline-hidden font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTutorForDemo(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSelection}
                  className="flex-1 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] disabled:opacity-50 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingSelection ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Send to Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <Clock className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-400">Published:</span>
          <span className="text-slate-900">{formatTimeAgo(job.postedAt || job.createdAt)}</span>
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
          <span className="text-slate-900 font-extrabold">{job.applications || (job.appliedTutors ? job.appliedTutors.length : 0) || 0}</span>
        </div>
      </div>
    </div>
  );
};
