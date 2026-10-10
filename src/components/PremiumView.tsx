import React, { useState } from 'react';
import { Sparkles, CheckCircle, CreditCard } from 'lucide-react';

export const PremiumView: React.FC = () => {
  const [isRequested, setIsRequested] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [trxId, setTrxId] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod || !trxId) return;
    setTimeout(() => {
      setIsRequested(true);
    }, 1000);
  };
  
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-center text-slate-900 mb-2">Premium Request</h1>
        <p className="text-slate-500 font-medium text-center text-sm max-w-lg mx-auto mb-8">
          Upgrade to Premium Tutor to get priority job matches and a verified premium badge.
        </p>

        {isRequested ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center">
             <CheckCircle className="w-12 h-12 text-amber-500 mb-4" />
             <h3 className="text-lg font-bold text-slate-900">Request Submitted</h3>
             <p className="text-sm text-slate-600 mt-2">Your premium request is pending payment verification.</p>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-amber-500" required>
                <option value="">-- Choose Option --</option>
                <option value="bkash">bKash (Send Money - 01XXXXXXXXX)</option>
                <option value="nagad">Nagad (Send Money - 01XXXXXXXXX)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction ID (TrxID)</label>
              <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. 7XJ9D..." className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-amber-500" required />
            </div>
            <button type="submit" className="w-full py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-amber-600 transition-colors">
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
