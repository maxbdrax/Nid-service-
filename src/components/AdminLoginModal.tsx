import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert 
} from 'lucide-react';
import type { User } from '../types';
import { api, setStoredUserId } from '../api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (user: User) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone.trim()) {
      setErrorMessage('সিক্রেট এডমিন মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('সিক্রেট এডমিন পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminLogin({
        phone: phone.trim(),
        password: password.trim(),
      });

      if (res.user.role !== 'admin') {
        throw new Error('এই অ্যাকাউন্টটির এডমিন এক্সেস অধিকার নেই।');
      }

      setStoredUserId(res.user.id);
      setSuccessMessage('সিক্রেট প্রমাণীকরণ সফল হয়েছে! এডমিন প্যানেলে নিয়ে যাওয়া হচ্ছে...');
      
      setTimeout(() => {
        onAdminLoginSuccess(res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'ভুল সিক্রেট নম্বর অথবা পাসওয়ার্ড! প্রবেশাধিকার প্রত্যাখ্যাত।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div 
        id="admin-security-modal"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-6 transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Security Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight">এডমিন সিক্রেট অথেন্টিকেশন</h2>
                </div>
                <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-red-500/30 text-red-200 border border-red-400/40 rounded">
                  RESTRICTED ACCESS
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-purple-200/90 mt-3 leading-relaxed relative z-10">
            এডমিন কন্ট্রোল প্যানেলে কোনো ডেমো বা অটো লগইন নেই। শুধুমাত্র অনুমোদিত সিক্রেট মোবাইল নম্বর এবং সিক্রেট পাসওয়ার্ড ব্যবহার করে প্রবেশ করুন।
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2.5 text-[11px] text-amber-900 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>অননুমোদিত বা ভুল ক্রেডেনশিয়াল দিয়ে প্রবেশের চেষ্টা সিস্টেম অডিটে রেকর্ড হয়।</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Secret Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-700" />
              <span>সিক্রেট এডমিন মোবাইল নম্বর</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="admin-secret-phone-input"
                type="tel"
                required
                placeholder="017xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="off"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              সিস্টেমে কনফিগার করা একমাত্র সিক্রেট এডমিন নম্বর
            </p>
          </div>

          {/* Secret Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-700" />
              <span>সিক্রেট এডমিন পাসওয়ার্ড</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="admin-secret-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="সিক্রেট পাসওয়ার্ড টাইপ করুন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                className="w-full pl-3.5 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="font-semibold leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="font-bold leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              id="admin-secret-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সিক্রেট প্রমাণীকরণ যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-300" />
                  <span>যাচাই করুন ও এডমিন প্যানেলে প্রবেশ করুন</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              বাতিল করুন (পাবলিক পোর্টালে ফিরে যান)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
