import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminTuitionEditModal } from "./tuition/AdminTuitionEditModal";
import { Plus } from "lucide-react";

import { 
  CheckCircle, Edit, MapPin, DollarSign, Activity, 
  RefreshCw, XCircle, Users, Calendar, Search, 
  CreditCard, Archive, Clock, Eye
} from 'lucide-react';


export const AdminTuitionsView: React.FC = () => {
  const { setActiveTab: setGlobalActiveTab, setAdminSelectedTuitionId } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [confirmModalData, setConfirmModalData] = useState<{id: string, tutorId: string} | null>(null);
  const [actualPayment, setActualPayment] = useState('5000');
  const [tuitions, setTuitions] = useState<any[]>([]);
  const [allTuitionsData, setAllTuitionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const [archiveNote, setArchiveNote] = useState('');
  const [selectedTuitionId, setSelectedTuitionId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState<any>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);


  const TABS = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending Requests', value: 'PENDING' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Teachers Applied', value: 'APPLIED' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Archived', value: 'ARCHIVED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  // Initialize and load from local storage
  
  
  useEffect(() => {
    const fetchTuitions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/tuitions?t=${Date.now()}`);
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
          const mappedTuitions = data.map((job: any) => ({
            id: job.id,
            title: job.title || 'Tuition Job',
            curriculum: job.course || 'Any',
            salary: job.salary || 0,
            location: job.location || 'Negotiable',
            schedule: job.daysPerWeek || '3 days/week',
            guardianName: job.guardianName || 'Guest Guardian',
            guardianPhone: job.guardianPhone || 'N/A',
            status: job.status || 'OPEN',
            postedAt: job.postedAt
          }));

          setAllTuitionsData(mappedTuitions);
        } else {
          setAllTuitionsData([]);
        }
      } catch (e) {
        console.error("Error fetching tuitions:", e);
        setAllTuitionsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTuitions();
  }, []);



  // Filter Data locally
  useEffect(() => {
    setLoading(true);
    let filtered = [...allTuitionsData];
    
    // Status Filter
    const activeTabValue = TABS.find(t => t.label === activeTab)?.value || 'ALL';
    if (activeTabValue !== 'ALL') {
      if (activeTabValue === 'PENDING') filtered = filtered.filter(t => t.status === 'PENDING_REVIEW');
      else if (activeTabValue === 'OPEN') filtered = filtered.filter(t => t.status === 'OPEN');
      else if (activeTabValue === 'APPLIED') filtered = filtered.filter(t => t.status === 'TEACHERS_APPLIED');
      else if (activeTabValue === 'CONFIRMED') filtered = filtered.filter(t => ['CONFIRMED', 'FILLED'].includes(t.status));
      else if (activeTabValue === 'ARCHIVED') filtered = filtered.filter(t => ['CLOSED', 'ARCHIVED'].includes(t.status));
      else if (activeTabValue === 'CANCELLED') filtered = filtered.filter(t => t.status === 'CANCELLED');
    }
    
    // Search Filter
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(t => 
        (t.id && t.id.toLowerCase().includes(s)) ||
        (t.title && t.title.toLowerCase().includes(s)) ||
        (t.location && t.location.toLowerCase().includes(s)) ||
        (t.guardianPhone && t.guardianPhone.toLowerCase().includes(s))
      );
    }

    setTuitions(filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()));
    setLoading(false);
  }, [allTuitionsData, activeTab, search]);

  const saveToStorage = (newData: any[]) => {
    localStorage.setItem('adminTuitionsData', JSON.stringify(newData));
    setAllTuitionsData(newData);
  };

  const handleStatusUpdate = async (id: string, targetStatus: string, extraPayload: any = {}) => {
    try {
      const response = await fetch(`/api/admin/tuitions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, ...extraPayload })
      });
      if (response.ok) {
        const updatedData = allTuitionsData.map(t => {
          if (t.id === id) {
            return { ...t, status: targetStatus, ...extraPayload, updatedAt: new Date().toISOString() };
          }
          return t;
        });
        setAllTuitionsData(updatedData);
      } else {
        alert('Failed to update status on server');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    }
  };

  const handleConfirmCancel = () => {
    if (selectedTuitionId) {
      handleStatusUpdate(selectedTuitionId, "CANCELLED", { cancelReason: cancelNote });
      setIsCancelModalOpen(false);
      setCancelNote("");
      setSelectedTuitionId(null);
    }
  };

  const handleConfirmArchive = () => {
    if (selectedTuitionId) {
      handleStatusUpdate(selectedTuitionId, 'ARCHIVED', { archiveReason: archiveNote });
      setIsArchiveModalOpen(false);
      setArchiveNote('');
      setSelectedTuitionId(null);
    }
  };

  const viewDetails = (id: string) => {
    setAdminSelectedTuitionId(id);
    setGlobalActiveTab('admin-tuition-details');
  };

  const viewPayment = () => {
    setGlobalActiveTab('admin-payments');
  };

  const handleEditClick = (tuition: any) => {
    setSelectedTuition(tuition);
    setIsCreateMode(false);
    setIsEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedTuition({});
    setIsCreateMode(true);
    setIsEditModalOpen(true);
  };

  const handleSaveModal = (formData: any) => {
    if (isCreateMode) {
      const newId = `JOB-${Math.floor(100000 + Math.random() * 900000)}`;
      const newTuition = {
        ...formData,
        id: newId,
        status: formData.status || "OPEN",
        postedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      saveToStorage([newTuition, ...allTuitionsData]);
      
      // Auto-switch to view it based on status
      const statusLabel = TABS.find(t => {
        if (newTuition.status === 'PENDING_REVIEW' && t.value === 'PENDING') return true;
        if (newTuition.status === 'TEACHERS_APPLIED' && t.value === 'APPLIED') return true;
        if (t.value === newTuition.status) return true;
        return false;
      })?.label || 'All';
      
      setActiveTab(statusLabel);
      alert('Success: New tuition created successfully!');
    } else {
      const updatedData = allTuitionsData.map(t => {
        if (t.id === formData.id) return { ...formData, updatedAt: new Date().toISOString() };
        return t;
      });
      saveToStorage(updatedData);
      alert('Success: Tuition updated successfully!');
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Tuition State Workflow</h2>
          <p className="text-sm text-slate-500 font-medium">Manage pipeline states and resolve tuition conflicts.</p>

        </div>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create New Tuition
        </button>

      </div>


      {/* Filter Pill Controls */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.label 
                ? 'bg-slate-900 text-white' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input 
          type="text" 
          placeholder="Search by Job ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-slate-400 bg-white" 
        />

      </div>

      <div className="grid grid-cols-1 gap-4 p-4 -mx-4 sm:mx-0 sm:p-6 bg-[#F8F9FA] sm:rounded-2xl border border-slate-100">
        {loading ? (
          <div className="text-center p-8 text-slate-500 font-medium flex flex-col items-center">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mb-2" />
            Loading tuitions...

          </div>
        ) : tuitions.length === 0 ? (
          <div className="text-center p-8 text-slate-500 font-medium bg-white rounded-xl border border-dashed border-slate-300">
            No tuitions found for this state.

          </div>
        ) : tuitions.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
            
            {/* Top Row: Header & Badges */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                  Job ID: {t.id}
                </span>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">{t.title || t.subject || `${t.category} - ${t.course}`}</h3>

              </div>
              <div className="flex gap-2">
                {t.applications > 0 && t.status !== 'CONFIRMED' && t.status !== 'CLOSED' && t.status !== 'ARCHIVED' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {t.applications} Applicants
                  </span>
                )}
                {t.status === 'DEMO_SCHEDULED' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Demo Scheduled
                  </span>
                )}
                {(t.status === 'CONFIRMED' || t.status === 'FILLED') && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                  </span>
                )}
                {(t.status === 'CLOSED' || t.status === 'ARCHIVED') && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                    <Archive className="w-3.5 h-3.5" /> Archived
                  </span>
                )}
                {t.status === "CANCELLED" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Cancelled
                  </span>
                )}

                {t.status === 'PENDING_REVIEW' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pending Approval
                  </span>
                )}

              </div>

            </div>

            {/* Middle Section: 4-Column Micro-grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-lg p-3 border border-slate-100 text-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Salary</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> 
                  {t.salary ? `৳ ${t.salary}/mo` : 'Negotiable'}
                </span>

              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Location</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> 
                  {t.area || t.location || 'Online'}
                </span>

              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Schedule</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                  {t.daysPerWeek || 'Negotiable'}
                </span>

              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Guardian Contact</span>
                <span className="font-semibold text-slate-700 flex flex-col">
                  <span>{t.guardianName || 'Hidden'}</span>
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Activity className="w-3 h-3" /> 
                    {t.guardianPhone || 'Hidden'}
                  </span>
                </span>
              </div>

            </div>

            {/* State-Specific Extra Info */}
            {t.status === 'DEMO_SCHEDULED' && t.demoSchedule && (
              <div className="text-xs font-medium text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                Assigned Tutor: <strong className="font-bold">{t.demoSchedule.tutorName || t.demoSchedule.tutorId}</strong> 
                &nbsp; | &nbsp; Demo Date: <strong className="font-bold">{t.demoSchedule.date}</strong>

              </div>
            )}
            {(t.status === 'CONFIRMED' || t.status === 'FILLED') && (
              <div className="text-xs font-medium text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100 flex items-center gap-4">
                <span>Confirmed Tutor: <strong className="font-bold">{t.assignedTutorId || 'Unknown'}</strong></span>
                {t.paymentRecord && (
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> 
                    Payment: <strong className="font-bold uppercase">{t.paymentRecord.status}</strong> 
                    (৳ {t.paymentRecord.amount})
                  </span>
                )}

              </div>
            )}
            {(t.status === 'CLOSED' || t.status === 'ARCHIVED') && t.adminNotes && (
              <div className="text-xs font-medium text-slate-600 bg-slate-100 p-2 rounded border border-slate-200">
                Archive Reason: <strong className="font-bold text-slate-700">{t.adminNotes}</strong>

              </div>
            )}

            {t.status === "CANCELLED" && t.adminNotes && (
              <div className="text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded border border-rose-200 mb-2">
                Cancel Reason: <strong className="font-bold text-rose-700">{t.adminNotes}</strong>

              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              {/* Universal Actions */}
              <button 
                onClick={() => viewDetails(t.id)}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </button>
              <button 
                onClick={() => handleEditClick(t)}
                className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Job

              </button>

              {/* Status Specific Actions */}
              {t.status === "PENDING_REVIEW" && (

                <>
                  <button 
                    onClick={() => handleStatusUpdate(t.id, 'OPEN')}
                    className="px-3 py-2 rounded-lg bg-[#10B981] text-white hover:bg-[#059669] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                  </button>
                  <button 
                    onClick={() => { setSelectedTuitionId(t.id); setIsArchiveModalOpen(true); }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}

              {(t.status === 'OPEN' || t.status === 'TEACHERS_APPLIED') && (
                <>
                  {t.status === 'TEACHERS_APPLIED' && (
                    <button 
                      onClick={() => viewDetails(t.id)}
                      className="px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" /> Review Applicants
                    </button>
                  )}
                  <button 
                    onClick={() => handleStatusUpdate(t.id, 'DEMO_SCHEDULED', { demoDate: 'TBD' })}
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
                  >
                    Assign for Demo
                  </button>
                  <button 
                    onClick={() => { setSelectedTuitionId(t.id); setIsArchiveModalOpen(true); }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs transition-colors"
                  >
                    Close Job
                  </button>
                </>
              )}

              {t.status === 'DEMO_SCHEDULED' && (
                <>
                  <button 
                    onClick={() => setConfirmModalData({ id: t.id, tutorId: t.demoSchedule?.tutorId || '' })}
                    className="px-3 py-2 rounded-lg bg-[#10B981] text-white hover:bg-[#059669] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Demo Passed
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(t.id, 'OPEN')}
                    className="px-3 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs transition-colors"
                  >
                    Demo Failed - Reopen
                  </button>
                </>
              )}

              {(t.status === 'CONFIRMED' || t.status === 'FILLED') && (
                <>
                  <button 
                    onClick={viewPayment}
                    className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> View Payment Entry
                  </button>
                </>
              )}

              {/* Universal Cancel Action */}
              {t.status !== "ARCHIVED" && t.status !== "CLOSED" && t.status !== "CANCELLED" && (
                <button 
                  onClick={() => { setSelectedTuitionId(t.id); setIsCancelModalOpen(true); }}
                  className="px-3 py-2 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 ml-2 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}

              {/* Universal Archive Action (except for archived) */}
              {t.status !== 'ARCHIVED' && t.status !== 'CLOSED' && (
                <button 
                  onClick={() => { setSelectedTuitionId(t.id); setIsArchiveModalOpen(true); }}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 ml-auto transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" /> Archive
                </button>
              )}

            </div>

          </div>
        ))}

      </div>

      {/* Cancel Modal */}
      {isCancelModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              Cancel Tuition
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Moving this job to the CANCELLED state. Please provide a reason below.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Admin Cancel Reason</label>
              <textarea 
                rows={3}
                value={cancelNote} 
                onChange={e => setCancelNote(e.target.value)}
                placeholder="e.g., Guardian requested cancellation, Spam..."
                className="w-full p-3 rounded-lg border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-rose-400"
              />

            </div>
            <div className="pt-2 flex gap-3">
              <button 
                onClick={() => { setIsCancelModalOpen(false); setCancelNote(""); setSelectedTuitionId(null); }} 
                className="flex-1 py-2.5 rounded-lg border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50"
              >
                Back
              </button>
              <button 
                onClick={handleConfirmCancel} 
                disabled={!cancelNote.trim()}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 disabled:opacity-50 font-black text-white text-xs shadow-sm hover:bg-rose-700"
              >
                Confirm Cancel
              </button>

            </div>

          </div>

         </div>
      )}

      {/* Archive Modal */}

      {confirmModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-slate-900 text-lg mb-1">Confirm Demo & Payment</h3>
            <p className="text-xs text-slate-500 mb-4">Record the final payment details before confirming.</p>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Received (BDT)</label>
            <input 
              type="number" 
              value={actualPayment} 
              onChange={(e) => setActualPayment(e.target.value)} 
              className="w-full p-2.5 border border-slate-200 rounded-xl mb-6 text-sm font-medium focus:border-[#10B981] focus:outline-hidden"
            />
            <div className="flex gap-2">
              <button onClick={() => setConfirmModalData(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-sm font-bold text-slate-700">Cancel</button>
              <button 
                onClick={() => {
                  handleStatusUpdate(confirmModalData.id, 'CONFIRMED', { tutorId: confirmModalData.tutorId, paymentAmount: parseInt(actualPayment) });
                  setConfirmModalData(null);
                }} 
                className="flex-1 py-2.5 bg-[#10B981] hover:bg-[#059669] transition-colors text-white rounded-xl text-sm font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isArchiveModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Archive className="w-5 h-5 text-rose-500" />
              Archive Tuition
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Moving this job to the ARCHIVED state. Please provide a reason below for internal records.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Admin Archive Reason</label>
              <textarea 
                rows={3}
                value={archiveNote} 
                onChange={e => setArchiveNote(e.target.value)}
                placeholder="e.g., Parent cancelled, Teacher left..."
                className="w-full p-3 rounded-lg border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-slate-400"
              />

            </div>
            <div className="pt-2 flex gap-3">
              <button 
                onClick={() => { setIsArchiveModalOpen(false); setArchiveNote(''); setSelectedTuitionId(null); }} 
                className="flex-1 py-2.5 rounded-lg border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmArchive} 
                disabled={!archiveNote.trim()}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 disabled:opacity-50 font-black text-white text-xs shadow-sm hover:bg-rose-700"
              >
                Confirm Archive
              </button>

            </div>

          </div>

         </div>
      )}

      {isEditModalOpen && (
        <AdminTuitionEditModal
          tuition={selectedTuition}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
};
