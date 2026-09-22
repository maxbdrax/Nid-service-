import React, { useState } from 'react';
import { 
  Wallet, 
  Copy, 
  Check, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Building,
  Smartphone
} from 'lucide-react';
import type { User, PaymentGateways, DepositRequest } from '../types';
import { api } from '../api';

interface AdminAddFundsProps {
  adminUser: User | null;
  gateways: PaymentGateways | null;
  recentDeposits: DepositRequest[];
  onFundsAdded: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminAddFunds: React.FC<AdminAddFundsProps> = ({
  adminUser,
  gateways,
  recentDeposits,
  onFundsAdded,
  onShowFeedback,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [amount, setAmount] = useState<string>('1000');
  const [senderNumber, setSenderNumber] = useState<string>(adminUser?.phone || '01700000000');
  const [trxId, setTrxId] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('এডমিন ফান্ড রিচার্জ');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Get active pre-defined admin number for the selected method
  const getPreDefinedAdminNumber = () => {
    if (!gateways) return '01712345678';
    switch (selectedMethod) {
      case 'bkash':
        return gateways.bkash?.number || '01712345678';
      case 'nagad':
        return gateways.nagad?.number || '01812345678';
      case 'rocket':
        return gateways.rocket?.number || '01912345678';
      default:
        return '01712345678';
    }
  };

  const getAccountType = () => {
    if (!gateways) return 'Personal';
    switch (selectedMethod) {
      case 'bkash':
        return gateways.bkash?.type || 'Personal';
      case 'nagad':
        return gateways.nagad?.type || 'Personal';
      case 'rocket':
        return gateways.rocket?.type || 'Personal';
      default:
        return 'Personal';
    }
  };

  const handleCopyNumber = () => {
    const num = getPreDefinedAdminNumber();
    navigator.clipboard.writeText(num);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateTrxId = () => {
    const prefix = selectedMethod === 'bkash' ? 'BKS' : selectedMethod === 'nagad' ? 'NGD' : 'RKT';
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const randomDigits = Math.floor(100 + Math.random() * 900);
    setTrxId(`${prefix}${randomChars}${randomDigits}`);
  };

  const handlePresetAmount = (presetVal: number) => {
    setAmount(presetVal.toString());
  };

  const handleInitiateConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 10) {
      onShowFeedback('সর্বনিম্ন ১০ টাকা বা তার বেশি ফান্ড উল্লেখ করুন।', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmAddFunds = async () => {
    setSubmitting(true);
    try {
      const numAmount = Number(amount);
      const res = await api.adminAddFunds({
        adminUserId: adminUser?.id,
        method: selectedMethod,
        amount: numAmount,
        senderNumber: senderNumber.trim() || adminUser?.phone || '01700000000',
        trxId: trxId.trim() || undefined,
        note: adminNote.trim() || undefined,
      });

      onShowFeedback(res.message, 'success');
      setShowConfirmModal(false);
      setTrxId('');
      onFundsAdded();
    } catch (err: any) {
      onShowFeedback('ফান্ড যোগ করতে ব্যর্থ হয়েছে: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentBalance = adminUser?.balance || 0;
  const numAmount = Number(amount) || 0;
  const projectedBalance = currentBalance + numAmount;
  const preDefinedNumber = getPreDefinedAdminNumber();
  const accountType = getAccountType();

  // Filter admin specific deposits
  const adminDeposits = recentDeposits.filter(
    (d) => d.id.startsWith('DEP-ADM-') || d.userId === adminUser?.id || (d.userName && d.userName.includes('এডমিন'))
  );

  return (
    <div id="admin-add-funds-container" className="space-y-6">
      
      {/* 1. Admin Wallet Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-semibold text-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>এডমিন একাউন্ট ওয়ালেট ম্যানেজমেন্ট</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              অ্যাডমিনিস্ট্রেটর ওয়ালেট রিচার্জ (Add Funds)
            </h2>
            <p className="text-xs text-purple-200/80 max-w-xl leading-relaxed">
              বিকাশ, নগদ বা রকেটের মাধ্যমে আপনার এডমিন একাউন্টে সরাসরি ফান্ড যুক্ত করুন। নির্ধারিত প্রাক-নির্ধারিত এডমিন নম্বরে টাকা পাঠিয়ে নিচে ট্রানজেকশন নিশ্চিতকরণ সম্পন্ন করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shrink-0 min-w-[240px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block">
              বর্তমান এডমিন ব্যালেন্স
            </span>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">
              ৳{currentBalance.toLocaleString('bn-BD')}
            </div>
            <div className="text-[11px] text-purple-200/70 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>{adminUser?.name || 'সুপার এডমিন'} ({adminUser?.phone || '01700000000'})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Add Funds Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          
          {/* Step 1: Select Method */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              ১. পেমেন্ট মেথড নির্বাচন করুন (বিকাশ, নগদ বা রকেট):
            </label>

            <div className="grid grid-cols-3 gap-3">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setSelectedMethod('bkash')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${
                  selectedMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-pink-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  bK
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">বিকাশ (bKash)</span>
                  <span className="text-[10px] text-pink-700 font-semibold">
                    {gateways?.bkash?.type || 'Personal'}
                  </span>
                </div>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setSelectedMethod('nagad')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${
                  selectedMethod === 'nagad'
                    ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-orange-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  ন
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">নগদ (Nagad)</span>
                  <span className="text-[10px] text-orange-700 font-semibold">
                    {gateways?.nagad?.type || 'Personal'}
                  </span>
                </div>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setSelectedMethod('rocket')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${
                  selectedMethod === 'rocket'
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  R
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">রকেট (Rocket)</span>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    {gateways?.rocket?.type || 'Personal'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Pre-defined Admin Number Highlight Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                প্রাক-নির্ধারিত এডমিন গ্রহণকারী নম্বর (Pre-defined Admin Receiving Number):
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                VERIFIED ADMIN GATEWAY
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-300">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-purple-800" />
                <div>
                  <span className="text-lg font-mono font-extrabold text-slate-900 tracking-wider">
                    {preDefinedNumber}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {selectedMethod.toUpperCase()} ({accountType})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyNumber}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>কপি নম্বর</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              * আপনার {selectedMethod === 'bkash' ? 'বিকাশ' : selectedMethod === 'nagad' ? 'নগদ' : 'রকেট'} অ্যাকাউন্ট থেকে উক্ত প্রাক-নির্ধারিত এডমিন নম্বরে প্রয়োজনীয় ফান্ড পাঠিয়ে নিচে ট্রানজেকশন তথ্য নিশ্চিত করুন।
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleInitiateConfirm} className="space-y-4">
            
            {/* Step 2: Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ২. রিচার্জের পরিমাণ (টাকা): <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">
                  ৳
                </span>
                <input
                  type="number"
                  required
                  min="10"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="যেমন: 2000"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 focus:bg-white transition-all"
                />
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[500, 1000, 2000, 5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetAmount(preset)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 rounded-lg transition-colors"
                  >
                    +৳{preset.toLocaleString('bn-BD')}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Sender & TrxID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ৩. প্রেরক মোবাইল নম্বর (Sender Phone):
                </label>
                <input
                  type="text"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="যেমন: 01700000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ৪. ট্রানজেকশন আইডি (TrxID):
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateTrxId}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>অটো জেনারেট</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder={`যেমন: ${selectedMethod === 'bkash' ? 'BKS892X7M' : selectedMethod === 'nagad' ? 'NGD982K4' : 'RKT1892L'}`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Note / Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ৫. প্রশাসনিক রেফারেন্স / নোট (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="যেমন: জরুরি সরকারি ফি ফান্ডিং / অফিসিয়াল ক্যাশ ইন"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-900 hover:to-indigo-950 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.99]"
              >
                <Wallet className="w-4 h-4" />
                <span>ফান্ড রিকোয়েস্ট যাচাই ও ট্রানজেকশন নিশ্চিতকরণ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>

        {/* Right Column: Projected Summary & Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Summary Preview Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              ট্রানজেকশন প্রাক-নিরীক্ষা (Summary)
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">নির্বাচিত মেথড:</span>
                <span className="font-bold uppercase text-purple-900">
                  {selectedMethod}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">প্রাক-নির্ধারিত গন্তব্য:</span>
                <span className="font-mono font-bold text-slate-800">
                  {preDefinedNumber}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">যোগের পরিমাণ:</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  +৳{numAmount.toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">বর্তমান ব্যালেন্স:</span>
                <span className="font-bold text-slate-700">
                  ৳{currentBalance.toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex justify-between py-2 bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                <span className="font-bold text-purple-900">নতুন প্রত্যাশিত ব্যালেন্স:</span>
                <span className="font-extrabold text-purple-900 text-base">
                  ৳{projectedBalance.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                এডমিন অ্যাকাউন্ট হওয়ায় নিশ্চিতকরণের পর অবিলম্বে ফান্ড সরাসরি আপনার ওয়ালেটে জমা হবে এবং লেজারে রেকর্ড থাকবে।
              </span>
            </div>
          </div>

          {/* Quick Help Guidelines */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block">প্রশাসনিক নির্দেশিকা:</span>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
              <li>প্রাক-নির্ধারিত এডমিন নম্বরটি <strong className="text-slate-800">পেমেন্ট গেটওয়ে সেটিংস</strong> ট্যাব থেকে যেকোনো সময় পরিবর্তন করা যায়।</li>
              <li>ফান্ড যুক্ত করার সাথে সাথে সিস্টেমের কেন্দ্রীয় অডিট লগ ও ট্রানজেকশনে ডিপোজিট এন্ট্রি তৈরি হয়।</li>
            </ul>
          </div>

        </div>

      </div>

      {/* 3. Recent Admin Add Funds Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-3">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              এডমিন ওয়ালেট ফান্ডিং ও ট্রানজেকশন হিস্ট্রি
            </h3>
            <p className="text-xs text-slate-500">
              এডমিন অ্যাকাউন্ট দ্বারা যুক্তকৃত সকল ফান্ডের তালিকা
            </p>
          </div>
          <span className="text-xs font-bold bg-purple-50 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
            মোট রেকর্ড: {adminDeposits.length} টি
          </span>
        </div>

        {adminDeposits.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            এখনও কোনো এডমিন ফান্ডিং রেকর্ড নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">তারিখ ও সময়</th>
                  <th className="p-3.5">মেথড</th>
                  <th className="p-3.5">গন্তব্য এডমিন নম্বর</th>
                  <th className="p-3.5">TrxID</th>
                  <th className="p-3.5">পরিমাণ</th>
                  <th className="p-3.5">অবস্থা</th>
                  <th className="p-3.5">মন্তব্য / রেফারেন্স</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(dep.createdAt).toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        dep.method === 'bkash' 
                          ? 'bg-pink-100 text-pink-800' 
                          : dep.method === 'nagad' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {dep.method}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">
                      {dep.gatewayNumber || '-'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {dep.trxId}
                    </td>
                    <td className="p-3.5 font-extrabold text-emerald-800 text-sm">
                      ৳{dep.amount}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        অনুমোদিত (Confirmed)
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {dep.adminNote || 'এডমিন ফান্ড'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-purple-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-base">এডমিন ওয়ালেট ট্রানজেকশন নিশ্চিতকরণ</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                আপনি কি নিশ্চিত যে আপনি নিম্নোক্ত তথ্য অনুযায়ী আপনার এডমিন ওয়ালেটে ফান্ড যুক্ত করতে চান?
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <span className="font-bold uppercase text-purple-900">{selectedMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">গন্তব্য প্রি-ডিফাইনড নম্বর:</span>
                  <span className="font-mono font-bold text-slate-900">{preDefinedNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">প্রেরক মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-slate-800">{senderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">টাকার পরিমাণ:</span>
                  <span className="font-extrabold text-emerald-800 text-sm">৳{numAmount}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-purple-950">
                  <span>নতুন ব্যালেন্স হবে:</span>
                  <span>৳{projectedBalance}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmAddFunds}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>প্রসেসিং হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>হ্যাঁ, নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
