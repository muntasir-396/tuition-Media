import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Play,
  SlidersHorizontal,
  CheckCircle2,
  Copy,
  Printer,
  Send,
  Sparkles,
  Share2,
  ShieldCheck,
  FileText,
  Bookmark,
} from 'lucide-react';

export const Modals: React.FC = () => {
  const {
    isTutorialModalOpen,
    setIsTutorialModalOpen,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isApplyModalOpen,
    setIsApplyModalOpen,
    jobToApply,
    applyToJob,
    isShareModalOpen,
    setIsShareModalOpen,
    isCvModalOpen,
    setIsCvModalOpen,
    selectedTutor,
    selectedCity,
    setSelectedCity,
    selectedMediumFilter,
    setSelectedMediumFilter,
  } = useApp();

  const [applyNotes, setApplyNotes] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jobToApply) {
      try {
        const res = await fetch('/api/v1/tutor/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            jobId: jobToApply.id, 
            expectedSalary, 
            notes: applyNotes 
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Application failed');
        }
      } catch (error) {
        console.error("Failed to submit application", error);
      }
      applyToJob(jobToApply.id);
      setIsAppliedSuccess(true);
      setTimeout(() => {
        setIsAppliedSuccess(false);
        setIsApplyModalOpen(false);
      }, 1500);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      {/* 1. Watch Tutorial Video Modal */}
      {isTutorialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-fade-in">
            <button
              onClick={() => setIsTutorialModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-lime-100 text-[#65A30D] flex items-center justify-center">
                <Play className="w-4 h-4 fill-[#65A30D] ml-0.5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Platform Video Tutorial</h3>
            </div>

            <div className="relative aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-4 border border-slate-700 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#84CC16] text-slate-950 flex items-center justify-center shadow-lg animate-pulse">
                <Play className="w-8 h-8 fill-slate-950 ml-1" />
              </div>
              <p className="font-bold text-sm text-center">How to Apply & Find Tuitions on TutorLink</p>
              <span className="text-xs text-slate-400">Duration: 2 mins 45 secs</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This short video explains step-by-step how tutors verify NID profiles, filter jobs by local area in Dhaka & Chittagong, and connect directly with parents.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsTutorialModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Job Filter Trigger Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#84CC16]" />
              <h3 className="font-extrabold text-slate-900 text-lg">Filter Tuition Jobs</h3>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1.5 text-slate-500">Region / City:</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                >
                  <option value="All">All Cities in Bangladesh</option>
                  <option value="DHAKA">Dhaka Division</option>
                  <option value="CHITTAGONG">Chittagong Division</option>
                  <option value="SYLHET">Sylhet Division</option>
                  <option value="KHULNA">Khulna Division</option>
                  <option value="GAZIPUR">Gazipur Region</option>
                  <option value="CUMILLA">Cumilla Region</option>
                  <option value="RAJSHAHI">Rajshahi Division</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-500">Educational Curriculum / Medium:</label>
                <select
                  value={selectedMediumFilter}
                  onChange={(e) => setSelectedMediumFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                >
                  <option value="All">All Curriculums</option>
                  <option value="Bangla Medium">Bangla Medium</option>
                  <option value="English Medium">English Medium</option>
                  <option value="English Version">English Version</option>
                  <option value="A/O Levels">A/O Levels</option>
                  <option value="Madrasah">Madrasah Medium</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedCity('All');
                  setSelectedMediumFilter('All');
                  setIsFilterModalOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Reset All
              </button>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#84CC16] text-slate-950 font-black text-xs shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Apply Now Modal */}
      {isApplyModalOpen && jobToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {isAppliedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#84CC16] mx-auto animate-bounce" />
                <h4 className="font-black text-slate-900 text-lg">Application Submitted!</h4>
                <p className="text-xs text-slate-500">
                  Job ID: {jobToApply.id} • The parent will review your profile & contact you directly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Apply for Tuition Job</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Job ID: <strong>{jobToApply.id}</strong> • {jobToApply.title}
                  </p>
                </div>

                <div className="space-y-3 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block text-slate-500 mb-1">Expected Monthly Remuneration (BDT):</label>
                    <input
                      type="text"
                      placeholder={`Asking Salary (Default: ${jobToApply.salary} BDT)`}
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Cover Note for Parent / Guardian:</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly state your university background, teaching experience, and relevant subjects..."
                      value={applyNotes}
                      onChange={(e) => setApplyNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-[#84CC16] text-slate-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Confirm Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative text-center">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Share2 className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-slate-900 text-lg">Share Tuition Requirement</h3>
            <p className="text-xs text-slate-500">
              Copy the direct link below to share with fellow tutors or parents on WhatsApp, Facebook, or SMS.
            </p>

            <button
              onClick={handleCopyShare}
              className="w-full py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <Copy className="w-4 h-4 text-[#84CC16]" />
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Download / Print CV Modal */}
      {isCvModalOpen && selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            <button
              onClick={() => setIsCvModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CV Document Header */}
            <div className="text-center pb-4 border-b border-slate-200 space-y-1">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Curriculum Vitae (Tutor Profile)
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                TutorLink Verified Mentor Record • ID: {selectedTutor.id}
              </p>
            </div>

            {/* Printable Content */}
            <div className="space-y-5 text-xs">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTutor.avatar}
                  alt={selectedTutor.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#84CC16]"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedTutor.name}</h3>
                  <p className="text-xs font-bold text-[#65A30D]">{selectedTutor.university}</p>
                  <p className="text-slate-500 mt-1">
                    Contact: Protected for privacy
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <span className="font-extrabold text-slate-900 block">Personal Profile:</span>
                <p className="text-slate-700">
                  DOB: {selectedTutor.dob} • Gender: {selectedTutor.gender} • Blood Group: {selectedTutor.bloodGroup} • Religion: {selectedTutor.religion}
                </p>
                <p className="text-slate-700">Present Address: {selectedTutor.presentAddress}</p>
              </div>

              <div className="space-y-2">
                <span className="font-extrabold text-slate-900 block">Educational Qualifications:</span>
                <div className="space-y-1.5">
                  {selectedTutor.educationHistory.map((edu, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                      <div>
                        <strong className="text-slate-900 block">{edu.degree}</strong>
                        <span className="text-slate-500">{edu.institute}</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-[#65A30D] block">{edu.result}</strong>
                        <span className="text-slate-400">{edu.passingYear}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsCvModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-[#84CC16] text-slate-950 font-black text-xs shadow-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF CV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
