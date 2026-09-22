import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Wallet, 
  Settings, 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Save, 
  Plus, 
  Trash2, 
  Download, 
  RefreshCw,
  TrendingUp,
  ExternalLink,
  CreditCard,
  Lock,
  KeyRound,
  LogOut,
  EyeOff
} from 'lucide-react';
import type { 
  AdminStats, 
  Order, 
  DepositRequest, 
  PaymentGateways, 
  ServiceItem, 
  User, 
  OrderStatus 
} from '../types';
import { api } from '../api';
import { AdminAddFunds } from './AdminAddFunds';
import { updateOrderStatusInFirestore, updateGatewaysInFirestore } from '../firebase';

interface AdminPanelProps {
  onRefreshAll: () => void;
  onAdminLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRefreshAll, onAdminLogout }) => {
  const [adminSubTab, setAdminSubTab] = useState<'stats' | 'orders' | 'deposits' | 'wallet' | 'gateways' | 'services' | 'users' | 'security'>('orders');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [gateways, setGateways] = useState<PaymentGateways | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Selected Order for Review Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusToUpdate, setOrderStatusToUpdate] = useState<OrderStatus>('pending');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [deliveryRef, setDeliveryRef] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');

  // Selected Deposit for note
  const [depositNote, setDepositNote] = useState('');

  // Gateway edit state
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashType, setBkashType] = useState<'Personal' | 'Agent' | 'Merchant'>('Personal');
  const [bkashNotice, setBkashNotice] = useState('');

  const [nagadNumber, setNagadNumber] = useState('');
  const [nagadType, setNagadType] = useState<'Personal' | 'Agent' | 'Merchant'>('Personal');
  const [nagadNotice, setNagadNotice] = useState('');

  const [rocketNumber, setRocketNumber] = useState('');
  const [rocketType, setRocketType] = useState<'Personal' | 'Agent' | 'Merchant'>('Personal');
  const [rocketNotice, setRocketNotice] = useState('');

  const [supportPhone, setSupportPhone] = useState('');
  const [noticeText, setNoticeText] = useState('');

  // Status Filter for orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, depositsRes, settingsRes, servicesRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminDeposits(),
        api.getSettings(),
        api.getServices(),
        api.getAdminUsers(),
      ]);

      setStats(statsRes.stats);
      setOrders(ordersRes.orders || []);
      setDeposits(depositsRes.deposits || []);
      setServices(servicesRes.services || []);
      setUsers(usersRes.users || []);

      if (settingsRes.gateways) {
        setGateways(settingsRes.gateways);
        setBkashNumber(settingsRes.gateways.bkash.number);
        setBkashType(settingsRes.gateways.bkash.type);
        setBkashNotice(settingsRes.gateways.bkash.feeNotice);

        setNagadNumber(settingsRes.gateways.nagad.number);
        setNagadType(settingsRes.gateways.nagad.type);
        setNagadNotice(settingsRes.gateways.nagad.feeNotice);

        setRocketNumber(settingsRes.gateways.rocket.number);
        setRocketType(settingsRes.gateways.rocket.type);
        setRocketNotice(settingsRes.gateways.rocket.feeNotice);

        setSupportPhone(settingsRes.gateways.supportPhone);
        setNoticeText(settingsRes.gateways.noticeText);
      }
    } catch (err: any) {
      showFeedback('তথ্য লোড করতে ব্যর্থ হয়েছে: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open Order Review
  const handleOpenOrderReview = (ord: Order) => {
    setSelectedOrder(ord);
    setOrderStatusToUpdate(ord.status);
    setAdminRemarks(ord.adminRemarks || '');
    setDeliveryRef(ord.deliveryReferenceNumber || '');
    setDeliveryUrl(ord.deliveryDocumentUrl || '');
  };

  // Save Order Status
  const handleSaveOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      const res = await api.updateOrder(selectedOrder.id, {
        status: orderStatusToUpdate,
        adminRemarks,
        deliveryReferenceNumber: deliveryRef,
        deliveryDocumentUrl: deliveryUrl,
      });

      try {
        await updateOrderStatusInFirestore(
          selectedOrder.id,
          orderStatusToUpdate,
          adminRemarks,
          deliveryRef,
          deliveryUrl
        );
      } catch (fbErr) {
        console.warn('Firestore order status sync:', fbErr);
      }

      showFeedback(res.message);
      setSelectedOrder(null);
      loadAllAdminData();
      onRefreshAll();
    } catch (err: any) {
      showFeedback('আপডেট ব্যর্থ হয়েছে: ' + err.message, 'error');
    }
  };

  // Deposit Actions
  const handleDepositAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.updateDeposit(id, {
        status,
        adminNote: depositNote || (status === 'approved' ? 'এডমিন দ্বারা অনুমোদিত' : 'বাতিল করা হয়েছে'),
      });
      showFeedback(res.message);
      setDepositNote('');
      loadAllAdminData();
      onRefreshAll();
    } catch (err: any) {
      showFeedback('অ্যাকশন ব্যর্থ হয়েছে: ' + err.message, 'error');
    }
  };

  // Save Gateway Settings
  const handleSaveGateways = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedGateways = {
        bkash: { active: true, number: bkashNumber.trim(), type: bkashType, feeNotice: bkashNotice },
        nagad: { active: true, number: nagadNumber.trim(), type: nagadType, feeNotice: nagadNotice },
        rocket: { active: true, number: rocketNumber.trim(), type: rocketType, feeNotice: rocketNotice },
        supportPhone: supportPhone.trim(),
        noticeText: noticeText.trim(),
      };
      const res = await api.updateGateways(updatedGateways);

      try {
        await updateGatewaysInFirestore(updatedGateways);
      } catch (fbErr) {
        console.warn('Firestore gateways sync:', fbErr);
      }

      showFeedback(res.message);
      loadAllAdminData();
      onRefreshAll();
    } catch (err: any) {
      showFeedback('সেটিংস সংরক্ষণ ব্যর্থ: ' + err.message, 'error');
    }
  };

  // Update Service Fee
  const handleUpdateServiceFee = async (srvId: string, regFee: number, urgFee: number) => {
    try {
      const res = await api.updateService(srvId, { regularFee: regFee, urgentFee: urgFee });
      showFeedback(res.message);
      loadAllAdminData();
      onRefreshAll();
    } catch (err: any) {
      showFeedback('সার্ভিস ফি পরিবর্তন ব্যর্থ: ' + err.message, 'error');
    }
  };

  // Manual Adjust User Balance
  const handleAdjustBalance = async (userId: string) => {
    const amountStr = prompt('কত টাকা যোগ (+) বা বিয়োগ (-) করতে চান? (যেমন: 500 বা -200)');
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount)) {
      alert('সঠিক সংখ্যা দিন');
      return;
    }
    const reason = prompt('কারণ লিখুন (যেমন: কাস্টমার রিফান্ড বা বোনাস)') || 'এডমিন সমন্বয়';
    try {
      const res = await api.adjustUserBalance(userId, { amount, reason });
      showFeedback(res.message);
      loadAllAdminData();
      onRefreshAll();
    } catch (err: any) {
      showFeedback('ব্যালেন্স পরিবর্তন ব্যর্থ: ' + err.message, 'error');
    }
  };

  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [showCredPassword, setShowCredPassword] = useState(false);

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdminPassword.trim()) {
      showFeedback('বর্তমান সিক্রেট পাসওয়ার্ড প্রদান করুন।', 'error');
      return;
    }
    if (newAdminPassword && newAdminPassword !== confirmAdminPassword) {
      showFeedback('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।', 'error');
      return;
    }

    setSavingCredentials(true);
    try {
      const res = await api.updateAdminCredentials({
        currentPassword: currentAdminPassword.trim(),
        newPhone: newAdminPhone.trim() || undefined,
        newPassword: newAdminPassword.trim() || undefined,
      });
      showFeedback(res.message || 'সিক্রেট ক্রেডেনশিয়াল সফলভাবে পরিবর্তন হয়েছে!', 'success');
      setCurrentAdminPassword('');
      setNewAdminPhone('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      loadAllAdminData();
      onRefreshAll();
    } catch (err: any) {
      showFeedback(err.message || 'ক্রেডেনশিয়াল পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSavingCredentials(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) => orderStatusFilter === 'all' || o.status === orderStatusFilter
  );

  const adminUser = users.find((u) => u.role === 'admin') || users[0] || null;

  return (
    <div id="admin-panel-container" className="space-y-6">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">সেন্ট্রাল এডমিন কন্ট্রোল প্যানেল</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              আবেদন রিকোয়েস্ট যাচাই, বিকাশ/নগদ নাম্বার পরিবর্তন, এডমিন ওয়ালেট রিচার্জ ও সিকিউরিটি নিয়ন্ত্রণ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {adminUser && (
            <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2">
              <span className="text-[11px] text-purple-200">এডমিন ওয়ালেট:</span>
              <span className="font-mono font-extrabold text-white text-sm">৳{adminUser.balance.toLocaleString('bn-BD')}</span>
              <button
                onClick={() => setAdminSubTab('wallet')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs transition-colors cursor-pointer"
              >
                + এড ফান্ডস
              </button>
            </div>
          )}

          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>

          {onAdminLogout && (
            <button
              onClick={onAdminLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition-colors border border-red-400/30 cursor-pointer"
              title="এডমিন প্যানেল লক করুন"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>লক ও প্রস্থান</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border shadow-xs transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Admin Sub Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        <button
          onClick={() => setAdminSubTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'orders'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>আবেদন রিকোয়েস্টসমূহ ({orders.filter(o => o.status === 'pending').length} অপেক্ষমান)</span>
        </button>

        <button
          onClick={() => setAdminSubTab('deposits')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'deposits'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>ইউজার এড মানি ({deposits.filter(d => d.status === 'pending').length} পেন্ডিং)</span>
        </button>

        <button
          onClick={() => setAdminSubTab('wallet')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'wallet'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>এডমিন ওয়ালেট রিচার্জ (Add Funds)</span>
        </button>

        <button
          onClick={() => setAdminSubTab('gateways')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'gateways'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 text-emerald-600" />
          <span>পেমেন্ট গেটওয়ে নাম্বার ও সেটিংস</span>
        </button>

        <button
          onClick={() => setAdminSubTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'stats'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>ড্যাশবোর্ড পরিসংখ্যান</span>
        </button>

        <button
          onClick={() => setAdminSubTab('services')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'services'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>সেবা ও ফি কন্ট্রোল</span>
        </button>

        <button
          onClick={() => setAdminSubTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'users'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ব্যবহারকারী তালিকা ({users.length})</span>
        </button>

        <button
          onClick={() => setAdminSubTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            adminSubTab === 'security'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-4 h-4 text-purple-600" />
          <span>সিক্রেট লগইন পরিবর্তন</span>
        </button>
      </div>

      {/* ======================= TAB: STATS ======================= */}
      {adminSubTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold uppercase text-slate-400">মোট আবেদন</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalOrders}</div>
              <span className="text-[11px] text-slate-500">অনলাইন পোর্টাল থেকে জমা</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
              <span className="text-xs font-bold uppercase text-amber-700">অপেক্ষমান আবেদন</span>
              <div className="text-3xl font-extrabold text-amber-700 mt-1">{stats.pendingOrders}</div>
              <span className="text-[11px] text-amber-600">যাচাইয়ের অপেক্ষায়</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-xs font-bold uppercase text-emerald-800">মোট রাজস্ব আয়</span>
              <div className="text-3xl font-extrabold text-emerald-800 mt-1">৳{stats.totalRevenue}</div>
              <span className="text-[11px] text-emerald-600">পরিশোধিত আবেদন ফি</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
              <span className="text-xs font-bold uppercase text-purple-700">পেন্ডিং এড মানি</span>
              <div className="text-3xl font-extrabold text-purple-700 mt-1">{stats.pendingDepositsCount} টি</div>
              <span className="text-[11px] text-purple-600">মোট: ৳{stats.pendingDepositsAmount}</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB: ORDERS ======================= */}
      {adminSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {(['all', 'pending', 'verified', 'processing', 'completed', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderStatusFilter === st
                      ? 'bg-purple-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all'
                    ? `সকল (${orders.length})`
                    : st === 'pending'
                    ? `অপেক্ষমান (${orders.filter((o) => o.status === 'pending').length})`
                    : st === 'verified'
                    ? `যাচাইকৃত (${orders.filter((o) => o.status === 'verified').length})`
                    : st === 'processing'
                    ? `প্রক্রিয়াধীন (${orders.filter((o) => o.status === 'processing').length})`
                    : st === 'completed'
                    ? `সম্পন্ন (${orders.filter((o) => o.status === 'completed').length})`
                    : `বাতিল (${orders.filter((o) => o.status === 'rejected').length})`}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              প্রদর্শিত হচ্ছে: {filteredOrders.length} টি আবেদন
            </span>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">কোনো আবেদন পাওয়া যায়নি</h4>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">ট্র্যাকিং ID</th>
                      <th className="p-3.5">আবেদনকারী</th>
                      <th className="p-3.5">সার্ভিস ও বিষয়</th>
                      <th className="p-3.5">ডেলিভারি ও ফি</th>
                      <th className="p-3.5">বর্তমান স্ট্যাটাস</th>
                      <th className="p-3.5">তারিখ</th>
                      <th className="p-3.5 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-purple-900">
                          {ord.trackingId}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{ord.userName}</div>
                          <div className="text-slate-500 font-mono">{ord.userPhone}</div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">{ord.serviceName}</div>
                          <div className="text-slate-500 truncate">{ord.correctionType}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900">৳{ord.feePaid}</div>
                          <div className="text-[10px] text-slate-500">{ord.deliveryType === 'urgent' ? 'জরুরি' : 'সাধারণ'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            ord.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'verified'
                              ? 'bg-indigo-100 text-indigo-800'
                              : ord.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'completed'
                              ? 'সম্পন্ন'
                              : ord.status === 'processing'
                              ? 'প্রক্রিয়াধীন'
                              : ord.status === 'verified'
                              ? 'যাচাইকৃত'
                              : ord.status === 'rejected'
                              ? 'বাতিল'
                              : 'অপেক্ষমান'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenOrderReview(ord)}
                            className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-lg font-bold text-xs flex items-center gap-1 ml-auto shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>যাচাই ও একশন</span>
                          </button>
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

      {/* ======================= TAB: DEPOSITS ======================= */}
      {adminSubTab === 'deposits' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">
              ইউজারদের এড মানি / পেমেন্ট রিকোয়েস্ট তালিকা
            </h3>
            <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full font-bold">
              পেন্ডিং রিকোয়েস্ট: {deposits.filter((d) => d.status === 'pending').length} টি
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">তারিখ</th>
                    <th className="p-3.5">ব্যবহারকারী</th>
                    <th className="p-3.5">মেথড</th>
                    <th className="p-3.5">প্রেরক নম্বর</th>
                    <th className="p-3.5">TrxID</th>
                    <th className="p-3.5">পরিমাণ</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(dep.createdAt).toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{dep.userName}</div>
                        <div className="text-slate-500 font-mono">{dep.userPhone}</div>
                      </td>
                      <td className="p-3.5 font-bold uppercase text-purple-900">
                        {dep.method}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {dep.senderNumber}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-800 text-sm">
                        {dep.trxId}
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-900 text-sm">
                        ৳{dep.amount}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          dep.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dep.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dep.status === 'approved'
                            ? 'অনুমোদিত'
                            : dep.status === 'rejected'
                            ? 'বাতিল'
                            : 'অপেক্ষমান'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {dep.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDepositAction(dep.id, 'approved')}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs"
                              title="টাকা যোগ করুন"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>অনুমোদন করুন</span>
                            </button>
                            <button
                              onClick={() => handleDepositAction(dep.id, 'rejected')}
                              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs"
                              title="বাতিল করুন"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">সম্পন্ন</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB: ADMIN ADD FUNDS ======================= */}
      {adminSubTab === 'wallet' && (
        <AdminAddFunds
          adminUser={adminUser}
          gateways={gateways}
          recentDeposits={deposits}
          onFundsAdded={() => {
            loadAllAdminData();
            onRefreshAll();
          }}
          onShowFeedback={showFeedback}
        />
      )}

      {/* ======================= TAB: GATEWAY SETTINGS ======================= */}
      {adminSubTab === 'gateways' && (
        <form onSubmit={handleSaveGateways} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                পেমেন্ট গেটওয়ে নম্বর ও একাউন্ট টাইপ কনফিগারেশন
              </h3>
              <p className="text-xs text-slate-500">
                এখানে যে নম্বর সংরক্ষণ করবেন, সকল ব্যবহারকারী এড মানি করার সময় হুবহু সেই নম্বরটি দেখতে পাবে।
              </p>
            </div>

            {/* Gateway Numbers Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* bKash Config */}
              <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-xs">
                      bK
                    </span>
                    <span className="font-bold text-pink-900 text-sm">বিকাশ গেটওয়ে</span>
                  </div>
                  <select
                    value={bkashType}
                    onChange={(e) => setBkashType(e.target.value as any)}
                    className="text-xs font-bold bg-white border border-pink-300 rounded px-2 py-1 text-pink-800"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Agent">Agent (Cash In)</option>
                    <option value="Merchant">Merchant (Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিকাশ নম্বর: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    নির্দেশনা টেক্সট:
                  </label>
                  <textarea
                    rows={2}
                    value={bkashNotice}
                    onChange={(e) => setBkashNotice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-pink-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Nagad Config */}
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
                      ন
                    </span>
                    <span className="font-bold text-orange-900 text-sm">নগদ গেটওয়ে</span>
                  </div>
                  <select
                    value={nagadType}
                    onChange={(e) => setNagadType(e.target.value as any)}
                    className="text-xs font-bold bg-white border border-orange-300 rounded px-2 py-1 text-orange-800"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Agent">Agent (Cash In)</option>
                    <option value="Merchant">Merchant (Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    নগদ নম্বর: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nagadNumber}
                    onChange={(e) => setNagadNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    নির্দেশনা টেক্সট:
                  </label>
                  <textarea
                    rows={2}
                    value={nagadNotice}
                    onChange={(e) => setNagadNotice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-orange-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Rocket Config */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      R
                    </span>
                    <span className="font-bold text-purple-900 text-sm">রকেট গেটওয়ে</span>
                  </div>
                  <select
                    value={rocketType}
                    onChange={(e) => setRocketType(e.target.value as any)}
                    className="text-xs font-bold bg-white border border-purple-300 rounded px-2 py-1 text-purple-800"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Agent">Agent (Cash In)</option>
                    <option value="Merchant">Merchant (Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    রকেট নম্বর: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rocketNumber}
                    onChange={(e) => setRocketNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    নির্দেশনা টেক্সট:
                  </label>
                  <textarea
                    rows={2}
                    value={rocketNotice}
                    onChange={(e) => setRocketNotice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-200 rounded-lg"
                  />
                </div>
              </div>

            </div>

            {/* Helpline & Notice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সাপোর্ট ও হেল্পলাইন মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ওয়েবসাইটে প্রদর্শিত জরুরি নোটিশ:
                </label>
                <input
                  type="text"
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>গেটওয়ে সেটিংস সেভ করুন</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================= TAB: SERVICES & FEES ======================= */}
      {adminSubTab === 'services' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">
              সেবাসমূহের নির্ধারিত ফি ও প্রক্রিয়াকরণ সময়
            </h3>
            <span className="text-xs text-slate-500">মোট {services.length} টি সার্ভিস অন্তর্ভুক্ত</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div key={srv.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{srv.title}</h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {srv.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      নিয়মিত ফি (৳):
                    </label>
                    <input
                      type="number"
                      defaultValue={srv.regularFee}
                      id={`reg-fee-${srv.id}`}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      জরুরি ফি (৳):
                    </label>
                    <input
                      type="number"
                      defaultValue={srv.urgentFee}
                      id={`urg-fee-${srv.id}`}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const regInput = document.getElementById(`reg-fee-${srv.id}`) as HTMLInputElement;
                      const urgInput = document.getElementById(`urg-fee-${srv.id}`) as HTMLInputElement;
                      if (regInput && urgInput) {
                        handleUpdateServiceFee(srv.id, Number(regInput.value), Number(urgInput.value));
                      }
                    }}
                    className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    ফি আপডেট করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB: USERS ======================= */}
      {adminSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">
              নিবন্ধিত ব্যবহারকারী ও ব্যালেন্স তালিকা
            </h3>
            <span className="text-xs text-slate-500">মোট: {users.length} জন</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">নাম</th>
                  <th className="p-3.5">মোবাইল নম্বর</th>
                  <th className="p-3.5">রোল</th>
                  <th className="p-3.5">বর্তমান ব্যালেন্স</th>
                  <th className="p-3.5">নিবন্ধন তারিখ</th>
                  <th className="p-3.5 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3.5 font-mono text-slate-700">{u.phone}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold text-emerald-800 text-sm">
                      ৳{u.balance}
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleAdjustBalance(u.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-md border border-slate-200 transition-colors"
                      >
                        ব্যালেন্স সমন্বয়
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB: ADMIN SECURITY / CREDENTIALS ======================= */}
      {adminSubTab === 'security' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                এডমিন সিক্রেট মোবাইল নম্বর ও পাসওয়ার্ড পরিবর্তন
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                এডমিন প্যানেলে প্রবেশের জন্য কোনো ডেমো বা অটো লগইন নেই। এখান থেকে আপনার নিজস্ব ব্যক্তিগত সিক্রেট নম্বর ও পাসওয়ার্ড আপডেট করে সুরক্ষিত রাখুন।
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">বর্তমান এডমিন অ্যাকাউন্ট তথ্য:</span>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">বর্তমান সিক্রেট নম্বর: </span>
                <span className="font-bold text-slate-900">{adminUser?.phone || '01700000000'}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">অ্যাকাউন্ট রোল: </span>
                <span className="font-bold text-purple-700 uppercase">MASTER ADMIN</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                বর্তমান সিক্রেট পাসওয়ার্ড <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCredPassword ? 'text' : 'password'}
                  required
                  placeholder="বর্তমান সিক্রেট পাসওয়ার্ড লিখুন"
                  value={currentAdminPassword}
                  onChange={(e) => setCurrentAdminPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCredPassword(!showCredPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  {showCredPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নতুন সিক্রেট এডমিন মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01712345678"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">পরিবর্তন করতে না চাইলে ফাঁকা রাখুন</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নতুন সিক্রেট পাসওয়ার্ড (ঐচ্ছিক)
                </label>
                <input
                  type="password"
                  placeholder="নতুন সিক্রেট পাসওয়ার্ড"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">কমপক্ষে ৪ ডিজিট বা বর্ণ</span>
              </div>
            </div>

            {newAdminPassword && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নতুন সিক্রেট পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="নতুন পাসওয়ার্ড পুনরায় লিখুন"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-mono"
                />
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingCredentials}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingCredentials ? 'সংরক্ষণ হচ্ছে...' : 'সিক্রেট ক্রেডেনশিয়াল সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================= ORDER REVIEW MODAL ======================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-purple-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-purple-200 bg-purple-800 px-2 py-0.5 rounded">
                  {selectedOrder.trackingId}
                </span>
                <h3 className="text-base font-bold mt-1">{selectedOrder.serviceName}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              
              {/* Applicant Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-500 block">আবেদনকারী:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedOrder.userName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedOrder.userPhone}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">মূল ডকুমেন্ট নং:</span>
                  <span className="font-mono text-slate-800">{selectedOrder.documentNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">ঠিকানা:</span>
                  <span className="text-slate-800">{selectedOrder.applicantAddress || 'N/A'}</span>
                </div>
              </div>

              {/* Wrong vs Correct Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
                  <span className="block font-bold text-red-800 uppercase mb-1">
                    আবেদনকারীর বিদ্যমান ভুল তথ্য:
                  </span>
                  <p className="text-red-950 font-medium text-sm">{selectedOrder.currentInfo}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="block font-bold text-emerald-800 uppercase mb-1">
                    কাঙ্ক্ষিত সঠিক তথ্য:
                  </span>
                  <p className="text-emerald-950 font-bold text-sm">{selectedOrder.correctedInfo}</p>
                </div>
              </div>

              {/* Attached Supporting Proofs */}
              {selectedOrder.attachedFiles && selectedOrder.attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">
                    সংযুক্ত প্রমাণক নথিপত্র ({selectedOrder.attachedFiles.length}টি):
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.attachedFiles.map((f, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-2.5 bg-white space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 truncate max-w-[140px]">{f.name}</span>
                          <a
                            href={f.dataUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>দেখুন</span>
                          </a>
                        </div>
                        {f.dataUrl.startsWith('data:image') || f.dataUrl.startsWith('http') ? (
                          <img
                            src={f.dataUrl}
                            alt={f.name}
                            className="w-full h-24 object-cover rounded-md border border-slate-100"
                          />
                        ) : (
                          <div className="w-full h-16 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                            ডকুমেন্ট ফাইল
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Update Status */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
                <span className="font-bold text-purple-950 uppercase block">
                  আবেদনের স্ট্যাটাস ও এডমিন অ্যাকশন
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      নতুন স্ট্যাটাস নির্ধারণ করুন:
                    </label>
                    <select
                      value={orderStatusToUpdate}
                      onChange={(e) => setOrderStatusToUpdate(e.target.value as OrderStatus)}
                      className="w-full p-2 bg-white border border-purple-300 rounded-lg font-bold text-slate-800"
                    >
                      <option value="pending">অপেক্ষমান (Pending)</option>
                      <option value="verified">কাগজপত্র যাচাই সম্পন্ন (Verified)</option>
                      <option value="processing">সরকারি সার্ভারে প্রক্রিয়াধীন (Processing)</option>
                      <option value="completed">সফলভাবে সম্পন্ন হয়েছে (Completed)</option>
                      <option value="rejected">আবেদন বাতিল (Rejected)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      সরকারি রেফারেন্স / টোকেন নং (যদি থাকে):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: EC-NID-2026-9921"
                      value={deliveryRef}
                      onChange={(e) => setDeliveryRef(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    এডমিন মন্তব্য / কারণ (ইউজার দেখতে পাবে):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="যেমন: কাগজপত্র সঠিক আছে, সরকারি সার্ভারে আবেদন অনুমোদিত হয়েছে।"
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ডেলিভারি ডকুমেন্ট ডাউনলোড লিংক (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    placeholder="https://... বা গুগল ড্রাইভ ডাউনলোড লিংক"
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrderStatus}
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-lg shadow-md"
                >
                  স্ট্যাটাস সেভ করুন
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
