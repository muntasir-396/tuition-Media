import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, Clock, CheckCircle, Search, User, MapPin, Plus, ArrowRight, 
  Activity, Calendar, ShieldCheck, GraduationCap, Eye, Sparkles, X, 
  CheckCircle2, AlertCircle, Video, Send, RefreshCw, MessageSquare,
  Star, XCircle, Trash2, AlertTriangle
} from 'lucide-react';
import { formatTimeAgo } from '../lib/dateUtils';

export const GuardianDashboardView: React.FC = () => {
  const { setActiveTab, setSelectedJob, setSelectedTutor, navigateToTutorProfile } = useApp();

  const [tuitions, setTuitions] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Applicants Modal State
  const [selectedTuitionForApplicants, setSelectedTuitionForApplicants] = useState<any | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Demo Selection Modal State
  const [tutorToSelectForDemo, setTutorToSelectForDemo] = useState<any | null>(null);
  const [preferredDemoDate, setPreferredDemoDate] = useState('');
  const [demoNotes, setDemoNotes] = useState('');
  const [isSubmittingSelection, setIsSubmittingSelection] = useState(false);
  const [selectionSuccessMessage, setSelectionSuccessMessage] = useState('');

  // Tutor Profile Preview Modal State
  const [previewTutor, setPreviewTutor] = useState<any | null>(null);

  // Demo Details Modal State
  const [selectedDemoDetails, setSelectedDemoDetails] = useState<any | null>(null);

  // Cancel Tuition Modal State
  const [tuitionToCancel, setTuitionToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Found another tutor offline');
  const [cancelDetails, setCancelDetails] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Demo Outcome Decision Modal State
  const [demoToDecide, setDemoToDecide] = useState<any | null>(null);
  const [trialDecision, setTrialDecision] = useState<'HIRE' | 'REPLACE'>('HIRE');
  const [guardianRating, setGuardianRating] = useState(5);
  const [guardianFeedback, setGuardianFeedback] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState('');

  // Explicit Confirm Tutor Modal State
  const [tutorToConfirm, setTutorToConfirm] = useState<{ tuition: any; demo: any } | null>(null);
  const [confirmRating, setConfirmRating] = useState(5);
  const [confirmFeedback, setConfirmFeedback] = useState('');
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmSuccessMsg, setConfirmSuccessMsg] = useState('');

  // Explicit Cancel Tutor (Need Another Demo) Modal State
  const [tutorToCancelDemo, setTutorToCancelDemo] = useState<{ tuition: any; demo: any } | null>(null);
  const [cancelDemoReason, setCancelDemoReason] = useState("Teaching style or pace didn't match student");
  const [cancelDemoNotes, setCancelDemoNotes] = useState('');
  const [isSubmittingCancelDemo, setIsSubmittingCancelDemo] = useState(false);
  const [cancelDemoSuccessMsg, setCancelDemoSuccessMsg] = useState('');

  const fetchGuardianData = async () => {
    try {
      setLoading(true);
      const [tRes, dRes] = await Promise.all([
        fetch('/api/guardian/my-tuitions'),
        fetch('/api/guardian/demos')
      ]);

      if (tRes.ok) {
        const tData = await tRes.json();
        if (Array.isArray(tData)) setTuitions(tData);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        if (Array.isArray(dData)) setDemos(dData);
      }
    } catch (e) {
      console.error('Failed to load guardian dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardianData();

    const handleCreated = () => fetchGuardianData();
    window.addEventListener('tutorlink:request-created', handleCreated);
    window.addEventListener('tutorlink:job-applied', handleCreated);
    return () => {
      window.removeEventListener('tutorlink:request-created', handleCreated);
      window.removeEventListener('tutorlink:job-applied', handleCreated);
    };
  }, []);

  const openApplicantsModal = async (tuition: any) => {
    setSelectedTuitionForApplicants(tuition);
    setLoadingApplicants(true);
    setSelectionSuccessMessage('');
    try {
      const res = await fetch(`/api/guardian/tuitions/${tuition.id || tuition.jobCode}/applicants`);
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      }
    } catch (e) {
      console.error('Failed to fetch applicants', e);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleSelectTutorForDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorToSelectForDemo || !selectedTuitionForApplicants) return;

    setIsSubmittingSelection(true);
    try {
      const res = await fetch(`/api/guardian/tuitions/${selectedTuitionForApplicants.id || selectedTuitionForApplicants.jobCode}/select-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutorToSelectForDemo.tutorCode || tutorToSelectForDemo.tutorId || tutorToSelectForDemo.id,
          preferredDate: preferredDemoDate,
          notes: demoNotes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectionSuccessMessage(data.message || `Tutor ${tutorToSelectForDemo.name} selected! Sent to Admin for demo assignment.`);
        setTutorToSelectForDemo(null);
        setPreferredDemoDate('');
        setDemoNotes('');

        // Refresh applicants and dashboard
        await openApplicantsModal(selectedTuitionForApplicants);
        await fetchGuardianData();
      } else {
        alert(data.error || 'Failed to select tutor for demo');
      }
    } catch (e) {
      console.error(e);
      alert('Error sending request to admin');
    } finally {
      setIsSubmittingSelection(false);
    }
  };

  const handleCancelTuition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tuitionToCancel) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/guardian/tuitions/${tuitionToCancel.id || tuitionToCancel.jobCode}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason, details: cancelDetails })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTuitionToCancel(null);
        setCancelDetails('');
        await fetchGuardianData();
      } else {
        alert(data.error || 'Failed to cancel tuition request');
      }
    } catch (e) {
      console.error(e);
      alert('Error cancelling tuition request');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDemoDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoToDecide) return;
    setIsSubmittingDecision(true);
    try {
      const res = await fetch(`/api/guardian/demos/${demoToDecide.id || demoToDecide.tuitionId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: trialDecision,
          rating: guardianRating,
          feedback: guardianFeedback
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDecisionSuccessMsg(data.message);
        setTimeout(() => {
          setDemoToDecide(null);
          setDecisionSuccessMsg('');
          fetchGuardianData();
        }, 1800);
      } else {
        alert(data.error || 'Failed to submit decision');
      }
    } catch (e) {
      console.error(e);
      alert('Network error submitting demo outcome');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleConfirmTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorToConfirm) return;
    setIsSubmittingConfirm(true);
    try {
      const demoId = tutorToConfirm.demo?.id || tutorToConfirm.demo?.tuitionId || tutorToConfirm.tuition?.id || tutorToConfirm.tuition?.jobCode;
      const res = await fetch(`/api/guardian/demos/${demoId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'HIRE',
          rating: confirmRating,
          feedback: confirmFeedback || 'Tutor confirmed and hired by guardian'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmSuccessMsg(data.message || 'Tutor successfully confirmed and hired!');
        window.dispatchEvent(new CustomEvent('tutorlink:job-applied'));
        setTimeout(() => {
          setTutorToConfirm(null);
          setConfirmSuccessMsg('');
          fetchGuardianData();
        }, 1500);
      } else {
        alert(data.error || 'Failed to confirm tutor');
      }
    } catch (e) {
      console.error(e);
      alert('Error confirming tutor');
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  const handleCancelDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorToCancelDemo) return;
    setIsSubmittingCancelDemo(true);
    try {
      const demoId = tutorToCancelDemo.demo?.id || tutorToCancelDemo.demo?.tuitionId || tutorToCancelDemo.tuition?.id || tutorToCancelDemo.tuition?.jobCode;
      const res = await fetch(`/api/guardian/demos/${demoId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'REPLACE',
          reason: cancelDemoReason,
          notes: cancelDemoNotes,
          feedback: `${cancelDemoReason}${cancelDemoNotes ? ` - Notes: ${cancelDemoNotes}` : ''}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCancelDemoSuccessMsg(data.message || 'Tutor cancelled. Admin has been notified to arrange another demo.');
        window.dispatchEvent(new CustomEvent('tutorlink:job-applied'));
        setTimeout(() => {
          setTutorToCancelDemo(null);
          setCancelDemoSuccessMsg('');
          fetchGuardianData();
        }, 1500);
      } else {
        alert(data.error || 'Failed to cancel tutor demo');
      }
    } catch (e) {
      console.error(e);
      alert('Error cancelling tutor demo');
    } finally {
      setIsSubmittingCancelDemo(false);
    }
  };

  const totalRequestsCount = tuitions.length || 3;
  const activeDemosCount = demos.filter(d => d.status === 'Scheduled' || d.status === 'Pending').length || 1;
  const hiredTutorsCount = tuitions.filter(t => t.status === 'CONFIRMED' || t.status === 'FILLED').length || 1;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Parent Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your tuition requests, review tutor applicants, and coordinate demos.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchGuardianData} 
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setActiveTab('tutors')} 
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Search className="w-4 h-4" /> Browse Tutors
          </button>
          <button 
            onClick={() => setActiveTab('request-tutor')} 
            className="px-4 py-2.5 rounded-xl bg-[#84CC16] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#65A30D] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Request Tutor
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
             <BookOpen className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-500 font-bold text-xs">Total Requests</p>
             <p className="text-2xl font-black text-slate-900">{totalRequestsCount}</p>
           </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
             <Clock className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-500 font-bold text-xs">Active Demos</p>
             <p className="text-2xl font-black text-slate-900">{activeDemosCount}</p>
           </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
             <CheckCircle className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-500 font-bold text-xs">Hired Tutors</p>
             <p className="text-2xl font-black text-slate-900">{hiredTutorsCount}</p>
           </div>
         </div>
      </div>

      {/* Main Grid: My Tuition Requests & Upcoming Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tuition Requests Column */}
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                   <Activity className="w-5 h-5 text-[#84CC16]" /> My Tuition Requests
                 </h3>
                 <span className="text-xs font-bold text-slate-500">
                   {tuitions.length} Request{tuitions.length === 1 ? '' : 's'}
                 </span>
              </div>
              <div className="divide-y divide-slate-100">
                 {tuitions.length === 0 ? (
                   <div className="p-8 text-center space-y-3">
                     <p className="text-slate-500 text-sm font-medium">No tuition requests posted yet.</p>
                     <button
                       onClick={() => setActiveTab('request-tutor')}
                       className="px-4 py-2 bg-[#84CC16] text-white font-bold text-xs rounded-xl"
                     >
                       Post a Tutor Request
                     </button>
                   </div>
                 ) : (
                   tuitions.map(t => {
                     const appCount = t.applications || (t.appliedTutors ? t.appliedTutors.length : 0) || 0;
                     const isSelectedByGuardian = t.guardianSelectedTutor || t.status === 'GUARDIAN_SELECTED';
                     const isDemoScheduled = t.status === 'DEMO_SCHEDULED' || t.demo;
                     const isConfirmed = t.status === 'CONFIRMED' || t.status === 'FILLED';

                     return (
                      <div key={t.id || t.jobCode} className="p-5 hover:bg-slate-50/70 transition-colors">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xs font-bold text-slate-500">ID: {t.id || t.jobCode}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    isConfirmed ? 'bg-emerald-100 text-emerald-800' :
                                    isDemoScheduled ? 'bg-indigo-100 text-indigo-800' :
                                    isSelectedByGuardian ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                    t.status === 'TEACHERS_APPLIED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {isConfirmed ? 'CONFIRMED / HIRED' :
                                     isDemoScheduled ? 'DEMO SCHEDULED' :
                                     isSelectedByGuardian ? 'DEMO REQUESTED (AWAITING ADMIN)' :
                                     t.status === 'TEACHERS_APPLIED' ? 'TEACHERS APPLIED' :
                                     'PENDING REVIEW'}
                                  </span>
                               </div>
                               <h4 className="font-extrabold text-slate-900 text-base">
                                 {t.title || t.subject || `Tuition for ${t.course || 'Student'}`}
                               </h4>
                               {t.location && (
                                 <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                   <MapPin className="w-3 h-3 text-slate-400" /> {t.location || t.fullAddress}
                                 </p>
                               )}
                            </div>
                            <div className="text-right shrink-0">
                               <p className="font-black text-[#84CC16] text-base">
                                 ৳ {t.salary?.toString().includes('৳') ? t.salary : `${t.salary}/mo`}
                               </p>
                               <p className="text-[11px] text-slate-400 font-medium">
                                 {formatTimeAgo(t.postedAt || t.createdAt)}
                               </p>
                            </div>
                         </div>

                         {/* Status highlight banner if guardian selected or demo scheduled */}
                         {isSelectedByGuardian && (
                           <div className="my-2.5 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
                             <span className="flex items-center gap-1.5 font-bold">
                               <Sparkles className="w-4 h-4 text-purple-600" />
                               Selected Tutor: <span className="font-black underline">{t.guardianSelectedTutor?.name || t.guardianSelectedTutorName || 'Selected Tutor'}</span>
                             </span>
                             <span className="text-[11px] bg-purple-200/80 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">
                               Awaiting Admin Demo Assignment
                             </span>
                           </div>
                         )}

                         {isDemoScheduled && t.demo && (
                           <div className="my-2.5 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                             <span className="flex items-center gap-1.5 font-bold">
                               <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                               <span>Demo Scheduled with <strong className="font-black underline">{t.demo.tutorName}</strong> ({t.demo.date} {t.demo.time ? `at ${t.demo.time}` : ''})</span>
                             </span>
                             <div className="flex items-center gap-1.5 flex-wrap">
                               <button
                                 onClick={() => setSelectedDemoDetails(t.demo)}
                                 className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                               >
                                 Demo Details
                               </button>
                               <button
                                 onClick={() => {
                                   const tid = t.demo.tutorCode || t.demo.tutorId || t.demo.tutor?.id || t.demo.tutorName;
                                   navigateToTutorProfile(tid);
                                 }}
                                 className="text-[11px] bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                                 title="View Tutor Profile as Guardian"
                               >
                                 <User className="w-3 h-3 text-[#84CC16]" /> View Tutor Profile
                               </button>
                               <button
                                 onClick={() => {
                                   setTutorToConfirm({ tuition: t, demo: t.demo });
                                   setConfirmRating(5);
                                   setConfirmFeedback('');
                                 }}
                                 className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                                 title="Confirm and hire this tutor"
                               >
                                 <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Tutor
                               </button>
                               <button
                                 onClick={() => {
                                   setTutorToCancelDemo({ tuition: t, demo: t.demo });
                                   setCancelDemoReason("Teaching style or pace didn't match student");
                                   setCancelDemoNotes('');
                                 }}
                                 className="text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                                 title="Cancel tutor and request another tutor demo"
                               >
                                 <XCircle className="w-3.5 h-3.5" /> Cancel Tutor (Need Another Demo)
                               </button>
                             </div>
                           </div>
                         )}

                         {t.guardianRequestedReplacement && !t.demo && (
                           <div className="my-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                             <div className="flex items-center gap-2">
                               <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                               <div>
                                 <span className="font-extrabold text-amber-900">Another Tutor Demo Requested</span>
                                 <p className="text-[11px] text-amber-800 font-medium">
                                   Admin has been notified to arrange another demo class. Reason: "{t.replacementReason || 'Need another tutor demo'}".
                                 </p>
                               </div>
                             </div>
                             {appCount > 0 && (
                               <button
                                 onClick={() => openApplicantsModal(t)}
                                 className="text-[11px] bg-amber-700 hover:bg-amber-800 text-white font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer shadow-xs"
                               >
                                 View Other Applicants ({appCount})
                               </button>
                             )}
                           </div>
                         )}

                         {/* Bottom row: applicant count & action buttons */}
                         <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 flex-wrap gap-2">
                            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                              {isConfirmed ? (
                                 <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                   <User className="w-3.5 h-3.5" /> Hired: <strong>{t.tutorName || t.hiredTutorName || 'Tanvir Hossain'}</strong>
                                 </span>
                              ) : (
                                 <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${
                                   appCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'
                                 }`}>
                                   <User className="w-3.5 h-3.5" /> {appCount} Tutor{appCount === 1 ? '' : 's'} Applied
                                 </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {appCount > 0 && (
                                <button
                                  onClick={() => openApplicantsModal(t)}
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                >
                                  <User className="w-3.5 h-3.5 text-[#84CC16]" />
                                  <span>View Applicants ({appCount})</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedJob(t);
                                  setActiveTab('job-details');
                                }}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white font-bold text-xs text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                View Details <ArrowRight className="w-3 h-3 text-slate-400" />
                              </button>

                              {(!isConfirmed && t.status !== 'CANCELLED') && (
                                <button
                                  onClick={() => setTuitionToCancel(t)}
                                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Cancel Request"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Cancel</span>
                                </button>
                              )}

                              {t.status === 'CANCELLED' && (
                                <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
                                  Cancelled
                                </span>
                              )}
                            </div>
                         </div>
                      </div>
                     );
                   })
                 )}
              </div>
           </div>
        </div>

        {/* Upcoming Demos Column */}
        <div>
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs sticky top-20">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                 <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-indigo-500" /> Upcoming Demos
                 </h3>
                 <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                   {demos.length} Active
                 </span>
              </div>
              <div className="p-4 space-y-4">
                 {demos.length === 0 ? (
                   <div className="p-6 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
                     <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                     <p className="text-slate-600 font-bold text-xs">No Demos Scheduled Yet</p>
                     <p className="text-[11px] text-slate-400">Select an applicant from your tuition requests to request a demo class from admin.</p>
                   </div>
                 ) : (
                   demos.map(d => (
                      <div key={d.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3">
                         <div className="flex justify-between items-start">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                              {d.status || 'Scheduled'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 text-right">
                              {d.tuitionId || d.jobCode || 'Tuition Demo'}
                            </span>
                         </div>
                         <div className="flex items-center gap-3">
                            <img 
                              src={d.avatar || d.tutor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(d.tutorName || 'Karim')}`} 
                              alt={d.tutorName || d.tutor?.name} 
                              className="w-11 h-11 rounded-full border border-slate-200 object-cover bg-white" 
                            />
                            <div>
                               <h4 className="font-black text-slate-900 text-sm">{d.tutorName || d.tutor?.name || 'Tutor'}</h4>
                               <p className="text-xs text-slate-500 font-medium truncate max-w-[170px]">
                                 {d.university || d.tutor?.university || 'Dhaka University'}
                               </p>
                            </div>
                         </div>
                         <div className="space-y-1.5 p-2.5 bg-white/80 rounded-xl border border-indigo-100 text-xs text-slate-700 font-medium">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> 
                              <span>{d.date || 'Upcoming'}</span>
                            </p>
                            {d.time && (
                              <p className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" /> 
                                <span>{d.time}</span>
                              </p>
                            )}
                            {d.location && (
                              <p className="flex items-center gap-2 text-slate-600 truncate">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                                <span className="truncate">{d.location}</span>
                              </p>
                            )}
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                           <button 
                             onClick={() => setSelectedDemoDetails(d)}
                             className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                           >
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Demo Details
                           </button>
                           <button 
                             onClick={() => {
                               const tid = d.tutorCode || d.tutorId || d.tutor?.id || d.tutorName;
                               navigateToTutorProfile(tid);
                             }}
                             className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                             title="View Tutor Profile as Guardian"
                           >
                              <User className="w-3.5 h-3.5 text-[#84CC16]" /> View Profile
                           </button>
                         </div>
                         {d.status !== 'Winner Selected' && (
                           <div className="grid grid-cols-2 gap-2 pt-1">
                             <button 
                               onClick={() => {
                                 const matchedT = tuitions.find(t => t.id === d.tuitionId || t.jobCode === d.tuitionId || t.id === d.jobCode);
                                 setTutorToConfirm({ tuition: matchedT || d, demo: d });
                                 setConfirmRating(5);
                                 setConfirmFeedback('');
                               }}
                               className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                             >
                               <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Tutor
                             </button>
                             <button 
                               onClick={() => {
                                 const matchedT = tuitions.find(t => t.id === d.tuitionId || t.jobCode === d.tuitionId || t.id === d.jobCode);
                                 setTutorToCancelDemo({ tuition: matchedT || d, demo: d });
                                 setCancelDemoReason("Teaching style or pace didn't match student");
                                 setCancelDemoNotes('');
                               }}
                               className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer text-center"
                             >
                               <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancel Tutor
                             </button>
                           </div>
                         )}
                      </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* ================= MODAL: WHO APPLIED FOR TUITION ================= */}
      {selectedTuitionForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 text-[10px] font-black uppercase">
                    ID: {selectedTuitionForApplicants.id || selectedTuitionForApplicants.jobCode}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Budget: ৳ {selectedTuitionForApplicants.salary}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Tutors Who Applied for {selectedTuitionForApplicants.title || selectedTuitionForApplicants.subject}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTuitionForApplicants(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success notification if just selected */}
            {selectionSuccessMessage && (
              <div className="m-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs font-bold">
                  {selectionSuccessMessage}
                </div>
              </div>
            )}

            {/* Body: Applicants List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {loadingApplicants ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#84CC16] animate-spin mx-auto" />
                  <p className="text-slate-500 font-bold text-xs">Loading applied tutors...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <User className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-slate-700 font-extrabold text-sm">No applications yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Tutors reviewing this request will submit their applications soon.
                  </p>
                </div>
              ) : (
                applicants.map((applicant) => {
                  const isSelected = applicant.isSelected || 
                    (selectedTuitionForApplicants.guardianSelectedTutor?.id === (applicant.tutorCode || applicant.tutorId));
                  const isScheduled = applicant.demoStatus === 'Scheduled';

                  return (
                    <div 
                      key={applicant.id || applicant.tutorCode}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'border-purple-300 bg-purple-50/40 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-[#84CC16] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <img 
                            src={applicant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(applicant.name)}`}
                            alt={applicant.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-slate-900 text-base">{applicant.name}</h4>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-200 flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3 text-[#65A30D]" /> {applicant.tutorCode || 'VERIFIED'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5 mt-0.5">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              <span>{applicant.university}</span>
                              {applicant.department && <span className="text-slate-400">• {applicant.department}</span>}
                            </p>

                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold flex-wrap">
                              {applicant.experience && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                  💼 {applicant.experience} experience
                                </span>
                              )}
                              {applicant.area && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                  📍 {applicant.area}, {applicant.district || 'Dhaka'}
                                </span>
                              )}
                              {applicant.appliedAt && (
                                <span className="text-slate-400">
                                  Applied {formatTimeAgo(applicant.appliedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Salary Request */}
                        {applicant.expectedSalary && (
                          <div className="text-right shrink-0">
                            <span className="block text-[10px] uppercase font-extrabold text-slate-400">Demand</span>
                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg inline-block">
                              ৳ {applicant.expectedSalary}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contact & Experience Row (matching Admin view) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mt-3">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px]">Phone Number</span>
                          <span className="font-bold text-slate-800">
                            {applicant.phone ? `${applicant.phone.substring(0, 3)}****${applicant.phone.substring(applicant.phone.length - 2)} (Verified)` : '017****71 (Verified)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px]">Email Address</span>
                          <span className="font-bold text-slate-800 truncate block">
                            {applicant.email ? (applicant.email.includes('@') ? `${applicant.email.substring(0, 2)}***@${applicant.email.split('@')[1]}` : 'Protected') : 'Protected'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px]">Tutoring Experience</span>
                          <span className="font-bold text-slate-800">{applicant.experience || '2+ years'}</span>
                        </div>
                      </div>

                      {/* Tutor's Pitch Note */}
                      {applicant.message && (
                        <div className="mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 italic flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p>"{applicant.message}"</p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const tid = applicant.tutorCode || applicant.tutorId || applicant.id;
                              setSelectedTuitionForApplicants(null);
                              navigateToTutorProfile(tid);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            title="View Full Tutor Profile as Guardian"
                          >
                            <User className="w-3.5 h-3.5 text-[#84CC16]" />
                            <span>View Tutor Profile</span>
                          </button>
                          <button
                            onClick={() => setPreviewTutor(applicant)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Quick View</span>
                          </button>
                        </div>

                        <div>
                          {isScheduled ? (
                            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Demo Scheduled by Admin</span>
                            </div>
                          ) : isSelected ? (
                            <div className="px-3.5 py-1.5 rounded-xl bg-purple-100 text-purple-800 font-black text-xs flex items-center gap-1.5 border border-purple-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                              <span>Selected • Sent to Admin for Demo</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setTutorToSelectForDemo(applicant)}
                              className="px-4 py-2 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-98 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Select for Demo Class</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Selecting a tutor notifies our admin team to arrange the demo schedule.</span>
              <button 
                onClick={() => setSelectedTuitionForApplicants(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DEMO SELECTION FOR ADMIN ================= */}
      {tutorToSelectForDemo && selectedTuitionForApplicants && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#84CC16]" /> Request Demo Class
              </h3>
              <button 
                onClick={() => setTutorToSelectForDemo(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-lime-50/70 border border-lime-200 flex items-center gap-3">
              <img 
                src={tutorToSelectForDemo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorToSelectForDemo.name)}`}
                alt={tutorToSelectForDemo.name}
                className="w-12 h-12 rounded-xl object-cover bg-white"
              />
              <div>
                <h4 className="font-black text-slate-900 text-sm">{tutorToSelectForDemo.name}</h4>
                <p className="text-xs text-slate-600 font-medium">{tutorToSelectForDemo.university}</p>
                <p className="text-[11px] text-[#65A30D] font-bold">Demand: ৳ {tutorToSelectForDemo.expectedSalary || selectedTuitionForApplicants.salary}/mo</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">How demo assignment works:</p>
              <p>1. When you select this tutor, your request is submitted directly to the <strong>TutorLink Admin</strong>.</p>
              <p>2. The Admin will contact the tutor, confirm timing, and assign the trial/demo class schedule.</p>
              <p>3. You will see the scheduled demo with meeting link or location on your Parent Dashboard!</p>
            </div>

            <form onSubmit={handleSelectTutorForDemo} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Date & Time (Optional)
                </label>
                <input 
                  type="text" 
                  value={preferredDemoDate}
                  onChange={(e) => setPreferredDemoDate(e.target.value)}
                  placeholder="e.g. Tomorrow at 5:00 PM / Weekday evenings"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#84CC16] outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note for Admin (Optional)
                </label>
                <textarea 
                  value={demoNotes}
                  onChange={(e) => setDemoNotes(e.target.value)}
                  placeholder="Any special instructions for the demo (e.g. prefer online Google Meet, focus on Chapter 3)"
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#84CC16] outline-hidden font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTutorToSelectForDemo(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSelection}
                  className="flex-1 py-3 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] disabled:opacity-50 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingSelection ? (
                    <span>Sending to Admin...</span>
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

      {/* ================= MODAL: TUTOR PROFILE PREVIEW ================= */}
      {previewTutor && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={previewTutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(previewTutor.name)}`}
                  alt={previewTutor.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{previewTutor.name}</h3>
                  <span className="text-[11px] font-bold text-[#65A30D] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Registered Tutor ({previewTutor.tutorCode || 'TUT'})
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewTutor(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm">Educational Background</p>
                <p className="text-slate-700"><strong>University:</strong> {previewTutor.university || 'University Graduate'}</p>
                <p className="text-slate-700"><strong>Department:</strong> {previewTutor.department || 'General'}</p>
                <p className="text-slate-700"><strong>Academic Year:</strong> {previewTutor.academicYear || 'Graduated / Final Year'}</p>
                {previewTutor.studentId && (
                  <p className="text-slate-700"><strong>Student ID:</strong> {previewTutor.studentId} (Verified)</p>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm">Tutoring Details</p>
                <p className="text-slate-700"><strong>Experience:</strong> {previewTutor.experience || '2+ years'}</p>
                <p className="text-slate-700"><strong>Preferred Area:</strong> {previewTutor.area || 'Dhaka'}, {previewTutor.district || 'Dhaka'}</p>
                <p className="text-slate-700"><strong>Mediums:</strong> {Array.isArray(previewTutor.mediums) ? previewTutor.mediums.join(', ') : 'Bangla Medium, English Version'}</p>
                <p className="text-slate-700"><strong>Expected Salary:</strong> ৳ {previewTutor.expectedSalary || 'Negotiable'}/month</p>
              </div>

              {previewTutor.message && (
                <div className="p-3.5 bg-lime-50/50 rounded-xl border border-lime-200">
                  <p className="font-bold text-[#65A30D] mb-1">Tutor's Note for Parent</p>
                  <p className="text-slate-700 leading-relaxed italic">"{previewTutor.message}"</p>
                </div>
              )}
            </div>

            <div className="pt-3 flex gap-2 flex-wrap">
              <button
                onClick={() => setPreviewTutor(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const tid = previewTutor.tutorCode || previewTutor.tutorId || previewTutor.id;
                  setPreviewTutor(null);
                  setSelectedTuitionForApplicants(null);
                  navigateToTutorProfile(tid);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>View Full Profile</span>
              </button>
              {selectedTuitionForApplicants && (
                <button
                  onClick={() => {
                    const tutor = previewTutor;
                    setPreviewTutor(null);
                    setTutorToSelectForDemo(tutor);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Select for Demo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEMO DETAILS ================= */}
      {selectedDemoDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" /> Demo Class Details
              </h3>
              <button 
                onClick={() => setSelectedDemoDetails(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedDemoDetails.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedDemoDetails.tutorName || 'Karim')}`} 
                  alt={selectedDemoDetails.tutorName}
                  className="w-12 h-12 rounded-full border border-white object-cover bg-white"
                />
                <div>
                  <h4 className="font-black text-slate-900 text-base">{selectedDemoDetails.tutorName || 'Tutor'}</h4>
                  <p className="text-xs text-slate-600 font-medium">{selectedDemoDetails.university || 'Dhaka University'}</p>
                </div>
              </div>
              <div className="pt-2 text-xs text-slate-700 space-y-1">
                <p><strong>Scheduled Date:</strong> {selectedDemoDetails.date || 'Scheduled'}</p>
                {selectedDemoDetails.time && <p><strong>Time:</strong> {selectedDemoDetails.time}</p>}
                {selectedDemoDetails.location && <p><strong>Address/Location:</strong> {selectedDemoDetails.location}</p>}
                {selectedDemoDetails.notes && <p><strong>Admin Notes:</strong> {selectedDemoDetails.notes}</p>}
              </div>
            </div>

            <button
              onClick={() => {
                const tid = selectedDemoDetails.tutorCode || selectedDemoDetails.tutorId || selectedDemoDetails.tutor?.id || selectedDemoDetails.tutorName;
                setSelectedDemoDetails(null);
                navigateToTutorProfile(tid);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#84CC16]" /> View Tutor Profile
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  const demo = selectedDemoDetails;
                  const matchedT = tuitions.find(t => t.id === demo.tuitionId || t.jobCode === demo.tuitionId || t.id === demo.jobCode);
                  setSelectedDemoDetails(null);
                  setTutorToConfirm({ tuition: matchedT || demo, demo });
                  setConfirmRating(5);
                  setConfirmFeedback('');
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Tutor
              </button>
              <button
                onClick={() => {
                  const demo = selectedDemoDetails;
                  const matchedT = tuitions.find(t => t.id === demo.tuitionId || t.jobCode === demo.tuitionId || t.id === demo.jobCode);
                  setSelectedDemoDetails(null);
                  setTutorToCancelDemo({ tuition: matchedT || demo, demo });
                  setCancelDemoReason("Teaching style or pace didn't match student");
                  setCancelDemoNotes('');
                }}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Tutor
              </button>
            </div>

            <button
              onClick={() => setSelectedDemoDetails(null)}
              className="w-full py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANCEL TUITION REQUEST ================= */}
      {tuitionToCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Cancel Tuition Request
              </h3>
              <button 
                onClick={() => setTuitionToCancel(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-1">
              <p className="font-bold">Are you sure you want to cancel this request?</p>
              <p>Tuition: <strong>{tuitionToCancel.title || tuitionToCancel.id}</strong></p>
              <p className="text-[11px] text-rose-600">This will close all active applications and notify the admin team.</p>
            </div>

            <form onSubmit={handleCancelTuition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Cancellation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-400 outline-hidden bg-white"
                  required
                >
                  <option value="Found another tutor offline / personal contact">Found another tutor offline / personal contact</option>
                  <option value="Student changed mind / Schedule conflict">Student changed mind / Schedule conflict</option>
                  <option value="Tuition budget constraints">Tuition budget constraints</option>
                  <option value="Relocating to another area / address changed">Relocating to another area / address changed</option>
                  <option value="Unhappy with applicant responses">Unhappy with applicant responses</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={cancelDetails}
                  onChange={(e) => setCancelDetails(e.target.value)}
                  placeholder="Tell us more about why you're cancelling so we can improve our service..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-400 outline-hidden"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTuitionToCancel(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Keep Request Active
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {isCancelling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEMO OUTCOME & HIRE DECISION ================= */}
      {demoToDecide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Demo Class Decision
                </h3>
                <p className="text-xs text-slate-500 font-medium">Please submit your feedback following the trial class.</p>
              </div>
              <button 
                onClick={() => setDemoToDecide(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {decisionSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{decisionSuccessMsg}</span>
              </div>
            )}

            {/* Tutor info banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img 
                src={demoToDecide.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(demoToDecide.tutorName || 'Tutor')}`} 
                alt={demoToDecide.tutorName}
                className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200"
              />
              <div>
                <h4 className="font-black text-slate-900 text-sm">{demoToDecide.tutorName || 'Tutor'}</h4>
                <p className="text-xs text-slate-600 font-medium">{demoToDecide.university || 'University Mentor'}</p>
                <p className="text-[11px] text-slate-500 font-bold">Demo Date: {demoToDecide.date || 'Completed'}</p>
              </div>
            </div>

            <form onSubmit={handleDemoDecision} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Your Decision for this Tutor:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTrialDecision('HIRE')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      trialDecision === 'HIRE' 
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🎉</span>
                      <strong className="text-xs font-black text-slate-900">Hire Tutor</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Satisfied with demo. Lock in this tutor and start classes!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrialDecision('REPLACE')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      trialDecision === 'REPLACE' 
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🔄</span>
                      <strong className="text-xs font-black text-slate-900">Try Another</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Request another tutor from your shortlisted applicants.
                    </p>
                  </button>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rate the Demo Class:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setGuardianRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= guardianRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {guardianRating === 5 ? 'Excellent (5/5)' : guardianRating === 4 ? 'Good (4/5)' : `${guardianRating} Stars`}
                  </span>
                </div>
              </div>

              {/* Feedback comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Feedback or Notes (Optional)
                </label>
                <textarea
                  value={guardianFeedback}
                  onChange={(e) => setGuardianFeedback(e.target.value)}
                  placeholder="Share details on teaching style, punctuality, or why you made this choice..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-400 outline-hidden"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDemoToDecide(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDecision}
                  className={`flex-1 py-2.5 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    trialDecision === 'HIRE' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isSubmittingDecision ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSubmittingDecision ? 'Submitting...' : trialDecision === 'HIRE' ? 'Confirm Hire' : 'Request Replacement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: CONFIRM TUTOR & HIRE ================= */}
      {tutorToConfirm && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirm & Hire Tutor
              </h3>
              <button 
                onClick={() => setTutorToConfirm(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{confirmSuccessMsg}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
              <img 
                src={tutorToConfirm.demo?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorToConfirm.demo?.tutorName || 'Tutor')}`}
                alt={tutorToConfirm.demo?.tutorName}
                className="w-12 h-12 rounded-xl object-cover bg-white border border-emerald-200"
              />
              <div>
                <h4 className="font-black text-slate-900 text-base">{tutorToConfirm.demo?.tutorName || 'Assigned Tutor'}</h4>
                <p className="text-xs text-slate-600 font-medium">{tutorToConfirm.demo?.university || 'University Mentor'}</p>
                <p className="text-[11px] text-emerald-700 font-bold">
                  Tuition: {tutorToConfirm.tuition?.title || tutorToConfirm.tuition?.subject || 'Tuition Job'}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmTutorSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Demo Experience Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setConfirmRating(star)}
                      className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Star 
                        className={`w-6 h-6 ${star <= confirmRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-1">{confirmRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Starting Notes or Feedback (Optional)
                </label>
                <textarea
                  value={confirmFeedback}
                  onChange={(e) => setConfirmFeedback(e.target.value)}
                  placeholder="e.g. Pleased with the demo! We would like to start regular classes from next Saturday."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-400 outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                ✅ Once confirmed, this tutor will be officially hired for this tuition request and admin will be notified immediately.
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTutorToConfirm(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConfirm}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingConfirm ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isSubmittingConfirm ? 'Confirming...' : 'Confirm & Hire Tutor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANCEL TUTOR (ANOTHER TUTOR DEMO NEEDED) ================= */}
      {tutorToCancelDemo && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" /> Cancel Tutor & Request Another Demo
                </h3>
                <p className="text-xs text-slate-500 font-medium">Admin will be notified to arrange another demo class.</p>
              </div>
              <button 
                onClick={() => setTutorToCancelDemo(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelDemoSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cancelDemoSuccessMsg}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center gap-3">
              <img 
                src={tutorToCancelDemo.demo?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorToCancelDemo.demo?.tutorName || 'Tutor')}`}
                alt={tutorToCancelDemo.demo?.tutorName}
                className="w-12 h-12 rounded-xl object-cover bg-white border border-rose-200"
              />
              <div>
                <h4 className="font-black text-slate-900 text-sm">Cancelling Demo with: {tutorToCancelDemo.demo?.tutorName}</h4>
                <p className="text-xs text-slate-600 font-medium">{tutorToCancelDemo.demo?.university}</p>
                <p className="text-[11px] text-rose-700 font-bold">
                  Tuition: {tutorToCancelDemo.tuition?.title || tutorToCancelDemo.tuition?.subject}
                </p>
              </div>
            </div>

            <form onSubmit={handleCancelDemoSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Requesting Another Tutor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cancelDemoReason}
                  onChange={(e) => setCancelDemoReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-400 outline-hidden bg-white"
                  required
                >
                  <option value="Teaching style or pace didn't match student">Teaching style or pace didn't match student</option>
                  <option value="Subject expertise or curriculum need">Looking for different subject expertise / background</option>
                  <option value="Schedule or timing conflict">Schedule or timing conflict</option>
                  <option value="Want to try another tutor from applicant list">Want to interview another tutor from applied list</option>
                  <option value="Student was not comfortable with the trial class">Student was not comfortable with the trial class</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes for Admin Team (Optional)
                </label>
                <textarea
                  value={cancelDemoNotes}
                  onChange={(e) => setCancelDemoNotes(e.target.value)}
                  placeholder="Specify any preferences for the next tutor (e.g. prefer experienced female tutor, weekday mornings only)..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-400 outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                🔔 <strong>Admin Notification:</strong> Your feedback will be delivered instantly to platform administrators. They will review your tuition and coordinate another tutor demo promptly.
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTutorToCancelDemo(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Keep Current Tutor
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancelDemo}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCancelDemo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSubmittingCancelDemo ? 'Submitting...' : 'Cancel & Request Another Tutor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
