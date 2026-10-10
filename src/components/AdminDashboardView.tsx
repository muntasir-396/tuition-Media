import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, BookOpen, Clock, CheckCircle, DollarSign, Activity, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export const AdminDashboardView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [metrics, setMetrics] = useState({
    tutors: 0,
    guardians: 0,
    activeTuitions: 0,
    pendingRequests: 0,
    demosToday: 0,
    confirmedMonth: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
      }
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    }
  };

  const revenueData = [
    { name: 'Jan', revenue: 4000, tuitions: 24 },
    { name: 'Feb', revenue: 3000, tuitions: 13 },
    { name: 'Mar', revenue: 2000, tuitions: 98 },
    { name: 'Apr', revenue: 2780, tuitions: 39 },
    { name: 'May', revenue: 1890, tuitions: 48 },
    { name: 'Jun', revenue: 2390, tuitions: 38 },
    { name: 'Jul', revenue: metrics.totalRevenue, tuitions: 43 },
  ];

  const statusData = [
    { name: 'Open', value: metrics.activeTuitions || 1 },
    { name: 'Pending Review', value: metrics.pendingRequests || 0 },
    { name: 'Demo', value: metrics.demosToday || 1 },
    { name: 'Confirmed', value: metrics.confirmedMonth || 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Admin Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Overview of platform metrics and activities.</p>
        </div>
      </div>

      {/* Pending Guardian Requests Banner */}
      {metrics.pendingRequests > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
              {metrics.pendingRequests}
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {metrics.pendingRequests} Pending Guardian Application{metrics.pendingRequests > 1 ? 's' : ''} Awaiting Review
              </h4>
              <p className="text-xs text-amber-800">
                Guardians submitted new tuition requirements. Review and approve them to list on the jobs feed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('admin-tuitions')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            Review Applications →
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Pending Applications', value: metrics.pendingRequests.toLocaleString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', action: () => setActiveTab('admin-tuitions') },
          { title: 'Total Guardians', value: metrics.guardians.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', action: () => setActiveTab('admin-guardians') },
          { title: 'Total Tutors', value: metrics.tutors.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', action: () => setActiveTab('admin-tutors') },
          { title: 'Active Tuitions', value: metrics.activeTuitions.toLocaleString(), icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', action: () => setActiveTab('admin-tuitions') },
          { title: 'Demos Scheduled', value: metrics.demosToday.toLocaleString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', action: () => setActiveTab('admin-demos') },
          { title: 'Confirmed Tuitions', value: metrics.confirmedMonth.toLocaleString(), icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100', action: () => setActiveTab('admin-tuitions') },
          { title: 'Total Revenue', value: `৳ ${(metrics.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-lime-600', bg: 'bg-lime-100', action: () => setActiveTab('admin-payments') },
          { title: 'Pending Payments', value: metrics.pendingPayments.toLocaleString(), icon: FileText, color: 'text-rose-600', bg: 'bg-rose-100', action: () => setActiveTab('admin-payments') },
        ].map((stat, i) => (
          <div key={i} onClick={stat.action} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-400 cursor-pointer transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-500 truncate">{stat.title}</p>
              <h3 className="text-xl font-black text-slate-900 truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue & Confirmed Tuitions</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#84CC16" fill="#84CC16" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Tuition Status Breakdown</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
             {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  {item.name}: {item.value}
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Live Activity Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#84CC16]" />
          <h3 className="text-lg font-bold text-slate-900">Live Activity Stream</h3>
        </div>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No recent activity.</p>
          ) : logs.map((log, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                    S
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-blue-500`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">System</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold mt-1 inline-block bg-blue-100 text-blue-700`}>
                    {log.action}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
