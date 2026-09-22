import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  Calendar,
  Loader2,
  ExternalLink
} from 'lucide-react';
import type { Order } from '../types';
import { api } from '../api';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReceipt: (order: Order) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  onViewReceipt,
}) => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.trackOrder(trackingId.trim());
      setOrder(res.order);
    } catch (err: any) {
      setOrder(null);
      setErrorMessage(err.message || 'আবেদন খুঁজে পাওয়া যায়নি। সঠিক ট্র্যাকিং নম্বর দিন।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">সফলভাবে সম্পন্ন হয়েছে</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">সরকারি সার্ভারে প্রক্রিয়াধীন</span>;
      case 'verified':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">প্রাথমিক যাচাই সম্পন্ন</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">আবেদন বাতিল</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">অপেক্ষমান (Pending)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="track-order-modal"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">আবেদন ট্র্যাকিং ও বর্তমান অবস্থা</h2>
              <p className="text-xs text-emerald-200">ট্র্যাকিং নম্বর দিয়ে রিয়েল-টাইম অগ্রগতি দেখুন</p>
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
          {/* Tracking Form */}
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="যেমন: REQ-2026-8491"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm uppercase font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>অনুসন্ধান করুন</span>
              )}
            </button>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Track Result Card */}
          {order && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                      {order.trackingId}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {order.serviceName}
                  </h4>
                  <p className="text-xs text-slate-600">
                    আবেদনকারী: <span className="font-semibold text-slate-800">{order.userName}</span> ({order.userPhone})
                  </p>
                </div>

                <div className="self-start sm:self-center">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Wrong vs Correct Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <span className="block text-[11px] font-bold text-red-800 uppercase mb-1">
                    বিদ্যমান ভুল তথ্য:
                  </span>
                  <p className="text-red-900 font-medium">{order.currentInfo}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <span className="block text-[11px] font-bold text-emerald-800 uppercase mb-1">
                    কাঙ্ক্ষিত সঠিক তথ্য:
                  </span>
                  <p className="text-emerald-900 font-medium">{order.correctedInfo}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  আবেদনের অগ্রগতি ও ইতিহাস:
                </h5>
                <div className="space-y-3 pl-2 border-l-2 border-emerald-200 ml-2">
                  {order.statusHistory.map((item, idx) => (
                    <div key={idx} className="relative pl-4">
                      <div className="absolute -left-[1.35rem] top-0.5 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="text-xs font-semibold text-slate-800">
                        {item.note}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(item.timestamp).toLocaleString('bn-BD')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin remarks / Delivery download if present */}
              {order.adminRemarks && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-900">এডমিন মন্তব্য / নোটিশ:</span>
                  <p className="text-amber-800">{order.adminRemarks}</p>
                </div>
              )}

              {order.deliveryReferenceNumber && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 font-medium">সরকারি অনুমোদন রেফারেন্স নম্বর:</span>
                    <span className="block font-mono font-bold text-emerald-900">{order.deliveryReferenceNumber}</span>
                  </div>
                  {order.deliveryDocumentUrl && (
                    <a
                      href={order.deliveryDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ডাউনলোড কপি</span>
                    </a>
                  )}
                </div>
              )}

              {/* Actions: View Receipt */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onViewReceipt(order)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>আবেদন রশিদ / স্লিপ দেখুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
