import React, { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle, XCircle, Users, Calendar, ExternalLink, Eye, Info, RefreshCw, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Mock Link component to satisfy the user's Next.js requirement in this Vite environment
const Link = ({ href, children, className, onClick: _onClick }: any) => {
  const { setActiveTab, setAdminSelectedTuitionId, navigateToTutorProfile } = useApp();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (_onClick) _onClick(e);
    
    if (href.startsWith('/admin/tuitions/')) {
       const id = href.split('/').pop().split('?')[0];
       setAdminSelectedTuitionId(id);
       setActiveTab('admin-tuition-details');
    } else if (href.startsWith('/admin/tutors/')) {
       const id = href.split('/').pop().split('?')[0];
       setActiveTab('admin-tutors');
    }
  };

  return <a href={href} onClick={handleClick} className={className}>{children}</a>;
};

export const AdminDemosView: React.FC = () => {
  const [demos, setDemos] = useState<any[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New scheduling form state
  const [scheduleTuitionId, setScheduleTuitionId] = useState('');
  const [scheduleTutorId, setScheduleTutorId] = useState('');
  
  const { setActiveTab, setAdminSelectedTuitionId } = useApp();

  useEffect(() => {
    fetchDemos();
  }, []);

  const fetchDemos = async () => {
    try {
      const res = await fetch('/api/admin/demos');
      const data = await res.json();
      if (!Array.isArray(data)) { setLoading(false); return; }
      setDemos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = (demo: any) => {
    setSelectedDemo(demo);
    setIsSelectModalOpen(true);
  };

  const handleExecuteBatch = async () => {
    if (!selectedDemo) return;
    try {
      await fetch(`/api/admin/demos/${selectedDemo.id}/winner`, {
        method: 'POST'
      });
      setIsSelectModalOpen(false);
      
      // "Clicking 'Select Winner' must update the DemoSchedule.status = 'WINNER_SELECTED' and redirect"
      setAdminSelectedTuitionId(selectedDemo.tuitionId);
      setActiveTab('admin-tuition-details');
      
      setSelectedDemo(null);
      fetchDemos();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Multi-Teacher Demo Engine</h2>
        <p className="text-sm text-slate-500 font-medium">Manage parallel demo scheduling and automated winner selection.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-[#84CC16]" /> Schedule New Demo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-1">
             <label className="text-xs font-bold text-slate-700">Tuition ID</label>
             <input 
               type="text" 
               list="open-tuitions"
               placeholder="Enter Tuition ID (e.g. T-1024)" 
               value={scheduleTuitionId}
               onChange={(e) => setScheduleTuitionId(e.target.value)}
               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] outline-hidden transition-all" 
             />
             <datalist id="open-tuitions">
                <option value="T-1024">Class 10 Math (Dhanmondi)</option>
                <option value="T-1025">O Level Physics (Gulshan)</option>
                <option value="T-1026">Class 8 English (Banani)</option>
             </datalist>
          </div>
          <div className="space-y-1.5 md:col-span-2">
             <label className="text-xs font-bold text-slate-700">Select Applied Teacher</label>
             <select 
               value={scheduleTutorId}
               onChange={(e) => setScheduleTutorId(e.target.value)}
               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] outline-hidden transition-all bg-white"
             >
                <option value="">-- Choose from applicants --</option>
                {scheduleTuitionId && (
                  <>
                    <option value="TUT-001">Muntasir Mamun (4.8⭐) • BSc in CSE, BUET</option>
                    <option value="TUT-002">Sadia Rahman (4.5⭐) • BBA, IBA DU</option>
                  </>
                )}
             </select>
          </div>
          <div className="md:col-span-1">
             <button className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md hover:bg-slate-800 transition-colors">
                Schedule Demo
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Demo Info</th>
                <th className="p-4">Teacher & Guardian</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Loading demo engine data...</td>
                </tr>
              ) : demos.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4 pl-6 align-top">
                    <p className="text-slate-900 font-black mb-1">{d.id}</p>
                    <Link href={`/admin/tuitions/${d.tuitionId}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#84CC16]/10 text-[#65A30D] hover:bg-[#84CC16]/20 transition-colors font-bold text-xs group/link">
                      Ref: {d.tuitionId}
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="p-4 align-top">
                    <div className="space-y-2">
                       <div>
                         <Link href={`/admin/tutors/${d.tutorId}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                           {d.tutorName}
                         </Link>
                         <p className="text-xs font-medium text-slate-500">Tutor ID: {d.tutorId}</p>
                       </div>
                       <div>
                         <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Guardian</p>
                         <p className="text-xs text-slate-500">{d.guardianName} ({d.guardianPhone})</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 align-top text-slate-600 font-medium">
                     <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-slate-400"/> {d.date}</div>
                     <p className="text-xs text-slate-500 ml-6">Online / Platform via Google Meet</p>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      d.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      d.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 align-top">
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                            <Link href={`/admin/tutors/${d.tutorId}`} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors" title="View Tutor Profile">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link href={`/admin/tuitions/${d.tuitionId}`} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors" title="Tuition Details">
                              <Info className="w-4 h-4" />
                            </Link>
                        </div>
                        
                        {d.status === 'Completed' && (
                           <button onClick={() => handleSelectWinner(d)} className="w-full px-3 py-2 bg-[#84CC16] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#65A30D] transition-colors">
                             <CheckCircle className="w-4 h-4" /> Select Winner
                           </button>
                        )}
                        {d.status === 'Scheduled' && (
                           <div className="flex gap-2 w-full justify-end">
                               <button className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-colors w-full">
                                  Mark Completed
                               </button>
                               <button className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors" title="Reschedule">
                                  <RefreshCw className="w-4 h-4" />
                               </button>
                           </div>
                        )}
                        {d.status === 'Cancelled' && (
                           <button className="w-full px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                             <UserPlus className="w-4 h-4" /> Re-assign Demo
                           </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {isSelectModalOpen && selectedDemo && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Confirm Selection Cascade</h3>
                <p className="text-sm font-medium text-slate-500">
                  Selecting <strong className="text-slate-900">{selectedDemo.tutorName}</strong> for <strong className="text-[#84CC16]">{selectedDemo.tuitionId}</strong> will trigger a database mutation.
                </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <ul className="text-xs font-bold space-y-3">
                  <li className="flex items-center gap-2.5 text-emerald-600">
                      <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle className="w-3.5 h-3.5" /></div> 
                      Tuition Confirmed & Assigned (WINNER_SELECTED)
                  </li>
                  <li className="flex items-center gap-2.5 text-rose-600">
                      <div className="bg-rose-100 p-1 rounded-full"><XCircle className="w-3.5 h-3.5" /></div> 
                      Reject other completed demos
                  </li>
                  <li className="flex items-center gap-2.5 text-rose-600">
                      <div className="bg-rose-100 p-1 rounded-full"><XCircle className="w-3.5 h-3.5" /></div> 
                      Auto-cancel scheduled demos
                  </li>
                </ul>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setIsSelectModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleExecuteBatch} className="flex-1 py-3 rounded-xl bg-slate-900 font-black text-white shadow-md hover:bg-slate-800 transition-colors shadow-slate-900/20">Execute Batch Update</button>
            </div>
          </div>
         </div>
      )}
    </div>
  );
};
