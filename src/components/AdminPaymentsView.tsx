import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, RefreshCcw, Download, Search, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminPaymentsView: React.FC = () => {
  const { setActiveTab, setAdminSelectedTuitionId, navigateToTutorProfile } = useApp();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (Array.isArray(data)) setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  const handleExportReport = () => {
    if (!payments.length) return;
    const headers = ["ID,Date,Amount,Method,Status"];
    const rows = payments.map(p => 
      `${p.id},${p.date || ''},${p.amount},${p.method},${p.status}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (p: any) => {
    setEditingId(p.id);
    setEditAmount(p.amount);
    setEditDate(p.date || '');
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await fetch(`/api/v1/admin/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: editAmount, paymentDate: editDate })
      });
      setEditingId(null);
      fetchPayments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTutorClick = (tutorId: string) => {
    navigateToTutorProfile(tutorId);
  };

  const handleTuitionClick = (tuitionId: string) => {
    setAdminSelectedTuitionId(tuitionId);
    setActiveTab('admin-tuition-details');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Payment & Fees Auditing</h2>
          <p className="text-sm text-slate-500 font-medium">Manage demo fees, commissions, and refunds.</p>
        </div>
        <button onClick={handleExportReport} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
           <div className="relative flex-1 min-w-[200px]">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
             <input type="text" placeholder="Search Txn ID..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden" />
           </div>
           <select className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium">
             <option>All Status</option>
             <option>COMPLETED</option>
             <option>PENDING</option>
           </select>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4 font-mono">Transaction ID</th>
                <th className="p-4">Teacher & Ref</th>
                <th className="p-4">Amount & Method</th>
                <th className="p-4">Status & Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No payments found.</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-900">{p.id}</td>
                  <td className="p-4">
                    <button onClick={() => handleTutorClick(p.tutorId)} className="block font-bold text-[#10B981] hover:underline mb-1">
                      {p.tutorId || 'N/A'}
                    </button>
                    <button onClick={() => handleTuitionClick(p.tuitionId)} className="block text-xs text-slate-500 underline hover:text-slate-700">
                      {p.tuitionId}
                    </button>
                  </td>
                  <td className="p-4">
                    {editingId === p.id ? (
                      <input 
                        type="number" 
                        value={editAmount} 
                        onChange={(e) => setEditAmount(e.target.value)} 
                        className="w-24 p-1.5 border border-slate-300 rounded text-sm"
                      />
                    ) : (
                      <div className="font-black text-slate-900 flex items-center gap-2">
                        ৳ {p.amount?.toLocaleString()}
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">{p.method}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase mb-1 ${
                      p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.status}
                    </span>
                    {editingId === p.id ? (
                      <input 
                        type="date" 
                        value={editDate} 
                        onChange={(e) => setEditDate(e.target.value)} 
                        className="block w-32 p-1.5 border border-slate-300 rounded text-xs mt-1"
                      />
                    ) : (
                      <p className="text-[11px] text-slate-500 font-medium">{p.date}</p>
                    )}
                  </td>
                  <td className="p-4 text-center space-x-2 whitespace-nowrap">
                    {editingId === p.id ? (
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => setEditingId(null)} className="px-2 py-1 text-xs bg-slate-200 rounded font-bold">Cancel</button>
                        <button onClick={() => handleSaveEdit(p.id)} className="px-2 py-1 text-xs bg-[#10B981] text-white rounded font-bold">Save</button>
                      </div>
                    ) : (
                      <button onClick={() => handleEditClick(p)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
