import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Clock, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Search,
  ExternalLink,
  Wallet
} from 'lucide-react';
import type { Order, DepositRequest, User } from '../types';
import { api } from '../api';

interface MyOrdersProps {
  currentUser: User;
  onTrackOrder: (trackingId: string) => void;
  onViewReceipt: (order: Order) => void;
  onOpenAddMoney: () => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
  currentUser,
  onTrackOrder,
  onViewReceipt,
  onOpenAddMoney,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'deposits'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, depositsRes] = await Promise.all([
        api.getMyOrders(),
        api.getMyDeposits()
      ]);
      setOrders(ordersRes.orders || []);
      setDeposits(depositsRes.deposits || []);
    } catch (err) {
      console.error('Failed to load user orders/deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">সম্পন্ন হয়েছে</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">সার্ভারে প্রক্রিয়াধীন</span>;
      case 'verified':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">কাগজপত্র যাচাইকৃত</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">বাতিল</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">অপেক্ষমান (Pending)</span>;
    }
  };

  const getDepositStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">অনুমোদিত (Approved)</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">বাতিল (Rejected)</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">যাচাই চলছে (Pending)</span>;
    }
  };

  return (
    <div id="my-orders-section" className="space-y-6">
      {/* Profile Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
              ব্যবহারকারী প্রোফাইল
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            মোবাইল নম্বর: <span className="font-semibold text-slate-700">{currentUser.phone}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right sm:border-r sm:border-slate-200 sm:pr-4">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">বর্তমান ওয়ালেট ব্যালেন্স</span>
            <span className="text-2xl font-extrabold text-emerald-800">
              ৳{currentUser.balance.toLocaleString('bn-BD')}
            </span>
          </div>
          <button
            onClick={onOpenAddMoney}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            + এড মানি
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>আমার সংশোধন আবেদনসমূহ ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('deposits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'deposits'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>এড মানি / ডিপোজিট হিস্ট্রি ({deposits.length})</span>
        </button>
      </div>

      {/* Orders List */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">কোনো আবেদন করা হয়নি</h3>
              <p className="text-xs text-slate-500 mt-1">সেবা তালিকা থেকে আপনার প্রয়োজনীয় সংশোধন আবেদনটি দাখিল করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
                        {ord.trackingId}
                      </span>
                      {getOrderStatusBadge(ord.status)}
                      <span className="text-xs text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {ord.serviceName}
                    </h3>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong className="text-slate-700">সংশোধনের বিষয়:</strong> {ord.correctionType}</span>
                      <span><strong className="text-slate-700">পরিশোধিত ফি:</strong> ৳{ord.feePaid}</span>
                      <span><strong className="text-slate-700">ডেলিভারি:</strong> {ord.deliveryType === 'urgent' ? 'জরুরি' : 'সাধারণ'}</span>
                    </div>

                    {ord.adminRemarks && (
                      <div className="text-xs bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-200 max-w-xl">
                        <strong>এডমিন নোট:</strong> {ord.adminRemarks}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => onTrackOrder(ord.trackingId)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-emerald-700" />
                      <span>লাইভ স্ট্যাটাস</span>
                    </button>

                    <button
                      onClick={() => onViewReceipt(ord)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>আবেদন স্লিপ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deposits List */}
      {activeSubTab === 'deposits' && (
        <div className="space-y-4">
          {deposits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
              <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">কোনো ডিপোজিট রেকর্ড নেই</h3>
              <p className="text-xs text-slate-500 mt-1">বিকাশ, নগদ বা রকেটের মাধ্যমে টাকা জমা দিয়ে শুরু করুন।</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">তারিখ</th>
                      <th className="p-3.5">মেথড</th>
                      <th className="p-3.5">প্রেরক নম্বর</th>
                      <th className="p-3.5">TrxID</th>
                      <th className="p-3.5">পরিমাণ</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5">মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(dep.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-3.5 font-bold uppercase text-slate-800">
                          {dep.method}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          {dep.senderNumber}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {dep.trxId}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-800 text-sm">
                          ৳{dep.amount}
                        </td>
                        <td className="p-3.5">
                          {getDepositStatusBadge(dep.status)}
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-xs truncate">
                          {dep.adminNote || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
