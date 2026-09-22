import React, { useState } from 'react';
import { X, UserPlus, LogIn, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { User } from '../types';
import { api, setStoredUserId } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (tab === 'register' && !name.trim()) {
      setErrorMessage('আপনার পূর্ণ নাম প্রদান করুন।');
      return;
    }

    if (!phone.trim() || !password.trim()) {
      setErrorMessage('মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'register') {
        const res = await api.register({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
        });
        setStoredUserId(res.user.id);
        setSuccessMessage(res.message);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1000);
      } else {
        const res = await api.login({
          phone: phone.trim(),
          password: password.trim(),
        });
        setStoredUserId(res.user.id);
        setSuccessMessage(res.message);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'অপারেশন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="auth-modal"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {tab === 'register' ? 'নতুন একাউন্ট খুলুন' : 'লগইন করুন'}
            </h2>
            <p className="text-xs text-emerald-100">
              {tab === 'register' 
                ? 'নাম ও মোবাইল নম্বর দিয়ে সহজে অ্যাকাউন্ট তৈরি করুন' 
                : 'আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors ${
              tab === 'register'
                ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            একাউন্ট তৈরি (নাম ও নম্বর)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors ${
              tab === 'login'
                ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            লগইন
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মো: আবুল কাশেম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="017xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পাসওয়ার্ড / পিন <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="কমপক্ষে ৪-৬ ডিজিট বা বর্ণ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>অপেক্ষা করুন...</span>
                </>
              ) : tab === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>একাউন্ট তৈরি করুন</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>লগইন করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
