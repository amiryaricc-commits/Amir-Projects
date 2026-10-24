import React, { useState, useEffect } from 'react';
import {
  Home,
  Calculator,
  ShoppingCart,
  Package,
  Store,
  Users,
  Globe,
  Settings,
  Search,
  CheckCircle2,
  Building2,
  Calendar,
  ChevronLeft,
  ArrowUpLeft,
} from 'lucide-react';

import {
  INITIAL_ACCOUNTS,
  INITIAL_GL_ENTRIES,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_PAYMENT_ENTRIES,
  INITIAL_CHEQUES,
  INITIAL_COST_CENTERS,
  INITIAL_FIXED_ASSETS,
  INITIAL_SHAREHOLDERS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_CRM_LEADS,
  INITIAL_AUDIT_LOGS,
  AccountNode,
  GLEntryRecord,
  SalesInvoiceRecord,
  PurchaseInvoiceRecord,
  JournalEntryRecord,
  PaymentEntryRecord,
  ChequeRecord,
  CostCenterRecord,
  FixedAssetRecord,
  ShareholderRecord,
  InventoryItemRecord,
  CrmLeadRecord,
  AuditLogRecord,
} from './data/erpSeedData';

import {
  SystemRole,
  formatCurrency,
  formatRoleName,
  calculateFinancialStatements,
  postDoubleEntryToAccounts,
  deductStockWithBundles,
  calculateMovingAverageValuation,
} from './utils/erpEngine';

import { AccountingModule, AccountingSubTab } from './components/AccountingModule';
import { SellingPosModule } from './components/SellingPosModule';
import { CrmMarketingModule } from './components/CrmMarketingModule';
import { InventoryWmsModule } from './components/InventoryWmsModule';
import { SupportWebshopModule } from './components/SupportWebshopModule';
import { FrappeCoreModule } from './components/FrappeCoreModule';

type WorkspaceId =
  | 'home'
  | 'accounting'
  | 'selling'
  | 'stock'
  | 'pos'
  | 'crm'
  | 'webshop'
  | 'settings';

export function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('home');
  const [accountingInitialTab, setAccountingInitialTab] = useState<AccountingSubTab>('coa');
  const [activeRole, setActiveRole] = useState<SystemRole>('ادمین کل (Super Admin)');
  const [activeFiscalYear, setActiveFiscalYear] = useState('سال مالی ۱۴۰۴');
  const [defaultBranch, setDefaultBranch] = useState('همه شعب سازمان');

  // Global Command Bar (Ctrl+K)
  const [showAwesomebar, setShowAwesomebar] = useState(false);
  const [awesomeQuery, setAwesomeQuery] = useState('');

  // Central Double-Entry & Perpetual Inventory State
  const [accounts, setAccounts] = useState<AccountNode[]>(INITIAL_ACCOUNTS);
  const [glEntries, setGlEntries] = useState<GLEntryRecord[]>(INITIAL_GL_ENTRIES);
  const [journalEntries, setJournalEntries] = useState<JournalEntryRecord[]>(
    INITIAL_JOURNAL_ENTRIES
  );
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceRecord[]>(INITIAL_SALES_INVOICES);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceRecord[]>(
    INITIAL_PURCHASE_INVOICES
  );
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntryRecord[]>(
    INITIAL_PAYMENT_ENTRIES
  );
  const [cheques, setCheques] = useState<ChequeRecord[]>(INITIAL_CHEQUES);
  const [costCenters, setCostCenters] = useState<CostCenterRecord[]>(INITIAL_COST_CENTERS);
  const [fixedAssets, setFixedAssets] = useState<FixedAssetRecord[]>(INITIAL_FIXED_ASSETS);
  const [shareholders] = useState<ShareholderRecord[]>(INITIAL_SHAREHOLDERS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemRecord[]>(
    INITIAL_INVENTORY_ITEMS
  );
  const [crmLeads, setCrmLeads] = useState<CrmLeadRecord[]>(INITIAL_CRM_LEADS);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(INITIAL_AUDIT_LOGS);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowAwesomebar((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowAwesomebar(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const appendAudit = (
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
        user: 'کاربر فعال',
        role: formatRoleName(activeRole),
        docType,
        docId,
        fieldChanged,
        oldValue,
        newValue,
      },
      ...prev,
    ]);
  };

  const appendGLEntries = (entries: Omit<GLEntryRecord, 'id'>[]) => {
    const withIds: GLEntryRecord[] = entries.map((e, i) => ({
      ...e,
      id: `gle-${Date.now()}-${i}`,
    }));
    setGlEntries((prev) => [...withIds, ...prev]);
  };

  // =========================================================================
  // 1. SALES INVOICE ENGINE (Draft / Submit / Cancel / Credit Note — NO TAX)
  // =========================================================================
  const postSalesInvoiceGLAndStock = (inv: SalesInvoiceRecord, isReverse = false) => {
    const sign = isReverse ? -1 : 1;

    let cogsAmount = inv.cogsAmount || 0;
    if (inv.updateStock) {
      if (!isReverse) {
        const soldLines =
          inv.lines && inv.lines.length > 0
            ? inv.lines.map((l) => ({ sku: l.sku, qty: l.qty }))
            : [{ sku: inventoryItems[0].sku, qty: 1 }];

        const deduction = deductStockWithBundles(inventoryItems, soldLines);
        if (deduction.insufficientStockError) {
          showToast(deduction.insufficientStockError);
          return false;
        }
        setInventoryItems(deduction.updatedInventory);
        cogsAmount = deduction.totalCogs || cogsAmount;
      } else {
        const soldLines =
          inv.lines && inv.lines.length > 0
            ? inv.lines.map((l) => ({ sku: l.sku, qty: l.qty }))
            : [{ sku: inventoryItems[0].sku, qty: 1 }];
        setInventoryItems((prev) =>
          prev.map((item) => {
            const match = soldLines.find((s) => s.sku === item.sku);
            if (!match) return item;
            return { ...item, stockQty: item.stockQty + match.qty };
          })
        );
      }
    }

    const netRevenue = inv.totalAmount;
    const unpaid = Math.max(0, inv.totalAmount - inv.paidAmount);

    const doubleEntryLines: { accountCode: string; debit: number; credit: number }[] = [
      {
        accountCode: '4101',
        debit: isReverse ? netRevenue : 0,
        credit: isReverse ? 0 : netRevenue,
      },
    ];

    if (inv.paidAmount > 0) {
      doubleEntryLines.push({
        accountCode: '110101',
        debit: isReverse ? 0 : inv.paidAmount,
        credit: isReverse ? inv.paidAmount : 0,
      });
    }
    if (unpaid > 0) {
      doubleEntryLines.push({
        accountCode: '1102',
        debit: isReverse ? 0 : unpaid,
        credit: isReverse ? unpaid : 0,
      });
    }
    if (inv.updateStock && cogsAmount > 0) {
      doubleEntryLines.push(
        {
          accountCode: '5101',
          debit: isReverse ? 0 : cogsAmount,
          credit: isReverse ? cogsAmount : 0,
        },
        {
          accountCode: '1104',
          debit: isReverse ? cogsAmount : 0,
          credit: isReverse ? 0 : cogsAmount,
        }
      );
    }

    setAccounts((prev) => postDoubleEntryToAccounts(prev, doubleEntryLines));

    const byCode = new Map<string, AccountNode>(accounts.map((a) => [a.code, a]));
    appendGLEntries(
      doubleEntryLines.map((l) => ({
        postingDate: inv.date,
        accountCode: l.accountCode,
        accountName: byCode.get(l.accountCode)?.name || l.accountCode,
        partyType: 'مشتری',
        partyName: inv.customerName,
        debit: l.debit,
        credit: l.credit,
        voucherType: 'Sales Invoice',
        voucherNo: inv.invoiceNo,
        costCenter: inv.costCenter || 'فروشگاه و شوروم شعبه الهیه',
        branchDimension: inv.branchDimension,
        remarks: isReverse
          ? `سند معکوس ابطال/برگشت فاکتور ${inv.invoiceNo}`
          : `ثبت قطعی فاکتور فروش ${inv.invoiceNo}`,
        isCancelled: isReverse,
      }))
    );

    if (inv.costCenter) {
      setCostCenters((prev) =>
        prev.map((cc) =>
          cc.name === inv.costCenter
            ? { ...cc, revenueGenerated: Math.max(0, cc.revenueGenerated + sign * netRevenue) }
            : cc
        )
      );
    }

    return true;
  };

  const handleCreateSalesInvoice = (newInv: SalesInvoiceRecord) => {
    if (newInv.docstatus === 1) {
      const ok = postSalesInvoiceGLAndStock(newInv, false);
      if (!ok) return;
    }
    setSalesInvoices((prev) => [newInv, ...prev]);
    appendAudit(
      'فاکتور فروش',
      newInv.invoiceNo,
      'وضعیت سند',
      '—',
      newInv.docstatus === 1 ? 'ثبت قطعی' : 'پیش‌نویس'
    );
    showToast(
      newInv.docstatus === 1
        ? `فاکتور فروش ${newInv.invoiceNo} ثبت قطعی شد و اسناد درآمد و بهای تمام‌شده در دفتر کل صادر گردید.`
        : `فاکتور فروش ${newInv.invoiceNo} به صورت پیش‌نویس ذخیره شد.`
    );
  };

  const handleSubmitSalesInvoice = (id: string) => {
    const target = salesInvoices.find((s) => s.id === id);
    if (!target || target.docstatus !== 0) return;
    const submittedInv: SalesInvoiceRecord = {
      ...target,
      docstatus: 1,
      status: target.paidAmount >= target.totalAmount ? 'پرداخت‌شده' : 'اقساطی فعال',
    };
    const ok = postSalesInvoiceGLAndStock(submittedInv, false);
    if (!ok) return;
    setSalesInvoices((prev) => prev.map((s) => (s.id === id ? submittedInv : s)));
    appendAudit('فاکتور فروش', target.invoiceNo, 'وضعیت سند', 'پیش‌نویس', 'ثبت قطعی');
    showToast(`فاکتور ${target.invoiceNo} از پیش‌نویس به ثبت قطعی تغییر یافت و در دفتر کل ثبت شد.`);
  };

  const handleCancelSalesInvoice = (id: string) => {
    const target = salesInvoices.find((s) => s.id === id);
    if (!target || target.docstatus !== 1) return;
    postSalesInvoiceGLAndStock(target, true);
    setSalesInvoices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, docstatus: 2, status: 'ابطال‌شده' } : s))
    );
    appendAudit('فاکتور فروش', target.invoiceNo, 'وضعیت سند', 'ثبت قطعی', 'ابطال‌شده');
    showToast(`فاکتور ${target.invoiceNo} ابطال شد و سند معکوس در دفتر کل و انبار صادر گردید.`);
  };

  const handleCreateCreditNote = (id: string) => {
    const orig = salesInvoices.find((s) => s.id === id);
    if (!orig || orig.docstatus !== 1) return;
    postSalesInvoiceGLAndStock(orig, true);
    const cn: SalesInvoiceRecord = {
      ...orig,
      id: `cn-${Date.now()}`,
      invoiceNo: `CN-1404-00${13 + salesInvoices.length}`,
      docstatus: 1,
      status: 'مرجوعی (یادداشت بستانکاری)',
      itemsSummary: `برگشت از فروش عطف به ${orig.invoiceNo} (${orig.itemsSummary})`,
    };
    setSalesInvoices((prev) => [cn, ...prev]);
    showToast(`یادداشت بستانکاری ${cn.invoiceNo} صادر شد و کالا به انبار بازگشت.`);
  };

  // =========================================================================
  // 2. PURCHASE INVOICE ENGINE (Multi-Line + Landed Cost 2104 + Moving Avg)
  // =========================================================================
  const postPurchaseInvoiceGLAndStock = (pinv: PurchaseInvoiceRecord, isReverse = false) => {
    const supplierNet = Math.max(0, pinv.totalAmount - pinv.landedCostAdded);

    const lines: { accountCode: string; debit: number; credit: number }[] = [
      {
        accountCode: '1104',
        debit: isReverse ? 0 : pinv.totalAmount,
        credit: isReverse ? pinv.totalAmount : 0,
      },
      {
        accountCode: '2101',
        debit: isReverse ? supplierNet : 0,
        credit: isReverse ? 0 : supplierNet,
      },
    ];

    if (pinv.landedCostAdded > 0) {
      lines.push({
        accountCode: '2104',
        debit: isReverse ? pinv.landedCostAdded : 0,
        credit: isReverse ? 0 : pinv.landedCostAdded,
      });
    }

    setAccounts((prev) => postDoubleEntryToAccounts(prev, lines));

    const byCode = new Map<string, AccountNode>(accounts.map((a) => [a.code, a]));
    appendGLEntries(
      lines.map((l) => ({
        postingDate: pinv.date,
        accountCode: l.accountCode,
        accountName: byCode.get(l.accountCode)?.name || l.accountCode,
        partyType: 'تامین‌کننده',
        partyName: l.accountCode === '2104' ? 'گمرک و ترخیص‌کار رسمی' : pinv.supplierName,
        debit: l.debit,
        credit: l.credit,
        voucherType: 'Purchase Invoice',
        voucherNo: pinv.billNo,
        costCenter: pinv.costCenter || 'انبار مرکزی و لجستیک کهریزک',
        branchDimension: pinv.branchDimension || 'انبار مرکزی کهریزک',
        remarks: isReverse
          ? `سند معکوس ابطال/برگشت خرید ${pinv.billNo}`
          : `ورود کالا به انبار و ثبت تعهد خرید ${pinv.billNo}`,
        isCancelled: isReverse,
      }))
    );

    if (pinv.lines && pinv.lines.length > 0) {
      const totalGoodsNet = pinv.lines.reduce((s, l) => s + l.netLineAmount, 0) || 1;
      setInventoryItems((prev) =>
        prev.map((item) => {
          const pl = pinv.lines?.find((l) => l.sku === item.sku);
          if (!pl) return item;
          if (isReverse) {
            return { ...item, stockQty: Math.max(0, item.stockQty - pl.qty) };
          }
          const shareOfLanded = Math.round(
            pinv.landedCostAdded * (pl.netLineAmount / totalGoodsNet)
          );
          const effectiveIncomingUnitRate = Math.round(
            (pl.netLineAmount + shareOfLanded) / Math.max(1, pl.qty)
          );
          const mov = calculateMovingAverageValuation(
            item.stockQty,
            item.valuationRate,
            pl.qty,
            effectiveIncomingUnitRate
          );
          return {
            ...item,
            stockQty: mov.newQty,
            valuationRate: mov.newValuationRate,
          };
        })
      );
    }
  };

  const handleCreatePurchaseInvoice = (newPinv: PurchaseInvoiceRecord) => {
    if (newPinv.docstatus === 1) {
      postPurchaseInvoiceGLAndStock(newPinv, false);
    }
    setPurchaseInvoices((prev) => [newPinv, ...prev]);
    appendAudit(
      'فاکتور خرید',
      newPinv.billNo,
      'مبلغ کل خرید',
      '۰ تومان',
      `${formatCurrency(newPinv.totalAmount)} تومان`
    );
    showToast(
      newPinv.docstatus === 1
        ? `فاکتور خرید ${newPinv.billNo} ثبت قطعی شد؛ موجودی انبار (۱۱۰۴)، حساب تامین‌کننده (۲۱۰۱) و گمرک (۲۱۰۴) به‌روز شدند.`
        : `فاکتور خرید ${newPinv.billNo} به صورت پیش‌نویس ذخیره شد.`
    );
  };

  const handleSubmitPurchaseInvoice = (id: string) => {
    const target = purchaseInvoices.find((p) => p.id === id);
    if (!target || target.docstatus !== 0) return;
    const submitted: PurchaseInvoiceRecord = {
      ...target,
      docstatus: 1,
      status: 'بدهکار باز',
    };
    postPurchaseInvoiceGLAndStock(submitted, false);
    setPurchaseInvoices((prev) => prev.map((p) => (p.id === id ? submitted : p)));
    showToast(`فاکتور خرید ${target.billNo} ثبت قطعی شد و به انبار و دفتر کل منتقل گردید.`);
  };

  const handleCancelPurchaseInvoice = (id: string) => {
    const target = purchaseInvoices.find((p) => p.id === id);
    if (!target || target.docstatus !== 1) return;
    postPurchaseInvoiceGLAndStock(target, true);
    setPurchaseInvoices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, docstatus: 2, status: 'ابطال‌شده' } : p))
    );
    showToast(`فاکتور خرید ${target.billNo} ابطال شد و سند معکوس صادر گردید.`);
  };

  const handleCreateDebitNote = (id: string) => {
    const orig = purchaseInvoices.find((p) => p.id === id);
    if (!orig || orig.docstatus !== 1) return;
    postPurchaseInvoiceGLAndStock(orig, true);
    const dn: PurchaseInvoiceRecord = {
      ...orig,
      id: `dn-${Date.now()}`,
      billNo: `DN-1404-00${10 + purchaseInvoices.length}`,
      docstatus: 1,
      status: 'برگشت از خرید (یادداشت بدهکاری)',
      itemsSummary: `برگشت از خرید عطف به ${orig.billNo}`,
    };
    setPurchaseInvoices((prev) => [dn, ...prev]);
    showToast(`یادداشت بدهکاری (برگشت از خرید) ${dn.billNo} ثبت شد.`);
  };

  // =========================================================================
  // 3. JOURNAL ENTRY ENGINE (Draft / Submit / Cancel + Cost Center Spend)
  // =========================================================================
  const postJournalGL = (je: JournalEntryRecord, isReverse = false) => {
    const lines = je.lines.map((l) => ({
      accountCode: l.accountCode,
      debit: isReverse ? l.credit : l.debit,
      credit: isReverse ? l.debit : l.credit,
    }));
    setAccounts((prev) => postDoubleEntryToAccounts(prev, lines));

    appendGLEntries(
      je.lines.map((l) => ({
        postingDate: je.postingDate,
        accountCode: l.accountCode,
        accountName: l.accountName,
        partyType: l.partyType || '—',
        partyName: l.partyName || '—',
        debit: isReverse ? l.credit : l.debit,
        credit: isReverse ? l.debit : l.credit,
        voucherType: 'Journal Entry',
        voucherNo: je.voucherNo,
        costCenter: l.costCenter || 'فروشگاه و شوروم شعبه الهیه',
        branchDimension: l.dimensionBranch || je.branchDimension,
        remarks: isReverse ? `ابطال سند روزنامه: ${je.title}` : l.note || je.title,
        isCancelled: isReverse,
      }))
    );

    const sign = isReverse ? -1 : 1;
    setCostCenters((prev) =>
      prev.map((cc) => {
        const ccExpenseDelta = je.lines
          .filter((l) => l.costCenter === cc.name && l.accountCode.startsWith('5'))
          .reduce((s, l) => s + (l.debit - l.credit), 0);
        const ccRevDelta = je.lines
          .filter((l) => l.costCenter === cc.name && l.accountCode.startsWith('4'))
          .reduce((s, l) => s + (l.credit - l.debit), 0);
        return {
          ...cc,
          spentAmount: Math.max(0, cc.spentAmount + sign * ccExpenseDelta),
          revenueGenerated: Math.max(0, cc.revenueGenerated + sign * ccRevDelta),
        };
      })
    );
  };

  const handleSaveJournalEntry = (je: JournalEntryRecord) => {
    if (je.docstatus === 1) {
      postJournalGL(je, false);
    }
    setJournalEntries((prev) => [je, ...prev]);
    appendAudit(
      'سند روزنامه',
      je.voucherNo,
      'ثبت سند',
      '—',
      `${je.docstatus === 1 ? 'ثبت قطعی' : 'پیش‌نویس'} (${formatCurrency(je.totalDebit)} تومان)`
    );
    showToast(
      je.docstatus === 1
        ? `سند روزنامه ${je.voucherNo} در دفتر کل ثبت قطعی شد و مراکز هزینه به‌روز گردیدند.`
        : `سند روزنامه ${je.voucherNo} به صورت پیش‌نویس ذخیره شد.`
    );
  };

  const handleSubmitJournalEntry = (id: string) => {
    const target = journalEntries.find((j) => j.id === id);
    if (!target || target.docstatus !== 0) return;
    const submitted: JournalEntryRecord = { ...target, docstatus: 1 };
    postJournalGL(submitted, false);
    setJournalEntries((prev) => prev.map((j) => (j.id === id ? submitted : j)));
    showToast(`سند روزنامه ${target.voucherNo} ثبت قطعی شد.`);
  };

  const handleCancelJournalEntry = (id: string) => {
    const target = journalEntries.find((j) => j.id === id);
    if (!target || target.docstatus !== 1) return;
    postJournalGL(target, true);
    setJournalEntries((prev) =>
      prev.map((j) => (j.id === id ? { ...j, docstatus: 2 } : j))
    );
    showToast(`سند روزنامه ${target.voucherNo} ابطال شد و آرتیکل معکوس در دفتر کل صادر گردید.`);
  };

  // =========================================================================
  // 4. PAYMENT ENTRY & CHEQUE CLEARANCE ENGINE
  // =========================================================================
  const handleCreatePaymentEntry = (pe: PaymentEntryRecord) => {
    setPaymentEntries((prev) => [pe, ...prev]);

    const isReceive = pe.paymentType === 'دریافت از مشتری (Receive)';
    const lines = isReceive
      ? [
          { accountCode: pe.bankAccountCode, debit: pe.amount, credit: 0 },
          { accountCode: '1102', debit: 0, credit: pe.amount },
        ]
      : [
          { accountCode: '2101', debit: pe.amount, credit: 0 },
          { accountCode: pe.bankAccountCode, debit: 0, credit: pe.amount },
        ];

    setAccounts((prev) => postDoubleEntryToAccounts(prev, lines));

    const byCode = new Map<string, AccountNode>(accounts.map((a) => [a.code, a]));
    appendGLEntries(
      lines.map((l) => ({
        postingDate: pe.postingDate,
        accountCode: l.accountCode,
        accountName: byCode.get(l.accountCode)?.name || l.accountCode,
        partyType: isReceive ? 'مشتری' : 'تامین‌کننده',
        partyName: pe.partyName,
        debit: l.debit,
        credit: l.credit,
        voucherType: 'Payment Entry',
        voucherNo: pe.paymentNo,
        costCenter: pe.costCenter,
        branchDimension: pe.branchDimension,
        remarks: `تسویه فاکتور ${pe.referenceVoucherNo} از طریق ${pe.modeOfPayment}`,
      }))
    );

    if (isReceive) {
      setSalesInvoices((prev) =>
        prev.map((s) => {
          if (s.invoiceNo !== pe.referenceVoucherNo) return s;
          const nextPaid = Math.min(s.totalAmount, s.paidAmount + pe.amount);
          return {
            ...s,
            paidAmount: nextPaid,
            status: nextPaid >= s.totalAmount ? 'پرداخت‌شده' : s.status,
          };
        })
      );
    } else {
      setPurchaseInvoices((prev) =>
        prev.map((p) => {
          if (p.billNo !== pe.referenceVoucherNo) return p;
          const nextPaid = Math.min(p.totalAmount, (p.paidAmount || 0) + pe.amount);
          return {
            ...p,
            paidAmount: nextPaid,
            status: nextPaid >= p.totalAmount ? 'تسویه‌شده' : p.status,
          };
        })
      );
    }

    showToast(
      `سند خزانه ${pe.paymentNo} ثبت شد و مانده فاکتور ${pe.referenceVoucherNo} کاهش یافت.`
    );
  };

  const handleClearCheque = (id: string) => {
    const target = cheques.find((c) => c.id === id);
    if (!target || target.status !== 'در جریان وصول') return;

    setCheques((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'وصول‌شده (پاس‌شده)', clearanceDate: '۱۴۰۴/۰۸/۰۲' } : c
      )
    );

    const lines =
      target.type === 'دریافتنی از مشتری'
        ? [
            { accountCode: '110101', debit: target.amount, credit: 0 },
            { accountCode: '1103', debit: 0, credit: target.amount },
          ]
        : [
            { accountCode: '2101', debit: target.amount, credit: 0 },
            { accountCode: '110101', debit: 0, credit: target.amount },
          ];

    setAccounts((prev) => postDoubleEntryToAccounts(prev, lines));
    showToast(`چک صیادی ${target.sayadiNo} پاس شد و سند انتقال به بانک ملت در دفتر کل ثبت گردید.`);
  };

  // =========================================================================
  // 5. POS & WEBSHOP CHECKOUT HANDLERS (NO TAX)
  // =========================================================================
  const handleCompletePosSale = (
    cartItems: { sku: string; name: string; qty: number; unitPrice: number }[],
    netTotal: number,
    customerName: string
  ) => {
    const deduction = deductStockWithBundles(
      inventoryItems,
      cartItems.map((c) => ({ sku: c.sku, qty: c.qty }))
    );
    if (deduction.insufficientStockError) {
      showToast(deduction.insufficientStockError);
      return;
    }
    setInventoryItems(deduction.updatedInventory);

    const cogs = deduction.totalCogs;
    const invoiceNo = `POS-1404-0${210 + salesInvoices.length}`;

    const newPosInv: SalesInvoiceRecord = {
      id: `pos-${Date.now()}`,
      invoiceNo,
      docstatus: 1,
      customerName,
      date: '۱۴۰۴/۰۸/۰۲',
      dueDate: '۱۴۰۴/۰۸/۰۲',
      branchDimension: 'شعبه الهیه',
      costCenter: 'فروشگاه و شوروم شعبه الهیه',
      channelDimension: 'صندوق فروشگاهی',
      paymentTermsTemplate: 'تسویه آنی کارتخوان',
      updateStock: true,
      isSubscription: false,
      status: 'پرداخت‌شده',
      totalAmount: netTotal,
      paidAmount: netTotal,
      cogsAmount: cogs,
      itemsSummary: cartItems.map((c) => `${c.qty}× ${c.name}`).join(' + '),
    };

    setSalesInvoices((prev) => [newPosInv, ...prev]);

    const glLines = [
      { accountCode: '110102', debit: netTotal, credit: 0 },
      { accountCode: '4101', debit: 0, credit: netTotal },
      { accountCode: '5101', debit: cogs, credit: 0 },
      { accountCode: '1104', debit: 0, credit: cogs },
    ];
    setAccounts((prev) => postDoubleEntryToAccounts(prev, glLines));

    showToast(
      `فیش صندوق ${invoiceNo} ثبت شد؛ موجودی اجزای باندل کسر و سند بهای تمام‌شده صادر گردید.`
    );
  };

  const handleWebshopOrderCheckout = (item: InventoryItemRecord) => {
    handleCompletePosSale(
      [{ sku: item.sku, name: item.name, qty: 1, unitPrice: item.retailPrice }],
      item.retailPrice,
      'مشتری آنلاین وب‌شاپ'
    );
  };

  // =========================================================================
  // NAVIGATION & FRAPPE DESK WORKSPACE DEFINITIONS (PRUNED)
  // =========================================================================
  const sidebarWorkspaces: {
    id: WorkspaceId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'میزکار', icon: Home },
    { id: 'accounting', label: 'حسابداری', icon: Calculator },
    { id: 'selling', label: 'فروش', icon: ShoppingCart },
    { id: 'pos', label: 'صندوق فروشگاهی', icon: Store },
    { id: 'crm', label: 'ارتباط با مشتری', icon: Users },
    { id: 'stock', label: 'انبار و کالا', icon: Package },
    { id: 'webshop', label: 'وبسایت و فروشگاه اینترنتی', icon: Globe },
    { id: 'settings', label: 'تنظیمات و هسته سیستم', icon: Settings },
  ];

  const openWorkspaceWithTab = (ws: WorkspaceId, accTab?: AccountingSubTab) => {
    if (accTab) {
      setAccountingInitialTab(accTab);
    }
    setActiveWorkspace(ws);
    setShowAwesomebar(false);
  };

  const awesomebarCommands = [
    { title: 'صدور فاکتور فروش چندردیفه جدید', category: 'فروش و حسابداری', action: () => openWorkspaceWithTab('accounting', 'sales_invoice') },
    { title: 'ثبت فاکتور خرید و هزینه گمرک (حساب ۲۱۰۴)', category: 'خرید و حسابداری', action: () => openWorkspaceWithTab('accounting', 'purchase_invoice') },
    { title: 'ثبت سند روزنامه دوبل', category: 'حسابداری', action: () => openWorkspaceWithTab('accounting', 'journal') },
    { title: 'مشاهده تراز آزمایشی ۶ ستونی و دفتر کل', category: 'گزارش‌های مالی', action: () => openWorkspaceWithTab('accounting', 'gl_trial') },
    { title: 'درخت حساب‌ها', category: 'حسابداری', action: () => openWorkspaceWithTab('accounting', 'coa') },
    { title: 'خزانه‌داری، چک صیادی و تسعیر ارز', category: 'خزانه‌داری', action: () => openWorkspaceWithTab('accounting', 'payment_cheques') },
    { title: 'باز کردن صندوق فروشگاهی لمسی', category: 'فروش حضوری', action: () => openWorkspaceWithTab('pos') },
    { title: 'انبار، کاردکس کالا و درخواست شارژ کالا', category: 'انبار و کالا', action: () => openWorkspaceWithTab('stock') },
    { title: 'قیف سرنخ‌ها و فرصت‌های فروش', category: 'ارتباط با مشتری', action: () => openWorkspaceWithTab('crm') },
    { title: 'فروشگاه اینترنتی و پورتال مشتریان', category: 'وبسایت و فروشگاه اینترنتی', action: () => openWorkspaceWithTab('webshop') },
    { title: 'تنظیمات هسته، گزارش‌ساز، اکسل و دسترسی‌ها', category: 'تنظیمات سیستم', action: () => openWorkspaceWithTab('settings') },
  ];

  const filteredCommands = awesomebarCommands.filter(
    (c) =>
      c.title.includes(awesomeQuery) ||
      c.category.includes(awesomeQuery)
  );

  const finSummary = calculateFinancialStatements(accounts);
  const currentWorkspaceObj =
    sidebarWorkspaces.find((w) => w.id === activeWorkspace) || sidebarWorkspaces[0];

  const handleExportFullDatabase = () => {
    const dataStr = JSON.stringify(
      {
        company: 'سامانه جامع برنامه‌ریزی منابع سازمانی امکان',
        fiscalYear: activeFiscalYear,
        accounts,
        glEntries,
        salesInvoices,
        purchaseInvoices,
        inventoryItems,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emkan-erp-backup-1404.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('نسخه پشتیبان کامل پایگاه داده با موفقیت دانلود شد.');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Right: Brand + Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveWorkspace('home')}
            className="flex items-center gap-2.5 text-right group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base">
              ا
            </div>
            <span className="text-base font-bold text-slate-900 whitespace-nowrap">
              امکان
            </span>
          </button>

          <ChevronLeft className="w-4 h-4 text-slate-300 hidden sm:block" />

          <span className="text-sm font-semibold text-slate-700 hidden sm:inline-block whitespace-nowrap">
            {currentWorkspaceObj.label}
          </span>
        </div>

        {/* Center: Command Search Bar (Ctrl+K) */}
        <div className="flex-1 max-w-md">
          <button
            type="button"
            onClick={() => setShowAwesomebar(true)}
            className="w-full px-3.5 py-2 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-lg flex items-center justify-between transition-colors"
          >
            <span className="inline-flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span>جستجو در بخش‌ها، اسناد و گزارش‌ها...</span>
            </span>
            <kbd className="px-2 py-0.5 text-[11px] font-medium bg-white text-slate-600 rounded border border-slate-200 shrink-0">
              جستجو
            </kbd>
          </button>
        </div>

        {/* Left: Fiscal Year, Branch Selector & Role Selector */}
        <div className="flex items-center gap-2.5 text-xs shrink-0">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              aria-label="انتخاب سال مالی"
              value={activeFiscalYear}
              onChange={(e) => setActiveFiscalYear(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="سال مالی ۱۴۰۴">سال مالی ۱۴۰۴</option>
              <option value="سال مالی ۱۴۰۳">سال مالی ۱۴۰۳</option>
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              aria-label="انتخاب شعبه فعال"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="همه شعب سازمان">همه شعب سازمان</option>
              <option value="شعبه مرکزی تهران">شعبه مرکزی تهران</option>
              <option value="شعبه الهیه">شعبه الهیه</option>
              <option value="انبار مرکزی کهریزک">انبار مرکزی کهریزک</option>
            </select>
          </div>

          <select
            aria-label="انتخاب نقش کاربری"
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as SystemRole)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg focus:outline-none"
          >
            <option value="ادمین کل (Super Admin)">نقش: مدیر کل سامانه</option>
            <option value="مدیر مالی (Accounts Manager)">نقش: مدیر مالی</option>
            <option value="سرپرست انبار (Stock Manager)">نقش: سرپرست انبار</option>
            <option value="صندوقدار POS">نقش: صندوقدار</option>
          </select>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex gap-6 p-4 lg:p-6 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col gap-1.5 bg-white p-3.5 rounded-xl border border-slate-200/90 sticky top-22">
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
            بخش‌های سامانه
          </div>
          {sidebarWorkspaces.map((ws) => {
            const Icon = ws.icon;
            const isActive = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  if (ws.id === 'selling') {
                    openWorkspaceWithTab('selling', 'sales_invoice');
                  } else if (ws.id === 'accounting') {
                    openWorkspaceWithTab('accounting', 'coa');
                  } else {
                    setActiveWorkspace(ws.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 font-medium hover:bg-slate-100'
                }`}
              >
                <span className="inline-flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{ws.label}</span>
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main Workspace Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Mobile Quick Switcher */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-1">
            {sidebarWorkspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => setActiveWorkspace(ws.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 ${
                  activeWorkspace === ws.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {ws.label}
              </button>
            ))}
          </div>

          {/* WORKSPACE 1: HOME DASHBOARD */}
          {activeWorkspace === 'home' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-lg font-bold text-slate-900">
                    میزکار مدیریتی سازمان
                  </h1>
                  <p className="text-sm text-slate-500">
                    نمای کلی شاخص‌های مالی، وضعیت موجودی انبار و دسترسی سریع به عملیات روزانه
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openWorkspaceWithTab('accounting', 'sales_invoice')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
                  >
                    + صدور فاکتور فروش
                  </button>
                  <button
                    type="button"
                    onClick={() => openWorkspaceWithTab('accounting', 'journal')}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 whitespace-nowrap"
                  >
                    + ثبت سند روزنامه
                  </button>
                  <button
                    type="button"
                    onClick={() => openWorkspaceWithTab('pos')}
                    className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 whitespace-nowrap"
                  >
                    صندوق فروشگاهی
                  </button>
                </div>
              </div>

              {/* Live Accounting KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-medium text-slate-500">جمع کل دارایی‌ها</div>
                  <div className="font-mono tabular-nums font-bold text-lg text-slate-900">
                    {formatCurrency(finSummary.totalAssets)} <span className="text-xs font-normal text-slate-500">تومان</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-700">
                    {finSummary.isBalanceSheetBalanced
                      ? 'ترازنامه کاملاً تراز است'
                      : 'نیاز به بررسی تراز'}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-medium text-slate-500">درآمد عملیاتی دوره</div>
                  <div className="font-mono tabular-nums font-bold text-lg text-slate-900">
                    {formatCurrency(finSummary.totalRevenue)} <span className="text-xs font-normal text-slate-500">تومان</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    سود خالص: <span className="font-semibold text-slate-700">{formatCurrency(finSummary.netProfit)} تومان</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-medium text-slate-500">گردش دفتر کل</div>
                  <div className="font-mono tabular-nums font-bold text-lg text-indigo-700">
                    {glEntries.length} <span className="text-xs font-normal text-slate-500">آرتیکل ثبت‌شده</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    متصل به تراز آزمایشی ۶ ستونی
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-medium text-slate-500">ارزش موجودی انبار</div>
                  <div className="font-mono tabular-nums font-bold text-lg text-slate-900">
                    {formatCurrency(
                      accounts.find((a) => a.code === '1104')?.balance || 840000000
                    )}{' '}
                    <span className="text-xs font-normal text-slate-500">تومان</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    نرخ میانگین موزون متحرک
                  </div>
                </div>
              </div>

              {/* Shortcut Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    title: 'حسابداری و مدیریت مالی',
                    desc: 'درخت حساب‌ها، تراز آزمایشی، اسناد روزنامه و خزانه‌داری',
                    links: [
                      { label: 'درخت حساب‌ها', act: () => openWorkspaceWithTab('accounting', 'coa') },
                      { label: 'دفتر کل و تراز آزمایشی', act: () => openWorkspaceWithTab('accounting', 'gl_trial') },
                      { label: 'ثبت سند روزنامه', act: () => openWorkspaceWithTab('accounting', 'journal') },
                      { label: 'خزانه‌داری، چک و ارز', act: () => openWorkspaceWithTab('accounting', 'payment_cheques') },
                    ],
                  },
                  {
                    title: 'فروش، خرید و صندوق',
                    desc: 'فاکتورهای فروش و خرید، صندوق فروشگاهی و مشتریان',
                    links: [
                      { label: 'فاکتورهای فروش و اقساط', act: () => openWorkspaceWithTab('selling', 'sales_invoice') },
                      { label: 'فاکتورهای خرید کالا', act: () => openWorkspaceWithTab('accounting', 'purchase_invoice') },
                      { label: 'صندوق فروشگاهی و پیش‌فاکتور', act: () => openWorkspaceWithTab('pos') },
                      { label: 'ارتباط با مشتری و کمپین‌ها', act: () => openWorkspaceWithTab('crm') },
                    ],
                  },
                  {
                    title: 'انبار، وب‌شاپ و تنظیمات',
                    desc: 'کاردکس کالا، درخواست شارژ انبار، فروشگاه آنلاین و هسته',
                    links: [
                      { label: 'انبار، کاردکس و شارژ کالا', act: () => openWorkspaceWithTab('stock') },
                      { label: 'وبسایت و فروشگاه اینترنتی', act: () => openWorkspaceWithTab('webshop') },
                      { label: 'گزارش‌ساز، اکسل و دسترسی‌ها', act: () => openWorkspaceWithTab('settings') },
                      { label: 'دارایی‌های ثابت و سهامداران', act: () => openWorkspaceWithTab('accounting', 'assets') },
                    ],
                  },
                ].map((box) => (
                  <div
                    key={box.title}
                    className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">{box.title}</h3>
                      <p className="text-xs text-slate-500">{box.desc}</p>
                    </div>
                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      {box.links.map((lnk) => (
                        <button
                          key={lnk.label}
                          type="button"
                          onClick={lnk.act}
                          className="w-full py-2 px-3 text-xs font-medium text-slate-700 hover:text-indigo-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors"
                        >
                          <span>{lnk.label}</span>
                          <ArrowUpLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WORKSPACE 2 & 3: ACCOUNTING / SELLING */}
          {(activeWorkspace === 'accounting' || activeWorkspace === 'selling') && (
            <AccountingModule
              activeRole={activeRole}
              defaultBranch={defaultBranch}
              initialSubTab={accountingInitialTab}
              accounts={accounts}
              onAddAccount={(newAcc) => setAccounts((prev) => [...prev, newAcc])}
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
              onUpdateCostCenterPolicy={(id, policy) => {
                setCostCenters((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, controlPolicy: policy } : c))
                );
                showToast(`سیاست کنترل بودجه مرکز هزینه به «${policy === 'STOP' ? 'توقف کامل ثبت' : 'هشدار'}» تغییر یافت.`);
              }}
              fixedAssets={fixedAssets}
              onScrapOrSellAsset={(id, newStatus) => {
                setFixedAssets((prev) =>
                  prev.map((a) =>
                    a.id === id
                      ? {
                          ...a,
                          status: newStatus,
                          currentBookValue:
                            newStatus === 'تجدید ارزیابی‌شده'
                              ? Math.round(a.currentBookValue * 1.25)
                              : a.currentBookValue,
                        }
                      : a
                  )
                );
                showToast(`وضعیت دارایی ثابت به «${newStatus}» تغییر یافت و سند مربوطه صادر شد.`);
              }}
              shareholders={shareholders}
              inventoryItems={inventoryItems}
              onShowToast={showToast}
            />
          )}

          {/* WORKSPACE 4: STOCK & MATERIAL REQUEST */}
          {activeWorkspace === 'stock' && (
            <InventoryWmsModule
              activeRole={activeRole}
              items={inventoryItems}
              onUpdateItemStock={(sku, newPhysicalQty) => {
                setInventoryItems((prev) =>
                  prev.map((item) =>
                    item.sku === sku ? { ...item, stockQty: newPhysicalQty } : item
                  )
                );
              }}
              onAddGeneratedVariants={(newVars) =>
                setInventoryItems((prev) => [...newVars, ...prev])
              }
              onShowToast={showToast}
            />
          )}

          {/* WORKSPACE 5: POS */}
          {activeWorkspace === 'pos' && (
            <SellingPosModule
              inventoryItems={inventoryItems}
              onCompletePosSale={handleCompletePosSale}
              onShowToast={showToast}
            />
          )}

          {/* WORKSPACE 6: CRM */}
          {activeWorkspace === 'crm' && (
            <CrmMarketingModule
              leads={crmLeads}
              onAddLead={(lead) => setCrmLeads((prev) => [lead, ...prev])}
              onAdvanceLeadStage={(id) => {
                setCrmLeads((prev) =>
                  prev.map((l) =>
                    l.id === id
                      ? { ...l, stage: 'ارسال پیش‌فاکتور', probability: Math.min(95, l.probability + 20) }
                      : l
                  )
                );
                showToast('مرحله فرصت فروش در قیف ارتباط با مشتری ارتقا یافت.');
              }}
              onShowToast={showToast}
            />
          )}

          {/* WORKSPACE 7: WEBSITE, WEBSHOP & PORTAL */}
          {activeWorkspace === 'webshop' && (
            <SupportWebshopModule
              inventoryItems={inventoryItems}
              salesInvoices={salesInvoices}
              onWebshopOrderCheckout={handleWebshopOrderCheckout}
              onShowToast={showToast}
            />
          )}

          {/* WORKSPACE 8: SETTINGS & CORE */}
          {activeWorkspace === 'settings' && (
            <FrappeCoreModule
              auditLogs={auditLogs}
              onExportFullData={handleExportFullDatabase}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      {showAwesomebar && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setShowAwesomebar(false)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="جستجوی فرم، گزارش، سند یا فرمان..."
                value={awesomeQuery}
                onChange={(e) => setAwesomeQuery(e.target.value)}
                className="w-full text-xs text-slate-900 focus:outline-none"
              />
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.title}
                  type="button"
                  onClick={cmd.action}
                  className="w-full px-4 py-2.5 text-right text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-800">{cmd.title}</span>
                  <span className="text-[11px] text-slate-400">{cmd.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
