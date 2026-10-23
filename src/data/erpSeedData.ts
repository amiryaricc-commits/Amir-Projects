export interface AccountNode {
  id: string;
  code: string;
  name: string;
  category: 'دارایی' | 'بدهی' | 'سرمایه' | 'درآمد' | 'هزینه';
  level: 'گروه' | 'کل' | 'معین' | 'تفصیلی';
  parentCode?: string;
  balance: number;
  currency: 'IRR' | 'USD' | 'AED';
}

export interface SalesInvoiceRecord {
  id: string;
  invoiceNo: string;
  customerName: string;
  date: string;
  dueDate: string;
  branchDimension: string;
  channelDimension: string;
  paymentTermsTemplate: string;
  updateStock: boolean;
  isSubscription: boolean;
  subscriptionInterval?: string;
  status: 'پرداخت‌شده' | 'اقساطی فعال' | 'معوق' | 'مرجوعی (یادداشت بستانکاری)';
  totalAmount: number;
  paidAmount: number;
  taxAmount: number;
  itemsSummary: string;
}

export interface PurchaseInvoiceRecord {
  id: string;
  billNo: string;
  supplierName: string;
  date: string;
  warehouse: string;
  status: 'تسویه‌شده' | 'بدهکار باز' | 'برگشت از خرید (یادداشت بدهکاری)';
  totalAmount: number;
  landedCostAdded: number;
  itemsSummary: string;
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
  salvageValue: number;
  usefulLifeMonths: number;
  elapsedMonths: number;
  method: 'straight-line' | 'declining';
  status: 'فعال در بهره‌برداری' | 'فروخته‌شده' | 'اسقاط‌شده';
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
  uomPrimary: string;
  uomSecondary: string;
  conversionFactor: number; // e.g. 1 کارتن = 100 عدد
  stockQty: number;
  reservedQty: number;
  reorderLevel: number;
  valuationRate: number; // Moving Average Cost
  retailPrice: number;
  wholesalePrice: number;
  partnerPrice: number;
  serialNumbers: string[];
  batchNo: string;
  expiryDate: string;
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

export interface WarrantyTicketRecord {
  id: string;
  ticketNo: string;
  serialNo: string;
  customerName: string;
  itemName: string;
  issueDescription: string;
  warrantyExpiry: string;
  status: 'پذیرش در تعمیرگاه' | 'تایید گارانتی تعویض' | 'آماده تحویل به مشتری';
  repairCost: number;
}

export interface CustomFieldDefinition {
  id: string;
  targetDocType: 'فاکتور فروش (Sales Invoice)' | 'کالا و خدمات (Item)' | 'مشتری (Customer)' | 'سند روزنامه (Journal Entry)';
  fieldLabel: string;
  fieldName: string;
  fieldType: 'متن (Data)' | 'عدد (Int/Currency)' | 'لیست کشویی (Select)' | 'تاریخ (Date)' | 'بارکد (Barcode)' | 'امضای دیجیتال (Signature)';
  isRequired: boolean;
  hiddenForRoles: string[];
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
  { id: 'acc-1', code: '1000', name: 'دارایی‌ها', category: 'دارایی', level: 'گروه', balance: 4850000000, currency: 'IRR' },
  { id: 'acc-2', code: '1100', name: 'دارایی‌های جاری و نقدینگی', category: 'دارایی', level: 'کل', parentCode: '1000', balance: 2940000000, currency: 'IRR' },
  { id: 'acc-3', code: '1101', name: 'موجودی نقد و بانک‌های ریالی', category: 'دارایی', level: 'معین', parentCode: '1100', balance: 1420000000, currency: 'IRR' },
  { id: 'acc-4', code: '110101', name: 'بانک ملت - شعبه مرکزی (حساب جاری پایا/ساتنا)', category: 'دارایی', level: 'تفصیلی', parentCode: '1101', balance: 980000000, currency: 'IRR' },
  { id: 'acc-5', code: '110102', name: 'صندوق فروشگاهی و کارتخوان شعبه الهیه', category: 'دارایی', level: 'تفصیلی', parentCode: '1101', balance: 440000000, currency: 'IRR' },
  { id: 'acc-6', code: '1102', name: 'حساب‌های دریافتنی تجاری (مشتریان)', category: 'دارایی', level: 'معین', parentCode: '1100', balance: 680000000, currency: 'IRR' },
  { id: 'acc-7', code: '1103', name: 'اسناد دریافتنی در جریان وصول (چک‌های صیادی)', category: 'دارایی', level: 'معین', parentCode: '1100', balance: 320000000, currency: 'IRR' },
  { id: 'acc-8', code: '1104', name: 'موجودی مواد و کالای انبار مرکزی', category: 'دارایی', level: 'معین', parentCode: '1100', balance: 840000000, currency: 'IRR' },
  { id: 'acc-9', code: '1200', name: 'دارایی‌های ثابت مشهود و اموال', category: 'دارایی', level: 'کل', parentCode: '1000', balance: 1910000000, currency: 'IRR' },
  { id: 'acc-10', code: '2000', name: 'بدهی‌ها و تعهدات', category: 'بدهی', level: 'گروه', balance: 960000000, currency: 'IRR' },
  { id: 'acc-11', code: '2101', name: 'حساب‌های پرداختنی تجاری (تامین‌کنندگان)', category: 'بدهی', level: 'معین', parentCode: '2000', balance: 610000000, currency: 'IRR' },
  { id: 'acc-12', code: '2102', name: 'مالیات بر ارزش افزوده و کسورات تکلیفی پرداختنی', category: 'بدهی', level: 'معین', parentCode: '2000', balance: 145000000, currency: 'IRR' },
  { id: 'acc-13', code: '2103', name: 'ذخیره پورسانت فروشندگان و معرف‌ها', category: 'بدهی', level: 'معین', parentCode: '2000', balance: 205000000, currency: 'IRR' },
  { id: 'acc-14', code: '3000', name: 'حقوق صاحبان سهام و سرمایه', category: 'سرمایه', level: 'گروه', balance: 3000000000, currency: 'IRR' },
  { id: 'acc-15', code: '3101', name: 'سرمایه ثبت‌شده سهامداران و شرکا', category: 'سرمایه', level: 'معین', parentCode: '3000', balance: 2500000000, currency: 'IRR' },
  { id: 'acc-16', code: '3102', name: 'سود و زیان انباشته سنواتی', category: 'سرمایه', level: 'معین', parentCode: '3000', balance: 500000000, currency: 'IRR' },
  { id: 'acc-17', code: '4000', name: 'درآمدهای عملیاتی و فروش', category: 'درآمد', level: 'گروه', balance: 2150000000, currency: 'IRR' },
  { id: 'acc-18', code: '4101', name: 'درآمد فروش خالص کالا (حضوری و آنلاین)', category: 'درآمد', level: 'معین', parentCode: '4000', balance: 1980000000, currency: 'IRR' },
  { id: 'acc-19', code: '4102', name: 'درآمد خدمات تعمیرات و اشتراک‌های دوره‌ای', category: 'درآمد', level: 'معین', parentCode: '4000', balance: 170000000, currency: 'IRR' },
  { id: 'acc-20', code: '5000', name: 'بهای تمام‌شده و هزینه‌های عملیاتی', category: 'هزینه', level: 'گروه', balance: 1260000000, currency: 'IRR' },
  { id: 'acc-21', code: '5101', name: 'بهای تمام‌شده کالای فروش‌رفته (میانگین موزون)', category: 'هزینه', level: 'معین', parentCode: '5000', balance: 910000000, currency: 'IRR' },
  { id: 'acc-22', code: '5201', name: 'هزینه حقوق، دستمزد و پورسانت تیم فروش', category: 'هزینه', level: 'معین', parentCode: '5000', balance: 220000000, currency: 'IRR' },
  { id: 'acc-23', code: '5202', name: 'هزینه استهلاک دارایی‌های ثابت و اجاره شعب', category: 'هزینه', level: 'معین', parentCode: '5000', balance: 130000000, currency: 'IRR' },
];

export const INITIAL_SALES_INVOICES: SalesInvoiceRecord[] = [
  {
    id: 'sinv-1',
    invoiceNo: 'SINV-1404-0108',
    customerName: 'پخش سراسری نیکوتین‌پارس (عمده)',
    date: '۱۴۰۴/۰۸/۰۱',
    dueDate: '۱۴۰۴/۱۰/۰۱',
    branchDimension: 'شعبه مرکزی تهران',
    channelDimension: 'فروش سازمانی B2B',
    paymentTermsTemplate: '۳۰٪ نقد، ۳۵٪ یک ماهه، ۳۵٪ دو ماهه',
    updateStock: true,
    isSubscription: false,
    status: 'اقساطی فعال',
    totalAmount: 145000000,
    paidAmount: 43500000,
    taxAmount: 13181818,
    itemsSummary: '۱۰۰ عدد پاد Peak Bar 60000 + ۵۰ بسته کویل',
  },
  {
    id: 'sinv-2',
    invoiceNo: 'SINV-1404-0109',
    customerName: 'امیرحسین رضایی (باشگاه طلایی)',
    date: '۱۴۰۴/۰۸/۰۲',
    dueDate: '۱۴۰۴/۰۸/۰۲',
    branchDimension: 'شعبه الهیه',
    channelDimension: 'صندوق فروشگاهی POS',
    paymentTermsTemplate: 'تسویه نقد و کارتخوان در لحظه',
    updateStock: true,
    isSubscription: false,
    status: 'پرداخت‌شده',
    totalAmount: 4850000,
    paidAmount: 4850000,
    taxAmount: 440909,
    itemsSummary: 'پک استارتر دستگاه + جویس انبه + کویل یدک',
  },
  {
    id: 'sinv-3',
    invoiceNo: 'SINV-1404-0110',
    customerName: 'کافه ویپ نیاوران (اشتراک ماهانه)',
    date: '۱۴۰۴/۰۷/۲۸',
    dueDate: '۱۴۰۴/۰۸/۲۸',
    branchDimension: 'شعبه الهیه',
    channelDimension: 'اشتراک خودکار (Auto-Repeat)',
    paymentTermsTemplate: 'اشتراک ماهانه تامین استند تستر',
    updateStock: true,
    isSubscription: true,
    subscriptionInterval: 'ماهانه (اول هر ماه)',
    status: 'پرداخت‌شده',
    totalAmount: 28000000,
    paidAmount: 28000000,
    taxAmount: 2545454,
    itemsSummary: 'شارژ ماهانه ۳۰ عدد سالت و جویس تستر витриن',
  },
  {
    id: 'sinv-4',
    invoiceNo: 'CN-1404-0012',
    customerName: 'فروشگاه دود سفید کرج',
    date: '۱۴۰۴/۰۷/۲۵',
    dueDate: '۱۴۰۴/۰۷/۲۵',
    branchDimension: 'شعبه مرکزی تهران',
    channelDimension: 'اینستاگرام و تلگرام',
    paymentTermsTemplate: 'یادداشت بستانکاری (Credit Note)',
    updateStock: true,
    isSubscription: false,
    status: 'مرجوعی (یادداشت بستانکاری)',
    totalAmount: 6400000,
    paidAmount: 6400000,
    taxAmount: 581818,
    itemsSummary: 'برگشت ۴ عدد دستگاه به علت مغایرت رنگ سفارش',
  },
];

export const INITIAL_PURCHASE_INVOICES: PurchaseInvoiceRecord[] = [
  {
    id: 'pinv-1',
    billNo: 'PINV-1404-0084',
    supplierName: 'بازرگانی شنژن ویپ تریدینگ (واردات مستقیم)',
    date: '۱۴۰۴/۰۷/۲۰',
    warehouse: 'انبار مرکزی کهریزک',
    status: 'تسویه‌شده',
    totalAmount: 420000000,
    landedCostAdded: 38500000,
    itemsSummary: '۵ کارتن (۵۰۰ عدد) پاد Peak Bar 60000 + ۳۰۰ عدد جویس ۶۰ میل',
  },
  {
    id: 'pinv-2',
    billNo: 'PINV-1404-0089',
    supplierName: 'توزیع‌کننده رسمی کویل و کارتریج پارس',
    date: '۱۴۰۴/۰۸/۰۱',
    warehouse: 'انبار شعبه الهیه',
    status: 'بدهکار باز',
    totalAmount: 85000000,
    landedCostAdded: 2400000,
    itemsSummary: '۲۰۰ بسته کارتریج 0.6 اهم و 0.8 اهم اورجینال',
  },
  {
    id: 'pinv-3',
    billNo: 'DN-1404-0005',
    supplierName: 'پخش لوازم جانبی آریا',
    date: '۱۴۰۴/۰۷/۲۹',
    warehouse: 'انبار مرکزی کهریزک',
    status: 'برگشت از خرید (یادداشت بدهکاری)',
    totalAmount: 11200000,
    landedCostAdded: 0,
    itemsSummary: 'یادداشت بدهکاری بابت مرجوعی ۱۴ عدد باتری معیوب در قرنطینه ورود',
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
    partyName: 'توزیع‌کننده رسمی کویل و کارتریج پارس',
    bankName: 'بانک ملت - جاری مرکزی',
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
    name: 'وانت باربری یخچال‌دار و عایق پخش شهری',
    category: 'وسایل نقلیه',
    location: 'انبار مرکزی کهریزک',
    purchaseDate: '۱۴۰۳/۰۲/۰۱',
    purchaseValue: 780000000,
    salvageValue: 180000000,
    usefulLifeMonths: 60,
    elapsedMonths: 18,
    method: 'straight-line',
    status: 'فعال در بهره‌برداری',
  },
  {
    id: 'ast-2',
    assetTag: 'AST-1403-014',
    name: 'دکوراسیون نوری، استندهای امنیتی و صندوق لمسی POS الهیه',
    category: 'دکوراسیون و فروشگاهی',
    location: 'شعبه الهیه',
    purchaseDate: '۱۴۰۳/۰۸/۰۱',
    purchaseValue: 320000000,
    salvageValue: 20000000,
    usefulLifeMonths: 36,
    elapsedMonths: 12,
    method: 'straight-line',
    status: 'فعال در بهره‌برداری',
  },
  {
    id: 'ast-3',
    assetTag: 'AST-1404-004',
    name: 'سرور پردازش ابری و ۳ دستگاه لپ‌تاپ مک‌بوک پرو تیم مالی',
    category: 'تجهیزات فناوری',
    location: 'دفتر مرکزی تهران',
    purchaseDate: '۱۴۰۴/۰۲/۰۱',
    purchaseValue: 240000000,
    salvageValue: 30000000,
    usefulLifeMonths: 36,
    elapsedMonths: 6,
    method: 'declining',
    status: 'فعال در بهره‌برداری',
  },
];

export const INITIAL_SHAREHOLDERS: ShareholderRecord[] = [
  {
    id: 'sh-1',
    name: 'مهندس رضا نوادگان (رییس هیئت مدیره)',
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
    name: 'پاد یکبارمصرف هوشمند Peak Bar 60000 — طعم انبه یخ',
    category: 'دستگاه پاد و ماد',
    brand: 'Peak Bar',
    flavor: 'انبه یخ (Mango Ice)',
    nicotine: '۵۰ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'عدد',
    uomSecondary: 'کارتن ۱۰۰ عددی',
    conversionFactor: 100,
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
  },
  {
    id: 'itm-2',
    sku: 'PK60-BLUE-20',
    name: 'پاد یکبارمصرف هوشمند Peak Bar 60000 — طعم بلوبری تمشک',
    category: 'دستگاه پاد و ماد',
    brand: 'Peak Bar',
    flavor: 'بلوبری تمشک',
    nicotine: '۲۰ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'عدد',
    uomSecondary: 'بسته ۱۰ عددی',
    conversionFactor: 10,
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
  },
  {
    id: 'itm-3',
    sku: 'SALT-NASTY-30',
    name: 'سالت نیکوتین اورجینال ۳۰ میل Nasty — تنباکو کارامل (MTL)',
    category: 'جویس و سالت',
    brand: 'Nasty Juice',
    flavor: 'تنباکو کارامل وانیل',
    nicotine: '۳۵ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'بطری',
    uomSecondary: 'باکس ۱۲ عددی',
    conversionFactor: 12,
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
  },
  {
    id: 'itm-4',
    sku: 'COIL-XROS-06',
    name: 'بسته ۴ عددی کارتریج و کویل XROS Mesh 0.6Ω',
    category: 'کویل و کارتریج',
    brand: 'Vaporesso',
    flavor: 'بدون طعم',
    nicotine: '۰ میلی‌گرم',
    condition: 'آکبند شرکتی',
    uomPrimary: 'بسته',
    uomSecondary: 'کارتن ۵۰ بسته‌ای',
    conversionFactor: 50,
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
  },
  {
    id: 'itm-5',
    sku: 'BND-STARTER-PRO',
    name: 'پکیج طلایی استارتر (دستگاه پاد + سالت ۳۰ میل + بسته کویل)',
    category: 'پکیج باندل',
    brand: 'FaraPay Bundle',
    flavor: 'انتخابی مشتری',
    nicotine: '۳۵ میلی‌گرم',
    condition: 'آکبند شرکتی',
    isBundle: true,
    bundleComponents: ['پاد Peak Bar 60000', 'سالت Nasty ۳۰ میل', 'بسته کارتریج XROS'],
    uomPrimary: 'پکیج کامل',
    uomSecondary: 'پکیج کامل',
    conversionFactor: 1,
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
  },
];

export const INITIAL_CRM_LEADS: CrmLeadRecord[] = [
  {
    id: 'crm-1',
    fullName: 'کیانوش رستمی (پخش ویپ اصفهان)',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    source: 'اینستاگرام',
    campaignName: 'کمپین پاییزه Peak Bar 60000',
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
    campaignName: 'تخفیف باشگاه مشتریان MTL',
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
    campaignName: 'معرفی پکیج استارتر یوتیوب',
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

export const INITIAL_WARRANTY_TICKETS: WarrantyTicketRecord[] = [
  {
    id: 'war-1',
    ticketNo: 'SUP-1404-041',
    serialNo: 'SN-PK60-99101',
    customerName: 'امیرحسین رضایی',
    itemName: 'پاد هوشمند Peak Bar 60000 — انبه یخ',
    issueDescription: 'عدم شارژ تایپ C پس از نوسان برق؛ بررسی برد نمایشگر دیجیتال',
    warrantyExpiry: '۱۴۰۵/۰۲/۰۱',
    status: 'تایید گارانتی تعویض',
    repairCost: 0,
  },
  {
    id: 'war-2',
    ticketNo: 'SUP-1404-042',
    serialNo: 'SN-VP-7001',
    customerName: 'کافه ویپ نیاوران',
    itemName: 'دستگاه ماد Vaporesso Armour Max',
    issueDescription: 'سرویس دوره‌ای، تعویض اورینگ و تست سنسور اتوماتیک',
    warrantyExpiry: '۱۴۰۴/۱۲/۲۹',
    status: 'آماده تحویل به مشتری',
    repairCost: 450000,
  },
];

export const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'cf-1',
    targetDocType: 'فاکتور فروش (Sales Invoice)',
    fieldLabel: 'کد رهگیری مرسوله تیپاکس / اسنپ‌باکس',
    fieldName: 'custom_tracking_code',
    fieldType: 'بارکد (Barcode)',
    isRequired: false,
    hiddenForRoles: [],
  },
  {
    id: 'cf-2',
    targetDocType: 'کالا و خدمات (Item)',
    fieldLabel: 'حاشیه سود محرمانه واردات (٪)',
    fieldName: 'custom_secret_margin',
    fieldType: 'عدد (Int/Currency)',
    isRequired: true,
    hiddenForRoles: ['صندوقدار POS', 'انباردار'],
  },
  {
    id: 'cf-3',
    targetDocType: 'فاکتور فروش (Sales Invoice)',
    fieldLabel: 'امضای دیجیتال تحویل‌گیرنده بار',
    fieldName: 'custom_receiver_signature',
    fieldType: 'امضای دیجیتال (Signature)',
    isRequired: false,
    hiddenForRoles: [],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'aud-1',
    timestamp: '۱۴۰۴/۰۸/۰۲ — ۱۴:۱۰',
    user: 'مهندس رضا نوادگان',
    role: 'مدیر ارشد سیستم (System Manager)',
    docType: 'لیست قیمت همکار (Price List)',
    docId: 'PK60-MANGO-50',
    fieldChanged: 'قیمت عمده (wholesalePrice)',
    oldValue: '۹۸۰,۰۰۰ تومان',
    newValue: '۹۶۰,۰۰۰ تومان',
  },
  {
    id: 'aud-2',
    timestamp: '۱۴۰۴/۰۸/۰۲ — ۱۲:۳۵',
    user: 'سارا کاظمی',
    role: 'مدیر مالی (Accounts Manager)',
    docType: 'سقف بودجه مرکز هزینه (Budget)',
    docId: 'CC-ECOM-02',
    fieldChanged: 'سیاست عبور از سقف (controlPolicy)',
    oldValue: 'هشدار (WARN)',
    newValue: 'توقف کامل ثبت فاکتور (STOP)',
  },
  {
    id: 'aud-3',
    timestamp: '۱۴۰۴/۰۸/۰۱ — ۱۸:۲۰',
    user: 'بهرام صادقی',
    role: 'سرپرست انبار (Stock Manager)',
    docType: 'رسید سرشکن هزینه خرید (Landed Cost)',
    docId: 'PINV-1404-0084',
    fieldChanged: 'هزینه گمرک و باربری (landedCostAdded)',
    oldValue: '۰ تومان',
    newValue: '۳۸,۵۰۰,۰۰۰ تومان',
  },
];
