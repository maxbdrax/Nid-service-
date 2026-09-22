/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  HelpCircle, 
  Clock, 
  PhoneCall, 
  Sparkles, 
  FileCheck, 
  Lock
} from 'lucide-react';
import type { User, PaymentGateways, ServiceItem, Order } from './types';
import { api, getStoredUserId, setStoredUserId } from './api';
import { Navbar } from './components/Navbar';
import { NoticeBanner } from './components/NoticeBanner';
import { ServicesList } from './components/ServicesList';
import { ApplicationModal } from './components/ApplicationModal';
import { AddMoneyModal } from './components/AddMoneyModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { MyOrders } from './components/MyOrders';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gateways, setGateways] = useState<PaymentGateways | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'my-orders' | 'admin'>('services');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [suggestedDepositAmount, setSuggestedDepositAmount] = useState<number | undefined>(undefined);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Load initial settings and user
  const refreshGlobalData = useCallback(async () => {
    try {
      const [settingsRes, servicesRes] = await Promise.all([
        api.getSettings(),
        api.getServices()
      ]);
      setGateways(settingsRes.gateways);
      setServices(servicesRes.services);

      const storedUid = getStoredUserId();
      if (storedUid) {
        try {
          const meRes = await api.getMe(storedUid);
          setCurrentUser(meRes.user);
        } catch {
          // If stored session invalid, clear
          setStoredUserId(null);
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    refreshGlobalData();
  }, [refreshGlobalData]);

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    refreshGlobalData();
  };

  const handleLogout = () => {
    setStoredUserId(null);
    setCurrentUser(null);
    setActiveTab('services');
  };

  // Service Selection -> Open Application Modal
  const handleSelectService = (srv: ServiceItem) => {
    setSelectedService(srv);
  };

  // Trigger Add Money modal with optional needed amount
  const handleOpenAddMoney = (neededAmount?: number) => {
    setSuggestedDepositAmount(neededAmount);
    setIsAddMoneyOpen(true);
  };

  // When order submitted successfully
  const handleOrderSuccess = (order: Order, remainingBalance: number) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, balance: remainingBalance });
    }
    refreshGlobalData();
  };

  // When deposit submitted successfully
  const handleDepositSuccess = () => {
    refreshGlobalData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Notice Banner */}
      <NoticeBanner gateways={gateways} />

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAddMoney={() => handleOpenAddMoney()}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdminAuth={() => setIsAdminLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'services' && (
          <ServicesList
            services={services}
            onSelectService={handleSelectService}
          />
        )}

        {activeTab === 'my-orders' && (
          currentUser ? (
            <MyOrders
              currentUser={currentUser}
              onTrackOrder={() => setIsTrackerOpen(true)}
              onViewReceipt={(ord) => setSelectedOrderForReceipt(ord)}
              onOpenAddMoney={() => handleOpenAddMoney()}
            />
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-6 max-w-md mx-auto space-y-4">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-lg font-bold text-slate-900">আপনার অ্যাকাউন্ট লগইন করুন</h2>
              <p className="text-xs text-slate-500">
                আপনার পূর্বে দাখিলকৃত সকল আবেদন দেখতে নাম ও মোবাইল নম্বর দিয়ে লগইন করুন।
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                লগইন / একাউন্ট তৈরি
              </button>
            </div>
          )
        )}

        {activeTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminPanel
              onRefreshAll={refreshGlobalData}
              onAdminLogout={handleLogout}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-purple-200 p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">এডমিন সিকিউরিটি গেটওয়ে</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                এই অংশটি শুধুমাত্র সিস্টেম এডমিনিস্ট্রেটরের জন্য সংরক্ষিত। এখানে কোনো ডেমো বা অটো লগইন নেই—প্রবেশ করতে আপনার সিক্রেট মোবাইল নম্বর ও সিক্রেট পাসওয়ার্ড প্রয়োজন।
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="w-full py-2.5 px-4 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  সিক্রেট এডমিন লগইন
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  মূল পোর্টালে ফিরে যান
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Modals */}
      {/* 1. Application Modal */}
      <ApplicationModal
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        service={selectedService}
        currentUser={currentUser}
        onOpenAuth={() => {
          setSelectedService(null);
          setIsAuthOpen(true);
        }}
        onOpenAddMoney={(needed) => {
          handleOpenAddMoney(needed);
        }}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 2. Add Money Modal */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        currentUser={currentUser}
        gateways={gateways}
        onDepositSuccess={handleDepositSuccess}
        suggestedAmount={suggestedDepositAmount}
      />

      {/* 3. Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onViewReceipt={(ord) => {
          setIsTrackerOpen(false);
          setSelectedOrderForReceipt(ord);
        }}
      />

      {/* 4. Order Receipt Modal */}
      <OrderReceiptModal
        order={selectedOrderForReceipt}
        isOpen={Boolean(selectedOrderForReceipt)}
        onClose={() => setSelectedOrderForReceipt(null)}
      />

      {/* 5. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 6. Admin Secret Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onAdminLoginSuccess={(adminUser) => {
          handleAuthSuccess(adminUser);
          setIsAdminLoginOpen(false);
          setActiveTab('admin');
        }}
      />

      {/* Footer */}
      <footer id="app-footer" className="bg-slate-900 text-slate-400 text-xs mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-white font-bold text-sm block">সরকারি সেবা ও সংশোধন পোর্টাল</span>
              <p className="text-slate-400 text-xs leading-relaxed">
                জাতীয় পরিচয়পত্র (NID), জন্ম ও মৃত্যু নিবন্ধন, এবং অন্যান্য সরকারি দলিলের ভুল সংশোধনের সহজ ও সুরক্ষিত ডিজিটাল ব্যবস্থাপনা মাধ্যম।
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold text-sm block">পেমেন্ট ও সাপোর্ট</span>
              <p className="text-slate-400 text-xs leading-relaxed">
                বিকাশ, নগদ ও রকেট ওয়ালেট এড মানি সাপোর্ট। এডমিন দ্বারা রিয়েল-টাইম যাচাই ও অনুমোদন।
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{gateways?.supportPhone || '01700000000'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold text-sm block">নিরাপত্তা ও রিয়েল-টাইম তথ্য</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>সার্ভার সক্রিয় ও রিয়েল-টাইম ডাটা সিঙ্ক চালু</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                সকল ডিভাইস (মোবাইল, ট্যাবলেট, কম্পিউটার) থেকে স্বয়ংক্রিয়ভাবে ডাটা সিঙ্ক থাকে।
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} ডিজিটাল ডকুমেন্ট সংশোধন সেবা। সর্বস্বত্ব সংরক্ষিত।</p>
            <p>সহজ ও সাবলীল বাংলা ইন্টারফেস</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
