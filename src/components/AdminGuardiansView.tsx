import React, { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, ShieldAlert, Eye, Search, MoreVertical, CreditCard, Edit } from 'lucide-react';


export const AdminGuardiansView: React.FC = () => {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    try {
      const res = await fetch('/api/admin/guardians');
      const data = await res.json();
      if (Array.isArray(data)) setGuardians(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (g: any) => {
    setSelectedGuardian(g);
    setEditFormData(g);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await fetch(`/api/admin/guardians/${selectedGuardian.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      setIsEditModalOpen(false);
      setSelectedGuardian(null);
      fetchGuardians();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Guardian Management</h2>
        <p className="text-sm text-slate-500 font-medium">Manage parents, active job requests, and billing.</p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Guardians', value: '4,521', icon: Users, color: 'text-blue-600' },
          { label: 'Verified Accounts', value: '3,892', icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Pending Payments', value: '142', icon: CreditCard, color: 'text-rose-600' },
          { label: 'Active Requests', value: '890', icon: FileText, color: 'text-amber-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-50 border border-slate-100 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
              <h4 className="text-lg font-black text-slate-900">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Search guardian..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden" />
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Guardian Profile</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Jobs (Act/Post)</th>
                <th className="p-4">Payment & Ver.</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading...</td></tr>
              ) : guardians.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No guardians found.</td></tr>
              ) : guardians.map(g => (
                <tr key={g.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="text-slate-900 font-bold">{g.name}</p>
                    <p className="text-xs text-slate-500 font-medium">ID: {g.id} • {g.phone || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-slate-600">{g.location || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span className="text-[#84CC16] font-black">{g.activeTuitions || 0}</span> / {g.totalTuitions || 0}
                  </td>
                  <td className="p-4">
                     <div className="flex flex-col gap-1.5 items-start">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${g.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {g.status || 'Active'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#65A30D]"><CheckCircle className="w-3 h-3" /> Verified</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedGuardian(g)} className="p-1.5 text-slate-400 hover:text-[#84CC16] rounded-lg hover:bg-slate-100 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleEditClick(g)} className="p-1.5 text-slate-400 hover:text-[#84CC16] rounded-lg hover:bg-slate-100 transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Panel (simplified as a modal for now) */}
      {selectedGuardian && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-slide-in-right relative">
            <button onClick={() => setSelectedGuardian(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold p-2">✕ Close</button>
            <h3 className="text-xl font-black text-slate-900 mb-6 mt-4">Guardian Profile</h3>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 space-y-2">
              <h4 className="font-bold text-slate-900">{selectedGuardian.name}</h4>
              <p className="text-sm font-medium text-slate-600">Contact: {selectedGuardian.phone}</p>
              <p className="text-sm font-medium text-slate-600">Address: {selectedGuardian.location}</p>
            </div>

            <h4 className="font-bold text-slate-900 mb-3">Transaction History</h4>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-slate-900">Tuition Comm. T-102{i}</p>
                    <p className="text-xs text-slate-500 font-medium">Aug 0{i}, 2026</p>
                  </div>
                  <span className="text-[#84CC16] font-black">৳3,500</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col gap-2">
               <button onClick={() => setIsEditModalOpen(true)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">Edit Profile</button>
               <button className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">Send Verification SMS</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedGuardian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => { setIsEditModalOpen(false); setSelectedGuardian(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1">
              ✕
            </button>
            <h3 className="text-xl font-black text-slate-900">Edit Guardian {selectedGuardian.id}</h3>
            
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
                <label className="text-xs font-bold text-slate-700 mb-1 block">Location</label>
                <input 
                  type="text" 
                  value={editFormData.location || ''} 
                  onChange={e => setEditFormData({...editFormData, location: e.target.value})}
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
              <button onClick={() => { setIsEditModalOpen(false); setSelectedGuardian(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl bg-slate-900 font-black text-white text-xs shadow-sm hover:bg-slate-800 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
