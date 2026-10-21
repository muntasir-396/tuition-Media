import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TutorProfile } from '../types';
import { EditTutorProfileModal } from './EditTutorProfileModal';
import {
  User,
  Download,
  Eye,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Heart,
  Users,
  Award,
  BookOpen,
  DollarSign,
  Clock,
  Briefcase,
  ChevronDown,
  Printer,
  Sparkles,
  Edit,
  Ban,
  ShieldAlert,
  AlertTriangle,
  Send,
  Star,
  ArrowLeft,
} from 'lucide-react';

export const TutorProfileView: React.FC = () => {
  const {
    selectedTutor,
    setSelectedTutor,
    setIsCvModalOpen,
    currentUser,
    setActiveTab,
    refreshMyTutorProfile,
    blockTutor,
    verifyTutor,
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewAsParent, setViewAsParent] = useState<boolean>(currentUser?.role === 'parent');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    personal: true,
    location: true,
    education: true,
    tutoring: true,
    guardian: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Auto-fetch if tutor is logged in and no tutor is selected yet
  useEffect(() => {
    if (!selectedTutor && currentUser?.role === 'tutor') {
      refreshMyTutorProfile().then(t => {
        if (t) setSelectedTutor(t);
      });
    }
  }, [selectedTutor, currentUser]);

  if (!selectedTutor) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 my-10">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-800">No Tutor Profile Selected</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Browse through our verified tutors directory or sign in to your tutor account to view and edit your profile.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('tutors')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Browse Tutors
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className="px-5 py-2.5 rounded-xl bg-[#84CC16] text-slate-950 font-bold text-xs hover:bg-[#65A30D]"
          >
            Tutor Sign In
          </button>
        </div>
      </div>
    );
  }

  const tutor: TutorProfile = selectedTutor;
  const isOwner = currentUser?.role === 'tutor' && (
    (currentUser?.phone && tutor.phone && currentUser.phone === tutor.phone) ||
    (currentUser?.name && tutor.name && currentUser.name.toLowerCase() === tutor.name.toLowerCase()) ||
    currentUser?.id === tutor.id
  );
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  const isParent = currentUser?.role === 'parent' || viewAsParent;
  const isBlocked = tutor.status === 'blocked' || tutor.status === 'suspended';

  const handleBlockToggle = async () => {
    if (!isAdmin) return;
    const newStatus = isBlocked ? 'active' : 'blocked';
    const confirmText = isBlocked 
      ? `Are you sure you want to unblock ${tutor.name}?` 
      : `Are you sure you want to block ${tutor.name}? They will not be able to apply for tuitions.`;
    
    if (window.confirm(confirmText)) {
      setIsActionLoading(true);
      const ok = await blockTutor(tutor.id, newStatus);
      setIsActionLoading(false);
      if (ok) {
        setActionSuccessMsg(`Tutor account ${newStatus === 'blocked' ? 'blocked' : 'activated'} successfully.`);
        setTimeout(() => setActionSuccessMsg(''), 3000);
      }
    }
  };

  const handleVerifyToggle = async () => {
    if (!isAdmin) return;
    setIsActionLoading(true);
    const ok = await verifyTutor(tutor.id, !tutor.verified);
    setIsActionLoading(false);
    if (ok) {
      setActionSuccessMsg(`Tutor NID verification status updated.`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Admin Inspector Banner */}
      {isAdmin && (
        <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#84CC16]" />
            <span className="text-xs font-bold">Admin Inspector Mode • Reviewing Tutor Profile ({tutor.name})</span>
          </div>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setActiveTab('admin-tuitions');
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Applications</span>
          </button>
        </div>
      )}

      {/* Action Notification */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* BLOCKED / SUSPENDED WARNING BANNER */}
      {isBlocked && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 flex items-start gap-3 shadow-sm animate-pulse">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black text-sm uppercase tracking-wide text-rose-700">Account Blocked / Suspended</h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              This tutor profile is currently <strong>blocked by the administrator</strong>. Applying for tuition jobs is restricted.
              {isOwner && " Please contact platform administration to appeal verification or resolve compliance issues."}
            </p>
          </div>
        </div>
      )}

      {/* 1. Header Banner & Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
        {/* Subtle background badge */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-50 rounded-bl-full -z-0 opacity-50" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              <img
                src={tutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=84cc16&color=fff&bold=true`}
                alt={tutor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#84CC16] p-1 shadow-md bg-white"
              />
              <span className={`absolute bottom-1 right-1 p-1 rounded-full text-white shadow-xs ${isBlocked ? 'bg-rose-600' : 'bg-[#84CC16]'}`}>
                {isBlocked ? <Ban className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{tutor.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isBlocked
                    ? 'bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {isBlocked ? 'Suspended / Blocked' : 'Active Account'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-[#65A30D] text-xs font-bold border border-lime-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {tutor.verified ? 'NID Verified' : 'Pending Verification'}
                </span>
              </div>

              <p className="text-sm font-bold text-[#65A30D] flex items-center justify-center sm:justify-start gap-1">
                <GraduationCap className="w-4 h-4 text-[#84CC16]" />
                <span>{tutor.university} • {tutor.department}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-semibold pt-0.5">
                <span>Tutor Code: <strong className="text-slate-900 font-black">{tutor.tutorCode || tutor.id}</strong></span>
                <span>•</span>
                <span>Gender: <strong className="text-slate-900">{tutor.gender}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {tutor.rating || 4.8} ({tutor.reviewsCount || 15} reviews)
                </span>
              </div>

              {/* Profile Completion Progress Bar */}
              <div className="pt-2 max-w-xs space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Tuition Terminal Profile Meter</span>
                  <span className="text-[#65A30D] font-black">{tutor.completion || 75}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-[#84CC16] to-[#65A30D] h-full rounded-full transition-all duration-500"
                    style={{ width: `${tutor.completion || 75}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Guardian Hire / Request Button */}
            {(isParent || currentUser?.role === 'parent') && (
              <button
                onClick={() => setActiveTab('request-tutor')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 stroke-[2.5]" />
                <span>Hire / Request This Tutor</span>
              </button>
            )}

            {/* Tutor Own Edit Button */}
            {(isOwner || !currentUser || currentUser?.role === 'tutor') && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4 text-[#84CC16]" />
                <span>Edit Profile</span>
              </button>
            )}

            {/* Admin Block / Unblock Button */}
            {isAdmin && (
              <>
                <button
                  onClick={handleBlockToggle}
                  disabled={isActionLoading}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                    isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isBlocked ? 'Unblock Tutor' : 'Block Tutor'}</span>
                </button>

                <button
                  onClick={handleVerifyToggle}
                  disabled={isActionLoading}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                    tutor.verified
                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      : 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{tutor.verified ? 'Unverify NID' : 'Verify NID'}</span>
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Admin Edit</span>
                </button>
              </>
            )}

            {/* Toggle View As Parent mode for testing */}
            {!isAdmin && currentUser?.role !== 'parent' && (
              <button
                onClick={() => setViewAsParent(!viewAsParent)}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  viewAsParent
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{viewAsParent ? 'Viewing as: Guardian' : 'Preview as Guardian'}</span>
              </button>
            )}

            <button
              onClick={() => setIsCvModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download CV</span>
            </button>
          </div>
        </div>

        {viewAsParent && (
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Guardian Privacy Mode:</strong> Phone numbers and direct emergency contact details are masked for verification privacy. Contact information is released upon tuition confirmation.
            </span>
          </div>
        )}
      </div>

      {/* 2. Personal Information Card */}
      <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('personal')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#84CC16]" /> 1. Personal Information
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.personal ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.personal && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Date of Birth:</span>
              <strong className="text-slate-900 text-sm">{tutor.dob || '2001-01-01'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Phone Number:</span>
              <strong className="text-slate-900 text-sm">
                {isParent ? (tutor.phone?.length >= 6 ? `${tutor.phone.substring(0, 3)}****${tutor.phone.substring(tutor.phone.length - 2)} (Protected)` : 'Protected by Admin') : (tutor.phone || '017XXXXXXXX')}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Email Address:</span>
              <strong className="text-slate-900 text-sm truncate block">
                {isParent ? (tutor.email?.includes('@') ? `${tutor.email.substring(0, 2)}***@${tutor.email.split('@')[1]}` : 'Protected') : (tutor.email || 'tutor@tutorlink.com')}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Gender:</span>
              <strong className="text-slate-900 text-sm">{tutor.gender}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Blood Group:</span>
              <strong className="text-red-600 font-black text-sm">{tutor.bloodGroup || 'B+'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Religion:</span>
              <strong className="text-slate-900 text-sm">{tutor.religion || 'Islam'}</strong>
            </div>

            <div className="p-3 bg-lime-50 rounded-2xl border border-lime-200 sm:col-span-2 lg:col-span-3 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">NID / Student ID Verification:</span>
                <strong className="text-[#65A30D] font-black text-sm flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4" /> {tutor.nidStatus || (tutor.verified ? 'Verified (NID Provided)' : 'Pending Verification')}
                </strong>
              </div>
              {tutor.verified && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  Verified Identity
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Education Qualifications Card */}
      <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('education')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-[#84CC16]" /> 2. Academic Qualifications & History
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.education ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.education && (
          <div className="p-6 space-y-4">
            {tutor.educationHistory && tutor.educationHistory.length > 0 ? (
              tutor.educationHistory.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 relative pl-6 border-l-4 border-l-[#84CC16]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-black text-slate-900 text-base">{edu.degree}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-xs w-fit">
                      Passing Year: {edu.passingYear}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-[#65A30D]">{edu.institute}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                    <span>Discipline / Board: {edu.boardOrGroup}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-black">Result: {edu.result}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No formal education history listed yet.</p>
            )}
          </div>
        )}
      </div>

      {/* 4. Tuition Preferences Card */}
      <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('tutoring')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-[#84CC16]" /> 3. Tuition Preferences & Teaching Setup
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.tutoring ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.tutoring && (
          <div className="p-6 space-y-5 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Tutoring Experience:</span>
                <strong className="text-slate-900 text-sm font-black">
                  {tutor.experienceYears ?? tutor.tutoringExperience ?? 2} Years Active
                </strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Expected Monthly Salary:</span>
                <strong className="text-[#65A30D] font-black text-sm">
                  {tutor.expectedSalary || `${tutor.expectedSalaryMin || 5000} - ${tutor.expectedSalaryMax || 8000} BDT`}
                </strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Teaching Methods:</span>
                <strong className="text-slate-900 text-sm">
                  {tutor.tutoringInfo?.methods?.join(', ') || 'Home Tutoring'}
                </strong>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Time Schedule:</span>
                <strong className="text-slate-900 text-sm">
                  {tutor.tutoringInfo?.timeSlots || '5:00 PM - 9:00 PM'}
                </strong>
              </div>
            </div>

            {/* Covered Subjects */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">Preferred Subjects:</span>
              <div className="flex flex-wrap gap-1.5">
                {tutor.subjects && tutor.subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs"
                  >
                    📚 {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Covered Classes */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">Preferred Classes:</span>
              <div className="flex flex-wrap gap-1.5">
                {(tutor.classes && tutor.classes.length > 0 ? tutor.classes : ['Class 9-10 (SSC)', 'Class 11-12 (HSC)']).map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    🎓 {cls}
                  </span>
                ))}
              </div>
            </div>

            {/* Covered Mediums */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">Mediums & Curriculums:</span>
              <div className="flex flex-wrap gap-1.5">
                {tutor.mediums && tutor.mediums.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-lime-100 text-[#65A30D] font-bold text-xs border border-lime-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">Preferred Areas for Tutoring:</span>
              <div className="flex flex-wrap gap-1.5">
                {(tutor.tutoringInfo?.preferredAreas && tutor.tutoringInfo.preferredAreas.length > 0
                  ? tutor.tutoringInfo.preferredAreas
                  : [tutor.area || 'Mirpur', 'Dhanmondi']
                ).map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs"
                  >
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Location & Residential Information Card */}
      <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('location')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#84CC16]" /> 4. Location & Address Information
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.location ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.location && (
          <div className="p-6 space-y-4 text-xs font-semibold">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block font-bold mb-1">Present Address (Current Residence):</span>
              <p className="text-slate-900 text-sm font-semibold">{tutor.presentAddress || `${tutor.area || 'Mirpur'}, ${tutor.district || 'Dhaka'}`}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block font-bold mb-1">Permanent Address (Home District):</span>
              <p className="text-slate-900 text-sm font-semibold">{tutor.permanentAddress || `${tutor.district || 'Dhaka'}, Bangladesh`}</p>
            </div>
          </div>
        )}
      </div>

      {/* 6. Guardian & Emergency Information Card */}
      <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('guardian')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#84CC16]" /> 5. Guardian & Emergency Verification
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.guardian ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.guardian && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Father's Name:</span>
              <strong className="text-slate-900 text-sm">{tutor.guardianInfo?.fatherName || 'Md. Guardian'}</strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Father's Phone:</span>
              <strong className="text-slate-900 text-sm">
                {isParent ? 'Protected for privacy' : (tutor.guardianInfo?.fatherPhone || '017XXXXXXXX')}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Mother's Name:</span>
              <strong className="text-slate-900 text-sm">{tutor.guardianInfo?.motherName || 'Fatema Begum'}</strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Mother's Phone:</span>
              <strong className="text-slate-900 text-sm">
                {isParent ? 'Protected for privacy' : (tutor.guardianInfo?.motherPhone || '017XXXXXXXX')}
              </strong>
            </div>

            <div className="p-3.5 bg-lime-50 rounded-2xl border border-lime-200 sm:col-span-2">
              <span className="text-slate-500 block mb-0.5">Emergency Contact Number:</span>
              <strong className="text-[#65A30D] font-black text-sm">
                {isParent ? 'Protected for privacy' : (tutor.guardianInfo?.emergencyContact || tutor.phone || '017XXXXXXXX')}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditTutorProfileModal
        tutor={tutor}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={(updated) => {
          setSelectedTutor(updated);
          setActionSuccessMsg('Tutor profile successfully updated!');
          setTimeout(() => setActionSuccessMsg(''), 3000);
        }}
      />
    </div>
  );
};
