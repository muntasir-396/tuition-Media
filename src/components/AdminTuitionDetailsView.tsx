import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminTuitionEditModal } from "./tuition/AdminTuitionEditModal";
import { formatTimeAgo } from "../lib/dateUtils";

import { MapPin, DollarSign, Activity, CheckCircle, XCircle, Users, BookOpen, Clock, Calendar, MessageSquare, ArrowLeft, Edit, User, GraduationCap, Phone, Mail, Award, CheckCircle2, Eye, ShieldCheck, Briefcase, BookMarked, Ban } from 'lucide-react';

export const AdminTuitionDetailsView: React.FC = () => {
  const { setActiveTab, adminSelectedTuitionId, navigateToTutorProfile, blockTutor } = useApp();
  const [tuition, setTuition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States for right panel
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianAltPhone, setGuardianAltPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [address, setAddress] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  
  const [savingDetails, setSavingDetails] = useState(false);
  const [showAppliedTutors, setShowAppliedTutors] = useState(false);
  const [appliedTutors, setAppliedTutors] = useState<any[]>([]);
  const [selectedTutorProfile, setSelectedTutorProfile] = useState<any>(null);
  const [demoDate, setDemoDate] = useState('');
  const [demoTutor, setDemoTutor] = useState('');
  const [showDemoSchedule, setShowDemoSchedule] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveNote, setArchiveNote] = useState('');
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [confirmTutorId, setConfirmTutorId] = useState('');
  const [customTutorInput, setCustomTutorInput] = useState('');
  const [confirmStartDate, setConfirmStartDate] = useState('');
  const [confirmPaymentAmount, setConfirmPaymentAmount] = useState('');
  const [confirmPaymentDate, setConfirmPaymentDate] = useState('');
  const [isSchedulingDemo, setIsSchedulingDemo] = useState(false);
  const [tuitionDemos, setTuitionDemos] = useState<any[]>([]);

  const handleScheduleDemoSubmit = async () => {
    if (!demoTutor || !demoDate) {
      alert("Please select a tutor and choose a date & time for the demo class.");
      return;
    }
    setIsSchedulingDemo(true);
    try {
      const primaryId = tuition.id || adminSelectedTuitionId;
      const res = await fetch(`/api/admin/tuitions/${primaryId}/schedule-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: demoTutor,
          demoDate: demoDate
        })
      });

      if (res.ok) {
        setShowDemoSchedule(false);
        alert(`Success: Demo class scheduled for ${new Date(demoDate).toLocaleString()}! The tutor has received an instant notification.`);
        await fetchTuitionDetails();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to schedule demo');
      }
    } catch (e) {
      console.error(e);
      alert('Error scheduling demo');
    } finally {
      setIsSchedulingDemo(false);
    }
  };

  const handleBlockApplicantTutor = async (tutor: any) => {
    const isCurrentlyBlocked = tutor.status === 'blocked';
    const newStatus = isCurrentlyBlocked ? 'active' : 'blocked';
    const ok = await blockTutor(tutor.tutorCode || tutor.tutorId || tutor.id, newStatus);
    if (ok) {
      setSelectedTutorProfile((prev: any) => prev ? { ...prev, status: newStatus } : null);
      setAppliedTutors(prev => prev.map(a => 
        (a.tutorId === tutor.tutorId || a.tutorCode === tutor.tutorCode) ? { ...a, status: newStatus } : a
      ));
    }
  };

  useEffect(() => {
    if (!adminSelectedTuitionId) {
      setActiveTab('admin-tuitions');
      return;
    }
    fetchTuitionDetails();

    const handleRealtime = () => {
      fetchTuitionDetails();
    };
    window.addEventListener('tutorlink:job-applied', handleRealtime);
    return () => window.removeEventListener('tutorlink:job-applied', handleRealtime);
  }, [adminSelectedTuitionId]);

  
  const fetchTuitionDetails = async () => {
    setLoading(true);
    let current = null;
    try {
      const response = await fetch('/api/admin/tuitions');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          current = data.find((t: any) => t.id === adminSelectedTuitionId || (t.id && t.id.includes(adminSelectedTuitionId)));
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    
    if (current) {
      setTuition(current);
      setGuardianName(current.guardianName || '');
      setGuardianPhone(current.guardianPhone || '');
      setGuardianAltPhone(current.guardianAltPhone || '');
      setGuardianRelation(current.guardianRelation || '');
      setAddress(current.location || '');
      setAdminNotes(current.adminNotes || '');
      
      try {
        const primaryId = current.id || adminSelectedTuitionId;
        let appsRes = await fetch(`/api/admin/tuitions/${primaryId}/applications`);
        let appsData = appsRes.ok ? await appsRes.json() : [];
        if ((!appsData || appsData.length === 0) && current.realId && current.realId !== primaryId) {
          appsRes = await fetch(`/api/admin/tuitions/${current.realId}/applications`);
          if (appsRes.ok) appsData = await appsRes.json();
        }
        if (Array.isArray(appsData)) {
          setAppliedTutors(appsData);
          setTuition(prev => prev ? { ...prev, applications: appsData.length } : null);
        }

        const dRes = await fetch(`/api/admin/tuitions/${primaryId}/demos`);
        if (dRes.ok) {
          const dData = await dRes.json();
          setTuitionDemos(dData.demos || []);
        }
      } catch (err) {}
    } else {
      // Prevent infinite loading state
      setTuition({ id: adminSelectedTuitionId, title: 'Unknown Tuition', notFound: true });
    }
    
    setLoading(false);
  };

  
  const updateTuitionInStorage = async (updatedFields: any) => {
    try {
      if (!tuition || !tuition.id) return;
      const primaryId = tuition.id || adminSelectedTuitionId;
      const realId = tuition.realId || tuition.id;

      if (updatedFields.status) {
        try {
          await fetch(`/api/admin/tuitions/${primaryId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: updatedFields.status, targetStatus: updatedFields.status })
          });
          if (realId && realId !== primaryId) {
            await fetch(`/api/admin/tuitions/${realId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: updatedFields.status, targetStatus: updatedFields.status })
            });
          }
        } catch (e) {}
      }

      const response = await fetch(`/api/admin/tuitions/${realId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        setTuition((prev: any) => ({ ...prev, ...updatedFields }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveModal = async (formData: any) => {
    await updateTuitionInStorage(formData);
    setIsEditModalOpen(false);
    await fetchTuitionDetails();
    alert('Success: Tuition details and status updated!');
  };

  const handleSaveDetails = async () => {
    setSavingDetails(true);
    await updateTuitionInStorage({
      guardianName,
      guardianPhone,
      guardianAltPhone,
      guardianRelation,
      location: address,
      adminNotes
    });
    await fetchTuitionDetails();
    setSavingDetails(false);
    alert('Success: Guardian details saved!');
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      const primaryId = tuition?.id || adminSelectedTuitionId;
      const realId = tuition?.realId || tuition?.id;

      await fetch(`/api/admin/tuitions/${primaryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, targetStatus: status })
      });

      if (realId && realId !== primaryId) {
        await fetch(`/api/admin/tuitions/${realId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, targetStatus: status })
        });
      }

      await updateTuitionInStorage({ status });
      setTuition((prev: any) => prev ? { ...prev, status } : prev);
      await fetchTuitionDetails();
      
      if (status === 'OPEN') {
        alert('Success: Tuition approved! It is now published and live for tutors to view and apply.');
      } else {
        alert(`Tuition status updated to ${status}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  const handleArchive = async () => {
    await updateTuitionInStorage({ adminNotes: archiveNote, status: 'ARCHIVED' });
    setShowArchiveDialog(false);
    fetchTuitionDetails();
  };

  const activeDemo = tuitionDemos.length > 0 ? tuitionDemos[0] : (
    tuition?.demoTutor ? {
      tutorCode: tuition.demoTutor,
      tutorId: tuition.demoTutor,
      tutorName: tuition.demoTutorName || tuition.demoTutor,
      date: tuition.demoSchedule,
      guardianPhone: tuition.demoTutorPhone || tuition.guardianPhone,
      guardianName: tuition.guardianName,
      status: 'Scheduled'
    } : null
  );

  const handleOpenConfirmModal = () => {
    const defaultTutor = activeDemo?.tutorCode || activeDemo?.tutorId || tuition?.demoTutor || tuition?.assignedTutorId || (appliedTutors[0]?.tutorCode || appliedTutors[0]?.tutorId) || '';
    setConfirmTutorId(defaultTutor);
    setCustomTutorInput(defaultTutor);

    if (!confirmPaymentAmount && tuition?.salary) {
      const cleanSalary = String(tuition.salary).replace(/[^0-9]/g, '');
      setConfirmPaymentAmount(cleanSalary || String(tuition.salary));
    }
    if (!confirmStartDate) {
      setConfirmStartDate(new Date().toISOString().split('T')[0]);
    }
    if (!confirmPaymentDate) {
      setConfirmPaymentDate(new Date().toISOString().split('T')[0]);
    }
    setShowConfirmModal(true);
  };

  const handleConfirmTuition = async () => {
    const finalTutor = confirmTutorId === 'custom' ? customTutorInput : confirmTutorId;
    if (!finalTutor) {
      alert('Please select or enter the tutor to assign for this tuition.');
      return;
    }

    try {
      await updateTuitionInStorage({
        status: 'CONFIRMED',
        assignedTutorId: finalTutor,
        confirmedStartDate: confirmStartDate
      });

      if (confirmPaymentAmount) {
        try {
          await fetch('/api/admin/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tuitionId: tuition?.id || adminSelectedTuitionId,
              tutorId: finalTutor,
              amount: confirmPaymentAmount,
              date: confirmPaymentDate || new Date().toISOString(),
              method: 'Cash / Mobile Banking',
              status: 'Pending'
            })
          });
        } catch (payErr) {}
      }

      setShowConfirmModal(false);
      alert(`Success: Tuition confirmed and assigned to Tutor ${finalTutor}! Payment entry generated.`);
      await fetchTuitionDetails();
      setConfirmTutorId('');
      setConfirmStartDate('');
      setConfirmPaymentAmount('');
      setConfirmPaymentDate('');
      setCustomTutorInput('');
    } catch (e) {
      console.error(e);
      alert('Error confirming tuition assignment');
    }
  };

  if (loading || !tuition) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab("admin-tuitions")} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">Tuition {tuition.id}</h2>
              <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Published {formatTimeAgo(tuition.postedAt || tuition.createdAt)}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Detailed view and administration.</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <Edit className="w-4 h-4" /> Edit Job Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Existing Content style) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Demo Assignment Banner */}
          {activeDemo && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Calendar className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-slate-900 text-base">Currently in Demo / Trial Class</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-extrabold text-[10px] uppercase tracking-wide animate-pulse">
                        Trial in Progress
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 font-medium mt-0.5">
                      This tutor has been assigned for the trial class. Admin can confirm and finalize this assignment below.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenConfirmModal}
                  className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform hover:scale-102 cursor-pointer shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm This Tutor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Assigned Tutor</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">{activeDemo.tutorName || activeDemo.tutorCode}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">{activeDemo.tutorCode || activeDemo.tutorId}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Scheduled Trial Date</span>
                  <span className="font-extrabold text-amber-900 text-sm block">
                    {activeDemo.date ? new Date(activeDemo.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Scheduled'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">Guardian Contact</span>
                  <span className="font-bold text-slate-900 text-xs block truncate">{tuition.guardianName || activeDemo.guardianName || 'Guardian'}</span>
                  <span className="font-semibold text-slate-600 text-[11px] block">📞 {tuition.guardianPhone || activeDemo.guardianPhone || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Student Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Job ID</span>
                <span className="font-bold text-slate-800">{tuition.id}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Published</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {formatTimeAgo(tuition.postedAt || tuition.createdAt)}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Category</span>
                <span className="font-bold text-slate-800">{tuition.category || tuition.curriculum || (tuition.course ? `Class ${tuition.course}` : 'General')}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Course</span>
                <span className="font-bold text-slate-800">{tuition.course || tuition.courseClass || tuition.curriculum || 'N/A'}</span>
              </div>
              <div className="col-span-2 md:col-span-3">
                <span className="block text-slate-500 text-xs font-semibold mb-1">Subjects</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.isArray(tuition.subjects) && tuition.subjects.length > 0 ? tuition.subjects.map((sub: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">{sub}</span>
                  )) : <span className="font-bold text-slate-800">{typeof tuition.subjects === 'string' && tuition.subjects ? tuition.subjects : 'N/A'}</span>}
                </div>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Days Per Week</span>
                <span className="font-bold text-slate-800">{tuition.daysPerWeek || '3 days'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Time</span>
                <span className="font-bold text-slate-800">{tuition.time || tuition.preferredTime || 'Flexible'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Duration</span>
                <span className="font-bold text-slate-800">{tuition.duration || '1 Hour'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Method</span>
                <span className="font-bold text-slate-800">{tuition.method || 'Home Tutoring'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Salary</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  ৳ {tuition.salary ? (isNaN(Number(tuition.salary)) ? tuition.salary : Number(tuition.salary).toLocaleString()) : 'Negotiable'}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Student Gender</span>
                <span className="font-bold text-slate-800">{tuition.studentGender || 'Mix'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-amber-500" />
              Tutor Requirements
            </h3>
            <div className="space-y-4">
               <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Preferred Tutor Gender</span>
                <span className="font-bold text-slate-800">{tuition.tutorGender || tuition.preferredTutorGender || 'Any'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs font-semibold mb-1">Additional Notes</span>
                <p className="font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                  {tuition.notes || tuition.parentSpecialInstructions || 'No additional notes provided.'}
                </p>
              </div>


            </div>
          </div>

          {/* APPLIED TUTORS SECTION - Prominently displayed right on the main details page */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#84CC16]" />
                <h3 className="text-lg font-black text-slate-900">
                  Applied Tutors ({appliedTutors.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {appliedTutors.length} Application{appliedTutors.length === 1 ? '' : 's'} Received
              </span>
            </div>

            {appliedTutors.length === 0 ? (
              <div className="py-10 text-center space-y-2 text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-700 text-sm">No tutors have applied yet</p>
                <p className="text-xs text-slate-400">Applications submitted for this job will appear here with full credentials.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedTutors.map((tutor) => (
                  <div
                    key={tutor.id || tutor.tutorCode}
                    className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-[#84CC16] hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-lime-100 text-[#65A30D] font-black text-base flex items-center justify-center shrink-0 border border-lime-200 uppercase">
                          {tutor.name ? tutor.name.substring(0, 2) : 'TU'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-base text-slate-900">{tutor.name}</h4>
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300">
                              {tutor.tutorCode || 'TT-1001'}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              tutor.status === 'blocked' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {tutor.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-1">
                            <GraduationCap className="w-4 h-4 text-slate-500" />
                            <span>{tutor.university || 'University'} • {tutor.department || 'Department'}</span>
                          </p>
                        </div>
                      </div>

                      {tutor.expectedSalary && (
                        <div className="text-right shrink-0">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Expected Salary</span>
                          <span className="text-sm font-black text-emerald-700">৳ {tutor.expectedSalary}/mo</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 px-3 bg-white rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Phone Number</span>
                        <span className="font-bold text-slate-800">{tutor.phone || '017XXXXXXXX'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Email Address</span>
                        <span className="font-bold text-slate-800 truncate block">{tutor.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Experience</span>
                        <span className="font-bold text-slate-800">{tutor.experience || '2+ years'}</span>
                      </div>
                    </div>

                    {tutor.message && (
                      <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-700 font-medium italic">
                        "{tutor.message}"
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Applied: {tutor.appliedAt ? new Date(tutor.appliedAt).toLocaleString() : 'Recent'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const tid = tutor.tutorCode || tutor.tutorId || tutor.id;
                            navigateToTutorProfile(tid);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="View Full Profile Page"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </button>
                        <button
                          onClick={() => setSelectedTutorProfile(tutor)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Quick Preview Modal"
                        >
                          Quick View
                        </button>
                        <button
                          onClick={() => handleBlockApplicantTutor(tutor)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer border ${
                            tutor.status === 'blocked'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {tutor.status === 'blocked' ? 'Unblock Tutor' : 'Block Tutor'}
                        </button>
                        <button
                          onClick={() => {
                            setDemoTutor(tutor.tutorCode || tutor.id || tutor.name);
                            setShowDemoSchedule(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black text-xs transition-colors cursor-pointer"
                        >
                          Assign Demo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Dynamic Admin Management Widget) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Action Control Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Activity className="w-4 h-4"/> Status</span>
               <span className={`px-2.5 py-1 font-black text-xs rounded-lg uppercase ${
                 tuition.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                 tuition.status === 'DEMO_SCHEDULED' ? 'bg-amber-100 text-amber-900 border-2 border-amber-300 font-extrabold' :
                 tuition.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                 tuition.status === 'CONFIRMED' ? 'bg-emerald-600 text-white font-extrabold' :
                 'bg-slate-100 text-slate-700'
               }`}>
                 {tuition.status === 'PENDING_REVIEW' ? 'Pending Approval' :
                  tuition.status === 'DEMO_SCHEDULED' ? 'In Demo Class' :
                  tuition.status === 'CONFIRMED' ? 'Confirmed & Assigned' :
                  tuition.status}
               </span>
             </div>

             {/* Approve & Publish Button for Pending Tuitions */}
             {tuition.status === 'PENDING_REVIEW' && (
               <button 
                 onClick={() => handleStatusUpdate('OPEN')} 
                 className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
               >
                 <CheckCircle className="w-5 h-5" /> Approve & Publish Tuition
               </button>
             )}

             {tuition.status === 'OPEN' && (
               <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                 <span>Published & Live on Tuition Jobs</span>
               </div>
             )}

             {tuition.status === 'DEMO_SCHEDULED' && (
               <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                 <span>Trial in Progress: {activeDemo?.tutorName || tuition.demoTutorName || 'Tutor Assigned'}</span>
               </div>
             )}

             <button onClick={handleOpenConfirmModal} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-sm transition-colors cursor-pointer">
               Close & Confirm Job
             </button>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleStatusUpdate('CANCELLED')} className="w-full py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-100 hover:bg-rose-100 transition-colors">
                  Cancel Job
                </button>
                <button onClick={() => setShowArchiveDialog(true)} className="w-full py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 hover:bg-slate-200 transition-colors">
                  Archive Job
                </button>
             </div>
          </div>

          {/* Interactive Workflow Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
             <button onClick={() => setShowAppliedTutors(true)} className="w-full p-4 rounded-xl border border-slate-200 hover:border-[#84CC16] hover:bg-slate-50 flex items-center justify-between group transition-all text-left">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                   <Users className="w-5 h-5" />


                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#84CC16] transition-colors">Applied Tutors</h4>
                   <p className="text-xs font-medium text-slate-500">{appliedTutors.length} application{appliedTutors.length === 1 ? '' : 's'} received</p>
                 </div>
               </div>
             </button>
             <button onClick={() => setShowDemoSchedule(true)} className="w-full p-4 rounded-xl border border-slate-200 hover:border-[#84CC16] hover:bg-slate-50 flex items-center justify-between group transition-all text-left">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                   <Calendar className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#84CC16] transition-colors">Demo Class Schedule</h4>
                   <p className="text-xs font-medium text-slate-500">
                     {activeDemo ? `Assigned: ${activeDemo.tutorName || activeDemo.tutorCode}` : 'Manage trial classes'}
                   </p>
                 </div>
               </div>
             </button>

             {activeDemo && (
               <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                 <div className="flex items-center justify-between">
                   <span className="font-bold flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                     In Demo:
                   </span>
                   <span className="font-black text-amber-900">{activeDemo.tutorName || activeDemo.tutorCode}</span>
                 </div>
                 <div className="text-[11px] text-amber-800 flex items-center justify-between">
                   <span>Demo Time:</span>
                   <span className="font-semibold">{activeDemo.date ? new Date(activeDemo.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}</span>
                 </div>
               </div>
             )}


          </div>

          {/* Guardian Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
             <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Guardian Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Guardian Name</label>
                <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#84CC16] bg-slate-50 focus:bg-white" />


              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input type="text" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#84CC16] bg-slate-50 focus:bg-white" />


                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Secondary Phone</label>
                  <input type="text" value={guardianAltPhone} onChange={(e) => setGuardianAltPhone(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#84CC16] bg-slate-50 focus:bg-white" placeholder="Optional" />


                </div>


              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Relationship to Student</label>
                <input type="text" value={guardianRelation} onChange={(e) => setGuardianRelation(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#84CC16] bg-slate-50 focus:bg-white" placeholder="e.g. Father, Mother" />


              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Present Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#84CC16] bg-slate-50 focus:bg-white" />


              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Internal Admin Notes</label>
                <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#84CC16] bg-slate-50 focus:bg-white resize-none" placeholder="Notes regarding the guardian..." />


              </div>

              <button onClick={handleSaveDetails} disabled={savingDetails} className="w-full py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black text-sm transition-colors mt-2">
                {savingDetails ? 'Saving...' : 'Save / Update Details'}
              </button>


            </div>


          </div>
          


        </div>


      </div>

      {/* Modals */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Confirm & Finalize Tuition Assignment</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Select Tutor to Confirm & Assign</label>
                  {activeDemo && (
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ⭐ Demo Tutor Found
                    </span>
                  )}
                </div>

                {activeDemo && (
                  <div className="mb-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">Demo Assigned Tutor</span>
                      <strong className="text-slate-900 font-black text-sm">{activeDemo.tutorName}</strong>
                      <span className="text-slate-500 font-semibold block text-[11px]">ID: {activeDemo.tutorCode || activeDemo.tutorId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmTutorId(activeDemo.tutorCode || activeDemo.tutorId);
                        setCustomTutorInput(activeDemo.tutorCode || activeDemo.tutorId);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      Use Demo Tutor
                    </button>
                  </div>
                )}

                <select
                  value={confirmTutorId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmTutorId(val);
                    if (val !== 'custom') {
                      setCustomTutorInput(val);
                    }
                  }}
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-hidden focus:border-[#10B981] bg-white cursor-pointer"
                >
                  <option value="">-- Choose Tutor to Confirm --</option>
                  
                  {activeDemo && (
                    <option value={activeDemo.tutorCode || activeDemo.tutorId} className="font-bold text-emerald-700">
                      ⭐ {activeDemo.tutorName || activeDemo.tutorCode} ({activeDemo.tutorCode || activeDemo.tutorId}) - [Assigned Demo Tutor]
                    </option>
                  )}

                  {appliedTutors.map((app: any) => {
                    const code = app.tutorCode || app.tutorId || app.id;
                    if (activeDemo && (activeDemo.tutorCode === code || activeDemo.tutorId === code)) return null;
                    return (
                      <option key={code} value={code}>
                        {app.name || app.fullName || code} ({code}) - Applicant
                      </option>
                    );
                  })}

                  <option value="custom">✏️ Enter Custom Tutor ID / Code...</option>
                </select>

                {(confirmTutorId === 'custom' || (!activeDemo && appliedTutors.length === 0)) && (
                  <input
                    type="text"
                    value={customTutorInput}
                    onChange={e => {
                      setCustomTutorInput(e.target.value);
                      setConfirmTutorId(e.target.value);
                    }}
                    placeholder="Enter Tutor Code (e.g. TUT-12345)"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm mt-2 focus:outline-hidden focus:border-[#10B981]"
                  />
                )}

                {confirmTutorId && confirmTutorId !== 'custom' && (
                  <p className="mt-1.5 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected Tutor ID: <strong>{confirmTutorId}</strong></span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tuition Start Date</label>
                <input type="date" value={confirmStartDate} onChange={e => setConfirmStartDate(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-[#10B981]" />


              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Amount (৳)</label>
                <input type="number" value={confirmPaymentAmount} onChange={e => setConfirmPaymentAmount(e.target.value)} placeholder="4500" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-[#10B981]" />


              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Due/Received Date</label>
                <input type="date" value={confirmPaymentDate} onChange={e => setConfirmPaymentDate(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-[#10B981]" />


              </div>


            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleConfirmTuition} className="flex-1 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-sm transition-colors">Submit & Generate Payment Entry</button>


            </div>


          </div>


        </div>
      )}
      
      {showArchiveDialog && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Archive Job</h3>
            <p className="text-xs font-medium text-slate-500">You are moving this job to the ARCHIVED state.</p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Admin Reason / Archive Note</label>
              <textarea 
                rows={4} 
                value={archiveNote} 
                onChange={e => setArchiveNote(e.target.value)}
                placeholder="Reason for archiving..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-[#84CC16]"
              />


            </div>

            <div className="pt-2 flex gap-3">
              <button onClick={() => setShowArchiveDialog(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50">Cancel</button>
              <button onClick={handleArchive} className="flex-1 py-2.5 rounded-xl bg-rose-600 font-black text-white text-xs shadow-sm hover:bg-rose-700">Confirm Archive</button>


            </div>


          </div>


         </div>
      )}

      {/* Applied Tutors Drawer */}
      {showAppliedTutors && (
         <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-xs">
           <div className="w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                   <Users className="w-5 h-5 text-[#84CC16]" />
                   <span>Applied Tutors ({appliedTutors.length})</span>
                 </h3>
                 <p className="text-xs text-slate-500 font-medium">Click "View Profile" to review tutor details or schedule a trial class.</p>
               </div>
               <button onClick={() => setShowAppliedTutors(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                 <XCircle className="w-5 h-5 text-slate-500"/>
               </button>
             </div>
             
             <div className="p-6 flex-1 overflow-y-auto space-y-4">
               {appliedTutors.length === 0 ? (
                 <div className="text-center text-slate-500 text-sm py-16 space-y-3">
                   <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                     <Users className="w-6 h-6" />
                   </div>
                   <p className="font-bold text-slate-700">No applications yet</p>
                   <p className="text-xs text-slate-400 max-w-xs mx-auto">Tutors who apply for this job will appear here with their credentials and profile.</p>
                 </div>
               ) : (
                 appliedTutors.map(tutor => (
                   <div key={tutor.id || tutor.tutorCode} className="p-4 border border-slate-200 rounded-2xl bg-white hover:border-[#84CC16] hover:shadow-md transition-all space-y-3">
                     <div className="flex items-start justify-between gap-3">
                       <div className="flex items-center gap-3">
                         <div className="w-11 h-11 rounded-xl bg-lime-100 text-[#65A30D] font-black text-sm flex items-center justify-center shrink-0 uppercase border border-lime-200">
                           {tutor.name ? tutor.name.substring(0, 2) : 'TU'}
                         </div>
                         <div>
                           <div className="flex items-center gap-1.5">
                             <h4 className="font-black text-sm text-slate-900">{tutor.name}</h4>
                             <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-200 flex items-center gap-0.5">
                               <ShieldCheck className="w-3 h-3 text-[#65A30D]" /> {tutor.tutorCode || 'TUT'}
                             </span>
                           </div>
                           <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                             <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                             <span>{tutor.university} • {tutor.department}</span>
                           </p>
                         </div>
                       </div>
                       {tutor.expectedSalary && (
                         <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100 shrink-0">
                           ৳ {tutor.expectedSalary}
                         </span>
                       )}
                     </div>

                     {tutor.message && (
                       <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                         "{tutor.message}"
                       </div>
                     )}

                     <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                       <span className="text-slate-400 font-medium">
                         Applied: {tutor.appliedAt ? new Date(tutor.appliedAt).toLocaleDateString() : 'Recent'}
                       </span>
                       <div className="flex items-center gap-2">
                         <button
                           onClick={() => setSelectedTutorProfile(tutor)}
                           className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                         >
                           <Eye className="w-3.5 h-3.5" /> View Profile
                         </button>
                         <button 
                           onClick={() => {
                             setDemoTutor(tutor.tutorCode || tutor.id || tutor.name);
                             setShowAppliedTutors(false);
                             setShowDemoSchedule(true);
                           }} 
                           className="px-3 py-1.5 bg-[#84CC16] text-slate-950 text-xs font-black rounded-lg hover:bg-[#65A30D] transition-colors cursor-pointer"
                         >
                           Demo
                         </button>
                       </div>
                     </div>
                   </div>
                 ))
               )}
             </div>
           </div>
         </div>
      )}

      {/* Full Tutor Profile Modal */}
      {selectedTutorProfile && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedTutorProfile(null)} 
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>

            {/* Profile Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                {selectedTutorProfile.name ? selectedTutorProfile.name.substring(0, 2).toUpperCase() : 'TU'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{selectedTutorProfile.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    selectedTutorProfile.status === 'blocked' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedTutorProfile.status === 'blocked' ? 'Blocked / Suspended' : 'Active Account'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 font-extrabold text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-lime-600" />
                    {selectedTutorProfile.verificationStatus === 'verified' ? 'NID Verified' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-500">Tutor ID: {selectedTutorProfile.tutorCode || selectedTutorProfile.id}</p>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedTutorProfile.university} • {selectedTutorProfile.department}
                </p>
              </div>
            </div>

            {/* Profile Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Academic Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <GraduationCap className="w-4 h-4 text-[#84CC16]" /> Academic Credentials
                </h4>
                <div className="space-y-1.5 pt-1 text-slate-700">
                  <p><span className="text-slate-400 font-bold">University:</span> {selectedTutorProfile.university || 'N/A'}</p>
                  <p><span className="text-slate-400 font-bold">Department:</span> {selectedTutorProfile.department || 'N/A'}</p>
                  <p><span className="text-slate-400 font-bold">Academic Year:</span> {selectedTutorProfile.academicYear || 'Undergraduate'}</p>
                  <p><span className="text-slate-400 font-bold">Student ID:</span> {selectedTutorProfile.studentId || 'Verified by Admin'}</p>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <Phone className="w-4 h-4 text-blue-500" /> Contact & Location
                </h4>
                <div className="space-y-1.5 pt-1 text-slate-700">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">{selectedTutorProfile.phone || 'Available after demo'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedTutorProfile.email || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedTutorProfile.area ? `${selectedTutorProfile.area}, ` : ''}{selectedTutorProfile.district || 'Dhaka'}</span>
                  </p>
                  <p><span className="text-slate-400 font-bold">Gender:</span> {selectedTutorProfile.gender || 'Any'}</p>
                </div>
              </div>

              {/* Tutoring Experience & Skills */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 sm:col-span-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <Briefcase className="w-4 h-4 text-amber-500" /> Tutoring Background
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-700">
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Experience</span>
                    <span className="font-bold text-slate-900">{selectedTutorProfile.experience || '2+ years'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Expected Salary</span>
                    <span className="font-bold text-emerald-600">৳ {selectedTutorProfile.expectedSalary || 'Negotiable'} BDT</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Application Status</span>
                    <span className="font-bold uppercase text-indigo-600">{selectedTutorProfile.status || 'Submitted'}</span>
                  </div>
                </div>
              </div>

              {/* Application Cover Message */}
              <div className="p-4 rounded-2xl bg-lime-50/60 border border-lime-200 space-y-2 sm:col-span-2">
                <h4 className="font-extrabold text-lime-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <MessageSquare className="w-4 h-4 text-[#65A30D]" /> Cover Note for Guardian / Admin
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{selectedTutorProfile.message || 'Ready to provide dedicated home/online tutoring with high quality results.'}"
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setDemoTutor(selectedTutorProfile.tutorCode || selectedTutorProfile.id || selectedTutorProfile.name);
                  setSelectedTutorProfile(null);
                  setShowAppliedTutors(false);
                  setShowDemoSchedule(true);
                }}
                className="flex-1 min-w-[140px] py-3 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-101 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Demo</span>
              </button>

              <button
                onClick={() => {
                  setConfirmTutorId(selectedTutorProfile.tutorCode || selectedTutorProfile.id);
                  setSelectedTutorProfile(null);
                  setShowAppliedTutors(false);
                  setShowConfirmModal(true);
                }}
                className="flex-1 min-w-[140px] py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-101 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
                <span>Assign Tutor</span>
              </button>

              <button
                onClick={() => handleBlockApplicantTutor(selectedTutorProfile)}
                className={`px-4 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                  selectedTutorProfile.status === 'blocked'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>{selectedTutorProfile.status === 'blocked' ? 'Unblock Tutor' : 'Block Tutor'}</span>
              </button>

              <button
                onClick={() => {
                  const tid = selectedTutorProfile.tutorCode || selectedTutorProfile.tutorId || selectedTutorProfile.id;
                  setSelectedTutorProfile(null);
                  navigateToTutorProfile(tid);
                }}
                className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>View Full Profile</span>
              </button>

              <button
                onClick={() => setSelectedTutorProfile(null)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDemoSchedule && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="font-black text-slate-900 text-lg">Demo Class Schedule</h3>
               <button onClick={() => setShowDemoSchedule(false)} className="p-2 hover:bg-slate-100 rounded-full"><XCircle className="w-5 h-5 text-slate-500"/></button>


             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Select Tutor</label>
                 <select value={demoTutor} onChange={e => setDemoTutor(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium">
                   <option value="">-- Select Tutor --</option>
                   {appliedTutors.map(t => {
                     const val = t.tutorCode || t.tutorId || t.id;
                     return <option key={t.id} value={val}>{t.name} ({val})</option>;
                   })}
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Date & Time</label>
                 <input type="datetime-local" value={demoDate} onChange={e => setDemoDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium" />
               </div>
               <button 
                 onClick={handleScheduleDemoSubmit}
                 disabled={!demoTutor || !demoDate || isSchedulingDemo}
                 className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
               >
                 <Calendar className="w-4 h-4" />
                 <span>{isSchedulingDemo ? 'Scheduling & Notifying Tutor...' : 'Schedule Demo'}</span>
               </button>
             </div>



          </div>


         </div>
      )}



      {isEditModalOpen && (
        <AdminTuitionEditModal
          tuition={tuition}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
};
