import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  FileCheck, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import type { ServiceItem, CorrectionCategory } from '../types';

interface ServicesListProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  onSelectService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | CorrectionCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchCategory = selectedCategory === 'all' || srv.category === selectedCategory;
      const matchSearch =
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.correctionOptions.some((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div id="services-section" className="space-y-6">
      {/* Hero Intro Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-8 shadow-lg border border-emerald-700/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>বাংলাদেশ অনলাইন ডকুমেন্ট সংশোধন পোর্টাল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            জাতীয় পরিচয়পত্র, জন্ম নিবন্ধন ও সরকারি কাগজপত্র সংশোধন
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed max-w-2xl">
            ঘরে বসেই আপনার ভুল তথ্য সংশোধনের আবেদন করুন। সঠিক প্রমাণক আপলোড করুন, বিকাশ/নগদ/রকেটের মাধ্যমে নির্ধারিত ফি পরিশোধ করুন এবং সরাসরি ট্র্যাকিং করুন।
          </p>
          
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-300" /> দ্রুততম সময়ে প্রসেসিং
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-300" /> রিয়েল-টাইম স্ট্যাটাস আপডেট
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-300" /> ডাউনলোডযোগ্য আবেদন স্লিপ
            </span>
          </div>
        </div>

        {/* Decorative Background Blob */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        {/* Category Tabs */}
        <div id="category-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            সকল সেবা ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('nid')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
              selectedCategory === 'nid'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            NID সেবা
          </button>
          <button
            onClick={() => setSelectedCategory('birth')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
              selectedCategory === 'birth'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            জন্ম নিবন্ধন সেবা
          </button>
          <button
            onClick={() => setSelectedCategory('other')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
              selectedCategory === 'other'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            অন্যান্য সনদ ও কাগজপত্র
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="service-search-input"
            type="text"
            placeholder="সেবা খুঁজুন (নাম, জন্মতারিখ...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">কোনো সেবা খুঁজে পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-500 mt-1">অনুগ্রহ করে ভিন্ন কোনো শব্দ দিয়ে অনুসন্ধান করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              id={`service-card-${srv.id}`}
              className="flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all p-5 group"
            >
              <div>
                {/* Header with category tag & popular badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    srv.category === 'nid'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : srv.category === 'birth'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {srv.category === 'nid' ? 'NID সংশোধন' : srv.category === 'birth' ? 'জন্ম নিবন্ধন' : 'অন্যান্য সরকারি দলিল'}
                  </span>

                  {srv.popular && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> সর্বাধিক জনপ্রিয়
                    </span>
                  )}
                </div>

                {/* Service Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                  {srv.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>

                {/* Options Chips */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {srv.correctionOptions.slice(0, 3).map((opt, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {opt}
                    </span>
                  ))}
                  {srv.correctionOptions.length > 3 && (
                    <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                      +{srv.correctionOptions.length - 3} আরও
                    </span>
                  )}
                </div>

                {/* Requirements preview */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">প্রয়োজনীয় কাগজপত্র:</span>
                  <div className="text-xs text-slate-600 flex items-start gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="truncate">{srv.requiredDocs.slice(0, 2).join(', ')}...</span>
                  </div>
                </div>
              </div>

              {/* Pricing and Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-emerald-800">
                      ৳{srv.regularFee.toLocaleString('bn-BD')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      (জরুরি ৳{srv.urgentFee.toLocaleString('bn-BD')})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{srv.regularDays}</span>
                  </div>
                </div>

                <button
                  id={`apply-btn-${srv.id}`}
                  onClick={() => onSelectService(srv)}
                  className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-all active:scale-95 group-hover:shadow-md"
                >
                  <span>আবেদন করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
