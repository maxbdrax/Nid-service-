import React from 'react';
import { 
  FileText, 
  Wallet, 
  PlusCircle, 
  Search, 
  ClipboardList, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn
} from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'services' | 'my-orders' | 'admin';
  setActiveTab: (tab: 'services' | 'my-orders' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAddMoney: () => void;
  onOpenTracker: () => void;
  onOpenAdminAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenAddMoney,
  onOpenTracker,
  onOpenAdminAuth
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2">
          
          {/* Brand Logo & Name */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('services')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  সংশোধন সেবা
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  সরকারি পোর্টাল
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                NID, জন্ম নিবন্ধন ও সকল সরকারি কাগজপত্র সংশোধন
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav id="main-navigation" className="hidden md:flex items-center gap-1.5">
            <button
              id="nav-services-btn"
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'services' 
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              সেবা সমূহ
            </button>

            <button
              id="nav-tracker-btn"
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>আবেদন ট্র্যাকিং</span>
            </button>

            {currentUser && (
              <button
                id="nav-myorders-btn"
                onClick={() => setActiveTab('my-orders')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'my-orders'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                <span>আমার আবেদনসমূহ</span>
              </button>
            )}

            {/* Admin Panel Tab Button */}
            <button
              id="nav-admin-btn"
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setActiveTab('admin');
                } else {
                  onOpenAdminAuth();
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-900 text-white font-semibold shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50/70 font-medium'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-purple-200' : 'text-purple-600'}`} />
              <span>এডমিন প্যানেল</span>
              {currentUser?.role !== 'admin' && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                  লক
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Track Button on Mobile */}
            <button
              id="mobile-track-btn"
              onClick={onOpenTracker}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              title="আবেদন ট্র্যাক করুন"
            >
              <Search className="w-5 h-5 text-emerald-700" />
            </button>

            {currentUser ? (
              <>
                {/* Wallet Balance & Add Money Button */}
                <div 
                  id="user-wallet-badge" 
                  className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 pl-2.5 sm:pl-3 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 mr-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">ব্যালেন্স</span>
                      <span className="text-sm font-bold text-slate-900">
                        ৳{currentUser.balance.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>
                  <button
                    id="add-money-btn"
                    onClick={onOpenAddMoney}
                    className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-xs active:scale-95 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>এড মানি</span>
                  </button>
                </div>

                {/* User Menu / Logout */}
                <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.name} 
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-emerald-300 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {currentUser.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-none">
                      {currentUser.phone || currentUser.email || 'ব্যবহারকারী'}
                    </span>
                  </div>

                  <button
                    id="user-logout-btn"
                    onClick={onLogout}
                    title="লগআউট"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                id="login-register-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন / একাউন্ট খুলুন</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-1 px-2.5 rounded-md font-medium ${
              activeTab === 'services' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            সেবা সমূহ
          </button>
          {currentUser && (
            <button
              onClick={() => setActiveTab('my-orders')}
              className={`py-1 px-2.5 rounded-md font-medium ${
                activeTab === 'my-orders' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
              }`}
            >
              আমার আবেদন
            </button>
          )}
          <button
            onClick={() => {
              if (currentUser?.role === 'admin') {
                setActiveTab('admin');
              } else {
                onOpenAdminAuth();
              }
            }}
            className={`py-1 px-2.5 rounded-md font-medium ${
              activeTab === 'admin' ? 'bg-purple-900 text-white font-bold' : 'text-purple-700'
            }`}
          >
            এডমিন প্যানেল
          </button>
        </div>

      </div>
    </header>
  );
};
