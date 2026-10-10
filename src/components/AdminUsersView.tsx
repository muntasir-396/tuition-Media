import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Plus, Edit, Trash2, ShieldCheck, Search, Shield, Ban, CheckCircle } from 'lucide-react';

const mockAdmins = [
  { id: 'ADM-01', username: 'superadmin', name: 'Super Administrator', role: 'Super Admin', status: 'Active', lastLogin: 'Just now' },
  { id: 'ADM-02', username: 'coadmin', name: 'Muntasir Mamun', role: 'Co-Admin', status: 'Active', lastLogin: '2 hrs ago' },
  { id: 'ADM-03', username: 'moderator1', name: 'Sadia Rahman', role: 'Co-Admin', status: 'Suspended', lastLogin: '5 days ago' },
];

export const AdminUsersView: React.FC = () => {
  const { currentUser } = useApp();

  if (currentUser?.role !== 'super-admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-3xl font-black text-slate-900 mb-2">403 - Access Denied</h2>
        <p className="text-slate-500 font-medium max-w-md">
          You do not have the required Super Admin privileges to view or manage system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Admin Management</h2>
          <p className="text-sm text-slate-500 font-medium">Manage co-admins, roles, and global permissions.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800">
          <Plus className="w-4 h-4" /> Create New Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
           <div className="relative flex-1 max-w-sm">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
             <input type="text" placeholder="Search admins..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden" />
           </div>
           <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
             <Shield className="w-3.5 h-3.5 text-blue-500" /> Authorized Personnel Only
           </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Admin Info</th>
                <th className="p-4">Role & Access</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold">
              {mockAdmins.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="text-slate-900 font-bold">{admin.name}</p>
                    <p className="text-xs text-slate-500 font-medium">@{admin.username} • {admin.id}</p>
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex w-fit items-center gap-1 ${
                        admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                     }`}>
                       {admin.role === 'Super Admin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                       {admin.role}
                     </span>
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs font-medium">
                     {admin.lastLogin}
                  </td>
                  <td className="p-4 text-center space-x-1 whitespace-nowrap">
                    {admin.role !== 'Super Admin' ? (
                       <>
                         <button className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg shadow-xs hover:bg-slate-100 transition-colors" title="Edit Permissions">
                           <Edit className="w-4 h-4" />
                         </button>
                         <button className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg shadow-xs hover:bg-rose-100 transition-colors" title="Suspend/Ban">
                           <Ban className="w-4 h-4" />
                         </button>
                         <button className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg shadow-xs hover:bg-red-100 transition-colors" title="Delete Admin">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">Restricted</span>
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
