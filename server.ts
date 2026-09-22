import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import type { 
  User, 
  PaymentGateways, 
  ServiceItem, 
  DepositRequest, 
  Order, 
  Transaction, 
  AdminStats 
} from './src/types';

interface DatabaseSchema {
  users: User[];
  gateways: PaymentGateways;
  services: ServiceItem[];
  deposits: DepositRequest[];
  orders: Order[];
  transactions: Transaction[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial data
const initialData: DatabaseSchema = {
  gateways: {
    bkash: {
      active: true,
      number: '01712345678',
      type: 'Personal',
      feeNotice: 'সেন্ড মানি (Send Money) করার পর ট্রানজেকশন আইডি (TrxID) দিন। ৩-৫ মিনিটে ব্যালেন্স যোগ হবে।'
    },
    nagad: {
      active: true,
      number: '01812345678',
      type: 'Personal',
      feeNotice: 'সেন্ড মানি করার পর প্রাপ্ত TrxID এবং প্রেরক নম্বর দিন।'
    },
    rocket: {
      active: true,
      number: '01912345678',
      type: 'Personal',
      feeNotice: 'রকেট পার্সোনাল নম্বরে সেন্ড মানি করুন।'
    },
    supportPhone: '01700000000',
    noticeText: 'সরকারি সার্ভারের সর্বশেষ নিয়ম অনুযায়ী NID ও জন্ম নিবন্ধন সংশোধন আবেদনের সাথে প্রয়োজনীয় প্রমাণক (SSC সনদ/পাসপোর্ট/পুরাতন কপি) সংযুক্ত করুন।'
  },
  services: [
    {
      id: 'srv-nid-name',
      title: 'জাতীয় পরিচয়পত্র (NID) নাম ও ব্যক্তিগত তথ্য সংশোধন',
      category: 'nid',
      description: 'বাংলা ও ইংরেজি নামের বানান, পিতা ও মাতার নামের বানান, বৈবাহিক অবস্থা ও রক্তের গ্রুপ সংশোধন।',
      regularFee: 350,
      urgentFee: 550,
      regularDays: '২-৩ কর্মদিবস',
      urgentDays: '২৪ ঘণ্টা',
      popular: true,
      requiredDocs: ['এসএসসি/জেএসসি সনদপত্র', 'জন্ম নিবন্ধন সনদ', 'পাসপোর্টের ফটোকপি (যদি থাকে)', 'পিতা/মাতার NID কপি'],
      correctionOptions: ['নিজের নাম (বাংলা)', 'নিজের নাম (ইংরেজি)', 'পিতার নাম', 'মাতার নাম', 'রক্তের গ্রুপ', 'বৈবাহিক অবস্থা']
    },
    {
      id: 'srv-nid-dob',
      title: 'জাতীয় পরিচয়পত্র (NID) জন্মতারিখ সংশোধন',
      category: 'nid',
      description: 'বয়স ও জন্ম তারিখের ভুল সংশোধন সরকারি ডাটাবেজ যাচাইকরণ সাপেক্ষে।',
      regularFee: 400,
      urgentFee: 650,
      regularDays: '৩-৫ কর্মদিবস',
      urgentDays: '৪৮ ঘণ্টা',
      popular: true,
      requiredDocs: ['এসএসসি/সমমানের মূল সনদপত্র', 'অনলাইন জন্ম নিবন্ধন (১৭ ডিজিট)', 'পাসপোর্ট/সার্ভিস বুক'],
      correctionOptions: ['জন্ম তারিখ সংশোধন', 'বয়স প্রমার্জন']
    },
    {
      id: 'srv-nid-address',
      title: 'NID ঠিকানা পরিবর্তন ও ভোটার এলাকা স্থানান্তর',
      category: 'nid',
      description: 'বর্তমান বা স্থায়ী ঠিকানা সংশোধন ও নতুন নির্বাচনী এলাকায় ভোটার স্থানান্তরের অনলাইন আবেদন।',
      regularFee: 350,
      urgentFee: 500,
      regularDays: '৩-৪ কর্মদিবস',
      urgentDays: '২৪ ঘণ্টা',
      popular: false,
      requiredDocs: ['ইউটিলিটি বিলের কপি (বিদ্যুৎ/গ্যাস/পানি)', 'পৌরসভা/ইউনিয়ন পরিষদ চেয়ারম্যানের প্রত্যয়নপত্র', 'জমির খতিয়ান/দলিল/ভাড়া চুক্তি'],
      correctionOptions: ['বর্তমান ঠিকানা পরিবর্তন', 'স্থায়ী ঠিকানা পরিবর্তন', 'ভোটার এলাকা স্থানান্তর']
    },
    {
      id: 'srv-nid-reissue',
      title: 'হারানো NID রি-ইস্যু ও নতুন ভোটার আবেদন',
      category: 'nid',
      description: 'NID হারিয়ে গেলে অনলাইন জিডি নম্বর সহ নতুন প্লাস্টিক/স্মার্ট কার্ডের রি-ইস্যু আবেদন।',
      regularFee: 450,
      urgentFee: 700,
      regularDays: '২-৩ কর্মদিবস',
      urgentDays: '২৪ ঘণ্টা',
      popular: false,
      requiredDocs: ['থানার সাধারণ ডায়েরি (GD) কপি', 'পুরাতন NID নম্বর বা ভোটার স্লিপ নম্বর'],
      correctionOptions: ['হারানো NID উত্তোলন', 'স্মার্ট কার্ড রি-ইস্যু', 'নতুন ভোটার কার্ড আবেদন']
    },
    {
      id: 'srv-birth-name',
      title: 'জন্ম নিবন্ধন নাম ও তথ্য সংশোধন (বাংলা/ইংরেজি)',
      category: 'birth',
      description: '১৭ ডিজিটের অনলাইন জন্ম সনদে নামের বানান, লিঙ্গ, পিতা-মাতার নাম ও NID সংযোজন।',
      regularFee: 250,
      urgentFee: 450,
      regularDays: '২-৩ কর্মদিবস',
      urgentDays: '২৪ ঘণ্টা',
      popular: true,
      requiredDocs: ['বিদ্যমান জন্ম নিবন্ধন কপি', 'পিতা ও মাতার NID কপি', 'শিক্ষাগত সনদপত্র/টিকা কার্ড'],
      correctionOptions: ['নিজের নাম (বাংলা)', 'নিজের নাম (ইংরেজি)', 'পিতার নাম ও NID', 'মাতার নাম ও NID', 'লিঙ্গ সংশোধন']
    },
    {
      id: 'srv-birth-dob',
      title: 'জন্ম নিবন্ধন জন্মতারিখ ও বয়স সংশোধন',
      category: 'birth',
      description: 'জন্ম তারিখ সংশোধন ও নিবন্ধক কার্যালয় থেকে অনুমোদন সহায়ক আবেদন।',
      regularFee: 300,
      urgentFee: 500,
      regularDays: '৩-৫ কর্মদিবস',
      urgentDays: '৪৮ ঘণ্টা',
      popular: false,
      requiredDocs: ['হাসপাতালের জন্মের প্রত্যয়নপত্র/টিকা কার্ড', 'স্কুল সার্টিফিকেট/পিএসসি/জেএসসি সনদ', 'পিতা-মাতার এনআইডি'],
      correctionOptions: ['জন্ম তারিখ সংশোধন', 'জন্মস্থান সংশোধন']
    },
    {
      id: 'srv-birth-digital',
      title: 'পুরাতন হাতে লেখা জন্ম সনদ অনলাইন/ডিজিটাকরণ',
      category: 'birth',
      description: 'হাতে লেখা পুরাতন জন্ম সনদকে নতুন ১৬ থেকে ১৭ ডিজিটের অনলাইন ডাটাবেজে রূপান্তর।',
      regularFee: 250,
      urgentFee: 400,
      regularDays: '২-৩ কর্মদিবস',
      urgentDays: '২৪ ঘণ্টা',
      popular: false,
      requiredDocs: ['পুরাতন হাতে লেখা মূল সনদের কপি', 'পিতা-মাতার জাতীয় পরিচয়পত্র', 'নাগরিকত্ব সনদ'],
      correctionOptions: ['১৭ ডিজিট অনলাইন রূপান্তর', 'অনলাইন ডাটাবেজে অন্তর্ভুক্তি']
    },
    {
      id: 'srv-cert-edu',
      title: 'শিক্ষাগত সার্টিফিকেট (SSC/HSC/JSC) ভুল সংশোধন',
      category: 'other',
      description: 'শিক্ষা বোর্ড থেকে সার্টিফিকেট ও মার্কশিটের নাম, পিতার নাম ও জন্মতারিখ সংশোধন আবেদন।',
      regularFee: 500,
      urgentFee: 850,
      regularDays: '৪-৭ কর্মদিবস',
      urgentDays: '৩ কর্মদিবস',
      popular: true,
      requiredDocs: ['মূল রেজিস্ট্রেশন কার্ড ও প্রবেশপত্র', 'অনলাইন জন্ম নিবন্ধন', 'পিতা-মাতার NID', 'বিদ্যালয় প্রধানের প্রত্যয়নপত্র'],
      correctionOptions: ['ছাত্র/ছাত্রীর নাম', 'পিতার নাম', 'মাতার নাম', 'জন্ম তারিখ']
    },
    {
      id: 'srv-cert-tin',
      title: 'ই-টিন (e-TIN) সার্টিফিকেট তথ্য সংশোধন ও রি-প্রিন্ট',
      category: 'other',
      description: 'ট্যাক্স আইডেন্টিফিকেশন নম্বর (TIN) সার্টিফিকেট নাম, ঠিকানা সংশোধন বা হারানো টিন কপি রি-প্রিন্ট।',
      regularFee: 300,
      urgentFee: 450,
      regularDays: '১-২ কর্মদিবস',
      urgentDays: '১২ ঘণ্টা',
      popular: false,
      requiredDocs: ['পুরাতন TIN সার্টিফিকেট বা TIN নম্বর', 'সংশোধিত NID কপি'],
      correctionOptions: ['নাম সংশোধন', 'ঠিকানা ও কর অঞ্চল সংশোধন', 'হারানো TIN সার্টিফিকেট পুনরুত্থান']
    },
    {
      id: 'srv-cert-dl',
      title: 'ড্রাইভিং লাইসেন্স তথ্য সংশোধন ও নবায়ন আবেদন',
      category: 'other',
      description: 'বিআরটিএ (BRTA) ড্রাইভিং লাইসেন্সে নাম, জন্মতারিখ, রক্তের গ্রুপ ও ঠিকানা সংশোধন।',
      regularFee: 600,
      urgentFee: 950,
      regularDays: '৫-৭ কর্মদিবস',
      urgentDays: '৩ কর্মদিবস',
      popular: false,
      requiredDocs: ['ড্রাইভিং লাইসেন্সের ফটোকপি/লার্নার কপি', 'মেডিকেল সার্টিফিকেট', 'সংশোধিত NID'],
      correctionOptions: ['নাম ও পিতা/স্বামীর নাম', 'জন্ম তারিখ ও রক্তের গ্রুপ', 'ঠিকানা পরিবর্তন']
    },
    {
      id: 'srv-cert-warish',
      title: 'ওয়ারিশান সনদ ও পারিবারিক প্রত্যয়ন আবেদন',
      category: 'other',
      description: 'ইউনিয়ন পরিষদ বা সিটি কর্পোরেশন থেকে অনলাইন ওয়ারিশান সনদ ও বংশতালিকা সনদ আবেদন।',
      regularFee: 250,
      urgentFee: 400,
      regularDays: '২-৩ কর্মদিবস',
      urgentDays: '২৪ ঘণ্টা',
      popular: false,
      requiredDocs: ['মৃত ব্যক্তির মৃত্যু সনদ', 'সকল ওয়ারিশের NID ও জন্ম সনদ', 'স্থানীয় চেয়ারম্যান/কাউন্সিলর প্রত্যয়ন'],
      correctionOptions: ['ওয়ারিশান সনদ আবেদন', 'ওয়ারিশ সংশোধন']
    },
    {
      id: 'srv-cert-other',
      title: 'অন্যান্য সরকারি কাগজপত্র ও দলিল সংশোধন আবেদন',
      category: 'other',
      description: 'যেকোনো কাস্টম সরকারি নথিপত্র, জমি-জমার প্রত্যয়ন বা অন্যান্য দলিলের ভুল সংশোধনের আবেদন।',
      regularFee: 350,
      urgentFee: 600,
      regularDays: '৩-৫ কর্মদিবস',
      urgentDays: '২৪ ঘণ্টা',
      popular: false,
      requiredDocs: ['মূল ডকুমেন্টের স্ক্যান কপি', 'সংশ্লিষ্ট প্রমাণক নথিপত্র', 'আবেদনকারীর NID'],
      correctionOptions: ['কাস্টম তথ্য সংশোধন', 'সরকারী প্রত্যয়ন ও প্রত্যায়নপত্র']
    }
  ],
  users: [
    {
      id: 'usr-admin-1',
      name: 'সুপার এডমিন',
      phone: '01700000000',
      password: 'admin',
      balance: 15000,
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-demo-1',
      name: 'মো: শরিফুল ইসলাম',
      phone: '01811223344',
      password: '123',
      balance: 850,
      role: 'user',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    }
  ],
  deposits: [
    {
      id: 'DEP-98214',
      userId: 'usr-demo-1',
      userName: 'মো: শরিফুল ইসলাম',
      userPhone: '01811223344',
      method: 'bkash',
      gatewayNumber: '01712345678',
      senderNumber: '01811223344',
      amount: 850,
      trxId: 'BKS94X7K21',
      status: 'approved',
      adminNote: 'টাকা জমা নিশ্চিত করা হয়েছে',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 23).toISOString()
    }
  ],
  orders: [
    {
      id: 'ord-seed-1',
      trackingId: 'REQ-2026-8491',
      userId: 'usr-demo-1',
      userName: 'মো: শরিফুল ইসলাম',
      userPhone: '01811223344',
      userEmail: 'shariful@example.com',
      serviceId: 'srv-nid-name',
      serviceName: 'জাতীয় পরিচয়পত্র (NID) নাম ও ব্যক্তিগত তথ্য সংশোধন',
      category: 'nid',
      correctionType: 'নিজের নাম (ইংরেজি)',
      currentInfo: 'MD SHORIFUL ISLAM (ভুল বানান SHORIFUL)',
      correctedInfo: 'MD SHARIFUL ISLAM',
      documentNumber: '19952691234567890',
      applicantAddress: 'গ্রাম: চরসুবুদ্ধি, উপজেলা: রায়পুরা, জেলা: নরসিংদী',
      deliveryType: 'regular',
      feePaid: 350,
      paymentStatus: 'paid',
      attachedFiles: [
        {
          name: 'SSC_Certificate_Shariful.jpg',
          dataUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
          size: '1.2 MB'
        }
      ],
      status: 'processing',
      statusHistory: [
        {
          status: 'pending',
          note: 'আবেদনপত্র জমা দেওয়া হয়েছে ও ফি পরিশোধিত',
          timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        {
          status: 'verified',
          note: 'এডমিন কর্তৃক প্রাথমিক কাগজপত্র ও এসএসসি সনদ যাচাই সম্পন্ন',
          timestamp: new Date(Date.now() - 3600000 * 10).toISOString()
        },
        {
          status: 'processing',
          note: 'নির্বাচন কমিশন (EC) কেন্দ্রীয় সার্ভারে সংশোধনের জন্য প্রেরণ করা হয়েছে',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ],
      adminRemarks: 'কাগজপত্র সঠিক রয়েছে। নির্বাচন কমিশন সার্ভার থেকে অনুমোদন প্রক্রিয়াধীন।',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ],
  transactions: [
    {
      id: 'TXN-001',
      userId: 'usr-demo-1',
      type: 'deposit',
      amount: 850,
      description: 'বিকাশ ডিপোজিট অনুমোদন (TrxID: BKS94X7K21)',
      relatedId: 'DEP-98214',
      createdAt: new Date(Date.now() - 3600000 * 23).toISOString()
    },
    {
      id: 'TXN-002',
      userId: 'usr-demo-1',
      type: 'service_payment',
      amount: 350,
      description: 'NID নাম সংশোধন আবেদন ফি (REQ-2026-8491)',
      relatedId: 'ord-seed-1',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ]
};

// Database helper functions
function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || initialData.users,
      gateways: parsed.gateways || initialData.gateways,
      services: parsed.services || initialData.services,
      deposits: parsed.deposits || initialData.deposits,
      orders: parsed.orders || initialData.orders,
      transactions: parsed.transactions || initialData.transactions,
    };
  } catch (err) {
    console.error('Error initializing database file:', err);
    return initialData;
  }
}

let db: DatabaseSchema = initDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser with high limit for document attachments
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ===================== AUTH ROUTES =====================
  app.post('/api/auth/register', (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'নাম, মোবাইল নম্বর এবং পাসওয়ার্ড আবশ্যক।' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'সঠিক মোবাইল নম্বর প্রদান করুন।' });
    }

    const existingUser = db.users.find(u => u.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (existingUser) {
      return res.status(400).json({ error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে।' });
    }

    const newUser: User = {
      id: 'usr-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: name.trim(),
      phone: cleanPhone,
      password: password.trim(),
      balance: 0,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDatabase();

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser, message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' });
  });

  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন।' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const user = db.users.find(u => 
      (u.phone.replace(/[^0-9]/g, '') === cleanPhone || u.phone === phone) && 
      u.password === password.trim()
    );

    if (!user) {
      return res.status(401).json({ error: 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser, message: 'সফলভাবে লগইন হয়েছে।' });
  });

  // Dedicated Secret Admin Authentication
  app.post('/api/admin/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'সিক্রেট এডমিন নম্বর ও পাসওয়ার্ড প্রদান করুন।' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const adminUser = db.users.find(u => 
      u.role === 'admin' &&
      (u.phone.replace(/[^0-9]/g, '') === cleanPhone || u.phone === phone.trim()) &&
      u.password === password.trim()
    );

    if (!adminUser) {
      return res.status(401).json({ error: 'ভুল সিক্রেট নম্বর অথবা পাসওয়ার্ড! এডমিন প্যানেলে অননুমোদিত প্রবেশাধিকার নিষিদ্ধ।' });
    }

    const { password: _, ...safeUser } = adminUser;
    return res.json({ user: safeUser, message: 'এডমিন প্রমাণীকরণ সফল হয়েছে। এডমিন প্যানেলে স্বাগতম।' });
  });

  // Change Secret Admin Credentials
  app.put('/api/admin/credentials', (req, res) => {
    const { currentPassword, newPhone, newPassword } = req.body;
    const adminUserId = req.headers['x-user-id'] as string;

    let adminUser = db.users.find(u => u.id === adminUserId && u.role === 'admin');
    if (!adminUser) {
      adminUser = db.users.find(u => u.role === 'admin');
    }

    if (!adminUser) {
      return res.status(404).json({ error: 'এডমিন অ্যাকাউন্ট পাওয়া যায়নি।' });
    }

    if (adminUser.password !== currentPassword?.trim()) {
      return res.status(400).json({ error: 'বর্তমান সিক্রেট পাসওয়ার্ড সঠিক নয়।' });
    }

    if (newPhone && newPhone.trim()) {
      const cleanNewPhone = newPhone.trim().replace(/[^0-9]/g, '');
      if (cleanNewPhone.length < 10) {
        return res.status(400).json({ error: 'সঠিক নতুন সিক্রেট নম্বর দিন (কমপক্ষে ১০ ডিজিট)।' });
      }
      adminUser.phone = cleanNewPhone;
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        return res.status(400).json({ error: 'নতুন সিক্রেট পাসওয়ার্ড কমপক্ষে ৪ ডিজিট হতে হবে।' });
      }
      adminUser.password = newPassword.trim();
    }

    saveDatabase();

    const { password: _, ...safeUser } = adminUser;
    return res.json({
      user: safeUser,
      message: 'এডমিন সিক্রেট লগইন নম্বর ও পাসওয়ার্ড সফলভাবে হালনাগাদ করা হয়েছে!'
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    if (!userId) {
      return res.status(401).json({ error: 'লগইন করা নেই।' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  // ===================== SETTINGS & GATEWAYS =====================
  app.get('/api/settings', (req, res) => {
    res.json({ gateways: db.gateways });
  });

  app.put('/api/admin/settings', (req, res) => {
    const { bkash, nagad, rocket, supportPhone, noticeText } = req.body;
    
    if (bkash) db.gateways.bkash = { ...db.gateways.bkash, ...bkash };
    if (nagad) db.gateways.nagad = { ...db.gateways.nagad, ...nagad };
    if (rocket) db.gateways.rocket = { ...db.gateways.rocket, ...rocket };
    if (supportPhone !== undefined) db.gateways.supportPhone = supportPhone;
    if (noticeText !== undefined) db.gateways.noticeText = noticeText;

    saveDatabase();
    res.json({ gateways: db.gateways, message: 'পেমেন্ট গেটওয়ে সেটিংস সফলভাবে আপডেট করা হয়েছে।' });
  });

  // ===================== SERVICES =====================
  app.get('/api/services', (req, res) => {
    res.json({ services: db.services });
  });

  app.put('/api/admin/services/:id', (req, res) => {
    const { id } = req.params;
    const index = db.services.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'সার্ভিস পাওয়া যায়নি।' });
    }

    db.services[index] = { ...db.services[index], ...req.body };
    saveDatabase();
    res.json({ service: db.services[index], message: 'সার্ভিস সফলভাবে আপডেট হয়েছে।' });
  });

  app.post('/api/admin/services', (req, res) => {
    const { title, category, description, regularFee, urgentFee, regularDays, urgentDays, requiredDocs, correctionOptions } = req.body;
    if (!title || !category || regularFee === undefined) {
      return res.status(400).json({ error: 'শিরোনাম, ক্যাটাগরি ও নিয়মিত ফি আবশ্যক।' });
    }

    const newService: ServiceItem = {
      id: 'srv-' + Date.now(),
      title,
      category,
      description: description || '',
      regularFee: Number(regularFee),
      urgentFee: Number(urgentFee || regularFee * 1.5),
      regularDays: regularDays || '২-৩ দিন',
      urgentDays: urgentDays || '২৪ ঘণ্টা',
      requiredDocs: Array.isArray(requiredDocs) ? requiredDocs : [],
      correctionOptions: Array.isArray(correctionOptions) ? correctionOptions : ['সাধারণ তথ্য সংশোধন']
    };

    db.services.push(newService);
    saveDatabase();
    res.status(201).json({ service: newService, message: 'নতুন সার্ভিস যোগ করা হয়েছে।' });
  });

  app.delete('/api/admin/services/:id', (req, res) => {
    const { id } = req.params;
    db.services = db.services.filter(s => s.id !== id);
    saveDatabase();
    res.json({ message: 'সার্ভিস ডিলিট করা হয়েছে।' });
  });

  // ===================== WALLET / ADD MONEY =====================
  app.post('/api/wallet/deposit', (req, res) => {
    const { userId, method, senderNumber, amount, trxId } = req.body;

    if (!userId || !method || !senderNumber || !amount || !trxId) {
      return res.status(400).json({ error: 'সকল তথ্য (পদ্ধতি, প্রেরক নম্বর, পরিমাণ ও ট্রানজেকশন আইডি) প্রদান করুন।' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'সঠিক টাকার পরিমাণ উল্লেখ করুন।' });
    }

    // Check duplicate pending TrxID
    const duplicate = db.deposits.find(d => d.trxId.trim().toUpperCase() === trxId.trim().toUpperCase() && d.status === 'approved');
    if (duplicate) {
      return res.status(400).json({ error: 'এই ট্রানজেকশন আইডিটি পূর্বে ব্যবহৃত হয়েছে।' });
    }

    const gatewayNumber = db.gateways[method as 'bkash' | 'nagad' | 'rocket']?.number || '01712345678';

    const deposit: DepositRequest = {
      id: 'DEP-' + Math.floor(10000 + Math.random() * 90000),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      method: method as any,
      gatewayNumber,
      senderNumber: senderNumber.trim(),
      amount: numAmount,
      trxId: trxId.trim().toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.deposits.unshift(deposit);
    saveDatabase();

    res.status(201).json({ 
      deposit, 
      message: 'এড মানি আবেদন সফলভাবে গ্রহণ করা হয়েছে! এডমিন যাচাই শেষে ৩-৫ মিনিটে ব্যালেন্স যোগ হবে।' 
    });
  });

  app.get('/api/wallet/my-deposits', (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'লগইন করুন।' });
    }
    const myDeposits = db.deposits.filter(d => d.userId === userId);
    res.json({ deposits: myDeposits });
  });

  app.get('/api/wallet/transactions', (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'লগইন করুন।' });
    }
    const myTxns = db.transactions.filter(t => t.userId === userId);
    res.json({ transactions: myTxns });
  });

  // Admin Deposits
  app.get('/api/admin/deposits', (req, res) => {
    res.json({ deposits: db.deposits });
  });

  app.put('/api/admin/deposits/:id', (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body; // status: 'approved' | 'rejected'

    const deposit = db.deposits.find(d => d.id === id);
    if (!deposit) {
      return res.status(404).json({ error: 'ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি।' });
    }

    if (deposit.status !== 'pending' && deposit.status === status) {
      return res.status(400).json({ error: 'এই রিকোয়েস্টের অবস্থা ইতিমধ্যে পরিবর্তিত হয়েছে।' });
    }

    const previousStatus = deposit.status;
    deposit.status = status;
    deposit.adminNote = adminNote || (status === 'approved' ? 'এডমিন কর্তৃক অনুমোদিত' : 'তথ্য অমিলের কারণে বাতিল');
    deposit.updatedAt = new Date().toISOString();

    // If changing to approved, credit user wallet
    if (status === 'approved' && previousStatus !== 'approved') {
      const targetUser = db.users.find(u => u.id === deposit.userId);
      if (targetUser) {
        targetUser.balance = (targetUser.balance || 0) + deposit.amount;

        db.transactions.unshift({
          id: 'TXN-' + Date.now(),
          userId: targetUser.id,
          type: 'deposit',
          amount: deposit.amount,
          description: `${deposit.method.toUpperCase()} এড মানি অনুমোদন (TrxID: ${deposit.trxId})`,
          relatedId: deposit.id,
          createdAt: new Date().toISOString()
        });
      }
    }

    saveDatabase();
    res.json({ deposit, message: status === 'approved' ? 'ডিপোজিট সফলভাবে অনুমোদিত হয়েছে ও ব্যালেন্স যোগ হয়েছে।' : 'ডিপোজিট বাতিল করা হয়েছে।' });
  });

  // Admin Direct Wallet Add Funds (using bKash, Nagad, or Rocket to pre-defined admin number)
  app.post('/api/admin/wallet/add-funds', (req, res) => {
    const { adminUserId, method, amount, senderNumber, trxId, note } = req.body;

    if (!method || !amount) {
      return res.status(400).json({ error: 'পেমেন্ট মেথড (বিকাশ, নগদ, রকেট) এবং টাকার পরিমাণ আবশ্যক।' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'সঠিক টাকার পরিমাণ প্রদান করুন।' });
    }

    // Identify admin user
    let adminUser = db.users.find(u => u.id === adminUserId);
    if (!adminUser) {
      // fallback to first admin
      adminUser = db.users.find(u => u.role === 'admin') || db.users[0];
    }

    if (!adminUser) {
      return res.status(404).json({ error: 'এডমিন একাউন্ট পাওয়া যায়নি।' });
    }

    const gatewayMethod = method as 'bkash' | 'nagad' | 'rocket';
    const gatewayInfo = db.gateways[gatewayMethod] || {
      number: '01712345678',
      type: 'Personal',
      feeNotice: ''
    };
    const preDefinedAdminNumber = gatewayInfo.number;

    // Credit admin wallet balance
    adminUser.balance = (adminUser.balance || 0) + numAmount;

    const generatedTrxId = (trxId || ('ADM' + Date.now().toString().slice(-7))).trim().toUpperCase();

    // Create completed deposit record
    const deposit: DepositRequest = {
      id: 'DEP-ADM-' + Math.floor(10000 + Math.random() * 90000),
      userId: adminUser.id,
      userName: `${adminUser.name} (এডমিন)`,
      userPhone: adminUser.phone,
      method: gatewayMethod,
      gatewayNumber: preDefinedAdminNumber,
      senderNumber: (senderNumber || adminUser.phone).trim(),
      amount: numAmount,
      trxId: generatedTrxId,
      status: 'approved',
      adminNote: note || `এডমিন ফান্ড রিচার্জ (${gatewayMethod.toUpperCase()} -> প্রি-ডিফাইনড এডমিন নম্বর: ${preDefinedAdminNumber})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.deposits.unshift(deposit);

    // Create transaction log
    db.transactions.unshift({
      id: 'TXN-' + Date.now(),
      userId: adminUser.id,
      type: 'deposit',
      amount: numAmount,
      description: `এডমিন ওয়ালেট ফান্ড যুক্তকরণ (${gatewayMethod.toUpperCase()} - গন্তব্য নম্বর: ${preDefinedAdminNumber}, TrxID: ${generatedTrxId})`,
      relatedId: deposit.id,
      createdAt: new Date().toISOString()
    });

    saveDatabase();

    const { password: _, ...safeAdmin } = adminUser;
    res.status(200).json({
      success: true,
      user: safeAdmin,
      newBalance: adminUser.balance,
      deposit,
      message: `এডমিন একাউন্টে ${gatewayMethod.toUpperCase()} এর মাধ্যমে ৳${numAmount} সফলভাবে যুক্ত করা হয়েছে! (গন্তব্য নম্বর: ${preDefinedAdminNumber})`
    });
  });

  // ===================== ORDERS & CORRECTION REQUESTS =====================
  app.post('/api/orders', (req, res) => {
    const { 
      userId, 
      serviceId, 
      correctionType, 
      currentInfo, 
      correctedInfo, 
      documentNumber, 
      applicantAddress, 
      deliveryType, 
      attachedFiles,
      userEmail
    } = req.body;

    if (!userId || !serviceId || !correctionType || !currentInfo || !correctedInfo) {
      return res.status(400).json({ error: 'সকল আবশ্যকীয় তথ্য (সার্ভিস, সংশোধনের বিবরণ ও ভুল/সঠিক তথ্য) পূরণ করুন।' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    const service = db.services.find(s => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ error: 'সার্ভিস পাওয়া যায়নি।' });
    }

    const fee = deliveryType === 'urgent' ? service.urgentFee : service.regularFee;

    // Check wallet balance
    if (user.balance < fee) {
      return res.status(400).json({ 
        error: `আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। প্রয়োজনীয় ফি: ৳${fee}, বর্তমান ব্যালেন্স: ৳${user.balance}। দয়া করে এড মানি করুন।`,
        needDeposit: true,
        requiredFee: fee,
        currentBalance: user.balance
      });
    }

    // Deduct fee from wallet
    user.balance -= fee;

    const trackingId = 'REQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      trackingId,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userEmail: userEmail || '',
      serviceId: service.id,
      serviceName: service.title,
      category: service.category,
      correctionType,
      currentInfo,
      correctedInfo,
      documentNumber: documentNumber || '',
      applicantAddress: applicantAddress || '',
      deliveryType: deliveryType === 'urgent' ? 'urgent' : 'regular',
      feePaid: fee,
      paymentStatus: 'paid',
      attachedFiles: Array.isArray(attachedFiles) ? attachedFiles : [],
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          note: 'আবেদনপত্র জমা হয়েছে এবং নির্ধারিত ফি ৳' + fee + ' ওয়ালেট থেকে কর্তন করা হয়েছে।',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);

    // Record transaction
    db.transactions.unshift({
      id: 'TXN-' + Date.now(),
      userId: user.id,
      type: 'service_payment',
      amount: fee,
      description: `${service.title} আবেদন ফি (${trackingId})`,
      relatedId: newOrder.id,
      createdAt: new Date().toISOString()
    });

    saveDatabase();

    res.status(201).json({
      order: newOrder,
      remainingBalance: user.balance,
      message: `আপনার সংশোধন আবেদনটি সফলভাবে জমা হয়েছে! ট্র্যাকিং আইডি: ${trackingId}`
    });
  });

  app.get('/api/orders/my', (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'লগইন করুন।' });
    }
    const myOrders = db.orders.filter(o => o.userId === userId);
    res.json({ orders: myOrders });
  });

  app.get('/api/orders/track/:trackingId', (req, res) => {
    const { trackingId } = req.params;
    const cleanId = trackingId.trim().toUpperCase();
    const order = db.orders.find(o => o.trackingId.toUpperCase() === cleanId || o.id === trackingId);
    if (!order) {
      return res.status(404).json({ error: 'প্রদত্ত ট্র্যাকিং নম্বরে কোনো আবেদন খুঁজে পাওয়া যায়নি।' });
    }
    res.json({ order });
  });

  // Admin Order routes
  app.get('/api/admin/orders', (req, res) => {
    res.json({ orders: db.orders });
  });

  app.put('/api/admin/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status, adminRemarks, deliveryDocumentUrl, deliveryReferenceNumber } = req.body;

    const order = db.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'আবেদন খুঁজে পাওয়া যায়নি।' });
    }

    if (status && status !== order.status) {
      order.status = status;
      const statusNoteMap: Record<string, string> = {
        pending: 'আবেদনপত্র অপেক্ষমান তালিকায় রয়েছে',
        verified: 'কাগজপত্র ও আবেদনকারীর তথ্য প্রাথমিক যাচাই সম্পন্ন',
        processing: 'সরকারি সার্ভার ডাটাবেজে প্রক্রিয়াজাতকরণ চলছে',
        completed: 'সংশোধন সফলভাবে সম্পন্ন হয়েছে ও কপি প্রস্তুত',
        rejected: adminRemarks || 'কাগজপত্রে ত্রুটি থাকার কারণে আবেদনটি বাতিল করা হয়েছে'
      };

      order.statusHistory.push({
        status,
        note: statusNoteMap[status] || 'অবস্থা পরিবর্তিত হয়েছে',
        timestamp: new Date().toISOString()
      });
    }

    if (adminRemarks !== undefined) order.adminRemarks = adminRemarks;
    if (deliveryDocumentUrl !== undefined) order.deliveryDocumentUrl = deliveryDocumentUrl;
    if (deliveryReferenceNumber !== undefined) order.deliveryReferenceNumber = deliveryReferenceNumber;
    order.updatedAt = new Date().toISOString();

    saveDatabase();
    res.json({ order, message: 'আবেদনের তথ্য ও অবস্থা সফলভাবে হালনাগাদ করা হয়েছে।' });
  });

  // Admin Users & Balance Adjust
  app.get('/api/admin/users', (req, res) => {
    const safeUsers = db.users.map(({ password: _, ...u }) => u);
    res.json({ users: safeUsers });
  });

  app.put('/api/admin/users/:id/balance', (req, res) => {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({ error: 'সঠিক ব্যালেন্স দিন।' });
    }

    user.balance = (user.balance || 0) + numAmount;
    db.transactions.unshift({
      id: 'TXN-' + Date.now(),
      userId: user.id,
      type: numAmount >= 0 ? 'deposit' : 'refund',
      amount: Math.abs(numAmount),
      description: `এডমিন কর্তৃক ব্যালেন্স সমন্বয় (${reason || 'সরাসরি অ্যাডজাস্টমেন্ট'})`,
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, message: 'ব্যালেন্স সফলভাবে পরিবর্তন করা হয়েছে।' });
  });

  // Admin Dashboard Stats
  app.get('/api/admin/stats', (req, res) => {
    const totalOrders = db.orders.length;
    const pendingOrders = db.orders.filter(o => o.status === 'pending').length;
    const processingOrders = db.orders.filter(o => o.status === 'processing' || o.status === 'verified').length;
    const completedOrders = db.orders.filter(o => o.status === 'completed').length;
    const totalRevenue = db.orders.reduce((sum, o) => sum + (o.feePaid || 0), 0);
    
    const pendingDeposits = db.deposits.filter(d => d.status === 'pending');
    const pendingDepositsCount = pendingDeposits.length;
    const pendingDepositsAmount = pendingDeposits.reduce((sum, d) => sum + d.amount, 0);
    const totalUsers = db.users.filter(u => u.role === 'user').length;

    const stats: AdminStats = {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalRevenue,
      pendingDepositsCount,
      pendingDepositsAmount,
      totalUsers
    };

    res.json({ stats });
  });

  // ===================== VITE & STATIC SERVING =====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
