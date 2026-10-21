import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminTuitionEditModal } from "./tuition/AdminTuitionEditModal";
import { Plus } from "lucide-react";

import { 
  CheckCircle, Edit, MapPin, DollarSign, Activity, 
  RefreshCw, XCircle, Users, Calendar, Search, 
  CreditCard, Archive, Clock, Eye, Bell
} from 'lucide-react';


export const AdminTuitionsView: React.FC = () => {
  const { setActiveTab: setGlobalActiveTab, setAdminSelectedTuitionId, adminTuitionsInitialTab, setAdminTuitionsInitialTab } = useApp();
  const [activeTab, setActiveTab] = useState(adminTuitionsInitialTab || 'All');
  const [confirmModalData, setConfirmModalData] = useState<{id: string, tutorId: string} | null>(null);
  const [actualPayment, setActualPayment] = useState('5000');
  const [tuitions, setTuitions] = useState<any[]>([]);
  const [allTuitionsData, setAllTuitionsData] = useState<any[]>([]);
  const [teacherAlerts, setTeacherAlerts] = useState<any[]>([]);
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

  useEffect(() => {
    if (adminTuitionsInitialTab) {
      setActiveTab(adminTuitionsInitialTab);
    }
  }, [adminTuitionsInitialTab]);

  const TABS = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending Requests', value: 'PENDING' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Teachers Applied', value: 'APPLIED' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Archived', value: 'ARCHIVED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  const fetchTeacherAlerts = async () => {
    try {
      const response = await fetch('/api/admin/teacher-applications/alerts');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.alerts)) {
          setTeacherAlerts(data.alerts);
        }
      }
    } catch (e) {}
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/admin/teacher-applications/alerts/${alertId}/dismiss`, { method: 'POST' });
      setTeacherAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) {}
  };

  const handleClearAllAlerts = async () => {
    try {
      await fetch('/api/admin/teacher-applications/alerts/clear', { method: 'POST' });
      setTeacherAlerts([]);
    } catch (e) {}
  };

  const fetchTuitions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tuitions?t=${Date.now()}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        const mappedTuitions = data.map((job: any) => ({
          id: job.id,
          realId: job.realId || job.id,
          jobCode: job.jobCode || job.id,
          title: job.title || 'Tuition Job',
          curriculum: job.course || job.curriculum || 'Any',
          course: job.course || 'Any',
          salary: job.salary || 0,
          location: job.location || job.fullAddress || job.area || 'Negotiable',
          area: job.area || job.location || '',
          schedule: job.daysPerWeek || '3 days/week',
          daysPerWeek: job.daysPerWeek || '3 days/week',
          guardianName: job.guardianName || 'Guest Guardian',
          guardianPhone: job.guardianPhone || 'N/A',
          status: job.status || 'OPEN',
          applications: job.applications !== undefined ? Number(job.applications) : Number(job.appCount || 0),
          postedAt: job.postedAt || job.createdAt,
          demoSchedule: job.demoSchedule,
          assignedTutorId: job.assignedTutorId,
          paymentRecord: job.paymentRecord,
          adminNotes: job.adminNotes
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

  useEffect(() => {
    fetchTuitions();
    fetchTeacherAlerts();

    const handleRealtimeApplied = () => {
      fetchTuitions();
      fetchTeacherAlerts();
    };

    window.addEventListener('tutorlink:job-applied', handleRealtimeApplied);
    return () => window.removeEventListener('tutorlink:job-applied', handleRealtimeApplied);
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
      else if (activeTabValue === 'APPLIED') filtered = filtered.filter(t => t.status === 'TEACHERS_APPLIED' || (t.applications && t.applications > 0));
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
        body: JSON.stringify({ status: targetStatus, targetStatus, ...extraPayload })
      });
      if (response.ok) {
        const updatedData = allTuitionsData.map(t => {
          if (t.id === id) {
            return { ...t, status: targetStatus, ...extraPayload, updatedAt: new Date().toISOString() };
          }
          return t;
        });
        saveToStorage(updatedData);
        alert(`Success: Tuition status updated to ${targetStatus}!`);
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

  const handleSaveModal = async (formData: any) => {
    if (isCreateMode) {
      try {
        const response = await fetch('/api/admin/tuitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            status: formData.status || 'OPEN'
          })
        });

        if (response.ok) {
          const created = await response.json();
          saveToStorage([created, ...allTuitionsData]);
          setActiveTab('Open');
          alert('Success: New tuition created and published to Tuition Jobs!');
        } else {
          // Fallback locally
          const newId = `JOB-${Math.floor(100000 + Math.random() * 900000)}`;
          const newTuition = {
            ...formData,
            id: newId,
            status: formData.status || "OPEN",
            postedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
          saveToStorage([newTuition, ...allTuitionsData]);
          setActiveTab('Open');
          alert('Success: New tuition created!');
        }
      } catch (err) {
        console.error(err);
        alert('Error creating tuition');
      }
    } else {
      try {
        await fetch(`/api/admin/tuitions/${formData.id}/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch (err) {
        console.error(err);
      }
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
        {TABS.map(tab => {
          let tabCount = 0;
          if (tab.value === 'ALL') tabCount = allTuitionsData.length;
          else if (tab.value === 'PENDING') tabCount = allTuitionsData.filter(t => t.status === 'PENDING_REVIEW').length;
          else if (tab.value === 'OPEN') tabCount = allTuitionsData.filter(t => t.status === 'OPEN').length;
          else if (tab.value === 'APPLIED') tabCount = allTuitionsData.filter(t => t.status === 'TEACHERS_APPLIED' || (t.applications && t.applications > 0)).length;
          else if (tab.value === 'CONFIRMED') tabCount = allTuitionsData.filter(t => ['CONFIRMED', 'FILLED'].includes(t.status)).length;
          else if (tab.value === 'ARCHIVED') tabCount = allTuitionsData.filter(t => ['CLOSED', 'ARCHIVED'].includes(t.status)).length;
          else if (tab.value === 'CANCELLED') tabCount = allTuitionsData.filter(t => t.status === 'CANCELLED').length;

          const isAppliedTab = tab.value === 'APPLIED';
          const hasUnreadAlerts = isAppliedTab && teacherAlerts.some(a => !a.isRead);

          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.label 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {tabCount}
              </span>
              {hasUnreadAlerts && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Teacher Applications Alert Section Banner */}
      {teacherAlerts.length > 0 && (activeTab === 'Teachers Applied' || activeTab === 'All') && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-indigo-950 flex items-center gap-2">
                  <span>Teacher Applications Alert</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-black">
                    {teacherAlerts.length} New
                  </span>
                </h4>
                <p className="text-xs text-indigo-800 font-medium">
                  Tutors recently applied to tuition jobs. Review credentials and assign for trial demo classes.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearAllAlerts}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear All Alerts
            </button>
          </div>

          {/* Alert cards list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {teacherAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-white/95 rounded-xl border border-indigo-100 flex items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 truncate">{alert.tutorName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {alert.jobId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {alert.tutorUniversity} • {alert.jobTitle}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => viewDetails(alert.jobId)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Dismiss Alert"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <div className="flex gap-2 items-center flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                  (t.applications || 0) > 0 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  <Users className="w-3.5 h-3.5" /> {t.applications || 0} Applicant{(t.applications || 0) === 1 ? '' : 's'}
                </span>
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

              {(t.status === 'OPEN' || t.status === 'TEACHERS_APPLIED' || (t.applications && t.applications > 0)) && (
                <>
                  <button 
                    onClick={() => viewDetails(t.id)}
                    className="px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Review Applicants</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                      {t.applications || 0}
                    </span>
                  </button>
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
