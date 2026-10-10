import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Clock, CheckCircle, Search, User, MapPin, Plus, ArrowRight, Activity, Calendar } from 'lucide-react';

export const GuardianDashboardView: React.FC = () => {
  const { setActiveTab, setSelectedJob } = useApp();

  const myTuitions = [
    { id: 'T-1024', subject: 'Mathematics (Class 9)', salary: '৳ 6,000/mo', status: 'TEACHERS_APPLIED', applicants: 5, postedAt: '2 days ago' },
    { id: 'T-998', subject: 'English (Class 7)', salary: '৳ 5,000/mo', status: 'CONFIRMED', applicants: 12, postedAt: '1 month ago', tutorName: 'Tanvir Hossain' },
    { id: 'T-1045', subject: 'Physics (Class 10)', salary: '৳ 8,000/mo', status: 'PENDING', applicants: 0, postedAt: 'Just now' },
  ];

  const upcomingDemos = [
    { id: 'D-801', tuitionId: 'T-1024', tutor: { name: 'Karim Hossain', university: 'Dhaka University', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim' }, date: 'Oct 28, 2026', time: '05:00 PM', status: 'Scheduled' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Parent Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your tuition requests and tutor demos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('tutors')} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs">
            <Search className="w-4 h-4" /> Browse Tutors
          </button>
          <button onClick={() => setActiveTab('request-tutor')} className="px-4 py-2.5 rounded-xl bg-[#84CC16] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#65A30D] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Request Tutor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
             <BookOpen className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-500 font-bold text-xs">Total Requests</p>
             <p className="text-2xl font-black text-slate-900">3</p>
           </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
             <Clock className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-500 font-bold text-xs">Active Demos</p>
             <p className="text-2xl font-black text-slate-900">1</p>
           </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
             <CheckCircle className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-500 font-bold text-xs">Hired Tutors</p>
             <p className="text-2xl font-black text-slate-900">1</p>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-[#84CC16]" /> My Tuition Requests</h3>
              </div>
              <div className="divide-y divide-slate-100">
                 {myTuitions.map(t => (
                    <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-500">ID: {t.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  t.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                                  t.status === 'TEACHERS_APPLIED' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {t.status.replace('_', ' ')}
                                </span>
                             </div>
                             <h4 className="font-bold text-slate-900 text-base">{t.subject}</h4>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-[#84CC16] text-sm">{t.salary}</p>
                             <p className="text-[11px] text-slate-400 font-medium">{t.postedAt}</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between mt-4">
                          <p className="text-xs font-bold text-slate-500">
                            {t.status === 'CONFIRMED' ? (
                               <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Hired: {t.tutorName}</span>
                            ) : (
                               <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {t.applicants} Tutors Applied</span>
                            )}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedJob({ id: t.id } as any);
                              setActiveTab('job-details');
                            }}
                            className="text-xs font-bold text-[#84CC16] hover:text-[#65A30D] flex items-center gap-1"
                          >
                            View Details <ArrowRight className="w-3 h-3" />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div>
           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200">
                 <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> Upcoming Demos</h3>
              </div>
              <div className="p-4 space-y-4">
                 {upcomingDemos.map(d => (
                    <div key={d.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                       <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">{d.status}</span>
                          <span className="text-[10px] font-bold text-slate-500 text-right">{d.tuitionId}</span>
                       </div>
                       <div className="flex items-center gap-3 mb-4">
                          <img src={d.tutor.avatar} alt={d.tutor.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                          <div>
                             <h4 className="font-bold text-slate-900 text-sm">{d.tutor.name}</h4>
                             <p className="text-xs text-slate-500 font-medium truncate max-w-[150px]">{d.tutor.university}</p>
                          </div>
                       </div>
                       <div className="space-y-2 mb-4">
                          <p className="text-xs text-slate-700 font-medium flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {d.date}</p>
                          <p className="text-xs text-slate-700 font-medium flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /> {d.time}</p>
                       </div>
                       <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                          Join Meeting / Details
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
