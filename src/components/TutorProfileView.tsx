import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'lucide-react';

export const TutorProfileView: React.FC = () => {
  const { selectedTutor, setIsCvModalOpen, navigateToJobDetails, currentUser, setActiveTab } = useApp();

  const [viewAsParent, setViewAsParent] = useState<boolean>(currentUser?.role === 'parent');
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    personal: true,
    location: true,
    guardian: true,
    tutoring: true,
    education: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!selectedTutor) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-500 font-medium">No tutor selected.</p>
      </div>
    );
  }

  const tutor = selectedTutor;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* 1. Header Banner & Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative shrink-0">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#84CC16] p-1 shadow-md"
              />
              <span className="absolute bottom-1 right-1 p-1 rounded-full bg-[#84CC16] text-white shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{tutor.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-[#65A30D] text-xs font-bold border border-lime-200">
                  {tutor.nidStatus.includes('Verified') ? 'NID Verified' : 'Pending'}
                </span>
              </div>

              <p className="text-sm font-bold text-[#65A30D] flex items-center justify-center sm:justify-start gap-1">
                <GraduationCap className="w-4 h-4 text-[#84CC16]" />
                <span>{tutor.university}</span>
              </p>

              <p className="text-xs text-slate-500 font-semibold">
                Tutor ID: <strong className="text-slate-900">{tutor.id}</strong> • Gender:{' '}
                <strong className="text-slate-900">{tutor.gender}</strong>
              </p>

              {/* Profile Completion Progress Bar */}
              <div className="pt-2 max-w-xs space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Profile Completion</span>
                  <span className="text-[#65A30D]">{tutor.completion}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#84CC16] to-[#65A30D] h-full rounded-full transition-all duration-500"
                    style={{ width: `${tutor.completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {currentUser?.role === 'parent' && (
              <button
                onClick={() => setActiveTab('request-tutor')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 stroke-[2.5]" />
                <span>Request This Tutor</span>
              </button>
            )}
            
            {currentUser?.role !== 'parent' && (
              <button
                onClick={() => setViewAsParent(!viewAsParent)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  viewAsParent
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{viewAsParent ? 'View Mode: Parent' : 'View As Parent'}</span>
              </button>
            )}

            <button
              onClick={() => setIsCvModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download CV</span>
            </button>
          </div>
        </div>

        {viewAsParent && (
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Parent Preview Active:</strong> Contact numbers and emergency guardian details are masked for verification privacy until match confirmation.
            </span>
          </div>
        )}
      </div>

      {/* 2. Personal Information Card */}
      <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs">
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
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-semibold">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Date of Birth:</span>
              <strong className="text-slate-900 text-sm">{tutor.dob}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Phone Number:</span>
              <strong className="text-slate-900 text-sm">
                Protected by Admin
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Email Address:</span>
              <strong className="text-slate-900 text-sm truncate block">
                Protected by Admin
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Gender:</span>
              <strong className="text-slate-900 text-sm">{tutor.gender}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Blood Group:</span>
              <strong className="text-red-600 font-extrabold text-sm">{tutor.bloodGroup}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Religion:</span>
              <strong className="text-slate-900 text-sm">{tutor.religion}</strong>
            </div>

            <div className="p-3 bg-lime-50 rounded-xl border border-lime-200 sm:col-span-2 lg:col-span-3">
              <span className="text-slate-500 block">NID / Passport Verification:</span>
              <strong className="text-[#65A30D] font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4" /> {tutor.nidStatus}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. Location Information Card */}
      <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('location')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#84CC16]" /> 2. Location Information
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.location ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.location && (
          <div className="p-6 space-y-4 text-xs font-semibold">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-bold mb-1">Present Address:</span>
              <p className="text-slate-900 text-sm">{tutor.presentAddress}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-bold mb-1">Permanent Address:</span>
              <p className="text-slate-900 text-sm">{tutor.permanentAddress}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Guardian Information Card */}
      <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('guardian')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#84CC16]" /> 3. Guardian Information
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.guardian ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.guardian && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Father's Name:</span>
              <strong className="text-slate-900 text-sm">{tutor.guardianInfo.fatherName}</strong>
              <span className="text-slate-400 block text-[11px] mt-0.5">
                Contact: Protected
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Mother's Name:</span>
              <strong className="text-slate-900 text-sm">{tutor.guardianInfo.motherName}</strong>
              <span className="text-slate-400 block text-[11px] mt-0.5">
                Contact: Protected
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 sm:col-span-2">
              <span className="text-amber-800 font-bold block">Emergency Contact Person:</span>
              <strong className="text-slate-900 text-sm">
                Verified Guardian Contact on file
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 5. Tutoring Info & Preferences Card */}
      <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('tutoring')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-[#84CC16]" /> 4. Tutoring Info & Preferences
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.tutoring ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.tutoring && (
          <div className="p-6 space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Tutoring Experience:</span>
                <strong className="text-slate-900 text-sm">
                  {tutor.experienceYears} Years Active Teaching
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Expected Monthly Salary:</span>
                <strong className="text-[#65A30D] font-extrabold text-sm">
                  {tutor.expectedSalary}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Tutoring Methods:</span>
                <strong className="text-slate-900 text-sm">
                  {tutor.tutoringInfo.methods.join(', ')}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Available Time Schedule:</span>
                <strong className="text-slate-900 text-sm">
                  {tutor.tutoringInfo.timeSlots}
                </strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">Covered Mediums & Curriculums:</span>
              <div className="flex flex-wrap gap-2">
                {tutor.mediums.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-lime-100 text-[#65A30D] font-bold text-xs border border-lime-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">Preferred Locations / Areas:</span>
              <div className="flex flex-wrap gap-2">
                {tutor.tutoringInfo.preferredAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-bold text-xs"
                  >
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Education History Card */}
      <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('education')}
          className="w-full p-5 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-base border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-[#84CC16]" /> 5. Chronological Education History
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              openSections.education ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.education && (
          <div className="p-6 space-y-4">
            {tutor.educationHistory.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 relative pl-6 border-l-4 border-l-[#84CC16]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-extrabold text-slate-900 text-base">{edu.degree}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-xs w-fit">
                    Passed: {edu.passingYear}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#65A30D]">{edu.institute}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>Group/Dept: {edu.boardOrGroup}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-extrabold">{edu.result}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
