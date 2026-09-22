import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  PlusCircle, 
  ArrowRight, 
  Loader2,
  Trash2
} from 'lucide-react';
import type { ServiceItem, User, AttachedDoc, Order } from '../types';
import { api } from '../api';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenAddMoney: (neededAmount?: number) => void;
  onOrderSuccess: (order: Order, newBalance: number) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  service,
  currentUser,
  onOpenAuth,
  onOpenAddMoney,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [correctionType, setCorrectionType] = useState('');
  const [currentInfo, setCurrentInfo] = useState('');
  const [correctedInfo, setCorrectedInfo] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState<'regular' | 'urgent'>('regular');
  const [attachedFiles, setAttachedFiles] = useState<AttachedDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  // Initialize correction type when service changes
  React.useEffect(() => {
    if (service && service.correctionOptions.length > 0) {
      setCorrectionType(service.correctionOptions[0]);
    }
    setStep(1);
    setErrorMessage('');
    setSubmittedOrder(null);
  }, [service]);

  if (!isOpen || !service) return null;

  const currentFee = deliveryType === 'urgent' ? service.urgentFee : service.regularFee;
  const currentBalance = currentUser?.balance || 0;
  const isBalanceSufficient = currentBalance >= currentFee;
  const missingAmount = Math.max(0, currentFee - currentBalance);

  // Handle File Upload via base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('ফাইলের সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে পারবে।');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            dataUrl: reader.result as string,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!isBalanceSufficient) {
      setErrorMessage(`পর্যাপ্ত ব্যালেন্স নেই। আরও ৳${missingAmount} এড মানি প্রয়োজন।`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitOrder({
        userId: currentUser.id,
        serviceId: service.id,
        correctionType,
        currentInfo,
        correctedInfo,
        documentNumber,
        applicantAddress,
        deliveryType,
        attachedFiles,
        userEmail
      });

      setSubmittedOrder(res.order);
      onOrderSuccess(res.order, res.remainingBalance);
    } catch (err: any) {
      setErrorMessage(err.message || 'আবেদন জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="application-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                {service.title}
              </h2>
              <p className="text-xs text-emerald-200">
                ভুল সংশোধন ও অনলাইন আবেদন ফর্ম
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If successfully submitted: show Confirmation Screen */}
        {submittedOrder ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-900">
              আবেদন সফলভাবে গ্রহণ করা হয়েছে!
            </h3>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">ট্র্যাকিং নম্বর:</span>
                <span className="font-mono font-bold text-emerald-900 text-base">{submittedOrder.trackingId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">সেবা:</span>
                <span className="font-medium text-slate-800">{submittedOrder.serviceName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">পরিশোধিত ফি:</span>
                <span className="font-bold text-slate-900">৳{submittedOrder.feePaid}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">বর্তমান স্ট্যাটাস:</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                  অপেক্ষমান (Pending)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার আবেদনটি সংশ্লিষ্ট এডমিন প্যানেলে প্রেরণ করা হয়েছে। এডমিন দ্রুত যাচাইপূর্বক সরকারি সার্ভারে প্রক্রিয়াজাত করবেন।
            </p>

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-xs transition-all"
              >
                সম্পন্ন করুন
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Form */
          <div className="p-6 space-y-6">
            
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  step >= 1 ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>1</span>
                <span>সংশোধনের বিবরণ</span>
              </button>

              <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />

              <button
                onClick={() => {
                  if (currentInfo && correctedInfo) setStep(2);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  step >= 2 ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>2</span>
                <span>কাগজপত্র ও ঠিকানা</span>
              </button>

              <div className={`h-0.5 w-12 ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />

              <button
                onClick={() => {
                  if (currentInfo && correctedInfo) setStep(3);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  step === 3 ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 3 ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>3</span>
                <span>ফি ও কনফার্মেশন</span>
              </button>
            </div>

            {/* STEP 1: Correction Details */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Correction Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    সংশোধনের ধরন নির্বাচন করুন <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={correctionType}
                    onChange={(e) => setCorrectionType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium text-slate-800"
                  >
                    {service.correctionOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current vs Corrected Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1.5">
                      বিদ্যমান ভুল তথ্য (যা সনদে এখন লেখা আছে) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="যেমন: MD SHORIFUL ISLAM (ভুল বানান) অথবা ভুল জন্মতারিখ ০১/০১/১৯৯০"
                      value={currentInfo}
                      onChange={(e) => setCurrentInfo(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-red-50/40 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">
                      কাঙ্ক্ষিত সঠিক তথ্য (যা সংশোধনের পর হবে) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="যেমন: MD SHARIFUL ISLAM (সঠিক বানান) অথবা সঠিক জন্মতারিখ ১৫/০৩/১৯৯২"
                      value={correctedInfo}
                      onChange={(e) => setCorrectedInfo(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-emerald-50/40 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বর্তমান ডকুমেন্টের নম্বর (NID নম্বর / জন্ম নিবন্ধন ১৭ ডিজিট / সনদ নম্বর) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 19952691234567890"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={!currentInfo.trim() || !correctedInfo.trim()}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <span>পরবর্তী ধাপ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Address & Documents Upload */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Applicant Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আবেদনকারীর ঠিকানা (গ্রাম/মহল্লা, ডাকঘর, উপজেলা, জেলা)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: গ্রাম: রূপনগর, ডাকঘর: সদর, উপজেলা: সাভার, জেলা: ঢাকা"
                    value={applicantAddress}
                    onChange={(e) => setApplicantAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক - আপডেটের জন্য)
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                {/* Supporting Documents Checklist */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    প্রয়োজনীয় প্রমাণক কাগজপত্রের তালিকা:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    {service.requiredDocs.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    প্রমাণক ছবি বা স্ক্যান কপি আপলোড করুন (ছবি বা PDF)
                  </label>
                  
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">ফাইল আপলোড করতে ক্লিক করুন</span>
                    <span className="text-[11px] text-slate-400">JPG, PNG, PDF (সর্বোচ্চ ৮ মেগাবাইট)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Attached Files List */}
                  {attachedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <span className="text-xs font-bold text-slate-700">সংযুক্ত ফাইল ({attachedFiles.length}টি):</span>
                      {attachedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate font-medium text-slate-800">{file.name}</span>
                            {file.size && <span className="text-[10px] text-slate-400">({file.size})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    আগের ধাপ
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <span>পরবর্তী ধাপ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Urgency, Fee and Confirmation */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Urgency Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    ডেলিভারির ধরন বেছে নিন
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('regular')}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                        deliveryType === 'regular'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-bold text-slate-900">সাধারণ ডেলিভারি</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {service.regularDays}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-800">
                        ৳{service.regularFee}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('urgent')}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                        deliveryType === 'urgent'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">জরুরি ডেলিভারি</span>
                          <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded">
                            FAST
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {service.urgentDays}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-800">
                        ৳{service.urgentFee}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">নির্বাচিত সার্ভিস:</span>
                    <span className="font-semibold text-slate-800">{service.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">সংশোধনের বিষয়:</span>
                    <span className="font-semibold text-slate-800">{correctionType}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">নির্ধারিত আবেদন ফি:</span>
                    <span className="font-extrabold text-slate-900 text-sm">৳{currentFee}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>আপনার বর্তমান ওয়ালেট ব্যালেন্স:</span>
                    </div>
                    <span className={`text-sm font-extrabold ${isBalanceSufficient ? 'text-emerald-700' : 'text-red-600'}`}>
                      ৳{currentBalance}
                    </span>
                  </div>
                </div>

                {/* Insufficient Balance Alert or Prompt to Login */}
                {!currentUser ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                    <span>আবেদন সম্পন্ন করতে অনুগ্রহ করে নাম ও মোবাইল নম্বর দিয়ে লগইন করুন।</span>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-3 py-1.5 bg-amber-700 text-white font-bold rounded-lg shrink-0 hover:bg-amber-800"
                    >
                      লগইন করুন
                    </button>
                  </div>
                ) : !isBalanceSufficient ? (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-red-800">
                      <span className="font-bold">অপর্যাপ্ত ওয়ালেট ব্যালেন্স!</span>
                      <span>ঘাটতি: ৳{missingAmount}</span>
                    </div>
                    <p className="text-red-700">
                      এই আবেদনের জন্য নির্ধারিত ফি ৳{currentFee}। অনুগ্রহ করে বিকাশ, নগদ বা রকেটের মাধ্যমে ওয়ালেটে এড মানি করুন।
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenAddMoney(missingAmount)}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs hover:from-emerald-700 hover:to-teal-700"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>এড মানি করুন (৳{missingAmount})</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স আছে। সাবমিট করলে স্বয়ংক্রিয়ভাবে ৳{currentFee} কর্তন হবে।</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Final Submit / Back */}
                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    আগের ধাপ
                  </button>

                  <button
                    type="button"
                    id="submit-order-final-btn"
                    disabled={loading || !currentUser || !isBalanceSufficient}
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>প্রক্রিয়াজাত হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>নিশ্চিত করুন ও ফি পরিশোধ করুন (৳{currentFee})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
