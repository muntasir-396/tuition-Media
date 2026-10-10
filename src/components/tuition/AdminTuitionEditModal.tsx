import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TuitionDetails } from './TuitionDetails';

interface AdminTuitionEditModalProps {
  tuition: any;
  onClose: () => void;
  onSave: (updatedTuition: any) => Promise<void>;
}

export const AdminTuitionEditModal: React.FC<AdminTuitionEditModalProps> = ({ tuition, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({ ...tuition });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  useEffect(() => {
    setFormData({ ...tuition });
  }, [tuition]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setErrorMsg("");
    const required = ["title", "category", "course", "subjects", "daysPerWeek", "method", "salary", "studentsCount"];
    for (const field of required) {
      if (!formData[field]) {
        setErrorMsg(`Please fill out the required field: ${field}`);
        return;
      }
    }

    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-7xl bg-slate-50 h-full shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-in-right relative">
        
        {/* Left Side: Edit Form */}
        <div className="w-full md:w-1/2 h-full bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-black text-slate-900">{tuition.id ? `Edit Tuition: ${tuition.id}` : "Create New Tuition"}</h2>
              <p className="text-xs font-semibold text-slate-500">Live preview available on the right.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
            {/* Core Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Core Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Title</label>
                  <input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Category</label>
                  <input type="text" value={formData.category || ''} onChange={e => handleChange('category', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Curriculum</label>
                  <input type="text" value={formData.curriculum || ''} onChange={e => handleChange('curriculum', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Course / Class</label>
                  <input type="text" value={formData.course || ''} onChange={e => handleChange('course', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Subjects (comma separated)</label>
                  <input type="text" value={Array.isArray(formData.subjects) ? formData.subjects.join(', ') : (formData.subjects || '')} onChange={e => handleChange('subjects', e.target.value.split(',').map((s: string) => s.trim()))} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Logistics & Requirements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Days Per Week</label>
                  <input type="text" value={formData.daysPerWeek || ''} onChange={e => handleChange('daysPerWeek', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Time</label>
                  <input type="text" value={formData.time || ''} onChange={e => handleChange('time', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Duration</label>
                  <input type="text" value={formData.duration || ''} onChange={e => handleChange('duration', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Method</label>
                  <input type="text" value={formData.method || ''} onChange={e => handleChange('method', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Salary (Monthly)</label>
                  <input type="number" value={formData.salary || ''} onChange={e => handleChange('salary', e.target.value ? parseInt(e.target.value) : null)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Expected Start Date</label>
                  <input type="text" value={formData.expectedStartDate || ''} onChange={e => handleChange('expectedStartDate', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Student & Tutor Specs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Number of Students</label>
                  <input type="text" value={formData.studentsCount || ''} onChange={e => handleChange('studentsCount', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Student Gender</label>
                  <input type="text" value={formData.studentGender || ''} onChange={e => handleChange('studentGender', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Preferred Tutor Gender</label>
                  <input type="text" value={formData.tutorGender || ''} onChange={e => handleChange('tutorGender', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Parent's Special Instructions (Notes)</label>
                  <textarea value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} rows={3} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Guardian Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Guardian Name</label>
                  <input type="text" value={formData.guardianName || ''} onChange={e => handleChange('guardianName', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Contact Number</label>
                  <input type="text" value={formData.guardianPhone || ''} onChange={e => handleChange('guardianPhone', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Alternative Number</label>
                  <input type="text" value={formData.guardianAltPhone || ''} onChange={e => handleChange('guardianAltPhone', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Country</label>
                  <input type="text" value={formData.country || ''} onChange={e => handleChange('country', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">City / Division</label>
                  <input type="text" value={formData.city || ''} onChange={e => handleChange('city', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">District / Area</label>
                  <input type="text" value={formData.area || ''} onChange={e => handleChange('area', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Google Map Location</label>
                  <input type="text" value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Latitude</label>
                  <input type="text" value={formData.latitude || ''} onChange={e => handleChange('latitude', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Longitude</label>
                  <input type="text" value={formData.longitude || ''} onChange={e => handleChange('longitude', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Full Address</label>
                  <input type="text" value={formData.fullAddress || ''} onChange={e => handleChange('fullAddress', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
              </div>
            </div>

            {/* Settings & Admin */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Settings & Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Job Status</label>
                  <select value={formData.status || 'OPEN'} onChange={e => handleChange('status', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden">
                    <option value="PENDING_REVIEW">Pending Requests</option>
                    <option value="OPEN">Open</option>
                    <option value="TEACHERS_APPLIED">Teachers Applied</option>
                    <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Visibility</label>
                  <select value={formData.visibility || 'Visible'} onChange={e => handleChange('visibility', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden">
                    <option value="Visible">Visible</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Verification Status</label>
                  <select value={formData.verificationStatus || 'Verified'} onChange={e => handleChange('verificationStatus', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden">
                    <option value="Verified">Verified</option>
                    <option value="Unverified">Unverified</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Application Deadline</label>
                  <input type="date" value={formData.applicationDeadline || ''} onChange={e => handleChange('applicationDeadline', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Maximum Applications</label>
                  <input type="number" value={formData.maxApplications || ''} onChange={e => handleChange('maxApplications', e.target.value ? parseInt(e.target.value) : null)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input type="checkbox" checked={formData.urgent || false} onChange={e => handleChange('urgent', e.target.checked)} className="w-4 h-4 text-[#84CC16] rounded-sm focus:ring-[#84CC16]" />
                    Urgent Job
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input type="checkbox" checked={formData.featured || false} onChange={e => handleChange('featured', e.target.checked)} className="w-4 h-4 text-[#84CC16] rounded-sm focus:ring-[#84CC16]" />
                    Featured Job
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input type="checkbox" checked={formData.premium || false} onChange={e => handleChange('premium', e.target.checked)} className="w-4 h-4 text-[#84CC16] rounded-sm focus:ring-[#84CC16]" />
                    Premium Job
                  </label>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-white">
            {errorMsg && <div className="mb-3 text-red-500 text-sm font-bold">{errorMsg}</div>}

            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-black shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div className="w-full md:w-1/2 h-full bg-slate-50 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Live Preview</h3>
            <div className="pointer-events-none">
              <TuitionDetails job={formData} hideActions />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
