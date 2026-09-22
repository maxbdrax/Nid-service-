import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  AlertCircle, 
  Smartphone, 
  ShieldCheck, 
  HelpCircle,
  Loader2 
} from 'lucide-react';
import type { PaymentGateways, PaymentMethod, User } from '../types';
import { api } from '../api';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  gateways: PaymentGateways | null;
  onDepositSuccess: (newDeposit: any) => void;
  suggestedAmount?: number;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  gateways,
  onDepositSuccess,
  suggestedAmount,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [senderNumber, setSenderNumber] = useState(currentUser?.phone || '');
  const [amount, setAmount] = useState<string>(suggestedAmount ? String(suggestedAmount) : '500');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const currentGateway = gateways?.[method] || {
    active: true,
    number: '01712345678',
    type: 'Personal',
    feeNotice: 'সেন্ড মানি করুন এবং TrxID দিন।'
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentGateway.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) {
      setErrorMessage('অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }

    if (!senderNumber || !amount || !trxId) {
      setErrorMessage('অনুগ্রহ করে সকল তথ্য (প্রেরক নম্বর, টাকার পরিমাণ ও TrxID) সঠিকভাবে পূরণ করুন।');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setErrorMessage('সর্বনিম্ন ১০ টাকা রিচার্জ করা যাবে।');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitDeposit({
        userId: currentUser.id,
        method,
        senderNumber,
        amount: numAmount,
        trxId: trxId.trim()
      });

      setSuccessMessage(res.message);
      onDepositSuccess(res.deposit);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'এড মানি অনুরোধ পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="add-money-modal"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ওয়ালেটে এড মানি (টাকা জমা)</h2>
              <p className="text-xs text-emerald-100">বিকাশ, নগদ ও রকেটের মাধ্যমে টাকা যুক্ত করুন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Method Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ১. পেমেন্ট মেথড নির্বাচন করুন
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setMethod('bkash')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  method === 'bkash'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-xs">
                  bK
                </span>
                <span className="text-xs font-bold">বিকাশ</span>
                <span className="text-[10px] text-pink-700 font-medium">
                  {gateways?.bkash?.type || 'Personal'}
                </span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setMethod('nagad')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  method === 'nagad'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
                  ন
                </span>
                <span className="text-xs font-bold">নগদ</span>
                <span className="text-[10px] text-orange-700 font-medium">
                  {gateways?.nagad?.type || 'Personal'}
                </span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setMethod('rocket')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  method === 'rocket'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  R
                </span>
                <span className="text-xs font-bold">রকেট</span>
                <span className="text-[10px] text-purple-700 font-medium">
                  {gateways?.rocket?.type || 'Personal'}
                </span>
              </button>
            </div>
          </div>

          {/* Admin Configured Number & Instructions Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                এডমিন প্যানেল নির্ধারিত {method.toUpperCase()} নম্বর:
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {currentGateway.type} অ্যাকাউন্ট
              </span>
            </div>

            <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-2.5 shadow-2xs">
              <span className="text-lg font-mono font-bold tracking-wider text-slate-900">
                {currentGateway.number}
              </span>
              <button
                type="button"
                id="copy-gateway-number-btn"
                onClick={handleCopyNumber}
                className="flex items-center gap-1 text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{currentGateway.feeNotice}</span>
            </p>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ২. আপনার পাঠানো তথ্যাবলী দিন
              </label>
              
              <div className="space-y-3">
                {/* Sender Mobile Number */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    প্রেরকের মোবাইল নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017xxxxxxxx"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      টাকার পরিমাণ (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      placeholder="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>

                  {/* TrxID */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: BKS92X8K10"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Amount Suggestion Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">দ্রুত নির্বাচন:</span>
              {['250', '350', '500', '1000'].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded transition-colors"
                >
                  ৳{val}
                </button>
              ))}
            </div>

            {/* Error & Success Feedback */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="submit-deposit-btn"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>এড মানি রিকোয়েস্ট পাঠান (৳{amount || '০'})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
