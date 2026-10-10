import React from 'react';
import { useApp } from '../context/AppContext';

export const GeneralPageView: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-lime-100 text-[#65A30D] rounded-full flex items-center justify-center">
          {icon}
        </div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        <p className="text-slate-500 font-medium text-sm max-w-lg">{description}</p>
        <button className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md hover:bg-slate-800 transition-colors">
          Coming Soon
        </button>
      </div>
    </div>
  );
};
