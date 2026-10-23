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
  FileText,
  ShoppingCart,
  Search,
  ChevronLeft,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_GL_ENTRIES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_PAYMENT_ENTRIES,
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
  GLEntryRecord,
  JournalEntryRecord,
  SalesInvoiceRecord,
  PurchaseInvoiceRecord,
  PaymentEntryRecord,
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
  deductStockWithBundles,
  DEFAULT_VAT_PERCENT,
} from './utils/erpEngine';
import { AccountingModule, AccountingSubTab } from './components/AccountingModule';
import { SellingPosModule } from './components/SellingPosModule';
import { CrmMarketingModule } from './components/CrmMarketingModule';
import { InventoryWmsModule } from './components/InventoryWmsModule';
import { SupportWebshopModule } from './components/SupportWebshopModule';
import { FrappeCoreModule } from './components/FrappeCoreModule';
import { AdminAndEnterpriseModule } from './components/AdminAndEnterpriseModule';

type ActiveModuleId =
  | 'dashboard'
  | 'accounting'
  | 'selling_workspace'
  | 'buying_workspace'
  | 'inventory'
  | 'selling_pos'
  | 'crm'
  | 'support_webshop'
  | 'frappe_core'
  | 'admin_enterprise';

const STORAGE_KEY = 'emkan_erp_state_v3';

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
  const [accountingSubTab, setAccountingSubTab] = useState<AccountingSubTab>('coa');
  const [activeFiscalYear, setActiveFiscalYear] = useState<string>('۱۴۰۴');
  const [defaultBranch, setDefaultBranch] = useState<string>('همه شعب');

  const [activeRole, setActiveRole] = useState<SystemRole>(() =>
    loadPersisted('activeRole', 'ادمین کل (Super Admin)')
  );
  const [fiscalYearLocked, setFiscalYearLocked] = useState<boolean>(() =>
    loadPersisted('fiscalYearLocked', false)
  );
  const [accounts, setAccounts] = useState<AccountNode[]>(() =>
    loadPersisted('accounts', INITIAL_ACCOUNTS)
  );
  const [glEntries, setGlEntries] = useState<GLEntryRecord[]>(() =>
    loadPersisted('glEntries', INITIAL_GL_ENTRIES)
  );
  const [journalEntries, setJournalEntries] = useState<JournalEntryRecord[]>(() =>
    loadPersisted('journalEntries', INITIAL_JOURNAL_ENTRIES)
  );
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceRecord[]>(() =>
    loadPersisted('salesInvoices', INITIAL_SALES_INVOICES)
  );
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceRecord[]>(() =>
    loadPersisted('purchaseInvoices', INITIAL_PURCHASE_INVOICES)
  );
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntryRecord[]>(() =>
    loadPersisted('paymentEntries', INITIAL_PAYMENT_ENTRIES)
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

  // Global Ctrl+K / Cmd+K Awesomebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowCommandModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist state automatically to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeRole,
          fiscalYearLocked,
          accounts,
          glEntries,
          journalEntries,
          salesInvoices,
          purchaseInvoices,
          paymentEntries,
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
    glEntries,
    journalEntries,
    salesInvoices,
    purchaseInvoices,
    paymentEntries,
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

  const getAccountName = (code: string) =>
    accounts.find((a) => a.code === code)?.name || `حساب ${code}`;

  const appendGLEntries = (
    voucherType: GLEntryRecord['voucherType'],
    voucherNo: string,
    postingDate: string,
    branch: string,
    costCenter: string,
    lines: {
      accountCode: string;
      debit: number;
      credit: number;
      partyType?: GLEntryRecord['partyType'];
      partyName?: string;
      remarks: string;
    }[]
  ) => {
    const validLines = lines.filter((l) => l.debit > 0 || l.credit > 0);
    const newEntries: GLEntryRecord[] = validLines.map((l, idx) => ({
      id: `gle-${Date.now()}-${idx}`,
      postingDate,
      voucherType,
      voucherNo,
      accountCode: l.accountCode,
      accountName: getAccountName(l.accountCode),
      partyType: l.partyType,
      partyName: l.partyName,
      debit: l.debit,
      credit: l.credit,
      costCenter,
      branch,
      remarks: l.remarks,
      isCancelled: false,
    }));
    setGlEntries((prev) => [...newEntries, ...prev]);
    setAccounts((prev) =>
      postDoubleEntryToAccounts(
        prev,
        validLines.map((l) => ({ accountCode: l.accountCode, debit: l.debit, credit: l.credit }))
      )
    );
  };

  const handleResetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccounts(INITIAL_ACCOUNTS);
    setGlEntries(INITIAL_GL_ENTRIES);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setSalesInvoices(INITIAL_SALES_INVOICES);
    setPurchaseInvoices(INITIAL_PURCHASE_INVOICES);
    setPaymentEntries(INITIAL_PAYMENT_ENTRIES);
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

  // 1. Chart of Accounts
  const handleAddAccount = (newAcc: AccountNode) => {
    setAccounts((prev) => [...prev, newAcc]);
    appendAuditLog('درخت حساب‌ها (Chart of Accounts)', newAcc.code, 'ایجاد سرفصل', '—', newAcc.name);
  };

  // 2. Journal Entry (Draft / Submit / Cancel)
  const postJournalGL = (je: JournalEntryRecord) => {
    appendGLEntries(
      'Journal Entry',
      je.voucherNo,
      je.postingDate,
      je.lines[0]?.dimensionBranch || 'دفتر مرکزی تهران',
      je.lines[0]?.costCenter || 'CC-HQ (دفتر مرکزی)',
      je.lines.map((l) => ({
        accountCode: l.accountCode,
        debit: l.debit,
        credit: l.credit,
        partyType: l.partyType,
        partyName: l.partyName,
        remarks: je.title,
      }))
    );
  };

  const handleSaveJournalEntry = (entry: JournalEntryRecord) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: دوره مالی قفل شده است؛ امکان ثبت سند در دفتر کل وجود ندارد.');
      return;
    }
    setJournalEntries((prev) => [entry, ...prev]);
    if (entry.docstatus === 1) {
      postJournalGL(entry);
      appendAuditLog('سند روزنامه (Journal Entry)', entry.voucherNo, 'ثبت در دفتر کل', 'پیش‌نویس', 'ثبت قطعی');
    }
  };

  const handleSubmitJournalEntry = (id: string) => {
    const target = journalEntries.find((j) => j.id === id);
    if (!target || target.docstatus !== 0) return;
    setJournalEntries((prev) => prev.map((j) => (j.id === id ? { ...j, docstatus: 1 } : j)));
    postJournalGL({ ...target, docstatus: 1 });
    triggerToast(`سند روزنامه ${target.voucherNo} ثبت قطعی (Submit) شد و در دفتر کل نشست.`);
  };

  const handleCancelJournalEntry = (id: string) => {
    const target = journalEntries.find((j) => j.id === id);
    if (!target || target.docstatus !== 1) return;
    setJournalEntries((prev) => prev.map((j) => (j.id === id ? { ...j, docstatus: 2 } : j)));
    appendGLEntries(
      'Journal Entry',
      `${target.voucherNo}-REV`,
      '۱۴۰۴/۰۸/۰۲',
      target.lines[0]?.dimensionBranch || 'دفتر مرکزی تهران',
      target.lines[0]?.costCenter || 'CC-HQ (دفتر مرکزی)',
      target.lines.map((l) => ({
        accountCode: l.accountCode,
        debit: l.credit,
        credit: l.debit,
        partyType: l.partyType,
        partyName: l.partyName,
        remarks: `سند معکوس ابطال ${target.voucherNo}`,
      }))
    );
    triggerToast(`سند روزنامه ${target.voucherNo} ابطال شد و سند معکوس در دفتر کل صادر گردید.`);
  };

  // 3. Sales Invoice (Draft / Submit / Cancel / Credit Note) with Perpetual Inventory COGS
  const executeSalesInvoiceSubmission = (inv: SalesInvoiceRecord): number => {
    let computedCogs = inv.cogsAmount || 0;
    if (inv.updateStock && inv.items.length > 0) {
      const deduction = deductStockWithBundles(
        inventoryItems,
        inv.items.map((it) => ({ sku: it.sku, qty: it.qty }))
      );
      setInventoryItems(deduction.updatedItems);
      computedCogs = deduction.totalCogs;
    }

    const unpaid = Math.max(0, inv.totalAmount - inv.paidAmount);
    const netRevenue = Math.max(0, inv.totalAmount - inv.taxAmount);
    const glLines: {
      accountCode: string;
      debit: number;
      credit: number;
      partyType?: GLEntryRecord['partyType'];
      partyName?: string;
      remarks: string;
    }[] = [
      {
        accountCode: '110101',
        debit: inv.paidAmount,
        credit: 0,
        remarks: `دریافت نقدی فاکتور ${inv.invoiceNo}`,
      },
      {
        accountCode: '1102',
        debit: unpaid,
        credit: 0,
        partyType: 'مشتری',
        partyName: inv.customerName,
        remarks: `تعهد مشتری بابت ${inv.invoiceNo}`,
      },
      {
        accountCode: '4101',
        debit: 0,
        credit: netRevenue,
        remarks: `درآمد فروش خالص ${inv.invoiceNo}`,
      },
      {
        accountCode: '2102',
        debit: 0,
        credit: inv.taxAmount,
        remarks: `مالیات بر ارزش افزوده (${DEFAULT_VAT_PERCENT}٪) ${inv.invoiceNo}`,
      },
    ];

    if (computedCogs > 0) {
      glLines.push(
        {
          accountCode: '5101',
          debit: computedCogs,
          credit: 0,
          remarks: `بهای تمام‌شده کالای فروش‌رفته (COGS) ${inv.invoiceNo}`,
        },
        {
          accountCode: '1104',
          debit: 0,
          credit: computedCogs,
          remarks: `کسر موجودی انبار بابت فروش ادواری ${inv.invoiceNo}`,
        }
      );
    }

    appendGLEntries(
      'Sales Invoice',
      inv.invoiceNo,
      inv.date,
      inv.branchDimension,
      'CC-HQ (دفتر مرکزی)',
      glLines
    );
    return computedCogs;
  };

  const handleCreateSalesInvoice = (newInv: SalesInvoiceRecord) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: سال مالی بسته و قفل شده است؛ امکان صدور فاکتور وجود ندارد.');
      return;
    }
    if (newInv.docstatus === 1 && newInv.updateStock) {
      for (const line of newInv.items) {
        const target = inventoryItems.find((i) => i.sku === line.sku);
        if (target && target.stockQty < line.qty) {
          triggerToast(
            `خطای کسری موجودی انبار: موجودی کالای «${target.name}» (${target.stockQty} عدد) کمتر از تعداد درخواستی (${line.qty} عدد) است.`
          );
          return;
        }
      }
    }

    let cogsAmount = newInv.cogsAmount;
    if (newInv.docstatus === 1) {
      cogsAmount = executeSalesInvoiceSubmission(newInv);
    }

    const savedInv: SalesInvoiceRecord = { ...newInv, cogsAmount };
    setSalesInvoices((prev) => [savedInv, ...prev]);

    appendAuditLog(
      'فاکتور فروش (Sales Invoice)',
      newInv.invoiceNo,
      newInv.docstatus === 1 ? 'ثبت قطعی فاکتور و سند دوبل + COGS' : 'ذخیره پیش‌نویس فاکتور',
      '۰ تومان',
      `${formatCurrency(newInv.totalAmount)} تومان`
    );
    triggerToast(
      newInv.docstatus === 1
        ? `فاکتور فروش ${newInv.invoiceNo} ثبت قطعی شد و سند درآمد + بهای تمام‌شده (COGS) در دفتر کل صادر گردید.`
        : `پیش‌نویس فاکتور فروش ${newInv.invoiceNo} ذخیره شد (بدون اثر در دفتر کل تا زمان ثبت قطعی).`
    );
  };

  const handleSubmitSalesInvoice = (id: string) => {
    const target = salesInvoices.find((s) => s.id === id);
    if (!target || target.docstatus !== 0) return;
    const cogs = executeSalesInvoiceSubmission({ ...target, docstatus: 1 });
    const nextStatus =
      target.paidAmount >= target.totalAmount
        ? 'پرداخت‌شده'
        : target.paidAmount > 0
        ? 'نیمه‌پرداخت (اقساطی)'
        : 'سررسید نشده';
    setSalesInvoices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, docstatus: 1, status: nextStatus, cogsAmount: cogs } : s
      )
    );
    triggerToast(`فاکتور فروش ${target.invoiceNo} ثبت قطعی (Submit) شد و در دفتر کل نشست.`);
  };

  const handleCancelSalesInvoice = (id: string) => {
    const target = salesInvoices.find((s) => s.id === id);
    if (!target || target.docstatus !== 1) return;

    if (target.updateStock && target.items.length > 0) {
      setInventoryItems((prev) =>
        prev.map((invItem) => {
          const line = target.items.find((l) => l.sku === invItem.sku);
          return line ? { ...invItem, stockQty: invItem.stockQty + line.qty } : invItem;
        })
      );
    }

    const unpaid = Math.max(0, target.totalAmount - target.paidAmount);
    const netRevenue = Math.max(0, target.totalAmount - target.taxAmount);
    const revLines: {
      accountCode: string;
      debit: number;
      credit: number;
      partyType?: GLEntryRecord['partyType'];
      partyName?: string;
      remarks: string;
    }[] = [
      { accountCode: '110101', debit: 0, credit: target.paidAmount, remarks: `معکوس دریافت ${target.invoiceNo}` },
      {
        accountCode: '1102',
        debit: 0,
        credit: unpaid,
        partyType: 'مشتری',
        partyName: target.customerName,
        remarks: `معکوس حساب دریافتنی ${target.invoiceNo}`,
      },
      { accountCode: '4101', debit: netRevenue, credit: 0, remarks: `معکوس فروش ${target.invoiceNo}` },
      { accountCode: '2102', debit: target.taxAmount, credit: 0, remarks: `معکوس مالیات ${target.invoiceNo}` },
    ];
    if (target.cogsAmount > 0) {
      revLines.push(
        { accountCode: '5101', debit: 0, credit: target.cogsAmount, remarks: `معکوس بهای تمام‌شده ${target.invoiceNo}` },
        { accountCode: '1104', debit: target.cogsAmount, credit: 0, remarks: `برگشت کالا به انبار ${target.invoiceNo}` }
      );
    }

    appendGLEntries(
      'Sales Invoice',
      `${target.invoiceNo}-REV`,
      '۱۴۰۴/۰۸/۰۲',
      target.branchDimension,
      'CC-HQ (دفتر مرکزی)',
      revLines
    );

    setSalesInvoices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, docstatus: 2, status: 'ابطال‌شده' } : s))
    );
    triggerToast(`فاکتور فروش ${target.invoiceNo} ابطال شد، سند معکوس در دفتر کل ثبت و کالا به انبار بازگردانده شد.`);
  };

  const handleCreateCreditNote = (id: string) => {
    const target = salesInvoices.find((s) => s.id === id);
    if (!target || target.docstatus !== 1) return;
    handleCancelSalesInvoice(id);
    const cnNo = `CN-${target.invoiceNo}`;
    const cnInv: SalesInvoiceRecord = {
      ...target,
      id: `cn-${Date.now()}`,
      invoiceNo: cnNo,
      docstatus: 1,
      status: 'مرجوعی (Credit Note)',
      isReturn: true,
      returnAgainst: target.invoiceNo,
      totalAmount: -target.totalAmount,
      paidAmount: -target.paidAmount,
      taxAmount: -target.taxAmount,
    };
    setSalesInvoices((prev) => [cnInv, ...prev]);
    triggerToast(`فاکتور برگشت از فروش (${cnNo}) صادر شد، کالا به انبار برگشت و حساب مشتری بستانکار گردید.`);
  };

  // 4. Purchase Invoice (Draft / Submit / Cancel / Debit Note) with Landed Cost Clearing (2104)
  const executePurchaseInvoiceSubmission = (pinv: PurchaseInvoiceRecord) => {
    if (pinv.items.length > 0) {
      const totalGoods = pinv.items.reduce((s, l) => s + l.netAmount, 0) || 1;
      setInventoryItems((prev) =>
        prev.map((item) => {
          const line = pinv.items.find((l) => l.sku === item.sku);
          if (!line) return item;
          const allocatedLanded = Math.round(
            pinv.landedCostAdded * (line.netAmount / totalGoods)
          );
          const effectiveUnitCost =
            line.unitPrice + Math.round(allocatedLanded / Math.max(1, line.qty));
          const mv = calculateMovingAverageValuation(
            item.stockQty,
            item.valuationRate,
            line.qty,
            effectiveUnitCost
          );
          return {
            ...item,
            stockQty: mv.newQty,
            valuationRate: mv.newValuationRate,
          };
        })
      );
    }

    const netGoodsAmount = Math.max(0, pinv.totalAmount - pinv.landedCostAdded);
    const glLines: {
      accountCode: string;
      debit: number;
      credit: number;
      partyType?: GLEntryRecord['partyType'];
      partyName?: string;
      remarks: string;
    }[] = [
      {
        accountCode: '1104',
        debit: pinv.totalAmount,
        credit: 0,
        remarks: `افزایش موجودی انبار بابت خرید ${pinv.billNo}`,
      },
      {
        accountCode: '2101',
        debit: 0,
        credit: netGoodsAmount,
        partyType: 'تامین‌کننده',
        partyName: pinv.supplierName,
        remarks: `بستانکاری تامین‌کننده بابت اصل کالا ${pinv.billNo}`,
      },
    ];
    if (pinv.landedCostAdded > 0) {
      glLines.push({
        accountCode: '2104',
        debit: 0,
        credit: pinv.landedCostAdded,
        remarks: `حساب واسط ترخیص، گمرک و حمل (Landed Cost) ${pinv.billNo}`,
      });
    }

    appendGLEntries(
      'Purchase Invoice',
      pinv.billNo,
      pinv.date,
      'انبار مرکزی کهریزک',
      'CC-WH (انبار مرکزی کهریزک)',
      glLines
    );
  };

  const handleCreatePurchaseInvoice = (newPinv: PurchaseInvoiceRecord) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: سال مالی بسته و قفل شده است؛ امکان ثبت فاکتور خرید وجود ندارد.');
      return;
    }
    setPurchaseInvoices((prev) => [newPinv, ...prev]);
    if (newPinv.docstatus === 1) {
      executePurchaseInvoiceSubmission(newPinv);
    }
    appendAuditLog(
      'فاکتور خرید (Purchase Invoice)',
      newPinv.billNo,
      newPinv.docstatus === 1 ? 'افزایش موجودی، میانگین موزون و سند دفتر کل' : 'ذخیره پیش‌نویس فاکتور خرید',
      newPinv.supplierName,
      `${formatCurrency(newPinv.totalAmount)} تومان`
    );
    triggerToast(
      newPinv.docstatus === 1
        ? `فاکتور خرید ${newPinv.billNo} ثبت قطعی شد، موجودی انبار به روش میانگین موزون به‌روز گردید و تفکیک حساب تامین‌کننده (2101) و گمرک (2104) در دفتر کل نشست.`
        : `پیش‌نویس فاکتور خرید ${newPinv.billNo} ذخیره شد.`
    );
  };

  const handleSubmitPurchaseInvoice = (id: string) => {
    const target = purchaseInvoices.find((p) => p.id === id);
    if (!target || target.docstatus !== 0) return;
    executePurchaseInvoiceSubmission({ ...target, docstatus: 1 });
    setPurchaseInvoices((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, docstatus: 1, status: 'تطبیق‌شده با رسید انبار (3-Way Matched)' }
          : p
      )
    );
    triggerToast(`فاکتور خرید ${target.billNo} ثبت قطعی شد و میانگین موزون انبار به‌روز گردید.`);
  };

  const handleCancelPurchaseInvoice = (id: string) => {
    const target = purchaseInvoices.find((p) => p.id === id);
    if (!target || target.docstatus !== 1) return;

    if (target.items.length > 0) {
      setInventoryItems((prev) =>
        prev.map((invItem) => {
          const line = target.items.find((l) => l.sku === invItem.sku);
          return line
            ? { ...invItem, stockQty: Math.max(0, invItem.stockQty - line.qty) }
            : invItem;
        })
      );
    }

    const netGoodsAmount = Math.max(0, target.totalAmount - target.landedCostAdded);
    const revLines: {
      accountCode: string;
      debit: number;
      credit: number;
      partyType?: GLEntryRecord['partyType'];
      partyName?: string;
      remarks: string;
    }[] = [
      { accountCode: '1104', debit: 0, credit: target.totalAmount, remarks: `معکوس موجودی انبار ${target.billNo}` },
      {
        accountCode: '2101',
        debit: netGoodsAmount,
        credit: 0,
        partyType: 'تامین‌کننده',
        partyName: target.supplierName,
        remarks: `معکوس حساب پرداختنی ${target.billNo}`,
      },
    ];
    if (target.landedCostAdded > 0) {
      revLines.push({
        accountCode: '2104',
        debit: target.landedCostAdded,
        credit: 0,
        remarks: `معکوس حساب واسط گمرک ${target.billNo}`,
      });
    }

    appendGLEntries(
      'Purchase Invoice',
      `${target.billNo}-REV`,
      '۱۴۰۴/۰۸/۰۲',
      'انبار مرکزی کهریزک',
      'CC-WH (انبار مرکزی کهریزک)',
      revLines
    );

    setPurchaseInvoices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, docstatus: 2, status: 'ابطال‌شده' } : p))
    );
    triggerToast(`فاکتور خرید ${target.billNo} ابطال شد و سند معکوس در دفتر کل صادر گردید.`);
  };

  const handleCreateDebitNote = (id: string) => {
    const target = purchaseInvoices.find((p) => p.id === id);
    if (!target || target.docstatus !== 1) return;
    handleCancelPurchaseInvoice(id);
    const dnNo = `DN-${target.billNo}`;
    const dnPinv: PurchaseInvoiceRecord = {
      ...target,
      id: `dn-${Date.now()}`,
      billNo: dnNo,
      docstatus: 1,
      status: 'برگشت از خرید (Debit Note)',
      isReturn: true,
      totalAmount: -target.totalAmount,
      paidAmount: -target.paidAmount,
    };
    setPurchaseInvoices((prev) => [dnPinv, ...prev]);
    triggerToast(`سند برگشت از خرید (${dnNo}) صادر شد و از موجودی انبار و بدهی تامین‌کننده کسر گردید.`);
  };

  // 5. Payment Entry (دریافت و پرداخت مستقل)
  const handleCreatePaymentEntry = (pe: PaymentEntryRecord) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: دوره مالی قفل شده است؛ امکان ثبت سند دریافت/پرداخت وجود ندارد.');
      return;
    }
    setPaymentEntries((prev) => [pe, ...prev]);

    if (pe.referenceVoucherNo) {
      if (pe.paymentType === 'دریافت از مشتری (Receive)') {
        setSalesInvoices((prev) =>
          prev.map((inv) => {
            if (inv.invoiceNo !== pe.referenceVoucherNo) return inv;
            const nextPaid = Math.min(inv.totalAmount, inv.paidAmount + pe.amount);
            const nextStatus =
              nextPaid >= inv.totalAmount ? 'پرداخت‌شده' : 'نیمه‌پرداخت (اقساطی)';
            return { ...inv, paidAmount: nextPaid, status: nextStatus };
          })
        );
      } else {
        setPurchaseInvoices((prev) =>
          prev.map((pinv) => {
            if (pinv.billNo !== pe.referenceVoucherNo) return pinv;
            const nextPaid = Math.min(pinv.totalAmount, pinv.paidAmount + pe.amount);
            return { ...pinv, paidAmount: nextPaid };
          })
        );
      }
    }

    if (pe.paymentType === 'دریافت از مشتری (Receive)') {
      appendGLEntries(
        'Payment Entry',
        pe.voucherNo,
        pe.postingDate,
        'دفتر مرکزی تهران',
        'CC-HQ (دفتر مرکزی)',
        [
          {
            accountCode: pe.bankAccountCode,
            debit: pe.amount,
            credit: 0,
            remarks: `دریافت وجه از ${pe.partyName} (${pe.modeOfPayment})`,
          },
          {
            accountCode: '1102',
            debit: 0,
            credit: pe.amount,
            partyType: 'مشتری',
            partyName: pe.partyName,
            remarks: `تسویه حساب دریافتنی ${pe.referenceVoucherNo || ''}`,
          },
        ]
      );
    } else {
      appendGLEntries(
        'Payment Entry',
        pe.voucherNo,
        pe.postingDate,
        'دفتر مرکزی تهران',
        'CC-HQ (دفتر مرکزی)',
        [
          {
            accountCode: '2101',
            debit: pe.amount,
            credit: 0,
            partyType: 'تامین‌کننده',
            partyName: pe.partyName,
            remarks: `تسویه حساب پرداختنی ${pe.referenceVoucherNo || ''}`,
          },
          {
            accountCode: pe.bankAccountCode,
            debit: 0,
            credit: pe.amount,
            remarks: `پرداخت وجه به ${pe.partyName} (${pe.modeOfPayment})`,
          },
        ]
      );
    }

    triggerToast(
      `سند ${pe.paymentType} به شماره ${pe.voucherNo} ثبت شد، مانده فاکتور تسویه و سند دوبل در دفتر کل صادر گردید.`
    );
  };

  // 6. Cheques, Budget, Assets
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
      appendGLEntries(
        'Payment Entry',
        `CHQ-${targetChq.sayadId.slice(-4)}`,
        '۱۴۰۴/۰۸/۰۲',
        'دفتر مرکزی تهران',
        'CC-HQ (دفتر مرکزی)',
        [
          {
            accountCode: '110101',
            debit: targetChq.amount,
            credit: 0,
            remarks: `وصول چک صیادی ${targetChq.sayadId}`,
          },
          {
            accountCode: '1103',
            debit: 0,
            credit: targetChq.amount,
            partyType: 'مشتری',
            partyName: targetChq.drawerOrPayee,
            remarks: `تسویه اسناد در جریان وصول چک ${targetChq.sayadId}`,
          },
        ]
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

  // 7. POS Sale with exact VAT + Dynamic Bundle Stock Deduction + COGS
  const handleCompletePosSale = (
    cartItems: { sku: string; name: string; qty: number; unitPrice: number }[],
    netTotal: number,
    exactTaxAmount: number,
    customerName: string
  ) => {
    if (fiscalYearLocked) {
      triggerToast('خطا: دوره مالی بسته و قفل شده است؛ امکان ثبت فیش صندوق وجود ندارد.');
      return;
    }

    const deduction = deductStockWithBundles(
      inventoryItems,
      cartItems.map((c) => ({ sku: c.sku, qty: c.qty }))
    );
    setInventoryItems(deduction.updatedItems);

    const netRev = Math.max(0, netTotal - exactTaxAmount);
    const posInvoiceNo = `POS-1404-${111 + salesInvoices.length}`;
    const newPosInv: SalesInvoiceRecord = {
      id: `pos-inv-${Date.now()}`,
      invoiceNo: posInvoiceNo,
      customerName,
      date: '۱۴۰۴/۰۸/۰۲',
      dueDate: '۱۴۰۴/۰۸/۰۲',
      branchDimension: 'شعبه الهیه',
      channelDimension: 'صندوق فروشگاهی POS',
      paymentTermsTemplate: 'تسویه آنی کارتخوان POS',
      updateStock: true,
      isSubscription: false,
      docstatus: 1,
      status: 'پرداخت‌شده',
      totalAmount: netTotal,
      paidAmount: netTotal,
      taxAmount: exactTaxAmount,
      cogsAmount: deduction.totalCogs,
      items: cartItems.map((c) => ({
        sku: c.sku,
        name: c.name,
        qty: c.qty,
        unitPrice: c.unitPrice,
        discountPercent: 0,
        netAmount: c.qty * c.unitPrice,
      })),
      itemsSummary: cartItems.map((c) => `${c.qty}× ${c.name}`).join(' + '),
    };
    setSalesInvoices((prev) => [newPosInv, ...prev]);

    const glLines: {
      accountCode: string;
      debit: number;
      credit: number;
      partyType?: GLEntryRecord['partyType'];
      partyName?: string;
      remarks: string;
    }[] = [
      { accountCode: '110102', debit: netTotal, credit: 0, remarks: `دریافت کارتخوان صندوق ${posInvoiceNo}` },
      { accountCode: '4101', debit: 0, credit: netRev, remarks: `درآمد فروش صندوق ${posInvoiceNo}` },
      { accountCode: '2102', debit: 0, credit: exactTaxAmount, remarks: `مالیات بر ارزش افزوده صندوق ${posInvoiceNo}` },
    ];
    if (deduction.totalCogs > 0) {
      glLines.push(
        { accountCode: '5101', debit: deduction.totalCogs, credit: 0, remarks: `بهای تمام‌شده (COGS) صندوق ${posInvoiceNo}` },
        { accountCode: '1104', debit: 0, credit: deduction.totalCogs, remarks: `کسر موجودی انبار صندوق ${posInvoiceNo}` }
      );
    }

    appendGLEntries(
      'POS Invoice',
      posInvoiceNo,
      '۱۴۰۴/۰۸/۰۲',
      'شعبه الهیه',
      'CC-ELH (شعبه الهیه)',
      glLines
    );
    triggerToast(`فیش صندوق ${posInvoiceNo} ثبت شد، موجودی انبار (همراه با اقلام باندل) و سند بهای تمام‌شده در دفتر کل نشست.`);
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
    const netAmount = item.retailPrice;
    const taxAmount = Math.round(netAmount * (DEFAULT_VAT_PERCENT / 100));
    const grandTotal = netAmount + taxAmount;
    handleCreateSalesInvoice({
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
      docstatus: 1,
      status: 'پرداخت‌شده',
      totalAmount: grandTotal,
      paidAmount: grandTotal,
      taxAmount,
      cogsAmount: item.valuationRate,
      items: [
        {
          sku: item.sku,
          name: item.name,
          qty: 1,
          unitPrice: item.retailPrice,
          discountPercent: 0,
          netAmount,
        },
      ],
      itemsSummary: `۱ ${item.uomPrimary} ${item.name}`,
    });
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
      glEntriesCount: glEntries.length,
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

  // Computed Real-time Executive Metrics (only submitted documents)
  const submittedSales = salesInvoices.filter((i) => i.docstatus === 1);
  const totalSalesRevenue = submittedSales.reduce((s, i) => s + i.totalAmount, 0);
  const totalReceivableBalance = submittedSales.reduce(
    (s, i) => s + Math.max(0, i.totalAmount - i.paidAmount),
    0
  );
  const totalInventoryValuation = inventoryItems.reduce(
    (s, i) => s + i.stockQty * i.valuationRate,
    0
  );
  const totalCashAndBank =
    accounts.find((a) => a.code === '1101')?.balance || 1420000000;

  // ERPNext Standard Sidebar Workspaces (No numbering prefixes)
  const sidebarItems: {
    id: ActiveModuleId;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'dashboard', label: 'میزکار (Home)', icon: LayoutGrid },
    { id: 'accounting', label: 'حسابداری (Accounting)', icon: Calculator },
    { id: 'selling_workspace', label: 'فروش (Selling)', icon: FileText },
    { id: 'buying_workspace', label: 'خرید (Buying)', icon: ShoppingCart },
    { id: 'inventory', label: 'انبار (Stock)', icon: Package },
    { id: 'selling_pos', label: 'صندوق فروشگاهی (POS)', icon: ShoppingBag },
    { id: 'crm', label: 'ارتباط با مشتری (CRM)', icon: Users },
    { id: 'support_webshop', label: 'پشتیبانی و وب‌شاپ', icon: Globe },
    { id: 'frappe_core', label: 'تنظیمات و ابزارها (Build)', icon: Sliders },
    { id: 'admin_enterprise', label: 'مدیریت سیستم و منابع انسانی', icon: ShieldAlert },
  ];

  const handleSelectWorkspace = (id: ActiveModuleId) => {
    setActiveModule(id);
    if (id === 'accounting') {
      setAccountingSubTab('coa');
    } else if (id === 'selling_workspace') {
      setAccountingSubTab('sales_invoice');
    } else if (id === 'buying_workspace') {
      setAccountingSubTab('purchase_invoice');
    }
  };

  const currentWorkspaceLabel =
    sidebarItems.find((s) => s.id === activeModule)?.label || 'میزکار';

  const allDocTypesCatalog = [
    { title: 'درخت حساب‌ها (Chart of Accounts)', mod: 'accounting' as ActiveModuleId, sub: 'coa' as AccountingSubTab, cat: 'حسابداری' },
    { title: 'دفتر کل و تراز آزمایشی ۶ ستونی (GL & Trial Balance)', mod: 'accounting' as ActiveModuleId, sub: 'gl_trial' as AccountingSubTab, cat: 'حسابداری' },
    { title: 'صورت سود و زیان و ترازنامه (Financial Statements)', mod: 'accounting' as ActiveModuleId, sub: 'statements' as AccountingSubTab, cat: 'حسابداری' },
    { title: 'سند حسابداری روزنامه (Journal Entry)', mod: 'accounting' as ActiveModuleId, sub: 'journal' as AccountingSubTab, cat: 'حسابداری' },
    { title: 'فاکتور فروش چندردیفه و اقساط (Sales Invoice)', mod: 'selling_workspace' as ActiveModuleId, sub: 'sales_invoice' as AccountingSubTab, cat: 'فروش' },
    { title: 'فاکتور خرید و میانگین موزون (Purchase Invoice)', mod: 'buying_workspace' as ActiveModuleId, sub: 'purchase_invoice' as AccountingSubTab, cat: 'خرید' },
    { title: 'دریافت و پرداخت و چک صیادی (Payment Entry)', mod: 'accounting' as ActiveModuleId, sub: 'payment_cheques' as AccountingSubTab, cat: 'خزانه‌داری' },
    { title: 'مراکز هزینه و بودجه (Cost Centers & Budget)', mod: 'accounting' as ActiveModuleId, sub: 'budget' as AccountingSubTab, cat: 'بودجه' },
    { title: 'دارایی‌های ثابت و استهلاک (Fixed Assets)', mod: 'accounting' as ActiveModuleId, sub: 'assets' as AccountingSubTab, cat: 'اموال' },
    { title: 'صندوق فروشگاهی لمسی و آفلاین (POS)', mod: 'selling_pos' as ActiveModuleId, cat: 'صندوق POS' },
    { title: 'سرنخ‌ها و فرصت‌های فروش (CRM Pipeline)', mod: 'crm' as ActiveModuleId, cat: 'CRM' },
    { title: 'کالاها، Multi-UOM و پکیج باندل (Stock Items)', mod: 'inventory' as ActiveModuleId, cat: 'انبار' },
    { title: 'سرشکن هزینه‌های گمرک و خرید (Landed Cost Voucher)', mod: 'inventory' as ActiveModuleId, cat: 'انبار' },
    { title: 'فروشگاه آنلاین یکپارچه و استعلام گارانتی', mod: 'support_webshop' as ActiveModuleId, cat: 'پشتیبانی و وب‌شاپ' },
    { title: 'فرم‌ساز و طراح گردش کار (Customize Form & Workflow)', mod: 'frappe_core' as ActiveModuleId, cat: 'تنظیمات و ابزارها' },
    { title: 'کنترل دسترسی نقش‌ها، حقوق و دستمزد و تولید (BOM)', mod: 'admin_enterprise' as ActiveModuleId, cat: 'مدیریت سیستم' },
  ];

  const filteredDocTypes = allDocTypesCatalog.filter(
    (d) => d.title.includes(commandSearch) || d.cat.includes(commandSearch)
  );

  const isAccountingView =
    activeModule === 'accounting' ||
    activeModule === 'selling_workspace' ||
    activeModule === 'buying_workspace';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900">
      {/* FRAPPE DESK STANDARD TOP HEADER (No duplicate module tabs) */}
      <header className="flex items-center justify-between gap-4 px-5 h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-30 no-print">
        {/* Right Zone: Brand Wordmark + Breadcrumb Path */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => handleSelectWorkspace('dashboard')}
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors shrink-0"
          >
            <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              ا
            </span>
            <span>امکان ERP</span>
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-xs font-medium text-slate-600 truncate">
            {currentWorkspaceLabel}
          </span>
        </div>

        {/* Center Zone: Frappe Awesomebar Command Search (Ctrl+K) */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block">
          <button
            type="button"
            onClick={() => setShowCommandModal(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>جستجو یا تایپ دستور در سامانه (Awesomebar)...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 border border-slate-200 rounded shadow-2xs shrink-0">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Left Zone: Fiscal Year Selector, Default Branch Selector & ERPNext Status */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCommandModal(true)}
            className="sm:hidden p-1.5 text-slate-600 bg-slate-100 rounded-lg"
            aria-label="جستجوی سریع"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              aria-label="انتخاب سال مالی فعال"
              value={activeFiscalYear}
              onChange={(e) => {
                setActiveFiscalYear(e.target.value);
                triggerToast(`سال مالی فعال روی «${e.target.value}» تنظیم شد.`);
              }}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="۱۴۰۴">سال مالی ۱۴۰۴</option>
              <option value="۱۴۰۳">سال مالی ۱۴۰۳ (بسته‌شده)</option>
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              aria-label="انتخاب شعبه پیش‌فرض"
              value={defaultBranch}
              onChange={(e) => {
                setDefaultBranch(e.target.value);
                triggerToast(`فیلتر شعبه پیش‌فرض روی «${e.target.value}» قرار گرفت.`);
              }}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="همه شعب">همه شعب</option>
              <option value="دفتر مرکزی تهران">دفتر مرکزی تهران</option>
              <option value="شعبه الهیه">شعبه الهیه</option>
              <option value="انبار مرکزی کهریزک">انبار مرکزی کهریزک</option>
              <option value="فروشگاه اینترنتی">فروشگاه اینترنتی</option>
            </select>
          </div>

          <div
            title="وضعیت اتصال هسته Frappe v15"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 rounded-lg text-[11px] font-mono"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>localhost:8080</span>
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 text-xs font-medium max-w-md"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workspace Body: ERPNext Desk Sidebar + Main Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto">
        {/* Clean ERPNext Sidebar */}
        <aside
          aria-label="منوی فضاهای کاری ERPNext"
          className="w-full lg:w-60 bg-white border-b lg:border-b-0 lg:border-l border-slate-200/80 px-3 py-4 shrink-0 no-print space-y-4"
        >
          {/* Role Switcher */}
          <div className="px-1 space-y-1">
            <label className="block text-[11px] text-slate-400">نقش کاربری فعال (RBAC)</label>
            <select
              aria-label="تغییر سطح دسترسی کاربر"
              value={activeRole}
              onChange={(e) => {
                const nextRole = e.target.value as SystemRole;
                setActiveRole(nextRole);
                triggerToast(`سطح دسترسی فعال به «${nextRole}» تغییر یافت.`);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none focus:border-slate-400"
            >
              <option value="ادمین کل (Super Admin)">ادمین کل (Super Admin)</option>
              <option value="مدیر مالی (Accounts Manager)">مدیر مالی (Accounts Manager)</option>
              <option value="سرپرست انبار (Stock Manager)">سرپرست انبار (Stock Manager)</option>
              <option value="صندوقدار POS">صندوقدار POS (محدود)</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="px-2 text-[11px] font-semibold text-slate-400 hidden lg:block">
              فضاهای کاری (Workspaces)
            </div>
            <div className="flex lg:flex-col gap-0.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-right text-xs transition-colors shrink-0 lg:w-full ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {activeModule === 'dashboard' && (
            <div className="space-y-8">
              {/* Minimalist Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    میزکار مالی و عملیاتی امکان
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    سال مالی {activeFiscalYear} · شعبه: {defaultBranch} · دسترسی فعال: {activeRole}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('selling_pos')}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                  >
                    صندوق فروشگاهی (POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace('accounting')}
                    className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
                  >
                    حسابداری و دفاتر کل
                  </button>
                </div>
              </div>

              {/* Clean 4-Column KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="text-xs text-slate-400">جمع فروش ثبت قطعی‌شده</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(totalSalesRevenue)}{' '}
                    <span className="text-xs font-normal text-slate-400">تومان</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {submittedSales.length} فاکتور قطعی · {glEntries.length} ردیف دفتر کل (GL)
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="text-xs text-slate-400">مانده حساب‌های دریافتنی</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(totalReceivableBalance)}{' '}
                    <span className="text-xs font-normal text-slate-400">تومان</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    مطالبات باز مشتریان و اقساط
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="text-xs text-slate-400">موجودی نقد و بانک</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(totalCashAndBank)}{' '}
                    <span className="text-xs font-normal text-slate-400">تومان</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    حساب‌های جاری و کارتخوان
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="text-xs text-slate-400">ارزش موجودی انبار</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {checkRolePermission(activeRole, 'view_buying_cost') ? (
                      <>
                        {formatCurrency(totalInventoryValuation)}{' '}
                        <span className="text-xs font-normal text-slate-400">تومان</span>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">مخفی (ویژه ادمین/مالی)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {inventoryItems.length} کد کالای فعال (میانگین موزون)
                  </div>
                </div>
              </div>

              {/* Minimalist Module Grid */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">ماژول‌های اصلی ERPNext</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[
                    {
                      id: 'accounting' as ActiveModuleId,
                      title: 'حسابداری و مدیریت مالی (Accounting)',
                      features: 'درخت حساب‌ها، تراز آزمایشی ۶ ستونی، دفتر کل (GL)، سند روزنامه و دریافت/پرداخت',
                      metric: `${accounts.length} سرفصل حساب`,
                    },
                    {
                      id: 'selling_workspace' as ActiveModuleId,
                      title: 'فروش و فاکتورها (Selling)',
                      features: 'فاکتور فروش چندردیفه، ثبت خودکار بهای تمام‌شده (COGS)، اقساط و برگشت از فروش',
                      metric: `${salesInvoices.length} سند فروش`,
                    },
                    {
                      id: 'buying_workspace' as ActiveModuleId,
                      title: 'تدارکات و خرید (Buying)',
                      features: 'فاکتور خرید چندردیفه، تفکیک حساب تامین‌کننده و گمرک (Landed Cost) و میانگین موزون',
                      metric: `${purchaseInvoices.length} سند خرید`,
                    },
                    {
                      id: 'inventory' as ActiveModuleId,
                      title: 'انبار و لجستیک (Stock & WMS)',
                      features: 'تنوع کالا، Multi-UOM، پکیج باندل پویا، ردیابی سریال/بچ و انبارگردانی',
                      metric: `${inventoryItems.length} کالای فعال`,
                    },
                    {
                      id: 'selling_pos' as ActiveModuleId,
                      title: 'صندوق فروشگاهی لمسی (Touch POS)',
                      features: 'صندوق آفلاین، چاپ فیش ۸cm، مالیات ۱۰٪ یکپارچه و کسر خودکار باندل',
                      metric: 'متصل به انبار و GL',
                    },
                    {
                      id: 'crm' as ActiveModuleId,
                      title: 'ارتباط با مشتری (CRM)',
                      features: 'قیف فروش، کمپین‌های بازاریابی، ارزش طول عمر مشتری و باشگاه وفاداری',
                      metric: `${crmLeads.length} پرونده فعال`,
                    },
                  ].map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectWorkspace(card.id)}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-400 transition-colors flex flex-col justify-between gap-4 text-right group"
                    >
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950">
                            {card.title}
                          </h3>
                          <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{card.features}</p>
                      </div>
                      <div className="flex items-center justify-between w-full pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                        <span className="font-mono">{card.metric}</span>
                        <span className="text-slate-700 font-medium">ورود ←</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimalist Monthly Trend Section */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      روند ماهانه فروش و سود خالص
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ارقام به میلیون تومان · سال مالی {activeFiscalYear}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded-md font-medium ${
                        chartType === 'bar' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      نمودار
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType('comparison')}
                      className={`px-3 py-1 rounded-md font-medium ${
                        chartType === 'comparison'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      جدول
                    </button>
                  </div>
                </div>

                {chartType === 'bar' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
                    {[
                      { month: 'فروردین', rev: 310, profit: 110, pct: 62 },
                      { month: 'اردیبهشت', rev: 365, profit: 132, pct: 73 },
                      { month: 'خرداد', rev: 410, profit: 155, pct: 82 },
                      { month: 'تیر', rev: 390, profit: 140, pct: 78 },
                      { month: 'مرداد', rev: 460, profit: 178, pct: 92 },
                      { month: 'آبان', rev: 495, profit: 194, pct: 99 },
                    ].map((m) => (
                      <div
                        key={m.month}
                        className="p-3 rounded-lg bg-slate-50/60 border border-slate-100 flex flex-col justify-between gap-2 text-xs"
                      >
                        <div className="font-medium text-slate-600">{m.month}</div>
                        <div className="h-20 flex items-end gap-1.5 pt-2">
                          <div
                            style={{ height: `${m.pct}%` }}
                            className="flex-1 bg-slate-800 rounded-t-sm"
                            title={`فروش: ${m.rev} میلیون`}
                          />
                          <div
                            style={{ height: `${Math.round(m.pct * 0.42)}%` }}
                            className="flex-1 bg-slate-300 rounded-t-sm"
                            title={`سود خالص: ${m.profit} میلیون`}
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 font-mono text-[11px] text-slate-500">
                          <span>{formatCurrency(m.rev)}M</span>
                          <span className="text-slate-900 font-semibold">
                            +{formatCurrency(m.profit)}M
                          </span>
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

          {isAccountingView && (
            <AccountingModule
              activeRole={activeRole}
              fiscalYearLocked={fiscalYearLocked}
              onToggleFiscalYearLock={() => setFiscalYearLocked((v) => !v)}
              defaultBranch={defaultBranch}
              initialSubTab={accountingSubTab}
              accounts={accounts}
              onAddAccount={handleAddAccount}
              glEntries={glEntries}
              journalEntries={journalEntries}
              onSaveJournalEntry={handleSaveJournalEntry}
              onSubmitJournalEntry={handleSubmitJournalEntry}
              onCancelJournalEntry={handleCancelJournalEntry}
              salesInvoices={salesInvoices}
              onCreateSalesInvoice={handleCreateSalesInvoice}
              onSubmitSalesInvoice={handleSubmitSalesInvoice}
              onCancelSalesInvoice={handleCancelSalesInvoice}
              onCreateCreditNote={handleCreateCreditNote}
              purchaseInvoices={purchaseInvoices}
              onCreatePurchaseInvoice={handleCreatePurchaseInvoice}
              onSubmitPurchaseInvoice={handleSubmitPurchaseInvoice}
              onCancelPurchaseInvoice={handleCancelPurchaseInvoice}
              onCreateDebitNote={handleCreateDebitNote}
              paymentEntries={paymentEntries}
              onCreatePaymentEntry={handleCreatePaymentEntry}
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

      {/* Global DocType Command Palette Modal (Awesomebar) */}
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
                بستن (Esc)
              </button>
            </div>
            <input
              type="text"
              autoFocus
              aria-label="جستجوی نام سند یا ماژول"
              placeholder="نام سند را بنویسید (مثلاً تراز آزمایشی، دفتر کل، فاکتور، چک، انبارگردانی)..."
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
                    if (dt.sub) setAccountingSubTab(dt.sub);
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
