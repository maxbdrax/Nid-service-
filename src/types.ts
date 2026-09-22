export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  balance: number;
  role: Role;
  createdAt: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket';

export interface GatewayInfo {
  active: boolean;
  number: string;
  type: 'Personal' | 'Agent' | 'Merchant';
  feeNotice: string;
}

export interface PaymentGateways {
  bkash: GatewayInfo;
  nagad: GatewayInfo;
  rocket: GatewayInfo;
  supportPhone: string;
  noticeText: string;
}

export type CorrectionCategory = 'nid' | 'birth' | 'other';

export interface ServiceItem {
  id: string;
  title: string;
  category: CorrectionCategory;
  description: string;
  regularFee: number;
  urgentFee: number;
  regularDays: string;
  urgentDays: string;
  popular?: boolean;
  requiredDocs: string[];
  correctionOptions: string[];
}

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  method: PaymentMethod;
  gatewayNumber: string;
  senderNumber: string;
  amount: number;
  trxId: string;
  status: DepositStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'verified' | 'processing' | 'completed' | 'rejected';

export interface StatusHistoryItem {
  status: OrderStatus;
  note: string;
  timestamp: string;
}

export interface AttachedDoc {
  name: string;
  dataUrl: string;
  size?: string;
}

export interface Order {
  id: string;
  trackingId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  serviceId: string;
  serviceName: string;
  category: CorrectionCategory;
  correctionType: string;
  currentInfo: string;
  correctedInfo: string;
  documentNumber: string;
  applicantAddress: string;
  deliveryType: 'regular' | 'urgent';
  feePaid: number;
  paymentStatus: 'paid';
  attachedFiles: AttachedDoc[];
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  adminRemarks?: string;
  deliveryDocumentUrl?: string;
  deliveryReferenceNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'service_payment' | 'refund';
  amount: number;
  description: string;
  relatedId?: string;
  createdAt: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  pendingDepositsCount: number;
  pendingDepositsAmount: number;
  totalUsers: number;
}
