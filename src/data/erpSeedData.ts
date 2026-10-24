export type DocStatus = 0 | 1 | 2; // 0 = پیش‌نویس، 1 = ثبت قطعی، 2 = ابطال‌شده

export interface AccountNode {
  id: string;
  code: string;
  name: string;
  category: 'دارایی' | 'بدهی' | 'سرمایه' | 'درآمد' | 'هزینه';
  level: 'گروه' | 'کل' | 'معین' | 'تفصیلی';
  parentCode?: string;
  openingBalance?: number;
  balance: number;
  currency: 'IRR' | 'USD' | 'AED';
}

export interface GLEntryRecord {
  id: string;
  postingDate: string;
  accountCode: string;
  accountName: string;
  partyType?: 'مشتری' | 'تامین‌کننده' | 'سهامدار' | '—';
  partyName?: string;
  debit: number;
  credit: number;
  voucherType:
    | 'Sales Invoice'
    | 'Purchase Invoice'
    | 'Journal Entry'
    | 'Payment Entry'
    | 'POS Invoice'
    | 'Cheque Clearance';
  voucherNo: string;
  costCenter: string;
  branchDimension: string;
  remarks?: string;
  isCancelled?: boolean;
}

export interface InvoiceLineItem {
  id: string;
  sku: string;
  itemName: string;
  uom: string;
  qty: number;
  unitPrice: number;
  discountPercent: number;
  netLineAmount: number;
  valuationRate: number;
}

export interface SalesInvoiceRecord {
  id: string;
  invoiceNo: string;
  docstatus: DocStatus;
  customerName: string;
  date: string;
  dueDate: string;
  branchDimension: string;
  costCenter?: string;
  channelDimension: string;
  paymentTermsTemplate: string;
  updateStock: boolean;
  isSubscription: boolean;
  subscriptionInterval?: string;
  status: 'پیش‌نویس' | 'پرداخت‌شده' | 'اقساطی فعال' | 'معوق' | 'مرجوعی (یادداشت بستانکاری)' | 'ابطال‌شده';
  totalAmount: number;
  paidAmount: number;
  cogsAmount?: number;
  itemsSummary: string;
  lines?: InvoiceLineItem[];
}

export interface PurchaseInvoiceRecord {
  id: string;
  billNo: string;
  docstatus: DocStatus;
  supplierName: string;
  date: string;
  warehouse: string;
  branchDimension?: string;
  costCenter?: string;
  status: 'پیش‌نویس' | 'تسویه‌شده' | 'بدهکار باز' | 'برگشت از خرید (یادداشت بدهکاری)' | 'ابطال‌شده';
  totalAmount: number;
  paidAmount?: number;
  landedCostAdded: number;
  itemsSummary: string;
  lines?: InvoiceLineItem[];
}

export interface JournalEntryRecord {
  id: string;
  voucherNo: string;
  postingDate: string;
  docstatus: DocStatus;
  title: string;
  branchDimension: string;
  totalDebit: number;
  totalCredit: number;
  lines: {
    id: string;
    accountCode: string;
    accountName: string;
    partyType?: 'مشتری' | 'تامین‌کننده' | 'سهامدار' | '—';
    partyName?: string;
    costCenter?: string;
    dimensionBranch?: string;
    debit: number;
    credit: number;
    note?: string;
  }[];
}

export interface PaymentEntryRecord {
  id: string;
  paymentNo: string;
  postingDate: string;
  docstatus: DocStatus;
  paymentType: 'دریافت از مشتری (Receive)' | 'پرداخت به تامین‌کننده (Pay)';
  partyName: string;
  modeOfPayment: 'حواله بانکی پایا/ساتنا' | 'کارتخوان (POS)' | 'نقد (صندوق)' | 'چک صیادی';
  bankAccountCode: string;
  referenceVoucherNo: string;
  amount: number;
  branchDimension: string;
  costCenter: string;
}

export interface ChequeRecord {
  id: string;
  sayadiNo: string;
  type: 'دریافتنی از مشتری' | 'پرداختنی به تامین‌کننده';
  partyName: string;
  bankName: string;
  amount: number;
  dueDate: string;
  clearanceDate?: string;
  status: 'در جریان وصول' | 'وصول‌شده (پاس‌شده)' | 'خرج‌شده' | 'برگشتی';
}

export interface CostCenterRecord {
  id: string;
  code: string;
  name: string;
  parentName: string;
  allocatedBudget: number;
  spentAmount: number;
  revenueGenerated: number;
  controlPolicy: 'WARN' | 'STOP';
  autoAllocationPercent: number;
}

export interface FixedAssetRecord {
  id: string;
  assetTag: string;
  name: string;
  category: 'تجهیزات فناوری' | 'دکوراسیون و فروشگاهی' | 'وسایل نقلیه';
  location: string;
  purchaseDate: string;
  purchaseValue: number;
  currentBookValue: number;
  status: 'فعال در بهره‌برداری' | 'فروخته‌شده' | 'اسقاط‌شده' | 'تجدید ارزیابی‌شده';
}

export interface ShareholderRecord {
  id: string;
  name: string;
  folioNo: string;
  sharesCount: number;
  ownershipPercent: number;
  capitalBalance: number;
  dividendPaid: number;
}

export interface BundleComponentSpec {
  sku: string;
  name: string;
  qty: number;
}

export interface InventoryItemRecord {
  id: string;
  sku: string;
  name: string;
  category: 'دستگاه پاد و ماد' | 'جویس و سالت' | 'کویل و کارتریج' | 'پکیج باندل' | 'کارت هدیه و خدمات';
  brand: string;
  flavor?: string;
  nicotine?: string;
  condition?: 'آکبند شرکتی' | 'کارکرده / تستر';
  isBundle?: boolean;
  bundleComponents?: string[];
  bundleComponentItems?: BundleComponentSpec[];
  uomPrimary: string;
  stockQty: number;
  reservedQty: number;
  reorderLevel: number;
  valuationRate: number;
  retailPrice: number;
  wholesalePrice: number;
  partnerPrice: number;
  serialNumbers: string[];
  batchNo: string;
  expiryDate: string;
  daysInStock?: number;
}

export interface CrmLeadRecord {
  id: string;
  fullName: string;
  phone: string;
  source: 'اینستاگرام' | 'تلگرام' | 'تماس تلفنی' | 'مراجعه حضوری' | 'کمپین اینفلوئنسر';
  campaignName: string;
  interestStyle: 'سبک MTL (سیگاری)' | 'سبک DTL (قلیانی)' | 'همکار عمده‌فروش';
  stage: 'سرنخ جدید (Lead)' | 'مذاکره و فرصت (Opportunity)' | 'ارسال پیش‌فاکتور' | 'مشتری وفادار';
  probability: number;
  estimatedValue: number;
  loyaltyTier: 'طلایی' | 'نقره‌ای' | 'برنزی';
  loyaltyPoints: number;
  clvAmount: number;
  lastPurchaseDaysAgo: number;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  docType: string;
  docId: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
}

export const INITIAL_ACCOUNTS: AccountNode[] = [
  // ۱۰۰۰ - دارایی‌ها (جمع: ۴,۸۵۰,۰۰۰,۰۰۰)
  { id: 'acc-1', code: '1000', name: 'دارایی‌ها', category: 'دارایی', level: 'گروه', openingBalance: 4100000000, balance: 4850000000, currency: 'IRR' },
  { id: 'acc-2', code: '1100', name: 'دارایی‌های جاری و نقدینگی', category: 'دارایی', level: 'کل', parentCode: '1000', openingBalance: 2650000000, balance: 3260000000, currency: 'IRR' },
  { id: 'acc-3', code: '1101', name: 'موجودی نقد و بانک‌های ریالی', category: 'دارایی', level: 'معین', parentCode: '1100', openingBalance: 1150000000, balance: 1420000000, currency: 'IRR' },
  { id: 'acc-4', code: '110101', name: 'بانک ملت — جاری شعبه مرکزی', category: 'دارایی', level: 'تفصیلی', parentCode: '1101', openingBalance: 790000000, balance: 980000000, currency: 'IRR' },
  { id: 'acc-5', code: '110102', name: 'صندوق و کارتخوان شعبه الهیه', category: 'دارایی', level: 'تفصیلی', parentCode: '1101', openingBalance: 360000000, balance: 440000000, currency: 'IRR' },
  { id: 'acc-6', code: '1102', name: 'حساب‌های دریافتنی تجاری', category: 'دارایی', level: 'معین', parentCode: '1100', openingBalance: 520000000, balance: 680000000, currency: 'IRR' },
  { id: 'acc-7', code: '1103', name: 'اسناد دریافتنی در جریان وصول', category: 'دارایی', level: 'معین', parentCode: '1100', openingBalance: 280000000, balance: 320000000, currency: 'IRR' },
  { id: 'acc-8', code: '1104', name: 'موجودی کالای انبار مرکزی', category: 'دارایی', level: 'معین', parentCode: '1100', openingBalance: 700000000, balance: 840000000, currency: 'IRR' },
  { id: 'acc-9', code: '1200', name: 'دارایی‌های ثابت مشهود', category: 'دارایی', level: 'کل', parentCode: '1000', openingBalance: 1450000000, balance: 1590000000, currency: 'IRR' },
  { id: 'acc-9b', code: '1201', name: 'اموال، ماشین‌آلات و تجهیزات', category: 'دارایی', level: 'معین', parentCode: '1200', openingBalance: 1450000000, balance: 1590000000, currency: 'IRR' },

  // ۲۰۰۰ - بدهی‌ها (جمع: ۹۶۰,۰۰۰,۰۰۰)
  { id: 'acc-10', code: '2000', name: 'بدهی‌ها و تعهدات', category: 'بدهی', level: 'گروه', openingBalance: 760000000, balance: 960000000, currency: 'IRR' },
  { id: 'acc-10b', code: '2100', name: 'بدهی‌های جاری تجاری', category: 'بدهی', level: 'کل', parentCode: '2000', openingBalance: 760000000, balance: 960000000, currency: 'IRR' },
  { id: 'acc-11', code: '2101', name: 'حساب‌های پرداختنی تجاری', category: 'بدهی', level: 'معین', parentCode: '2100', openingBalance: 590000000, balance: 716500000, currency: 'IRR' },
  { id: 'acc-13', code: '2103', name: 'ذخیره پورسانت فروشندگان', category: 'بدهی', level: 'معین', parentCode: '2100', openingBalance: 140000000, balance: 205000000, currency: 'IRR' },
  { id: 'acc-13b', code: '2104', name: 'حساب واسط ترخیص و گمرک', category: 'بدهی', level: 'معین', parentCode: '2100', openingBalance: 30000000, balance: 38500000, currency: 'IRR' },

  // ۳۰۰۰ - حقوق صاحبان سهام (جمع: ۳,۰۰۰,۰۰۰,۰۰۰)
  { id: 'acc-14', code: '3000', name: 'حقوق صاحبان سهام و سرمایه', category: 'سرمایه', level: 'گروه', openingBalance: 3000000000, balance: 3000000000, currency: 'IRR' },
  { id: 'acc-14b', code: '3100', name: 'سرمایه و اندوخته‌های قانونی', category: 'سرمایه', level: 'کل', parentCode: '3000', openingBalance: 3000000000, balance: 3000000000, currency: 'IRR' },
  { id: 'acc-15', code: '3101', name: 'سرمایه ثبت‌شده سهامداران', category: 'سرمایه', level: 'معین', parentCode: '3100', openingBalance: 2500000000, balance: 2500000000, currency: 'IRR' },
  { id: 'acc-16', code: '3102', name: 'سود و زیان انباشته سنواتی', category: 'سرمایه', level: 'معین', parentCode: '3100', openingBalance: 500000000, balance: 500000000, currency: 'IRR' },

  // ۴۰۰۰ - درآمدها (جمع: ۲,۱۵۰,۰۰۰,۰۰۰)
  { id: 'acc-17', code: '4000', name: 'درآمدهای عملیاتی و فروش', category: 'درآمد', level: 'گروه', openingBalance: 1200000000, balance: 2150000000, currency: 'IRR' },
  { id: 'acc-17b', code: '4100', name: 'درآمد فروش کالا و خدمات', category: 'درآمد', level: 'کل', parentCode: '4000', openingBalance: 1200000000, balance: 2150000000, currency: 'IRR' },
  { id: 'acc-18', code: '4101', name: 'درآمد فروش خالص کالا', category: 'درآمد', level: 'معین', parentCode: '4100', openingBalance: 1100000000, balance: 1980000000, currency: 'IRR' },
  { id: 'acc-19', code: '4102', name: 'درآمد اشتراک‌های دوره‌ای', category: 'درآمد', level: 'معین', parentCode: '4100', openingBalance: 100000000, balance: 170000000, currency: 'IRR' },

  // ۵۰۰۰ - هزینه‌ها و بهای تمام‌شده (جمع: ۱,۲۶۰,۰۰۰,۰۰۰)
  { id: 'acc-20', code: '5000', name: 'بهای تمام‌شده و هزینه‌های عملیاتی', category: 'هزینه', level: 'گروه', openingBalance: 860000000, balance: 1260000000, currency: 'IRR' },
  { id: 'acc-20b', code: '5100', name: 'بهای تمام‌شده و هزینه‌های فروش', category: 'هزینه', level: 'کل', parentCode: '5000', openingBalance: 860000000, balance: 1260000000, currency: 'IRR' },
  { id: 'acc-21', code: '5101', name: 'بهای تمام‌شده کالای فروش‌رفته', category: 'هزینه', level: 'معین', parentCode: '5100', openingBalance: 610000000, balance: 910000000, currency: 'IRR' },
  { id: 'acc-22', code: '5201', name: 'هزینه پورسانت فروش و بازاریابی', category: 'هزینه', level: 'معین', parentCode: '5100', openingBalance: 150000000, balance: 220000000, currency: 'IRR' },
  { id: 'acc-23', code: '5202', name: 'هزینه اجاره و نگهداری شعب', category: 'هزینه', level: 'معین', parentCode: '5100', openingBalance: 100000000, balance: 130000000, currency: 'IRR' },
];

export const INITIAL_GL_ENTRIES: GLEntryRecord[] = [
  {
    id: 'gle-1',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    accountCode: '110101',
    accountName: 'بانک ملت — جاری شعبه مرکزی',
    partyType: 'مشتری',
    partyName: 'پخش سراسری نیکوتین‌پارس',
    debit: 43500000,
    credit: 0,
    voucherType: 'Sales Invoice',
    voucherNo: 'SINV-1404-0108',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
    branchDimension: 'شعبه مرکزی تهران',
    remarks: 'دریافت پیش‌پرداخت ۳۰٪ فاکتور فروش اقساطی',
  },
  {
    id: 'gle-2',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    accountCode: '1102',
    accountName: 'حساب‌های دریافتنی تجاری',
    partyType: 'مشتری',
    partyName: 'پخش سراسری نیکوتین‌پارس',
    debit: 101500000,
    credit: 0,
    voucherType: 'Sales Invoice',
    voucherNo: 'SINV-1404-0108',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
    branchDimension: 'شعبه مرکزی تهران',
    remarks: 'مانده تعهد اقساطی یک‌ماهه و دوماهه (۷۰٪)',
  },
  {
    id: 'gle-3',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    accountCode: '4101',
    accountName: 'درآمد فروش خالص کالا',
    partyType: 'مشتری',
    partyName: 'پخش سراسری نیکوتین‌پارس',
    debit: 0,
    credit: 145000000,
    voucherType: 'Sales Invoice',
    voucherNo: 'SINV-1404-0108',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
    branchDimension: 'شعبه مرکزی تهران',
    remarks: 'ثبت درآمد خالص فروش عمده',
  },
  {
    id: 'gle-5',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    accountCode: '5101',
    accountName: 'بهای تمام‌شده کالای فروش‌رفته',
    partyType: '—',
    partyName: 'کاردکس انبار مرکزی',
    debit: 104000000,
    credit: 0,
    voucherType: 'Sales Invoice',
    voucherNo: 'SINV-1404-0108',
    costCenter: 'انبار مرکزی و لجستیک کهریزک',
    branchDimension: 'شعبه مرکزی تهران',
    remarks: 'ثبت خودکار بهای تمام‌شده کالای فروش‌رفته',
  },
  {
    id: 'gle-6',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    accountCode: '1104',
    accountName: 'موجودی کالای انبار مرکزی',
    partyType: '—',
    partyName: 'کاردکس انبار مرکزی',
    debit: 0,
    credit: 104000000,
    voucherType: 'Sales Invoice',
    voucherNo: 'SINV-1404-0108',
    costCenter: 'انبار مرکزی و لجستیک کهریزک',
    branchDimension: 'شعبه مرکزی تهران',
    remarks: 'خروج کالا از انبار به نرخ میانگین موزون',
  },
  {
    id: 'gle-7',
    postingDate: '۱۴۰۴/۰۷/۲۰',
    accountCode: '1104',
    accountName: 'موجودی کالای انبار مرکزی',
    partyType: 'تامین‌کننده',
    partyName: 'بازرگانی شنژن تریدینگ',
    debit: 420000000,
    credit: 0,
    voucherType: 'Purchase Invoice',
    voucherNo: 'PINV-1404-0084',
    costCenter: 'انبار مرکزی و لجستیک کهریزک',
    branchDimension: 'انبار مرکزی کهریزک',
    remarks: 'ورود کالای وارداتی همراه با سرشکن گمرک',
  },
  {
    id: 'gle-8',
    postingDate: '۱۴۰۴/۰۷/۲۰',
    accountCode: '2101',
    accountName: 'حساب‌های پرداختنی تجاری',
    partyType: 'تامین‌کننده',
    partyName: 'بازرگانی شنژن تریدینگ',
    debit: 0,
    credit: 381500000,
    voucherType: 'Purchase Invoice',
    voucherNo: 'PINV-1404-0084',
    costCenter: 'انبار مرکزی و لجستیک کهریزک',
    branchDimension: 'انبار مرکزی کهریزک',
    remarks: 'بهای خالص فاکتور تامین‌کننده',
  },
  {
    id: 'gle-9',
    postingDate: '۱۴۰۴/۰۷/۲۰',
    accountCode: '2104',
    accountName: 'حساب واسط ترخیص و گمرک',
    partyType: 'تامین‌کننده',
    partyName: 'گمرک و ترخیص‌کار رسمی',
    debit: 0,
    credit: 38500000,
    voucherType: 'Purchase Invoice',
    voucherNo: 'PINV-1404-0084',
    costCenter: 'انبار مرکزی و لجستیک کهریزک',
    branchDimension: 'انبار مرکزی کهریزک',
    remarks: 'سند سرشکن هزینه‌های گمرکی و حمل',
  },
];

export const INITIAL_SALES_INVOICES: SalesInvoiceRecord[] = [
  {
    id: 'sinv-1',
    invoiceNo: 'SINV-1404-0108',
    docstatus: 1,
    customerName: 'پخش سراسری نیکوتین‌پارس',
    date: '۱۴۰۴/۰۸/۰۱',
    dueDate: '۱۴۰۴/۱۰/۰۱',
    branchDimension: 'شعبه مرکزی تهران',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
    channelDimension: 'فروش سازمانی عمده',
    paymentTermsTemplate: '۳۰٪ نقد، ۳۵٪ یک ماهه، ۳۵٪ دو ماهه',
    updateStock: true,
    isSubscription: false,
    status: 'اقساطی فعال',
    totalAmount: 145000000,
    paidAmount: 43500000,
    cogsAmount: 104000000,
    itemsSummary: '۱۰۰ عدد پاد پیک‌بار ۶۰۰۰۰ + ۵۰ بسته کویل',
    lines: [
      {
        id: 'sl-1',
        sku: 'PK60-MANGO-50',
        itemName: 'پاد هوشمند پیک‌بار ۶۰۰۰۰ — انبه یخ',
        uom: 'عدد',
        qty: 100,
        unitPrice: 1120000,
        discountPercent: 0,
        netLineAmount: 112000000,
        valuationRate: 780000,
      },
      {
        id: 'sl-2',
        sku: 'COIL-XROS-06',
        itemName: 'بسته کارتریج اکس‌راس ۰.۶ اهم',
        uom: 'بسته',
        qty: 50,
        unitPrice: 660000,
        discountPercent: 0,
        netLineAmount: 33000000,
        valuationRate: 520000,
      },
    ],
  },
  {
    id: 'sinv-2',
    invoiceNo: 'SINV-1404-0109',
    docstatus: 1,
    customerName: 'امیرحسین رضایی',
    date: '۱۴۰۴/۰۸/۰۲',
    dueDate: '۱۴۰۴/۰۸/۰۲',
    branchDimension: 'شعبه الهیه',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
    channelDimension: 'صندوق فروشگاهی',
    paymentTermsTemplate: 'تسویه نقد و کارتخوان',
    updateStock: true,
    isSubscription: false,
    status: 'پرداخت‌شده',
    totalAmount: 4850000,
    paidAmount: 4850000,
    cogsAmount: 1760000,
    itemsSummary: 'پکیج استارتر کامل + جویس انبه + کویل یدک',
  },
  {
    id: 'sinv-3',
    invoiceNo: 'SINV-1404-0110',
    docstatus: 0,
    customerName: 'کافه ویپ نیاوران',
    date: '۱۴۰۴/۰۸/۰۲',
    dueDate: '۱۴۰۴/۰۸/۲۸',
    branchDimension: 'شعبه الهیه',
    costCenter: 'فروشگاه اینترنتی و دیجیتال مارکتینگ',
    channelDimension: 'اشتراک خودکار ماهانه',
    paymentTermsTemplate: 'اشتراک ماهانه استند تستر',
    updateStock: true,
    isSubscription: true,
    subscriptionInterval: 'ماهانه (اول هر ماه)',
    status: 'پیش‌نویس',
    totalAmount: 28000000,
    paidAmount: 0,
    cogsAmount: 13800000,
    itemsSummary: 'شارژ ماهانه ۳۰ عدد سالت و جویس تستر',
  },
  {
    id: 'sinv-4',
    invoiceNo: 'CN-1404-0012',
    docstatus: 1,
    customerName: 'فروشگاه دود سفید کرج',
    date: '۱۴۰۴/۰۷/۲۵',
    dueDate: '۱۴۰۴/۰۷/۲۵',
    branchDimension: 'شعبه مرکزی تهران',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
    channelDimension: 'اینستاگرام و تلگرام',
    paymentTermsTemplate: 'یادداشت بستانکاری',
    updateStock: true,
    isSubscription: false,
    status: 'مرجوعی (یادداشت بستانکاری)',
    totalAmount: 6400000,
    paidAmount: 6400000,
    cogsAmount: 3120000,
    itemsSummary: 'برگشت ۴ عدد دستگاه به علت مغایرت رنگ',
  },
];

export const INITIAL_PURCHASE_INVOICES: PurchaseInvoiceRecord[] = [
  {
    id: 'pinv-1',
    billNo: 'PINV-1404-0084',
    docstatus: 1,
    supplierName: 'بازرگانی شنژن تریدینگ',
    date: '۱۴۰۴/۰۷/۲۰',
    warehouse: 'انبار مرکزی کهریزک',
    branchDimension: 'انبار مرکزی کهریزک',
    costCenter: 'انبار مرکزی و لجستیک کهریزک',
    status: 'تسویه‌شده',
    totalAmount: 420000000,
    paidAmount: 420000000,
    landedCostAdded: 38500000,
    itemsSummary: '۵۰۰ عدد پاد پیک‌بار ۶۰۰۰۰ + ۳۰۰ عدد جویس ۶۰ میل',
  },
  {
    id: 'pinv-2',
    billNo: 'PINV-1404-0089',
    docstatus: 1,
    supplierName: 'پخش کویل و کارتریج پارس',
    date: '۱۴۰۴/۰۸/۰۱',
    warehouse: 'انبار شعبه الهیه',
    branchDimension: 'شعبه الهیه',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
    status: 'بدهکار باز',
    totalAmount: 85000000,
    paidAmount: 25000000,
    landedCostAdded: 2400000,
    itemsSummary: '۲۰۰ بسته کارتریج ۰.۶ و ۰.۸ اهم اورجینال',
  },
  {
    id: 'pinv-3',
    billNo: 'PINV-1404-0090',
    docstatus: 0,
    supplierName: 'پخش لوازم جانبی آریا',
    date: '۱۴۰۴/۰۸/۰۲',
    warehouse: 'انبار مرکزی کهریزک',
    branchDimension: 'انبار مرکزی کهریزک',
    costCenter: 'انبار مرکزی و لجستیک کهریزک',
    status: 'پیش‌نویس',
    totalAmount: 29440000,
    paidAmount: 0,
    landedCostAdded: 1440000,
    itemsSummary: '۶۰ بطری سالت نیکوتین نستی ۳۰ میل',
  },
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntryRecord[] = [
  {
    id: 'je-1',
    voucherNo: 'ACC-JV-1404-0014',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    docstatus: 1,
    title: 'تسویه پورسانت معرف‌ها و انتقال بین بانکی',
    branchDimension: 'شعبه مرکزی تهران',
    totalDebit: 68000000,
    totalCredit: 68000000,
    lines: [
      {
        id: 'jel-1',
        accountCode: '5201',
        accountName: 'هزینه پورسانت فروش و بازاریابی',
        partyType: 'مشتری',
        partyName: 'معرف‌ها و نمایندگان فروش',
        costCenter: 'فروشگاه و شوروم شعبه الهیه',
        dimensionBranch: 'شعبه مرکزی تهران',
        debit: 68000000,
        credit: 0,
        note: 'ثبت پورسانت تحقق تارگت فروش مهرماه',
      },
      {
        id: 'jel-2',
        accountCode: '2103',
        accountName: 'ذخیره پورسانت فروشندگان',
        partyType: '—',
        partyName: 'حساب ذخیره پورسانت',
        costCenter: 'فروشگاه و شوروم شعبه الهیه',
        dimensionBranch: 'شعبه مرکزی تهران',
        debit: 0,
        credit: 8000000,
        note: 'ذخیره پورسانت قابل تهاتر با فاکتور بعدی',
      },
      {
        id: 'jel-3',
        accountCode: '110101',
        accountName: 'بانک ملت — جاری شعبه مرکزی',
        partyType: '—',
        partyName: 'واریز گروهی پایا',
        costCenter: 'فروشگاه و شوروم شعبه الهیه',
        dimensionBranch: 'شعبه مرکزی تهران',
        debit: 0,
        credit: 60000000,
        note: 'پرداخت نقدی پورسانت از طریق حواله پایا',
      },
    ],
  },
];

export const INITIAL_PAYMENT_ENTRIES: PaymentEntryRecord[] = [
  {
    id: 'pay-1',
    paymentNo: 'ACC-PAY-1404-0041',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    docstatus: 1,
    paymentType: 'دریافت از مشتری (Receive)',
    partyName: 'پخش سراسری نیکوتین‌پارس',
    modeOfPayment: 'حواله بانکی پایا/ساتنا',
    bankAccountCode: '110101',
    referenceVoucherNo: 'SINV-1404-0108',
    amount: 43500000,
    branchDimension: 'شعبه مرکزی تهران',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
  },
  {
    id: 'pay-2',
    paymentNo: 'ACC-PAY-1404-0042',
    postingDate: '۱۴۰۴/۰۸/۰۱',
    docstatus: 1,
    paymentType: 'پرداخت به تامین‌کننده (Pay)',
    partyName: 'پخش کویل و کارتریج پارس',
    modeOfPayment: 'حواله بانکی پایا/ساتنا',
    bankAccountCode: '110101',
    referenceVoucherNo: 'PINV-1404-0089',
    amount: 25000000,
    branchDimension: 'شعبه الهیه',
    costCenter: 'فروشگاه و شوروم شعبه الهیه',
  },
];

export const INITIAL_CHEQUES: ChequeRecord[] = [
  {
    id: 'chq-1',
    sayadiNo: '4029183746501928',
    type: 'دریافتنی از مشتری',
    partyName: 'پخش سراسری نیکوتین‌پارس',
    bankName: 'بانک سامان',
    amount: 50750000,
    dueDate: '۱۴۰۴/۰۹/۰۱',
    status: 'در جریان وصول',
  },
  {
    id: 'chq-2',
    sayadiNo: '9182736455019283',
    type: 'دریافتنی از مشتری',
    partyName: 'فروشگاه مدرن ویپ شیراز',
    bankName: 'بانک ملت',
    amount: 34000000,
    dueDate: '۱۴۰۴/۰۷/۳۰',
    clearanceDate: '۱۴۰۴/۰۸/۰۱',
    status: 'وصول‌شده (پاس‌شده)',
  },
  {
    id: 'chq-3',
    sayadiNo: '7748291038475610',
    type: 'پرداختنی به تامین‌کننده',
    partyName: 'پخش کویل و کارتریج پارس',
    bankName: 'بانک ملت — جاری مرکزی',
    amount: 45000000,
    dueDate: '۱۴۰۴/۰۸/۱۵',
    status: 'در جریان وصول',
  },
];

export const INITIAL_COST_CENTERS: CostCenterRecord[] = [
  {
    id: 'cc-1',
    code: 'CC-TEH-01',
    name: 'فروشگاه و شوروم شعبه الهیه',
    parentName: 'واحدهای عملیاتی خرده‌فروشی',
    allocatedBudget: 80000000,
    spentAmount: 64000000,
    revenueGenerated: 620000000,
    controlPolicy: 'WARN',
    autoAllocationPercent: 45,
  },
  {
    id: 'cc-2',
    code: 'CC-ECOM-02',
    name: 'فروشگاه اینترنتی و دیجیتال مارکتینگ',
    parentName: 'واحدهای فروش آنلاین',
    allocatedBudget: 60000000,
    spentAmount: 56000000,
    revenueGenerated: 890000000,
    controlPolicy: 'STOP',
    autoAllocationPercent: 35,
  },
  {
    id: 'cc-3',
    code: 'CC-WMS-03',
    name: 'انبار مرکزی و لجستیک کهریزک',
    parentName: 'زنجیره تامین و انبارها',
    allocatedBudget: 50000000,
    spentAmount: 31000000,
    revenueGenerated: 640000000,
    controlPolicy: 'WARN',
    autoAllocationPercent: 20,
  },
];

export const INITIAL_FIXED_ASSETS: FixedAssetRecord[] = [
  {
    id: 'ast-1',
    assetTag: 'AST-1403-001',
    name: 'وانت باربری یخچال‌دار پخش شهری',
    category: 'وسایل نقلیه',
    location: 'انبار مرکزی کهریزک',
    purchaseDate: '۱۴۰۳/۰۲/۰۱',
    purchaseValue: 780000000,
    currentBookValue: 690000000,
    status: 'فعال در بهره‌برداری',
  },
  {
    id: 'ast-2',
    assetTag: 'AST-1403-014',
    name: 'دکوراسیون، استندها و صندوق لمسی الهیه',
    category: 'دکوراسیون و فروشگاهی',
    location: 'شعبه الهیه',
    purchaseDate: '۱۴۰۳/۰۸/۰۱',
    purchaseValue: 320000000,
    currentBookValue: 280000000,
    status: 'فعال در بهره‌برداری',
  },
  {
    id: 'ast-3',
    assetTag: 'AST-1404-004',
    name: 'سرور ابری و تجهیزات پردازشی واحد مالی',
    category: 'تجهیزات فناوری',
    location: 'دفتر مرکزی تهران',
    purchaseDate: '۱۴۰۴/۰۲/۰۱',
    purchaseValue: 240000000,
    currentBookValue: 220000000,
    status: 'فعال در بهره‌برداری',
  },
];

export const INITIAL_SHAREHOLDERS: ShareholderRecord[] = [
  {
    id: 'sh-1',
    name: 'مهندس رضا نوادگان (رئیس هیئت مدیره)',
    folioNo: 'SH-1001',
    sharesCount: 55000,
    ownershipPercent: 55,
    capitalBalance: 1375000000,
    dividendPaid: 275000000,
  },
  {
    id: 'sh-2',
    name: 'شرکت سرمایه‌گذاری پیشگامان تجارت پارس',
    folioNo: 'SH-1002',
    sharesCount: 30000,
    ownershipPercent: 30,
    capitalBalance: 750000000,
    dividendPaid: 150000000,
  },
  {
    id: 'sh-3',
    name: 'سارا کاظمی (شریک تجاری و مدیر فروش)',
    folioNo: 'SH-1003',
    sharesCount: 15000,
    ownershipPercent: 15,
    capitalBalance: 375000000,
    dividendPaid: 75000000,
  },
];

export const INITIAL_INVENTORY_ITEMS: InventoryItemRecord[] = [
  {
    id: 'itm-1',
    sku: 'PK60-MANGO-50',
    name: 'پاد هوشمند پیک‌بار ۶۰۰۰۰ — انبه یخ',
    category: 'دستگاه پاد و ماد',
    brand: 'پیک‌بار',
    flavor: 'انبه یخ',
    nicotine: '۵۰ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'عدد',
    stockQty: 142,
    reservedQty: 20,
    reorderLevel: 30,
    valuationRate: 780000,
    retailPrice: 1180000,
    wholesalePrice: 960000,
    partnerPrice: 1020000,
    serialNumbers: ['SN-PK60-99101', 'SN-PK60-99102', 'SN-PK60-99103', 'SN-PK60-99104'],
    batchNo: 'BCH-2026-08A',
    expiryDate: '۱۴۰۶/۰۶/۳۰',
    daysInStock: 18,
  },
  {
    id: 'itm-2',
    sku: 'PK60-BLUE-20',
    name: 'پاد هوشمند پیک‌بار ۶۰۰۰۰ — بلوبری تمشک',
    category: 'دستگاه پاد و ماد',
    brand: 'پیک‌بار',
    flavor: 'بلوبری تمشک',
    nicotine: '۲۰ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'عدد',
    stockQty: 18,
    reservedQty: 5,
    reorderLevel: 25,
    valuationRate: 775000,
    retailPrice: 1150000,
    wholesalePrice: 940000,
    partnerPrice: 990000,
    serialNumbers: ['SN-PK60-88201', 'SN-PK60-88202'],
    batchNo: 'BCH-2026-07C',
    expiryDate: '۱۴۰۶/۰۴/۱۵',
    daysInStock: 42,
  },
  {
    id: 'itm-3',
    sku: 'SALT-NASTY-30',
    name: 'سالت نستی ۳۰ میل — تنباکو کارامل',
    category: 'جویس و سالت',
    brand: 'نستی جویس',
    flavor: 'تنباکو کارامل',
    nicotine: '۳۵ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'بطری',
    stockQty: 64,
    reservedQty: 8,
    reorderLevel: 20,
    valuationRate: 460000,
    retailPrice: 740000,
    wholesalePrice: 590000,
    partnerPrice: 630000,
    serialNumbers: ['SN-NST-4401', 'SN-NST-4402'],
    batchNo: 'BCH-NST-1404',
    expiryDate: '۱۴۰۵/۰۱/۲۰',
    daysInStock: 95,
  },
  {
    id: 'itm-4',
    sku: 'COIL-XROS-06',
    name: 'بسته کارتریج اکس‌راس ۰.۶ اهم',
    category: 'کویل و کارتریج',
    brand: 'واپورسو',
    flavor: 'بدون طعم',
    nicotine: '۰ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'بسته',
    stockQty: 95,
    reservedQty: 12,
    reorderLevel: 30,
    valuationRate: 520000,
    retailPrice: 820000,
    wholesalePrice: 660000,
    partnerPrice: 710000,
    serialNumbers: ['SN-VP-7001'],
    batchNo: 'BCH-VP-2026',
    expiryDate: '۱۴۰۸/۱۲/۲۹',
    daysInStock: 12,
  },
  {
    id: 'itm-5',
    sku: 'BND-STARTER-PRO',
    name: 'پکیج استارتر کامل (پاد + سالت + کویل)',
    category: 'پکیج باندل',
    brand: 'پکیج امکان',
    flavor: 'انتخابی مشتری',
    nicotine: '۳۵ میلی‌گرم',
    condition: 'آکبند شرکتی',
    isBundle: true,
    bundleComponents: ['پاد پیک‌بار ۶۰۰۰۰ (۱×)', 'سالت نستی ۳۰ میل (۱×)', 'بسته کارتریج اکس‌راس (۱×)'],
    bundleComponentItems: [
      { sku: 'PK60-MANGO-50', name: 'پاد پیک‌بار ۶۰۰۰۰', qty: 1 },
      { sku: 'SALT-NASTY-30', name: 'سالت نستی ۳۰ میل', qty: 1 },
      { sku: 'COIL-XROS-06', name: 'بسته کارتریج اکس‌راس', qty: 1 },
    ],
    uomPrimary: 'پکیج کامل',
    stockQty: 32,
    reservedQty: 3,
    reorderLevel: 10,
    valuationRate: 1760000,
    retailPrice: 2490000,
    wholesalePrice: 2150000,
    partnerPrice: 2250000,
    serialNumbers: ['SN-BND-101', 'SN-BND-102'],
    batchNo: 'BCH-BND-01',
    expiryDate: '۱۴۰۶/۰۱/۰۱',
    daysInStock: 27,
  },
];

export const INITIAL_CRM_LEADS: CrmLeadRecord[] = [
  {
    id: 'crm-1',
    fullName: 'کیانوش رستمی (پخش اصفهان)',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    source: 'اینستاگرام',
    campaignName: 'کمپین پاییزه پیک‌بار',
    interestStyle: 'همکار عمده‌فروش',
    stage: 'مذاکره و فرصت (Opportunity)',
    probability: 80,
    estimatedValue: 95000000,
    loyaltyTier: 'طلایی',
    loyaltyPoints: 1450,
    clvAmount: 420000000,
    lastPurchaseDaysAgo: 6,
  },
  {
    id: 'crm-2',
    fullName: 'مهسا شجاعی',
    phone: '۰۹۳۵۱۱۱۲۲۳۳',
    source: 'تلگرام',
    campaignName: 'تخفیف باشگاه مشتریان',
    interestStyle: 'سبک MTL (سیگاری)',
    stage: 'مشتری وفادار',
    probability: 95,
    estimatedValue: 4200000,
    loyaltyTier: 'نقره‌ای',
    loyaltyPoints: 620,
    clvAmount: 28500000,
    lastPurchaseDaysAgo: 14,
  },
  {
    id: 'crm-3',
    fullName: 'نیما فرهادی',
    phone: '۰۹۱۹۸۸۸۷۷۶۶',
    source: 'کمپین اینفلوئنسر',
    campaignName: 'معرفی پکیج استارتر',
    interestStyle: 'سبک DTL (قلیانی)',
    stage: 'سرنخ جدید (Lead)',
    probability: 45,
    estimatedValue: 3500000,
    loyaltyTier: 'برنزی',
    loyaltyPoints: 110,
    clvAmount: 3100000,
    lastPurchaseDaysAgo: 48,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'aud-1',
    timestamp: '۱۴۰۴/۰۸/۰۲ — ۱۴:۱۰',
    user: 'مهندس رضا نوادگان',
    role: 'مدیر کل سامانه',
    docType: 'لیست قیمت همکار',
    docId: 'PK60-MANGO-50',
    fieldChanged: 'قیمت عمده',
    oldValue: '۹۸۰,۰۰۰ تومان',
    newValue: '۹۶۰,۰۰۰ تومان',
  },
  {
    id: 'aud-2',
    timestamp: '۱۴۰۴/۰۸/۰۲ — ۱۲:۳۵',
    user: 'سارا کاظمی',
    role: 'مدیر مالی و حسابداری',
    docType: 'سقف بودجه مرکز هزینه',
    docId: 'CC-ECOM-02',
    fieldChanged: 'سیاست کنترل بودجه',
    oldValue: 'هشدار سیستمی',
    newValue: 'توقف کامل ثبت فاکتور',
  },
  {
    id: 'aud-3',
    timestamp: '۱۴۰۴/۰۸/۰۱ — ۱۸:۲۰',
    user: 'بهرام صادقی',
    role: 'سرپرست انبار و کالا',
    docType: 'رسید سرشکن هزینه‌های خرید',
    docId: 'PINV-1404-0084',
    fieldChanged: 'هزینه گمرک و باربری',
    oldValue: '۰ تومان',
    newValue: '۳۸,۵۰۰,۰۰۰ تومان',
  },
];
