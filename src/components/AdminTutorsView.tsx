import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, ShieldCheck, AlertCircle, Eye, Trash2, Ban, Edit } from 'lucide-react';

export const AdminTutorsView: React.FC = () => {
  const [tutors, setTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const res = await fetch('/api/admin/tutors');
      const data = await res.json();
      if (Array.isArray(data)) setTutors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (t: any) => {
    setSelectedTutor(t);
    setEditFormData(t);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await fetch(`/api/admin/tutors/${selectedTutor.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      setIsEditModalOpen(false);
      setSelectedTutor(null);
      fetchTutors();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Tutor Management</h2>
          <p className="text-sm text-slate-500 font-medium">View and manage tutor profiles and verification.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 flex items-center gap-2 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input type="text" placeholder="Search by name, ID, or phone..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#84CC16]" />
        </div>
        <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white">
          <option>All Universities</option>
          <option>BUET</option>
          <option>DU</option>
          <option>NSU</option>
        </select>
        <select className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white">
          <option>All Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-12"><input type="checkbox" className="rounded-sm" /></th>
                <th className="p-4">Tutor Info</th>
                <th className="p-4">University</th>
                <th className="p-4">Status & Verification</th>
                <th className="p-4">Tuitions (Cur/Tot)</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">Loading...</td></tr>
              ) : tutors.map((tutor) => (
                <tr key={tutor.id} className="hover:bg-slate-50/50">
                  <td className="p-4"><input type="checkbox" className="rounded-sm" /></td>
                  <td className="p-4 flex items-center gap-3">
                    <img src={tutor.avatar || `https://ui-avatars.com/api/?name=${tutor.name}`} alt={tutor.name} className="w-10 h-10 rounded-full border border-slate-200" />
                    <div>
                      <p className="text-slate-900 font-bold">{tutor.name}</p>
                      <p className="text-xs text-slate-500 font-medium">ID: {tutor.id} • {tutor.phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{tutor.university || 'N/A'}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700`}>
                        Active
                      </span>
                      {tutor.verified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#65A30D]"><ShieldCheck className="w-3 h-3" /> NID Verified</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><AlertCircle className="w-3 h-3" /> Unverified</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <span className="text-[#84CC16] font-black">2</span> / {tutor.completion || 0}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedTutor(tutor)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEditClick(tutor)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Drawer/Modal for Stats */}
      {selectedTutor && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative">
            <button onClick={() => setSelectedTutor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1">
              ✕
            </button>
            <div className="flex items-center gap-4">
              <img src={selectedTutor.avatar || `https://ui-avatars.com/api/?name=${selectedTutor.name}`} alt="Avatar" className="w-16 h-16 rounded-full border border-slate-200" />
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedTutor.name}</h3>
                <p className="text-sm font-semibold text-slate-500">ID: {selectedTutor.id} • {selectedTutor.university || 'N/A'}</p>
              </div>
            </div>
            
            <h4 className="font-bold text-slate-900">Lifetime Statistics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500">Demos Taken</span>
                <strong className="text-lg font-black text-slate-900">80</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500">Confirmed</span>
                <strong className="text-lg font-black text-slate-900">{selectedTutor.completion || 0}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500">Rejection Rate</span>
                <strong className="text-lg font-black text-rose-600">12%</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500">Income</span>
                <strong className="text-lg font-black text-[#65A30D]">৳1.2M</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => setIsEditModalOpen(true)} className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors">Edit Profile</button>
              <button onClick={() => alert(`Tutor ID: ${selectedTutor.id}`)} className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors hover:bg-slate-800">View Tutor</button>
              <button className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 transition-colors hover:bg-rose-100">Suspend Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => { setIsEditModalOpen(false); setSelectedTutor(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1">
              ✕
            </button>
            <h3 className="text-xl font-black text-slate-900">Edit Tutor {selectedTutor.id}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Name</label>
                <input 
                  type="text" 
                  value={editFormData.name || ''} 
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">University</label>
                <input 
                  type="text" 
                  value={editFormData.university || ''} 
                  onChange={e => setEditFormData({...editFormData, university: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Phone Number</label>
                <input 
                  type="text" 
                  value={editFormData.phone || ''} 
                  onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-hidden" 
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={() => { setIsEditModalOpen(false); setSelectedTutor(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl bg-slate-900 font-black text-white text-xs shadow-sm hover:bg-slate-800 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
