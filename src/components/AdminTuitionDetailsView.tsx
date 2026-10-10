import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminTuitionEditModal } from "./tuition/AdminTuitionEditModal";

import { MapPin, DollarSign, Activity, CheckCircle, XCircle, Users, BookOpen, Clock, Calendar, MessageSquare, ArrowLeft, Edit } from 'lucide-react';

export const AdminTuitionDetailsView: React.FC = () => {
  const { setActiveTab, adminSelectedTuitionId } = useApp();
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
  const [demoDate, setDemoDate] = useState('');
  const [demoTutor, setDemoTutor] = useState('');
  const [showDemoSchedule, setShowDemoSchedule] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveNote, setArchiveNote] = useState('');
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [confirmTutorId, setConfirmTutorId] = useState('');
  const [confirmStartDate, setConfirmStartDate] = useState('');
  const [confirmPaymentAmount, setConfirmPaymentAmount] = useState('');
  const [confirmPaymentDate, setConfirmPaymentDate] = useState('');

  useEffect(() => {
    if (!adminSelectedTuitionId) {
      setActiveTab('admin-tuitions');
      return;
    }
    fetchTuitionDetails();
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
        const appsRes = await fetch(`/api/admin/tuitions/${current.realId || current.id}/applications`);
        if (appsRes.ok) {
           const appsData = await appsRes.json();
           setAppliedTutors(appsData);
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
      // If we don't have a tuition object, we can't update it
      if (!tuition || !tuition.id) return;
      const realId = tuition.realId || tuition.id; // use realId if fetched from All

      const response = await fetch(`/api/admin/tuitions/${realId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        // optimistically update local state if needed
        setTuition((prev: any) => ({ ...prev, ...updatedFields }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveModal = async (formData: any) => {
    await updateTuitionInStorage(formData);
    setIsEditModalOpen(false);
    fetchTuitionDetails();
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
    fetchTuitionDetails();
    setSavingDetails(false);
  };

  const handleStatusUpdate = async (status: string) => {
    await updateTuitionInStorage({ status });
    fetchTuitionDetails();
  };

  const handleArchive = async () => {
    await updateTuitionInStorage({ adminNotes: archiveNote, status: 'ARCHIVED' });
    setShowArchiveDialog(false);
    fetchTuitionDetails();
  };

  const handleConfirmTuition = async () => {
    updateTuitionInStorage({
      status: 'CONFIRMED',
      assignedTutorId: confirmTutorId,
      confirmedStartDate: confirmStartDate
    });
    setShowConfirmModal(false);
    fetchTuitionDetails();
    setConfirmTutorId('');
    setConfirmStartDate('');
    setConfirmPaymentAmount('');
    setConfirmPaymentDate('');
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
            <h2 className="text-2xl font-black text-slate-900">Tuition {tuition.id}</h2>
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


        </div>

        {/* Right Column (Dynamic Admin Management Widget) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Action Control Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Activity className="w-4 h-4"/> Status</span>
               <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-black text-xs rounded-lg uppercase">{tuition.status}</span>


             </div>
             <button onClick={() => setShowConfirmModal(true)} className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100 hover:bg-indigo-100 transition-colors">
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
                   <p className="text-xs font-medium text-slate-500">{tuition.applications || 0} applications received</p>


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
                   <p className="text-xs font-medium text-slate-500">Manage trial classes</p>


                 </div>


               </div>
             </button>


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
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Tutor ID / Name</label>
                <input type="text" value={confirmTutorId} onChange={e => setConfirmTutorId(e.target.value)} placeholder="TUT-12345" className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:border-[#10B981]" />


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

      {/* Placeholder Modals for Tutors and Demo */}
      {showAppliedTutors && (
         <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-xs">
           <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right flex flex-col">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-black text-slate-900 text-lg">Applied Tutors</h3>
               <button onClick={() => setShowAppliedTutors(false)} className="p-2 hover:bg-slate-100 rounded-full"><XCircle className="w-5 h-5 text-slate-500"/></button>


             </div>
             
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
               {appliedTutors.length === 0 ? (
                 <div className="text-center text-slate-500 text-sm py-12">No tutors have applied yet.</div>
               ) : (
                 appliedTutors.map(tutor => (
                   <div key={tutor.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-white hover:border-[#84CC16] transition-colors">
                     <div>
                       <p className="font-bold text-sm text-slate-900">{tutor.name}</p>
                       <p className="text-xs text-slate-500">{tutor.university} • {tutor.department}</p>
                     </div>
                     <button 
                       onClick={() => {
                         setDemoTutor(tutor.id);
                         setShowAppliedTutors(false);
                         setShowDemoSchedule(true);
                       }} 
                       className="px-3 py-1.5 bg-[#84CC16] text-white text-xs font-bold rounded-lg hover:bg-[#65A30D] transition-colors"
                     >
                       Demo
                     </button>
                   </div>
                 ))
               )}
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
                   {appliedTutors.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Date & Time</label>
                 <input type="datetime-local" value={demoDate} onChange={e => setDemoDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium" />
               </div>
               <button 
                 onClick={() => {
                    // Logic to schedule demo
                    setShowDemoSchedule(false);
                    // Could trigger handleStatusUpdate to DEMO_SCHEDULED here in a real scenario
                 }}
                 disabled={!demoTutor || !demoDate}
                 className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
               >
                 Schedule Demo
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
