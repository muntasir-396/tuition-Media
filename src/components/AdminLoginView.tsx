import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { loginAdmin } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate backend verification
    
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', username, password })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        loginAdmin(data.user.role, username, data.user);
      } else {
        setError(data.error || 'Invalid admin credentials.');
        setIsLoading(false);
      }
    }).catch(e => {
      setError('Network error');
      setIsLoading(false);
    });
  
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-900 rounded-3xl overflow-hidden mt-8 shadow-2xl">
       {/* Background decorative elements */}
       <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-500 opacity-20 rounded-full blur-3xl" />
       <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl" />
       
       <div className="max-w-md w-full space-y-8 bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-700/50 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner mb-4">
            <Shield className="w-8 h-8 text-[#84CC16]" />
          </div>
          <h2 className="mt-2 text-3xl font-black text-white tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Secure access for authorized personnel only.
          </p>
          
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 rounded-xl p-4 flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
               <p className="text-sm font-medium text-rose-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-colors font-medium"
                  placeholder="Enter admin username"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] transition-colors font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-slate-950 bg-[#84CC16] hover:bg-[#65A30D] focus:outline-hidden disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate System'}
          </button>
        </form>
        
        <div className="mt-6 border-t border-slate-800 pt-6 text-center">
           <p className="text-xs text-slate-500 font-medium">Protected by Argon2 & Enterprise RBAC</p>
        </div>
      </div>
    </div>
  );
};
