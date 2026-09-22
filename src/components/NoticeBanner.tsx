import React from 'react';
import { Megaphone, PhoneCall, CheckCircle2 } from 'lucide-react';
import type { PaymentGateways } from '../types';

interface NoticeBannerProps {
  gateways: PaymentGateways | null;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ gateways }) => {
  const noticeText = gateways?.noticeText || 'সরকারি ডাটাবেজের সাথে সংগতি রেখে NID, জন্ম নিবন্ধন ও অন্যান্য দলিলের ভুল সংশোধন আবেদন গ্রহণ করা হচ্ছে।';
  const phone = gateways?.supportPhone || '01700000000';

  return (
    <div id="notice-banner-wrapper" className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs sm:text-sm py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-center sm:text-left">
          <span className="shrink-0 flex items-center justify-center bg-emerald-700/80 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
            <Megaphone className="w-3 h-3 mr-1 inline" /> জরুরি বিজ্ঞপ্তি
          </span>
          <p className="truncate text-emerald-50">
            {noticeText}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-xs font-medium text-emerald-100">
          <span className="hidden md:flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ১০০% সুরক্ষিত ও রিয়েল-টাইম ট্র্যাকিং
          </span>
          <a 
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-emerald-300" />
            <span>হেল্পলাইন: <span className="font-bold text-white">{phone}</span></span>
          </a>
        </div>
      </div>
    </div>
  );
};
