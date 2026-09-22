import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  onSnapshot, 
  updateDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type { User, Order, DepositRequest, PaymentGateways } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the provisioned database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Connection Test as per Firebase Skill guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline.');
    }
  }
}

// Google Sign-In (Registration & Login)
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    // Check or create user in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    let userData: User;
    
    try {
      const snap = await getDoc(userDocRef);
      const isKnownAdmin = fbUser.email === 'developermaxbd@gmail.com';
      
      if (snap.exists()) {
        const d = snap.data();
        userData = {
          id: fbUser.uid,
          name: d.name || fbUser.displayName || 'গুগল ব্যবহারকারী',
          phone: d.phone || fbUser.phoneNumber || '',
          email: fbUser.email || undefined,
          photoURL: fbUser.photoURL || undefined,
          balance: typeof d.balance === 'number' ? d.balance : 0,
          role: d.role === 'admin' || isKnownAdmin ? 'admin' : 'user',
          createdAt: d.createdAt || new Date().toISOString()
        };
        // Update user record with latest profile details
        await setDoc(userDocRef, userData, { merge: true });
      } else {
        userData = {
          id: fbUser.uid,
          name: fbUser.displayName || 'গুগল ব্যবহারকারী',
          phone: fbUser.phoneNumber || '',
          email: fbUser.email || undefined,
          photoURL: fbUser.photoURL || undefined,
          balance: 100, // ৳100 initial signup balance
          role: isKnownAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, userData);
      }
      return userData;
    } catch (dbErr) {
      console.warn('Firestore user fetch failed, fallback to auth profile:', dbErr);
      userData = {
        id: fbUser.uid,
        name: fbUser.displayName || 'গুগল ব্যবহারকারী',
        phone: fbUser.phoneNumber || '',
        email: fbUser.email || undefined,
        photoURL: fbUser.photoURL || undefined,
        balance: 100,
        role: fbUser.email === 'developermaxbd@gmail.com' ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };
      return userData;
    }
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw new Error(error.message || 'গুগল লগইন সম্পন্ন করা সম্ভব হয়নি।');
  }
}

// Sign out
export async function signOutFromFirebase() {
  await fbSignOut(auth);
}

// Real-Time Listeners for Firestore
export function subscribeToRealtimeOrders(
  onUpdate: (orders: Order[]) => void,
  userId?: string
) {
  const ordersRef = collection(db, 'orders');
  return onSnapshot(
    ordersRef,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Order;
        if (!userId || data.userId === userId) {
          orders.push({ ...data, id: docSnap.id });
        }
      });
      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    }
  );
}

export function subscribeToRealtimeDeposits(
  onUpdate: (deposits: DepositRequest[]) => void,
  userId?: string
) {
  const depositsRef = collection(db, 'deposits');
  return onSnapshot(
    depositsRef,
    (snapshot) => {
      const deposits: DepositRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DepositRequest;
        if (!userId || data.userId === userId) {
          deposits.push({ ...data, id: docSnap.id });
        }
      });
      deposits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(deposits);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'deposits');
    }
  );
}

export function subscribeToRealtimeSettings(
  onUpdate: (gateways: PaymentGateways) => void
) {
  const settingsDocRef = doc(db, 'settings', 'global');
  return onSnapshot(
    settingsDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.gateways) {
          onUpdate(data.gateways as PaymentGateways);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    }
  );
}

export function subscribeToRealtimeUser(
  userId: string,
  onUpdate: (user: User) => void
) {
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as User;
        onUpdate({ ...data, id: snap.id });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  );
}

// Firestore Database Operations
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const orderRef = doc(db, 'orders', order.id);
  try {
    await setDoc(orderRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function saveDepositToFirestore(deposit: DepositRequest): Promise<void> {
  const depositRef = doc(db, 'deposits', deposit.id);
  try {
    await setDoc(depositRef, deposit);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `deposits/${deposit.id}`);
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string, 
  status: string, 
  adminRemarks?: string,
  deliveryRef?: string,
  deliveryUrl?: string
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  try {
    const updatePayload: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (adminRemarks !== undefined) updatePayload.adminRemarks = adminRemarks;
    if (deliveryRef !== undefined) updatePayload.deliveryRef = deliveryRef;
    if (deliveryUrl !== undefined) updatePayload.deliveryDocumentUrl = deliveryUrl;
    
    await updateDoc(orderRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function updateGatewaysInFirestore(gateways: PaymentGateways): Promise<void> {
  const settingsDocRef = doc(db, 'settings', 'global');
  try {
    await setDoc(settingsDocRef, {
      gateways,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/global');
  }
}
