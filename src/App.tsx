import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Calculator,
  ShoppingBag,
  Users,
  Package,
  Globe,
  Sliders,
  ShieldAlert,
  ArrowUpLeft,
  CheckCircle2,
} from 'lucide-react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_CHEQUES,
  INITIAL_COST_CENTERS,
  INITIAL_FIXED_ASSETS,
  INITIAL_SHAREHOLDERS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_CRM_LEADS,
  INITIAL_WARRANTY_TICKETS,
  INITIAL_CUSTOM_FIELDS,
  INITIAL_AUDIT_LOGS,
  AccountNode,
  SalesInvoiceRecord,
  PurchaseInvoiceRecord,
  ChequeRecord,
  CostCenterRecord,
  FixedAssetRecord,
  InventoryItemRecord,
  CrmLeadRecord,
  WarrantyTicketRecord,
  CustomFieldDefinition,
  AuditLogRecord,
} from './data/erpSeedData';
import {
  formatCurrency,
  calculateMovingAverageValuation,
  SystemRole,
  checkRolePermission,
  postDoubleEntryToAccounts,
} from './utils/erpEngine';
import { AccountingModule } from './components/AccountingModule';
import { SellingPosModule } from './components/SellingPosModule';
import { CrmMarketingModule } from './components/CrmMarketingModule';
import { InventoryWmsModule } from './components/InventoryWmsModule';
import { SupportWebshopModule } from './components/SupportWebshopModule';
import { FrappeCoreModule } from './components/FrappeCoreModule';
import { AdminAndEnterpriseModule } from './components/AdminAndEnterpriseModule';

type ActiveModuleId =
  | 'dashboard'
  | 'accounting'
  | 'selling_pos'
  | 'crm'
  | 'inventory'
  | 'support_webshop'
  | 'frappe_core'
  | 'admin_enterprise';

const STORAGE_KEY = 'emkan_erp_state_v2';

function loadPersisted<T>(field: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed[field] !== undefined ? parsed[field] : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModuleId>('dashboard');
  const [activeRole, setActiveRole] = useState<SystemRole>(() =>
    loadPersisted('activeRole', 'ادمین کل (Super Admin)')
  );
  const [fiscalYearLocked, setFiscalYearLocked] = useState<boolean>(() =>
    loadPersisted('fiscalYearLocked', false)
  );
  const [accounts, setAccounts] = useState<AccountNode[]>(() =>
    loadPersisted('accounts', INITIAL_ACCOUNTS)
  );
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceRecord[]>(() =>
    loadPersisted('salesInvoices', INITIAL_SALES_INVOICES)
  );
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceRecord[]>(() =>
    loadPersisted('purchaseInvoices', INITIAL_PURCHASE_INVOICES)
  );
  const [cheques, setCheques] = useState<ChequeRecord[]>(() =>
    loadPersisted('cheques', INITIAL_CHEQUES)
  );
  const [costCenters, setCostCenters] = useState<CostCenterRecord[]>(() =>
    loadPersisted('costCenters', INITIAL_COST_CENTERS)
  );
  const [fixedAssets, setFixedAssets] = useState<FixedAssetRecord[]>(() =>
    loadPersisted('fixedAssets', INITIAL_FIXED_ASSETS)
  );
  const [shareholders] = useState(INITIAL_SHAREHOLDERS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemRecord[]>(() =>
    loadPersisted('inventoryItems', INITIAL_INVENTORY_ITEMS)
  );
  const [crmLeads, setCrmLeads] = useState<CrmLeadRecord[]>(() =>
    loadPersisted('crmLeads', INITIAL_CRM_LEADS)
  );
  const [warrantyTickets, setWarrantyTickets] = useState<WarrantyTicketRecord[]>(() =>
    loadPersisted('warrantyTickets', INITIAL_WARRANTY_TICKETS)
  );
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(() =>
    loadPersisted('customFields', INITIAL_CUSTOM_FIELDS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(() =>
    loadPersisted('auditLogs', INITIAL_AUDIT_LOGS)
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'comparison'>('bar');

  // Persist state automatically to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeRole,
          fiscalYearLocked,
          accounts,
          salesInvoices,
          purchaseInvoices,
          cheques,
          costCenters,
          fixedAssets,
          inventoryItems,
          crmLeads,
          warrantyTickets,
          customFields,
          auditLogs,
        })
      );
    } catch {
      // Ignore quota errors in private mode
    }
  }, [
    activeRole,
    fiscalYearLocked,
    accounts,
    salesInvoices,
    purchaseInvoices,
    cheques,
    costCenters,
    fixedAssets,
    inventoryItems,
    crmLeads,
    warrantyTickets,
    customFields,
    auditLogs,
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const appendAuditLog = (
    docType: string,
    docId: string,
    fieldChanged: string,
    oldValue: string,
    newValue: string
  ) => {
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: '۱۴۰۴/۰۸/۰۲ — اکنون',
        user: 'مهندس رضا نوادگان',
        role: activeRole,
        docType,
        docId,
        fieldChanged,
        oldValue,
        newValue,
      },
      ...prev,
    ]);
  };

  const handleResetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccounts(INITIAL_ACCOUNTS);
    setSalesInvoices(INITIAL_SALES_INVOICES);
    setPurchaseInvoices(INITIAL_PURCHASE_INVOICES);
    setCheques(INITIAL_CHEQUES);
    setCostCenters(INITIAL_COST_CENTERS);
    setFixedAssets(INITIAL_FIXED_ASSETS);
    setInventoryItems(INITIAL_INVENTORY_ITEMS);
    setCrmLeads(INITIAL_CRM_LEADS);
    setWarrantyTickets(INITIAL_WARRANTY_TICKETS);
    setCustomFields(INITIAL_CUSTOM_FIELDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFiscalYearLocked(false);
    setActiveRole('ادمین کل (Super Admin)');
    triggerToast('دیتابیس سامانه «امکان» با موفقیت به داده‌های استاندارد اولیه بازنشانی شد.');
  };

  // Handlers wired end-to-end across modules
  const handleAddAccount = (newAcc: AccountNode) => {
    setAccounts((prev) => [...prev, newAcc]);
    appendAuditLog('درخت حساب‌ها (Chart of Accounts)', newAcc.code, 'ایجاد سرفصل', '—', newAcc.name);
  };

  const handlePostJournalToLedger = (
    lines: { accountCode: string; debit: number; credit: number }[]
  ) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: دوره مالی قفل شده است؛ امکان ثبت سند در دفتر کل وجود ندارد.');
      return;
    }
    setAccounts((prev) => postDoubleEntryToAccounts(prev, lines));
    appendAuditLog('سند روزنامه (Journal Entry)', `JE-${Date.now()}`, 'ثبت در دفتر کل', 'پیش‌نویس', 'ثبت قطعی');
  };

  const handleCreateSalesInvoice = (
    newInv: SalesInvoiceRecord,
    deductSku?: string,
    deductQty?: number
  ) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: سال مالی بسته و قفل شده است؛ امکان صدور فاکتور وجود ندارد.');
      return;
    }
    if (deductSku && deductQty && deductQty > 0) {
      const target = inventoryItems.find((i) => i.sku === deductSku);
      if (target && target.stockQty < deductQty) {
        triggerToast(
          `خطای کسری موجودی انبار: موجودی کالای «${target.name}» (${target.stockQty} عدد) کمتر از تعداد درخواستی (${deductQty} عدد) است.`
        );
        return;
      }
      setInventoryItems((prev) =>
        prev.map((item) => {
          if (item.sku === deductSku) {
            return { ...item, stockQty: Math.max(0, item.stockQty - deductQty) };
          }
          // If the sold item is a Product Bundle, also deduct component SKUs
          if (
            target?.isBundle &&
            (item.sku === 'PK60-MANGO-50' || item.sku === 'SALT-NASTY-30')
          ) {
            return { ...item, stockQty: Math.max(0, item.stockQty - deductQty) };
          }
          return item;
        })
      );
    }
    setSalesInvoices((prev) => [newInv, ...prev]);

    // Auto-post Double-Entry Journal to General Ledger (Chart of Accounts)
    const unpaid = Math.max(0, newInv.totalAmount - newInv.paidAmount);
    const netRevenue = Math.max(0, newInv.totalAmount - newInv.taxAmount);
    setAccounts((prev) =>
      postDoubleEntryToAccounts(prev, [
        { accountCode: '110101', debit: newInv.paidAmount, credit: 0 },
        { accountCode: '1102', debit: unpaid, credit: 0 },
        { accountCode: '4101', debit: 0, credit: netRevenue },
        { accountCode: '2102', debit: 0, credit: newInv.taxAmount },
      ])
    );

    appendAuditLog(
      'فاکتور فروش (Sales Invoice)',
      newInv.invoiceNo,
      'ثبت فاکتور و سند دوبل دفتر کل',
      '۰ تومان',
      `${formatCurrency(newInv.totalAmount)} تومان`
    );
    triggerToast(
      `فاکتور فروش ${newInv.invoiceNo} ثبت شد، سند دوبل در دفتر کل صادر گردید${deductSku ? ' و موجودی از انبار کسر شد' : ''}.`
    );
  };

  const handleCreatePurchaseInvoice = (
    newPinv: PurchaseInvoiceRecord,
    addSku: string,
    addQty: number,
    unitCost: number
  ) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: سال مالی بسته و قفل شده است؛ امکان ثبت فاکتور خرید وجود ندارد.');
      return;
    }
    setPurchaseInvoices((prev) => [newPinv, ...prev]);
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.sku !== addSku) return item;
        const mv = calculateMovingAverageValuation(
          item.stockQty,
          item.valuationRate,
          addQty,
          unitCost
        );
        return {
          ...item,
          stockQty: mv.newQty,
          valuationRate: mv.newValuationRate,
        };
      })
    );
    // Auto-post Double-Entry Journal: Debit Inventory (1104), Credit Accounts Payable (2101)
    setAccounts((prev) =>
      postDoubleEntryToAccounts(prev, [
        { accountCode: '1104', debit: newPinv.totalAmount, credit: 0 },
        { accountCode: '2101', debit: 0, credit: newPinv.totalAmount },
      ])
    );
    appendAuditLog(
      'فاکتور خرید (Purchase Invoice)',
      newPinv.billNo,
      'افزایش موجودی، میانگین موزون و سند دفتر کل',
      addSku,
      `+${addQty} عدد (فی تمام‌شده: ${formatCurrency(unitCost)})`
    );
    triggerToast(
      `فاکتور خرید ${newPinv.billNo} ثبت شد، موجودی انبار و دفتر کل به‌روز گردید و میانگین موزون بازمحاسبه شد.`
    );
  };

  const handleClearCheque = (id: string) => {
    const targetChq = cheques.find((c) => c.id === id);
    setCheques((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'وصول‌شده (پاس‌شده)', clearanceDate: '۱۴۰۴/۰۸/۰۲' }
          : c
      )
    );
    if (targetChq) {
      // Clear cheque in GL: Debit Bank (110101), Credit Cheques in Transit (1103)
      setAccounts((prev) =>
        postDoubleEntryToAccounts(prev, [
          { accountCode: '110101', debit: targetChq.amount, credit: 0 },
          { accountCode: '1103', debit: 0, credit: targetChq.amount },
        ])
      );
    }
    appendAuditLog('مدیریت چک (Cheque)', id, 'وضعیت وصول و سند بانکی', 'در جریان وصول', 'وصول‌شده (پاس‌شده)');
    triggerToast('وضعیت چک صیادی به «وصول‌شده» تغییر یافت و سند انتقال از اسناد در جریان وصول به بانک ثبت شد.');
  };

  const handleUpdateCostCenterPolicy = (id: string, policy: 'WARN' | 'STOP') => {
    setCostCenters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, controlPolicy: policy } : c))
    );
    triggerToast(
      `سیاست کنترل بودجه مرکز هزینه به «${policy === 'STOP' ? 'توقف کامل ثبت فاکتور' : 'هشدار سیستمی'}» تغییر یافت.`
    );
  };

  const handleScrapOrSellAsset = (id: string, newStatus: 'فروخته‌شده' | 'اسقاط‌شده') => {
    setFixedAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    triggerToast(`وضعیت دارایی ثابت به «${newStatus}» تغییر یافت و سند سود/زیان واگذاری صادر شد.`);
  };

  const handleCompletePosSale = (
    cartItems: { sku: string; name: string; qty: number; unitPrice: number }[],
    netTotal: number,
    customerName: string
  ) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: دوره مالی بسته و قفل شده است؛ امکان ثبت فیش صندوق وجود ندارد.');
      return;
    }
    const hasBundle = cartItems.some((c) => c.sku === 'BUNDLE-STARTER-01');
    const bundleQty = cartItems.find((c) => c.sku === 'BUNDLE-STARTER-01')?.qty || 0;

    setInventoryItems((prev) =>
      prev.map((invItem) => {
        const sold = cartItems.find((c) => c.sku === invItem.sku);
        let deduct = sold ? sold.qty : 0;
        if (
          hasBundle &&
          (invItem.sku === 'PK60-MANGO-50' || invItem.sku === 'SALT-NASTY-30')
        ) {
          deduct += bundleQty;
        }
        if (deduct === 0) return invItem;
        return { ...invItem, stockQty: Math.max(0, invItem.stockQty - deduct) };
      })
    );
    const taxAmount = Math.round(netTotal * 0.09);
    const netRev = Math.max(0, netTotal - taxAmount);
    const newPosInv: SalesInvoiceRecord = {
      id: `pos-inv-${Date.now()}`,
      invoiceNo: `POS-1404-${111 + salesInvoices.length}`,
      customerName,
      date: '۱۴۰۴/۰۸/۰۲',
      dueDate: '۱۴۰۴/۰۸/۰۲',
      branchDimension: 'شعبه الهیه',
      channelDimension: 'صندوق فروشگاهی POS',
      paymentTermsTemplate: 'تسویه آنی کارتخوان POS',
      updateStock: true,
      isSubscription: false,
      status: 'پرداخت‌شده',
      totalAmount: netTotal,
      paidAmount: netTotal,
      taxAmount,
      itemsSummary: cartItems.map((c) => `${c.qty}× ${c.name}`).join(' + '),
    };
    setSalesInvoices((prev) => [newPosInv, ...prev]);
    setAccounts((prev) =>
      postDoubleEntryToAccounts(prev, [
        { accountCode: '110102', debit: netTotal, credit: 0 },
        { accountCode: '4101', debit: 0, credit: netRev },
        { accountCode: '2102', debit: 0, credit: taxAmount },
      ])
    );
    triggerToast(`فیش صندوق ${newPosInv.invoiceNo} ثبت شد، موجودی انبار و دفتر کل به‌روز گردید.`);
  };

  const handleAdvanceLeadStage = (id: string) => {
    const stages: CrmLeadRecord['stage'][] = [
      'سرنخ جدید (Lead)',
      'مذاکره و فرصت (Opportunity)',
      'ارسال پیش‌فاکتور',
      'مشتری وفادار',
    ];
    setCrmLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const idx = stages.indexOf(l.stage);
        const nextStage = stages[Math.min(stages.length - 1, idx + 1)];
        return {
          ...l,
          stage: nextStage,
          probability: Math.min(100, l.probability + 20),
        };
      })
    );
    triggerToast('مرحله مذاکره سرنخ در قیف فروش CRM ارتقا یافت.');
  };

  const handleUpdateItemStock = (sku: string, newPhysicalQty: number) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, stockQty: newPhysicalQty } : item))
    );
  };

  const handleWebshopOrderCheckout = (item: InventoryItemRecord) => {
    handleCreateSalesInvoice(
      {
        id: `web-${Date.now()}`,
        invoiceNo: `WEB-1404-${200 + salesInvoices.length}`,
        customerName: 'خریدار آنلاین وب‌شاپ امکان (درگاه بانکی)',
        date: '۱۴۰۴/۰۸/۰۲',
        dueDate: '۱۴۰۴/۰۸/۰۲',
        branchDimension: 'فروشگاه اینترنتی',
        channelDimension: 'وب‌شاپ یکپارچه (Built-in Webshop)',
        paymentTermsTemplate: 'پرداخت آنلاین درگاه شاپرک',
        updateStock: true,
        isSubscription: false,
        status: 'پرداخت‌شده',
        totalAmount: item.retailPrice,
        paidAmount: item.retailPrice,
        taxAmount: Math.round(item.retailPrice * 0.09),
        itemsSummary: `۱ ${item.uomPrimary} ${item.name}`,
      },
      item.sku,
      1
    );
  };

  const handleExportFullData = () => {
    if (!checkRolePermission(activeRole, 'export_database')) {
      triggerToast('خطای دسترسی: فقط نقش «ادمین کل (Super Admin)» مجاز به خروجی گرفتن از کل دیتابیس است.');
      return;
    }
    const payload = {
      exportedAt: new Date().toISOString(),
      system: 'Emkan ERP (امکان — سامانه جامع برنامه‌ریزی منابع سازمانی و حسابداری)',
      activeRole,
      accountsCount: accounts.length,
      salesInvoicesCount: salesInvoices.length,
      purchaseInvoicesCount: purchaseInvoices.length,
      inventoryItemsCount: inventoryItems.length,
      customFields,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emkan-erp-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('فایل خروجی کل دیتابیس امکان (JSON Backup) با موفقیت دانلود شد.');
  };

  // Computed Real-time Executive Metrics
  const totalSalesRevenue = salesInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalReceivableBalance = salesInvoices.reduce(
    (s, i) => s + Math.max(0, i.totalAmount - i.paidAmount),
    0
  );
  const totalInventoryValuation = inventoryItems.reduce(
    (s, i) => s + i.stockQty * i.valuationRate,
    0
  );
  const totalCashAndBank =
    accounts.find((a) => a.code === '1101')?.balance || 1420000000;

  const sidebarItems: {
    id: ActiveModuleId;
    label: string;
    sub: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'dashboard',
      label: 'میزکار و داشبورد امکان',
      sub: 'نمای کلی، نمودارها و لانچر ماژول‌ها',
      icon: LayoutGrid,
    },
    {
      id: 'accounting',
      label: '۱. حسابداری و مالی',
      sub: 'دفتر کل، ترازنامه، اسناد دوبل و چک',
      icon: Calculator,
    },
    {
      id: 'selling_pos',
      label: '۲. فروش و صندوق POS',
      sub: 'صندوق لمسی آفلاین، اقساط و پورسانت',
      icon: ShoppingBag,
    },
    {
      id: 'crm',
      label: '۳. ارتباط با مشتری (CRM)',
      sub: 'سرنخ‌ها، کمپین UTM، تقویم و CLV',
      icon: Users,
    },
    {
      id: 'inventory',
      label: '۴ و ۵. انبارداری و خرید',
      sub: 'تنوع کالا، سریال، گمرک و انبارگردانی',
      icon: Package,
    },
    {
      id: 'support_webshop',
      label: '۹ و ۱۰. گارانتی و وب‌شاپ',
      sub: 'فروشگاه آنلاین، پورتال و تعمیرات',
      icon: Globe,
    },
    {
      id: 'frappe_core',
      label: '۱۱. موتور فریم‌ورک Frappe',
      sub: 'فرم‌ساز، گردش کار، دسترسی و API',
      icon: Sliders,
    },
    {
      id: 'admin_enterprise',
      label: 'ادمین کل، منابع انسانی و ممیزی',
      sub: 'دسترسی Super Admin، ماژول ۶/۷/۸ و کم‌و‌کسر',
      icon: ShieldAlert,
    },
  ];

  const allDocTypesCatalog = [
    { title: 'درخت حساب‌ها (Chart of Accounts)', mod: 'accounting' as ActiveModuleId, cat: 'حسابداری' },
    { title: 'تراز آزمایشی، صورت سود و زیان و ترازنامه', mod: 'accounting' as ActiveModuleId, cat: 'حسابداری' },
    { title: 'سند حسابداری روزنامه (Journal Entry)', mod: 'accounting' as ActiveModuleId, cat: 'حسابداری' },
    { title: 'فاکتور فروش و اقساط (Sales Invoice)', mod: 'accounting' as ActiveModuleId, cat: 'حسابداری' },
    { title: 'فاکتور خرید و میانگین موزون (Purchase Invoice)', mod: 'accounting' as ActiveModuleId, cat: 'خرید' },
    { title: 'مدیریت چک صیادی و تطبیق پرداخت', mod: 'accounting' as ActiveModuleId, cat: 'خزانه‌داری' },
    { title: 'کنترل بودجه و درخت مراکز هزینه', mod: 'accounting' as ActiveModuleId, cat: 'بودجه' },
    { title: 'دارایی‌های ثابت و استهلاک خودکار', mod: 'accounting' as ActiveModuleId, cat: 'اموال' },
    { title: 'صندوق فروشگاهی لمسی و آفلاین (POS)', mod: 'selling_pos' as ActiveModuleId, cat: 'فروش' },
    { title: 'پیش‌فاکتور و سفارش فروش (Quotation)', mod: 'selling_pos' as ActiveModuleId, cat: 'فروش' },
    { title: 'سرنخ‌ها، فرصت‌های فروش و خبرنامه MTL/DTL', mod: 'crm' as ActiveModuleId, cat: 'CRM' },
    { title: 'تنوع کالا، Multi-UOM و پکیج باندل', mod: 'inventory' as ActiveModuleId, cat: 'انبار WMS' },
    { title: 'سرشکن هزینه‌های گمرک و خرید (Landed Cost)', mod: 'inventory' as ActiveModuleId, cat: 'انبار WMS' },
    { title: 'انبارگردانی و نقطه سفارش خودکار', mod: 'inventory' as ActiveModuleId, cat: 'انبار WMS' },
    { title: 'فروشگاه آنلاین یکپارچه و استعلام گارانتی', mod: 'support_webshop' as ActiveModuleId, cat: 'وب‌شاپ' },
    { title: 'ساخت فیلد سفارشی و طراح گردش کار (Frappe Core)', mod: 'frappe_core' as ActiveModuleId, cat: 'فریم‌ورک' },
    { title: 'مرکز فرماندهی ادمین کل، حقوق و دستمزد (۶)، تولید (۷) و ممیزی سیستم', mod: 'admin_enterprise' as ActiveModuleId, cat: 'ادمین کل' },
  ];

  const filteredDocTypes = allDocTypesCatalog.filter(
    (d) => d.title.includes(commandSearch) || d.cat.includes(commandSearch)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('dashboard');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          امکان ERP
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="ناوبری اصلی ماژول‌ها"
          className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600"
        >
          <button
            type="button"
            onClick={() => setActiveModule('dashboard')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'dashboard' ? 'text-indigo-700 underline underline-offset-8' : ''
            }`}
          >
            داشبورد کلان
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('accounting')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'accounting' ? 'text-indigo-700 underline underline-offset-8' : ''
            }`}
          >
            حسابداری و مالی
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('selling_pos')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'selling_pos' ? 'text-indigo-700 underline underline-offset-8' : ''
            }`}
          >
            فروش و صندوق POS
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('inventory')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'inventory' ? 'text-indigo-700 underline underline-offset-8' : ''
            }`}
          >
            انبارداری WMS
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('admin_enterprise')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'admin_enterprise' ? 'text-indigo-700 underline underline-offset-8' : ''
            }`}
          >
            ادمین کل و ممیزی
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setShowCommandModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            جستجوی سریع اسناد (DocTypes)
          </button>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-medium max-w-md"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workspace Body: Sidebar + Main Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside
          aria-label="منوی دپارتمان‌های سازمانی"
          className="w-full lg:w-68 bg-white border-b lg:border-b-0 lg:border-l border-slate-200 p-4 shrink-0 no-print space-y-4"
        >
          {/* Active Role Badge & Quick Switcher in Sidebar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-[11px] text-slate-500 font-medium">
              سطح دسترسی فعال در سامانه امکان:
            </div>
            <select
              aria-label="تغییر سطح دسترسی کاربر"
              value={activeRole}
              onChange={(e) => {
                const nextRole = e.target.value as SystemRole;
                setActiveRole(nextRole);
                triggerToast(`سطح دسترسی فعال به «${nextRole}» تغییر یافت.`);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-lg"
            >
              <option value="ادمین کل (Super Admin)">ادمین کل (Super Admin)</option>
              <option value="مدیر مالی (Accounts Manager)">مدیر مالی (Accounts Manager)</option>
              <option value="سرپرست انبار (Stock Manager)">سرپرست انبار (Stock Manager)</option>
              <option value="صندوقدار POS">صندوقدار POS (محدود)</option>
            </select>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 px-2 mb-2">
              دپارتمان‌ها و ماژول‌های سامانه امکان
            </div>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModule(item.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl text-right transition-colors shrink-0 lg:w-full ${
                      isActive
                        ? 'bg-indigo-50/90 text-indigo-950 border border-indigo-200/80'
                        : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold whitespace-nowrap">{item.label}</div>
                      <div className="text-[11px] text-slate-500 truncate hidden lg:block mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-5 lg:p-6 min-w-0">
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Welcome & Quick Actions */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-indigo-700 font-semibold">
                    سامانه جامع سازمانی «امکان (Emkan ERP)» · فونت وزیر · دسترسی فعال: {activeRole}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    میزکار جامع حسابداری دوبل، صندوق فروشگاهی، انبارداری پیشرفته و اتوماسیون امکان
                  </h1>
                  <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                    پوشش کامل تمامی ۱۱ دپارتمان (شامل حسابداری ۵ سطحی و ترازنامه، فروش اقساطی و POS آفلاین، CRM، انبارداری سریال/بچ و گمرک، منابع انسانی و حقوق، تولید BOM، وب‌شاپ و موتور Frappe) همراه با ذخیره‌سازی خودکار و مدیریت دسترسی ادمین کل.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModule('admin_enterprise')}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                  >
                    پنل ادمین کل و گزارش کم‌و‌کسر
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModule('selling_pos')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 whitespace-nowrap"
                  >
                    ورود به صندوق فروشگاهی (POS)
                  </button>
                </div>
              </div>

              {/* 4-Column Executive KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">جمع فروش و فاکتورهای صادره</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(totalSalesRevenue)} تومان
                  </div>
                  <div className="text-xs text-emerald-700">
                    {salesInvoices.length} سند فروش فعال · رشد ۱۸.۴٪ ماهانه
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">حساب‌های دریافتنی و اقساط باز</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-indigo-700">
                    {formatCurrency(totalReceivableBalance)} تومان
                  </div>
                  <div className="text-xs text-slate-500">
                    شامل اقساط ۳۰/۳۵/۳۵ و چک‌های صیادی
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">موجودی نقد، بانک و کارتخوان‌ها</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                    {formatCurrency(totalCashAndBank)} تومان
                  </div>
                  <div className="text-xs text-slate-500">
                    تطبیق‌شده با صورت‌حساب پایا و ساتنا
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">ارزش موجودی انبار (میانگین موزون)</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {checkRolePermission(activeRole, 'view_buying_cost')
                      ? `${formatCurrency(totalInventoryValuation)} تومان`
                      : '🔒 مخفی (ویژه ادمین/مالی)'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {inventoryItems.length} کد کالای فعال دارای سریال و بچ
                  </div>
                </div>
              </div>

              {/* Odoo-Style Module Launcher Grid */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      لانچر سریع ماژول‌ها و دایرةالمعارف کامل اسناد سامانه «امکان»
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      برای ورود مستقیم به هر زیرسیستم و بررسی اسناد تخصصی روی کارت مربوطه کلیک کنید
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'accounting' as ActiveModuleId,
                      title: '۱. حسابداری، ترازنامه و مدیریت مالی',
                      features:
                        'درخت حساب‌ها · تراز آزمایشی و سود و زیان · سند روزنامه · فاکتور اقساطی ۳۰/۳۵/۳۵ · چک صیادی · کنترل بودجه · دارایی ثابت و سهام',
                      metric: `${accounts.length} سرفصل حساب کل و معین`,
                    },
                    {
                      id: 'selling_pos' as ActiveModuleId,
                      title: '۲. فروش، صندوق لمسی (POS) و پورسانت',
                      features:
                        'صندوق لمسی آفلاین · پیش‌فاکتور و رزرو انبار · لیست قیمت تکی/عمده/همکار · پروموشن پلکانی · باشگاه مشتریان · درخت فروشندگان',
                      metric: 'فیش حرارتی ۸cm + کارکرد آفلاین',
                    },
                    {
                      id: 'crm' as ActiveModuleId,
                      title: '۳. ارتباط با مشتری و بازاریابی (CRM)',
                      features:
                        'سرنخ‌های اینستاگرام و تلگرام · فرصت‌های فروش · کمپین UTM · تقویم گوگل · ارزش طول عمر مشتری (CLV) · خبرنامه MTL/DTL',
                      metric: `${crmLeads.length} پرونده مذاکره فعال`,
                    },
                    {
                      id: 'inventory' as ActiveModuleId,
                      title: '۴ و ۵. انبارداری پیشرفته (WMS) و خرید',
                      features:
                        'تولید تنوع کالا (طعم/نیکوتین) · Multi-UOM · پکیج باندل · میانگین موزون · سریال و انقضا · سرشکن گمرک (Landed Cost) · انبارگردانی',
                      metric: `${inventoryItems.length} کالای دارای ردیابی بچ`,
                    },
                    {
                      id: 'support_webshop' as ActiveModuleId,
                      title: '۹ و ۱۰. گارانتی، تعمیرات و وب‌شاپ آنلاین',
                      features:
                        'فروشگاه اینترنتی متصل به انبار · استعلام سریال گارانتی · پذیرش تعمیرگاه · پورتال مشتریان · صفحه‌ساز و فرم‌های تحت وب',
                      metric: `${warrantyTickets.length} پرونده گارانتی فعال`,
                    },
                    {
                      id: 'admin_enterprise' as ActiveModuleId,
                      title: '۶، ۷، ۸ و ۱۱. ادمین کل، منابع انسانی، تولید و ممیزی',
                      features:
                        'کنترل دسترسی ادمین کل (Super Admin) · فیش حقوقی (۶) · فرمول تولید BOM (۷) · پروژه‌ها (۸) · موتور Frappe (۱۱) · گزارش کم و کسرها',
                      metric: `دسترسی: ${activeRole}`,
                    },
                  ].map((card) => (
                    <div
                      key={card.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-colors flex flex-col justify-between gap-3 bg-slate-50/40"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                          <ArrowUpLeft className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{card.features}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-xs">
                        <span className="font-mono text-slate-500">{card.metric}</span>
                        <button
                          type="button"
                          onClick={() => setActiveModule(card.id)}
                          className="font-semibold text-indigo-700 hover:text-indigo-900"
                        >
                          باز کردن ماژول ←
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Report Builder & Dashboard Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      گزارش‌ساز و نمودارساز پویا (Report Builder & Dashboard Chart)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تحلیل مقایسه‌ای درآمد فروش، بهای تمام‌شده و سود خالص به تفکیک ماه‌های سال مالی ۱۴۰۴ (ارقام به میلیون تومان)
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded-md font-medium ${
                        chartType === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      نمای نمودار میله‌ای
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType('comparison')}
                      className={`px-3 py-1 rounded-md font-medium ${
                        chartType === 'comparison'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      جدول تراز سود و زیان
                    </button>
                  </div>
                </div>

                {chartType === 'bar' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 pt-2">
                    {[
                      { month: 'فروردین', rev: 310, profit: 110, pct: 62 },
                      { month: 'اردیبهشت', rev: 365, profit: 132, pct: 73 },
                      { month: 'خرداد', rev: 410, profit: 155, pct: 82 },
                      { month: 'تیر', rev: 390, profit: 140, pct: 78 },
                      { month: 'مرداد', rev: 460, profit: 178, pct: 92 },
                      { month: 'آبان (جاری)', rev: 495, profit: 194, pct: 99 },
                    ].map((m) => (
                      <div
                        key={m.month}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2 text-xs"
                      >
                        <div className="font-bold text-slate-800">{m.month}</div>
                        <div className="h-24 flex items-end gap-1.5 pt-2">
                          <div
                            style={{ height: `${m.pct}%` }}
                            className="flex-1 bg-indigo-600 rounded-t-md"
                            title={`فروش: ${m.rev} میلیون`}
                          />
                          <div
                            style={{ height: `${Math.round(m.pct * 0.42)}%` }}
                            className="flex-1 bg-emerald-500 rounded-t-md"
                            title={`سود خالص: ${m.profit} میلیون`}
                          />
                        </div>
                        <div className="space-y-0.5 pt-1 border-t border-slate-200 font-mono text-[11px]">
                          <div className="text-slate-700">فروش: {formatCurrency(m.rev)} M</div>
                          <div className="text-emerald-700 font-semibold">
                            سود: {formatCurrency(m.profit)} M
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                          <th className="py-2 px-3">شعبه / کانال فروش</th>
                          <th className="py-2 px-3 text-left">فروش ناخالص (تومان)</th>
                          <th className="py-2 px-3 text-left">بهای تمام‌شده میانگین موزون</th>
                          <th className="py-2 px-3 text-left">سود ویژه عملیاتی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        <tr>
                          <td className="py-2 px-3 font-sans font-bold">شعبه مرکزی تهران (فروش عمده B2B)</td>
                          <td className="py-2 px-3 text-left">۱,۱۲۰,۰۰۰,۰۰۰</td>
                          <td className="py-2 px-3 text-left">۷۸۰,۰۰۰,۰۰۰</td>
                          <td className="py-2 px-3 text-left text-emerald-700 font-bold">۳۴۰,۰۰۰,۰۰۰</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-sans font-bold">شعبه الهیه (صندوق فروشگاهی POS)</td>
                          <td className="py-2 px-3 text-left">۶۲۰,۰۰۰,۰۰۰</td>
                          <td className="py-2 px-3 text-left">۳۹۰,۰۰۰,۰۰۰</td>
                          <td className="py-2 px-3 text-left text-emerald-700 font-bold">۲۳۰,۰۰۰,۰۰۰</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModule === 'accounting' && (
            <AccountingModule
              activeRole={activeRole}
              fiscalYearLocked={fiscalYearLocked}
              onToggleFiscalYearLock={() => setFiscalYearLocked((v) => !v)}
              accounts={accounts}
              onAddAccount={handleAddAccount}
              onPostJournal={handlePostJournalToLedger}
              salesInvoices={salesInvoices}
              onCreateSalesInvoice={handleCreateSalesInvoice}
              purchaseInvoices={purchaseInvoices}
              onCreatePurchaseInvoice={handleCreatePurchaseInvoice}
              cheques={cheques}
              onClearCheque={handleClearCheque}
              costCenters={costCenters}
              onUpdateCostCenterPolicy={handleUpdateCostCenterPolicy}
              fixedAssets={fixedAssets}
              onScrapOrSellAsset={handleScrapOrSellAsset}
              shareholders={shareholders}
              inventoryItems={inventoryItems}
              onShowToast={triggerToast}
            />
          )}

          {activeModule === 'selling_pos' && (
            <SellingPosModule
              inventoryItems={inventoryItems}
              onCompletePosSale={handleCompletePosSale}
              onShowToast={triggerToast}
            />
          )}

          {activeModule === 'crm' && (
            <CrmMarketingModule
              leads={crmLeads}
              onAddLead={(l) => setCrmLeads((prev) => [l, ...prev])}
              onAdvanceLeadStage={handleAdvanceLeadStage}
              onShowToast={triggerToast}
            />
          )}

          {activeModule === 'inventory' && (
            <InventoryWmsModule
              activeRole={activeRole}
              items={inventoryItems}
              onUpdateItemStock={handleUpdateItemStock}
              onAddGeneratedVariants={(newVars) =>
                setInventoryItems((prev) => [...newVars, ...prev])
              }
              onShowToast={triggerToast}
            />
          )}

          {activeModule === 'support_webshop' && (
            <SupportWebshopModule
              inventoryItems={inventoryItems}
              warrantyTickets={warrantyTickets}
              onAddWarrantyTicket={(t) => setWarrantyTickets((prev) => [t, ...prev])}
              salesInvoices={salesInvoices}
              onWebshopOrderCheckout={handleWebshopOrderCheckout}
              onShowToast={triggerToast}
            />
          )}

          {activeModule === 'frappe_core' && (
            <FrappeCoreModule
              customFields={customFields}
              onAddCustomField={(cf) => setCustomFields((prev) => [cf, ...prev])}
              auditLogs={auditLogs}
              onExportFullData={handleExportFullData}
              onShowToast={triggerToast}
            />
          )}

          {activeModule === 'admin_enterprise' && (
            <AdminAndEnterpriseModule
              activeRole={activeRole}
              onChangeRole={setActiveRole}
              onResetDatabase={handleResetDatabase}
              onExportDatabase={handleExportFullData}
              onShowToast={triggerToast}
            />
          )}
        </main>
      </div>

      {/* Global DocType Command Palette Modal */}
      {showCommandModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctype-search-title"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 id="doctype-search-title" className="text-sm font-bold text-slate-900">
                جستجوی سریع اسناد و ماژول‌های سامانه امکان (Awesomebar)
              </h3>
              <button
                type="button"
                onClick={() => setShowCommandModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                بستن پنجره
              </button>
            </div>
            <input
              type="text"
              aria-label="جستجوی نام سند یا ماژول"
              placeholder="نام سند را بنویسید (مثلاً ترازنامه، چک، فاکتور، انبارگردانی، ادمین کل)..."
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
            <div className="space-y-1.5 max-h-72 overflow-y-auto text-xs">
              {filteredDocTypes.map((dt) => (
                <button
                  key={dt.title}
                  type="button"
                  onClick={() => {
                    setActiveModule(dt.mod);
                    setShowCommandModal(false);
                  }}
                  className="w-full p-2.5 rounded-lg hover:bg-indigo-50 flex items-center justify-between text-right transition-colors"
                >
                  <span className="font-semibold text-slate-900">{dt.title}</span>
                  <span className="text-indigo-700 font-medium">{dt.cat} ←</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
