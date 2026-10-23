import React, { useState } from 'react';
import {
  LayoutGrid,
  Calculator,
  ShoppingBag,
  Users,
  Package,
  Globe,
  Sliders,
  Search,
  ArrowUpLeft,
  CheckCircle2,
  BarChart3,
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
  ChequeRecord,
  CostCenterRecord,
  FixedAssetRecord,
  InventoryItemRecord,
  CrmLeadRecord,
  WarrantyTicketRecord,
  CustomFieldDefinition,
  AuditLogRecord,
} from './data/erpSeedData';
import { formatCurrency } from './utils/erpEngine';
import { AccountingModule } from './components/AccountingModule';
import { SellingPosModule } from './components/SellingPosModule';
import { CrmMarketingModule } from './components/CrmMarketingModule';
import { InventoryWmsModule } from './components/InventoryWmsModule';
import { SupportWebshopModule } from './components/SupportWebshopModule';
import { FrappeCoreModule } from './components/FrappeCoreModule';

type ActiveModuleId =
  | 'dashboard'
  | 'accounting'
  | 'selling_pos'
  | 'crm'
  | 'inventory'
  | 'support_webshop'
  | 'frappe_core';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModuleId>('dashboard');
  const [accounts, setAccounts] = useState<AccountNode[]>(INITIAL_ACCOUNTS);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceRecord[]>(INITIAL_SALES_INVOICES);
  const [purchaseInvoices] = useState(INITIAL_PURCHASE_INVOICES);
  const [cheques, setCheques] = useState<ChequeRecord[]>(INITIAL_CHEQUES);
  const [costCenters, setCostCenters] = useState<CostCenterRecord[]>(INITIAL_COST_CENTERS);
  const [fixedAssets, setFixedAssets] = useState<FixedAssetRecord[]>(INITIAL_FIXED_ASSETS);
  const [shareholders] = useState(INITIAL_SHAREHOLDERS);
  const [inventoryItems, setInventoryItems] =
    useState<InventoryItemRecord[]>(INITIAL_INVENTORY_ITEMS);
  const [crmLeads, setCrmLeads] = useState<CrmLeadRecord[]>(INITIAL_CRM_LEADS);
  const [warrantyTickets, setWarrantyTickets] =
    useState<WarrantyTicketRecord[]>(INITIAL_WARRANTY_TICKETS);
  const [customFields, setCustomFields] =
    useState<CustomFieldDefinition[]>(INITIAL_CUSTOM_FIELDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(INITIAL_AUDIT_LOGS);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'comparison'>('bar');

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
        role: 'مدیر ارشد سیستم',
        docType,
        docId,
        fieldChanged,
        oldValue,
        newValue,
      },
      ...prev,
    ]);
  };

  // Handlers wired end-to-end across modules
  const handleAddAccount = (newAcc: AccountNode) => {
    setAccounts((prev) => [...prev, newAcc]);
    appendAuditLog('درخت حساب‌ها (Chart of Accounts)', newAcc.code, 'ایجاد سرفصل', '—', newAcc.name);
  };

  const handleCreateSalesInvoice = (
    newInv: SalesInvoiceRecord,
    deductSku?: string,
    deductQty?: number
  ) => {
    setSalesInvoices((prev) => [newInv, ...prev]);
    if (deductSku && deductQty && deductQty > 0) {
      setInventoryItems((prev) =>
        prev.map((item) =>
          item.sku === deductSku
            ? { ...item, stockQty: Math.max(0, item.stockQty - deductQty) }
            : item
        )
      );
    }
    appendAuditLog(
      'فاکتور فروش (Sales Invoice)',
      newInv.invoiceNo,
      'ثبت فاکتور جدید',
      '۰ تومان',
      `${formatCurrency(newInv.totalAmount)} تومان`
    );
    triggerToast(
      `فاکتور فروش ${newInv.invoiceNo} ثبت شد${deductSku ? ' و موجودی کالا از انبار کسر گردید' : ''}.`
    );
  };

  const handleClearCheque = (id: string) => {
    setCheques((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'وصول‌شده (پاس‌شده)', clearanceDate: '۱۴۰۴/۰۸/۰۲' }
          : c
      )
    );
    appendAuditLog('مدیریت چک (Cheque)', id, 'وضعیت وصول', 'در جریان وصول', 'وصول‌شده (پاس‌شده)');
    triggerToast('وضعیت چک صیادی به «وصول‌شده» تغییر یافت و سند بانکی آن ثبت شد.');
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
    // Deduct stock for each POS item
    setInventoryItems((prev) =>
      prev.map((invItem) => {
        const sold = cartItems.find((c) => c.sku === invItem.sku);
        if (!sold) return invItem;
        return { ...invItem, stockQty: Math.max(0, invItem.stockQty - sold.qty) };
      })
    );
    // Create POS Sales Invoice record
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
      taxAmount: Math.round(netTotal * 0.09),
      itemsSummary: cartItems.map((c) => `${c.qty}× ${c.name}`).join(' + '),
    };
    setSalesInvoices((prev) => [newPosInv, ...prev]);
    triggerToast(`فیش صندوق ${newPosInv.invoiceNo} ثبت شد و موجودی انبار به‌روز گردید.`);
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
        customerName: 'خریدار آنلاین وب‌شاپ (درگاه بانکی)',
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
    const payload = {
      exportedAt: new Date().toISOString(),
      system: 'FaraPay ERP (Odoo / ERPNext Persian Edition)',
      accountsCount: accounts.length,
      salesInvoicesCount: salesInvoices.length,
      inventoryItemsCount: inventoryItems.length,
      customFields,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farapay-erp-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('فایل خروجی کل دیتابیس (JSON Backup) با موفقیت تولید و دانلود شد.');
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
      label: 'میزکار و داشبورد کلان',
      sub: 'نمای کلی، نمودارها و لانچر Odoo',
      icon: LayoutGrid,
    },
    {
      id: 'accounting',
      label: '۱. حسابداری و مالی',
      sub: 'دفتر کل، اسناد دوبل، چک و دارایی',
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
  ];

  const allDocTypesCatalog = [
    { title: 'درخت حساب‌ها (Chart of Accounts)', mod: 'accounting' as ActiveModuleId, cat: 'حسابداری' },
    { title: 'سند حسابداری روزنامه (Journal Entry)', mod: 'accounting' as ActiveModuleId, cat: 'حسابداری' },
    { title: 'فاکتور فروش و اقساط (Sales Invoice)', mod: 'accounting' as ActiveModuleId, cat: 'حسابداری' },
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
          فراپِی ERP
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
            onClick={() => setActiveModule('frappe_core')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'frappe_core' ? 'text-indigo-700 underline underline-offset-8' : ''
            }`}
          >
            موتور فریم‌ورک
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
          className="w-full lg:w-68 bg-white border-b lg:border-b-0 lg:border-l border-slate-200 p-4 shrink-0 no-print"
        >
          <div className="text-xs font-bold text-slate-400 px-2 mb-2">
            دپارتمان‌ها و ماژول‌های ERPNext / Odoo
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
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-5 lg:p-6 min-w-0">
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Welcome & Quick Actions */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-indigo-700 font-semibold">
                    معماری یکپارچه Odoo 18 & ERPNext Frappe · سال مالی ۱۴۰۴
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    میزکار جامع برنامه‌ریزی منابع سازمانی، حسابداری دوبل و لجستیک هوشمند
                  </h1>
                  <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                    تمامی ۱۱ زیرسیستم اصلی شامل حسابداری ۵ سطحی، فروش اقساطی، صندوق لمسی آفلاین (POS)، قیف CRM، انبارداری سریال/بچ و سرشکن هزینه گمرک، وب‌شاپ یکپارچه و موتور نرم‌افزارساز Frappe به صورت زنده به یکدیگر متصل هستند.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModule('selling_pos')}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                  >
                    ورود به صندوق فروشگاهی (POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModule('accounting')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 whitespace-nowrap"
                  >
                    ثبت سند و فاکتور جدید
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
                    {formatCurrency(totalInventoryValuation)} تومان
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
                      لانچر سریع ماژول‌ها و دایرةالمعارف کامل اسناد (Odoo & ERPNext DocTypes)
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
                      title: '۱. حسابداری و مدیریت مالی',
                      features:
                        'درخت حساب‌ها · ابعاد تحلیلی · سند روزنامه و قالب‌ها · فاکتور اقساطی ۳۰/۳۵/۳۵ · چک صیادی · کنترل بودجه · دارایی ثابت و سهام',
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
                      id: 'frappe_core' as ActiveModuleId,
                      title: '۱۱. موتور فریم‌ورک و اتوماسیون (Frappe Core)',
                      features:
                        'ساخت فیلد و فرم بدون کدنویسی · طراح گردش کار تاییدات · اعلان تلگرام · طراح چاپ · دسترسی سطح فیلد · لاگ امنیتی و وب‌هوک n8n',
                      metric: `${customFields.length} فیلد سفارشی + Audit Trail`,
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
              accounts={accounts}
              onAddAccount={handleAddAccount}
              salesInvoices={salesInvoices}
              onCreateSalesInvoice={handleCreateSalesInvoice}
              purchaseInvoices={purchaseInvoices}
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
                جستجوی سریع اسناد و ماژول‌ها (Frappe Awesomebar)
              </h3>
              <button
                type="button"
                onClick={() => setShowCommandModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                بستن ✕
              </button>
            </div>
            <input
              type="text"
              aria-label="جستجوی نام سند یا ماژول"
              placeholder="نام سند را بنویسید (مثلاً چک، فاکتور، انبارگردانی، گمرک، POS)..."
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
