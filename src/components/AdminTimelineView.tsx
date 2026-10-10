import React, { useState } from 'react';
import { Activity, Clock, CheckCircle, FileText, Code } from 'lucide-react';

const mockTimeline = [
  { id: 1, title: 'Tuition Created', time: 'Oct 20, 2026 - 10:30 AM', actor: 'Guardian ID: G-101', color: 'bg-slate-500', details: 'Initial payload submitted from IP 103.25.xxx.xx' },
  { id: 2, title: '5 Teachers Applied', time: 'Oct 21, 2026 - 02:15 PM', actor: 'System', color: 'bg-blue-500', details: 'IDs: A45348A, T88219B, K99120C, L1122, M3344' },
  { id: 3, title: 'Guardian Shortlisted 2 Tutors', time: 'Oct 22, 2026 - 09:00 AM', actor: 'Guardian ID: G-101', color: 'bg-amber-500', details: 'Selected A45348A and T88219B for demo.' },
  { id: 4, title: 'Demo Class Scheduled with Muntasir Mamun', time: 'Oct 23, 2026 - 11:30 AM', actor: 'Admin: Admin-01', color: 'bg-orange-500', details: 'Demo ID: D-801. Date set for Oct 24.' },
  { id: 5, title: 'Demo Completed', time: 'Oct 24, 2026 - 05:00 PM', actor: 'System Auto-Update', color: 'bg-indigo-500', details: 'Guardian submitted feedback: Positive.' },
  { id: 6, title: 'Teacher Selected & Tuition Confirmed', time: 'Oct 25, 2026 - 10:00 AM', actor: 'Admin: Admin-01', color: 'bg-purple-500', details: 'Status transitioned: DEMO_COMPLETED -> CONFIRMED.' },
  { id: 7, title: 'Commission Payment Received', time: 'Oct 26, 2026 - 01:20 PM', actor: 'System Gateway', color: 'bg-emerald-500', details: 'bKash TrxID: TRX-99821 verified.' },
];

export const AdminTimelineView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">T-1024</span>
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold text-[10px] uppercase">Confirmed</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Mathematics (Class 9)</h2>
          <p className="text-xs font-medium text-slate-500">Guardian: Md. Shafiqul Islam</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-bold">Total Days Active</p>
          <p className="text-2xl font-black text-[#84CC16]">6 Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#84CC16]" /> Activity Timeline
          </h3>
          <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
            {mockTimeline.map((node, i) => (
              <div key={node.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white ${node.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10`} />
                 <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-xs cursor-pointer hover:border-slate-300 transition-colors" onClick={() => setSelectedNode(node)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500">{node.time}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{node.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Actor: {node.actor}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Audit Detail
            </h3>
            {selectedNode ? (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <p className="text-xs font-bold text-slate-500">Event Title</p>
                  <p className="text-sm font-bold text-slate-900">{selectedNode.title}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Timestamp</p>
                  <p className="text-sm font-medium text-slate-900">{selectedNode.time}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Actor</p>
                  <p className="text-sm font-medium text-slate-900">{selectedNode.actor}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Code className="w-4 h-4"/> Raw Payload / Logs</p>
                  <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-[10px] text-lime-400 font-mono">
{`{
  "eventId": "evt_${selectedNode.id}9982",
  "tuitionId": "T-1024",
  "type": "STATE_TRANSITION",
  "metadata": {
    "details": "${selectedNode.details}"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">Click a timeline node to view raw audit logs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
