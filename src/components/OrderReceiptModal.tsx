import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import type { Order } from '../types';

interface OrderReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="receipt-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all"
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            সরকারি ডকুমেন্ট সংশোধন আবেদন রশিদ (Official Slip)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / সেভ করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Area */}
        <div id="printable-slip" className="p-8 space-y-6 bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-emerald-800 pb-4 space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mb-1">
              <ShieldCheck className="w-7 h-7 text-emerald-800" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত
            </h2>
            <h3 className="text-base font-bold text-emerald-800">
              জাতীয় পরিচয়পত্র ও জন্ম নিবন্ধন সংশোধন পোর্টাল
            </h3>
            <p className="text-xs text-slate-500">
              অনলাইন আবেদন দাখিল ও ফি পরিশোধের অফিসিয়াল রশিদ
            </p>
          </div>

          {/* Barcode & Tracking Meta */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">আবেদন ট্র্যাকিং নম্বর:</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 tracking-widest mt-0.5">
                {order.trackingId}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')} | সময়: {new Date(order.createdAt).toLocaleTimeString('bn-BD')}
              </div>
            </div>

            {/* Barcode & QR Simulation */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="h-9 w-32 bg-slate-800 flex items-center justify-between px-1.5 py-1 rounded">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full bg-white ${i % 3 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-0.5' : 'w-1'}`}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-slate-500 tracking-widest block mt-0.5">
                  {order.trackingId}
                </span>
              </div>
              
              <div className="w-12 h-12 border border-slate-300 rounded flex items-center justify-center bg-white p-1">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
            </div>
          </div>

          {/* Service & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">আবেদনকারীর বিবরণ:</span>
              <p><span className="font-semibold text-slate-700">নাম:</span> {order.userName}</p>
              <p><span className="font-semibold text-slate-700">মোবাইল:</span> {order.userPhone}</p>
              {order.userEmail && <p><span className="font-semibold text-slate-700">ইমেইল:</span> {order.userEmail}</p>}
              {order.applicantAddress && <p><span className="font-semibold text-slate-700">ঠিকানা:</span> {order.applicantAddress}</p>}
            </div>

            <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">সার্ভিস ও সংশোধন তথ্য:</span>
              <p><span className="font-semibold text-slate-700">সার্ভিস:</span> {order.serviceName}</p>
              <p><span className="font-semibold text-slate-700">সংশোধনের বিষয়:</span> {order.correctionType}</p>
              <p><span className="font-semibold text-slate-700">মূল ডকুমেন্ট নং:</span> <span className="font-mono font-bold">{order.documentNumber || 'N/A'}</span></p>
              <p><span className="font-semibold text-slate-700">ডেলিভারি ধরন:</span> {order.deliveryType === 'urgent' ? 'জরুরি (২৪ ঘণ্টা)' : 'সাধারণ'}</p>
            </div>
          </div>

          {/* Detailed Correction Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-200">
              সংশোধনের বিবরণী (Correction Summary)
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-3 bg-red-50/40 flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-bold text-red-800 shrink-0 w-36">বিদ্যমান ভুল তথ্য:</span>
                <span className="text-red-950 font-medium">{order.currentInfo}</span>
              </div>
              <div className="p-3 bg-emerald-50/40 flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-bold text-emerald-800 shrink-0 w-36">কাঙ্ক্ষিত সঠিক তথ্য:</span>
                <span className="text-emerald-950 font-semibold">{order.correctedInfo}</span>
              </div>
            </div>
          </div>

          {/* Payment & Status Receipt */}
          <div className="flex items-center justify-between border-t-2 border-dashed border-slate-200 pt-4">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>পরিশোধের অবস্থা: সফলভাবে পরিশোধিত (PAID)</span>
              </div>
              <span className="text-[11px] text-slate-500">ওয়ালেট ডিজিটাল পেমেন্ট গেটওয়ের মাধ্যমে পরিশোধিত</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">মোট ফি:</span>
              <span className="text-2xl font-extrabold text-slate-900">
                ৳{order.feePaid}
              </span>
            </div>
          </div>

          {/* Official Verification Seal & Footer */}
          <div className="pt-6 flex justify-between items-end text-xs text-slate-500 border-t border-slate-100">
            <div className="space-y-1 max-w-xs">
              <p className="font-semibold text-slate-700">জরুরি নির্দেশনাবলী:</p>
              <p className="text-[10px] leading-tight">
                এই রশিদটি সংরক্ষণ করুন। আপনার আবেদনটির সার্বক্ষণিক স্ট্যাটাস জানতে ট্র্যাকিং নম্বারটি ব্যবহার করুন।
              </p>
            </div>

            {/* Official Stamp Stamp Simulation */}
            <div className="w-28 h-28 border-2 border-dashed border-emerald-700 rounded-full flex flex-col items-center justify-center text-emerald-800 rotate-[-12deg] p-1 select-none opacity-85">
              <span className="text-[8px] font-bold uppercase tracking-widest text-center leading-none">
                VERIFIED & PAID
              </span>
              <span className="text-[10px] font-extrabold my-0.5">
                ডিজিটাল সিল
              </span>
              <span className="text-[8px] font-mono text-center leading-none">
                GOVT PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Footer print button on screen */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
