import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertCircle,
  Eye,
  Trash2,
  Ban,
  Edit,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const AdminTutorsView: React.FC = () => {
  const { navigateToTutorProfile, blockTutor, verifyTutor } = useApp();

  const [tutors, setTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [universityFilter, setUniversityFilter] = useState('All');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [toastMessage, setToastMessage] = useState('');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleBlockToggle = async (tutor: any) => {
    const isCurrentlyBlocked = tutor.status === 'blocked' || tutor.status === 'suspended';
    const newStatus = isCurrentlyBlocked ? 'active' : 'blocked';
    const ok = await blockTutor(tutor.id || tutor.tutorCode, newStatus);
    if (ok) {
      setTutors(prev =>
        prev.map(t => (t.id === tutor.id || t.tutorCode === tutor.tutorCode ? { ...t, status: newStatus } : t))
      );
      if (selectedTutor && (selectedTutor.id === tutor.id || selectedTutor.tutorCode === tutor.tutorCode)) {
        setSelectedTutor({ ...selectedTutor, status: newStatus });
      }
      showToast(`Tutor ${tutor.name} ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully.`);
    }
  };

  const handleVerifyToggle = async (tutor: any) => {
    const newVerified = !tutor.verified;
    const ok = await verifyTutor(tutor.id || tutor.tutorCode, newVerified);
    if (ok) {
      setTutors(prev =>
        prev.map(t => (t.id === tutor.id || t.tutorCode === tutor.tutorCode ? { ...t, verified: newVerified } : t))
      );
      if (selectedTutor && (selectedTutor.id === tutor.id || selectedTutor.tutorCode === tutor.tutorCode)) {
        setSelectedTutor({ ...selectedTutor, verified: newVerified });
      }
      showToast(`Tutor ${tutor.name} verification status updated.`);
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
      showToast('Tutor information updated successfully.');
    } catch (e) {
      console.error(e);
    }
  };

  // Filter tutors
  const filteredTutors = tutors.filter(t => {
    const isBlocked = t.status === 'blocked' || t.status === 'suspended';
    if (statusFilter === 'active' && isBlocked) return false;
    if (statusFilter === 'blocked' && !isBlocked) return false;

    if (universityFilter !== 'All' && !(t.university || '').toLowerCase().includes(universityFilter.toLowerCase())) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (t.name || t.fullName || '').toLowerCase().includes(q);
      const matchId = (t.id || t.tutorCode || '').toLowerCase().includes(q);
      const matchPhone = (t.phone || '').toLowerCase().includes(q);
      const matchUni = (t.university || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchPhone && !matchUni) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-xs animate-fade-in font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Tutor Management</h2>
          <p className="text-sm text-slate-500 font-medium">
            View, verify, block, and manage registered tutors on the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 flex items-center gap-2 hover:bg-slate-50 shadow-xs cursor-pointer">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, phone, or university..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#84CC16]"
          />
        </div>

        <select
          value={universityFilter}
          onChange={e => setUniversityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer"
        >
          <option value="All">All Universities</option>
          <option value="BUET">BUET</option>
          <option value="DU">Dhaka University (DU)</option>
          <option value="NSU">North South University (NSU)</option>
          <option value="BRAC">BRAC University</option>
          <option value="CUET">CUET</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white cursor-pointer"
        >
          <option value="All">All Statuses ({tutors.length})</option>
          <option value="active">Active Only</option>
          <option value="blocked">Blocked / Suspended Only</option>
        </select>
      </div>

      {/* Tutors Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-12"><input type="checkbox" className="rounded-sm" /></th>
                <th className="p-4">Tutor Info</th>
                <th className="p-4">University & Dept</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Profile Meter</th>
                <th className="p-4 text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading tutors database...
                  </td>
                </tr>
              ) : filteredTutors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No tutors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTutors.map((tutor) => {
                  const isBlocked = tutor.status === 'blocked' || tutor.status === 'suspended';
                  return (
                    <tr key={tutor.id || tutor.tutorCode} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4"><input type="checkbox" className="rounded-sm" /></td>
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={tutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=84cc16&color=fff&bold=true`}
                          alt={tutor.name}
                          className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="text-slate-900 font-bold flex items-center gap-1.5">
                            {tutor.name}
                            {tutor.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#84CC16] fill-lime-100" />
                            )}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Code: <strong className="text-slate-700">{tutor.tutorCode || tutor.id}</strong> • {tutor.phone || '017XXXXXXXX'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{tutor.university || 'University'}</span>
                          <span className="text-[11px] text-slate-500">{tutor.department || 'General'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                          isBlocked
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isBlocked ? (
                            <>
                              <XCircle className="w-3 h-3" /> Blocked
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        {tutor.verified ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-[#65A30D]">
                            <ShieldCheck className="w-3.5 h-3.5" /> NID Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                            <AlertCircle className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="bg-[#84CC16] h-full rounded-full"
                              style={{ width: `${tutor.completion || 70}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{tutor.completion || 70}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => navigateToTutorProfile(tutor.id || tutor.tutorCode)}
                            title="View Full Profile"
                            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Stats Drawer */}
                          <button
                            onClick={() => setSelectedTutor(tutor)}
                            title="View Lifetime Stats"
                            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          </button>

                          {/* Block / Unblock Button */}
                          <button
                            onClick={() => handleBlockToggle(tutor)}
                            title={isBlocked ? "Unblock Tutor" : "Block Tutor"}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => handleEditClick(tutor)}
                            title="Quick Edit"
                            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Modal for Lifetime Stats & Quick Actions */}
      {selectedTutor && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-200">
            <button
              onClick={() => setSelectedTutor(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedTutor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTutor.name)}&background=84cc16&color=fff&bold=true`}
                alt="Avatar"
                className="w-16 h-16 rounded-full border border-slate-200 object-cover"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{selectedTutor.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    selectedTutor.status === 'blocked' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedTutor.status === 'blocked' ? 'Blocked' : 'Active'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  ID: <strong className="text-slate-800">{selectedTutor.tutorCode || selectedTutor.id}</strong> • {selectedTutor.university || 'N/A'} • {selectedTutor.department || 'N/A'}
                </p>
                <p className="text-xs text-slate-600">
                  Phone: <strong>{selectedTutor.phone}</strong> • Email: <strong>{selectedTutor.email}</strong>
                </p>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Tuition Terminal Statistics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-500">Applications</span>
                <strong className="text-lg font-black text-slate-900">14</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-500">Confirmed</span>
                <strong className="text-lg font-black text-emerald-600">{selectedTutor.completion ? Math.round(selectedTutor.completion / 10) : 5}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-500">Rating</span>
                <strong className="text-lg font-black text-amber-500">★ {selectedTutor.rating || 4.8}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-500">Expected Rate</span>
                <strong className="text-sm font-black text-[#65A30D]">{selectedTutor.expectedSalary || '৳6,000'}</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedTutor(null);
                  navigateToTutorProfile(selectedTutor.id || selectedTutor.tutorCode);
                }}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black transition-colors hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View Full Profile
              </button>

              <button
                onClick={() => handleBlockToggle(selectedTutor)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                  selectedTutor.status === 'blocked'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{selectedTutor.status === 'blocked' ? 'Unblock Tutor' : 'Block Tutor'}</span>
              </button>

              <button
                onClick={() => handleVerifyToggle(selectedTutor)}
                className="py-2.5 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {selectedTutor.verified ? 'Unverify NID' : 'Verify NID'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedTutor(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-slate-900">
              Quick Edit: {selectedTutor.name}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name || editFormData.fullName || ''}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">University</label>
                <input
                  type="text"
                  value={editFormData.university || ''}
                  onChange={e => setEditFormData({ ...editFormData, university: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Department</label>
                <input
                  type="text"
                  value={editFormData.department || ''}
                  onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone || ''}
                  onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#84CC16] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Account Status</label>
                <select
                  value={editFormData.status || 'active'}
                  onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:border-[#84CC16] focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked / Suspended</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedTutor(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 font-black text-white text-xs shadow-sm hover:bg-slate-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
