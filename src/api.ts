import type { 
  User, 
  PaymentGateways, 
  ServiceItem, 
  DepositRequest, 
  Order, 
  Transaction, 
  AdminStats 
} from './types';

const API_BASE = '/api';

export function getStoredUserId(): string | null {
  return localStorage.getItem('doc_portal_user_id');
}

export function setStoredUserId(id: string | null) {
  if (id) {
    localStorage.setItem('doc_portal_user_id', id);
  } else {
    localStorage.removeItem('doc_portal_user_id');
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const userId = getStoredUserId();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (userId) {
    headers.set('x-user-id', userId);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'অনুরোধটি ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
  }
  return data as T;
}

export const api = {
  // Auth
  register: (data: { name: string; phone: string; password: string }) =>
    request<{ user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { phone: string; password: string }) =>
    request<{ user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminLogin: (data: { phone: string; password: string }) =>
    request<{ user: User; message: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdminCredentials: (data: { currentPassword: string; newPhone?: string; newPassword?: string }) =>
    request<{ user: User; message: string }>('/admin/credentials', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getMe: (userId?: string) =>
    request<{ user: User }>(`/auth/me${userId ? `?userId=${userId}` : ''}`),

  // Settings & Gateways
  getSettings: () => request<{ gateways: PaymentGateways }>('/settings'),

  updateGateways: (data: Partial<PaymentGateways>) =>
    request<{ gateways: PaymentGateways; message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Services
  getServices: () => request<{ services: ServiceItem[] }>('/services'),

  updateService: (id: string, data: Partial<ServiceItem>) =>
    request<{ service: ServiceItem; message: string }>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  createService: (data: Partial<ServiceItem>) =>
    request<{ service: ServiceItem; message: string }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    request<{ message: string }>(`/admin/services/${id}`, {
      method: 'DELETE',
    }),

  // Wallet / Add Money
  submitDeposit: (data: {
    userId: string;
    method: 'bkash' | 'nagad' | 'rocket';
    senderNumber: string;
    amount: number;
    trxId: string;
  }) =>
    request<{ deposit: DepositRequest; message: string }>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyDeposits: () => request<{ deposits: DepositRequest[] }>('/wallet/my-deposits'),

  getMyTransactions: () => request<{ transactions: Transaction[] }>('/wallet/transactions'),

  // Orders
  submitOrder: (data: any) =>
    request<{ order: Order; remainingBalance: number; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyOrders: () => request<{ orders: Order[] }>('/orders/my'),

  trackOrder: (trackingId: string) =>
    request<{ order: Order }>(`/orders/track/${encodeURIComponent(trackingId)}`),

  // Admin APIs
  getAdminOrders: () => request<{ orders: Order[] }>('/admin/orders'),

  updateOrder: (id: string, data: Partial<Order>) =>
    request<{ order: Order; message: string }>(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminDeposits: () => request<{ deposits: DepositRequest[] }>('/admin/deposits'),

  updateDeposit: (id: string, data: { status: 'approved' | 'rejected'; adminNote?: string }) =>
    request<{ deposit: DepositRequest; message: string }>(`/admin/deposits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminUsers: () => request<{ users: User[] }>('/admin/users'),

  adjustUserBalance: (id: string, data: { amount: number; reason: string }) =>
    request<{ user: User; message: string }>(`/admin/users/${id}/balance`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminStats: () => request<{ stats: AdminStats }>('/admin/stats'),

  adminAddFunds: (data: {
    adminUserId?: string;
    method: 'bkash' | 'nagad' | 'rocket';
    amount: number;
    senderNumber?: string;
    trxId?: string;
    note?: string;
  }) =>
    request<{
      success: boolean;
      user: User;
      newBalance: number;
      deposit: DepositRequest;
      message: string;
    }>('/admin/wallet/add-funds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
