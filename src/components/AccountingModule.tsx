import React, { useState } from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  PieChart,
  Building2,
  Users,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Calculator,
  Receipt,
} from 'lucide-react';
import {
  AccountNode,
  SalesInvoiceRecord,
  PurchaseInvoiceRecord,
  ChequeRecord,
  CostCenterRecord,
  FixedAssetRecord,
  ShareholderRecord,
  InventoryItemRecord,
} from '../data/erpSeedData';
import {
  formatCurrency,
  validateJournalEntry,
  calculateInstallments,
  calculateAssetDepreciation,
  evaluateBudgetControl,
  allocateCostCenterExpense,
  calculateFinancialStatements,
  checkRolePermission,
  SystemRole,
  JournalLine,
} from '../utils/erpEngine';

interface AccountingModuleProps {
  activeRole: SystemRole;
  fiscalYearLocked: boolean;
  onToggleFiscalYearLock: () => void;
  accounts: AccountNode[];
  onAddAccount: (acc: AccountNode) => void;
  onPostJournal: (lines: { accountCode: string; debit: number; credit: number }[]) => void;
  salesInvoices: SalesInvoiceRecord[];
  onCreateSalesInvoice: (inv: SalesInvoiceRecord, deductItemSku?: string, deductQty?: number) => void;
  purchaseInvoices: PurchaseInvoiceRecord[];
  onCreatePurchaseInvoice: (pinv: PurchaseInvoiceRecord, addSku: string, addQty: number, unitCost: number) => void;
  cheques: ChequeRecord[];
  onClearCheque: (id: string) => void;
  costCenters: CostCenterRecord[];
  onUpdateCostCenterPolicy: (id: string, policy: 'WARN' | 'STOP') => void;
  fixedAssets: FixedAssetRecord[];
  onScrapOrSellAsset: (id: string, newStatus: 'فروخته‌شده' | 'اسقاط‌شده') => void;
  shareholders: ShareholderRecord[];
  inventoryItems: InventoryItemRecord[];
  onShowToast: (msg: string) => void;
}

type SubTab =
  | 'coa'
  | 'statements'
  | 'journal'
  | 'receivable'
  | 'payable'
  | 'banking'
  | 'budget'
  | 'assets';

export const AccountingModule: React.FC<AccountingModuleProps> = ({
  activeRole,
  fiscalYearLocked,
  onToggleFiscalYearLock,
  accounts,
  onAddAccount,
  onPostJournal,
  salesInvoices,
  onCreateSalesInvoice,
  purchaseInvoices,
  onCreatePurchaseInvoice,
  cheques,
  onClearCheque,
  costCenters,
  onUpdateCostCenterPolicy,
  fixedAssets,
  onScrapOrSellAsset,
  shareholders,
  inventoryItems,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('coa');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [selectedDimensionBranch, setSelectedDimensionBranch] = useState<string>('همه شعب');

  // Purchase Invoice Form State
  const [showNewPurchaseForm, setShowNewPurchaseForm] = useState(false);
  const [pinvSupplier, setPinvSupplier] = useState('بازرگانی شنژن ویپ تریدینگ');
  const [pinvSku, setPinvSku] = useState(inventoryItems[0]?.sku || 'PK60-MANGO-50');
  const [pinvQty, setPinvQty] = useState(50);
  const [pinvUnitCost, setPinvUnitCost] = useState(760000);
  const [pinvLandedCost, setPinvLandedCost] = useState(3500000);

  // New Account Modal state
  const [showNewAccForm, setShowNewAccForm] = useState(false);
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccCat, setNewAccCat] = useState<'دارایی' | 'بدهی' | 'سرمایه' | 'درآمد' | 'هزینه'>('دارایی');
  const [newAccLevel, setNewAccLevel] = useState<'گروه' | 'کل' | 'معین' | 'تفصیلی'>('معین');

  // Journal Entry state
  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    {
      id: 'jl-1',
      accountCode: '110101',
      accountName: 'بانک ملت - شعبه مرکزی',
      dimensionBranch: 'شعبه مرکزی تهران',
      dimensionChannel: 'فروش سازمانی B2B',
      debit: 25000000,
      credit: 0,
      note: 'دریافت علی‌الحساب تسویه فاکتور',
    },
    {
      id: 'jl-2',
      accountCode: '1102',
      accountName: 'حساب‌های دریافتنی تجاری (مشتریان)',
      dimensionBranch: 'شعبه مرکزی تهران',
      dimensionChannel: 'فروش سازمانی B2B',
      debit: 0,
      credit: 25000000,
      note: 'کسر از بدهی مشتری عمده',
    },
  ]);
  const [postedJournalsCount, setPostedJournalsCount] = useState(14);

  // Sales Invoice Form State
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [invCustomer, setInvCustomer] = useState('پخش سراسری نیکوتین‌پارس (عمده)');
  const [invItemSku, setInvItemSku] = useState(inventoryItems[0]?.sku || 'PK60-MANGO-50');
  const [invQty, setInvQty] = useState(10);
  const [invBranch, setInvBranch] = useState('شعبه مرکزی تهران');
  const [invChannel, setInvChannel] = useState('فروش سازمانی B2B');
  const [invTermsType, setInvTermsType] = useState<'cash' | 'installment3' | 'subscription'>('installment3');
  const [invUpdateStock, setInvUpdateStock] = useState(true);

  // Payment Reconciliation State
  const [reconciledAdvanceIds, setReconciledAdvanceIds] = useState<string[]>([]);

  // Cost Center Expense Allocation & Budget Simulator State
  const [sharedBillAmount, setSharedBillAmount] = useState(30000000);
  const [testBudgetCenterId, setTestBudgetCenterId] = useState('cc-2');
  const [testExpenseInput, setTestExpenseInput] = useState(8000000);

  const journalValidation = validateJournalEntry(journalLines);

  const applyJournalTemplate = (tpl: 'payroll' | 'depreciation' | 'partner_draw') => {
    if (tpl === 'payroll') {
      setJournalLines([
        {
          id: 'jl-p1',
          accountCode: '5201',
          accountName: 'هزینه حقوق، دستمزد و پورسانت تیم فروش',
          dimensionBranch: 'شعبه مرکزی تهران',
          debit: 68000000,
          credit: 0,
          note: 'ثبت حقوق و پورسانت آبان‌ماه پرسنل',
        },
        {
          id: 'jl-p2',
          accountCode: '2102',
          accountName: 'مالیات تکلیفی و بیمه پرداختنی',
          dimensionBranch: 'شعبه مرکزی تهران',
          debit: 0,
          credit: 8000000,
          note: 'کسر مالیات تکلیفی حقوق در مبدا',
        },
        {
          id: 'jl-p3',
          accountCode: '110101',
          accountName: 'بانک ملت - شعبه مرکزی (پایا)',
          dimensionBranch: 'شعبه مرکزی تهران',
          debit: 0,
          credit: 60000000,
          note: 'واریز خالص حقوق از طریق فایل پایا',
        },
      ]);
      onShowToast('قالب آماده «سند حقوق و کسورات قانونی» بارگذاری شد.');
    } else if (tpl === 'depreciation') {
      setJournalLines([
        {
          id: 'jl-d1',
          accountCode: '5202',
          accountName: 'هزینه استهلاک دارایی‌های ثابت',
          dimensionBranch: 'شعبه الهیه',
          debit: 18333333,
          credit: 0,
          note: 'ثبت استهلاک خودکار ماهانه تجهیزات و وسایل نقلیه',
        },
        {
          id: 'jl-d2',
          accountCode: '1200',
          accountName: 'استهلاک انباشته دارایی‌های ثابت مشهود',
          dimensionBranch: 'شعبه الهیه',
          debit: 0,
          credit: 18333333,
          note: 'کاهش ارزش دفتری دارایی‌ها',
        },
      ]);
      onShowToast('قالب آماده «ثبت استهلاک ماهانه دارایی‌ها» بارگذاری شد.');
    } else {
      setJournalLines([
        {
          id: 'jl-s1',
          accountCode: '3101',
          accountName: 'جاری شرکا و سهامداران',
          dimensionBranch: 'دفتر مرکزی',
          debit: 45000000,
          credit: 0,
          note: 'برداشت علی‌الحساب سود سهامدار',
        },
        {
          id: 'jl-s2',
          accountCode: '110101',
          accountName: 'بانک ملت - شعبه مرکزی',
          dimensionBranch: 'دفتر مرکزی',
          debit: 0,
          credit: 45000000,
          note: 'حواله ساتنا به حساب شریک تجاری',
        },
      ]);
      onShowToast('قالب آماده «برداشت و تسویه شرکا» بارگذاری شد.');
    }
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCode.trim() || !newAccName.trim()) return;
    onAddAccount({
      id: `acc-${Date.now()}`,
      code: newAccCode.trim(),
      name: newAccName.trim(),
      category: newAccCat,
      level: newAccLevel,
      balance: 0,
      currency: 'IRR',
    });
    setNewAccCode('');
    setNewAccName('');
    setShowNewAccForm(false);
    onShowToast(`سرفصل حساب «${newAccName}» با موفقیت به درخت حساب‌ها اضافه شد.`);
  };

  const selectedItemObj =
    inventoryItems.find((i) => i.sku === invItemSku) || inventoryItems[0];
  const computedInvoiceSubtotal = (selectedItemObj?.wholesalePrice || 960000) * invQty;
  const computedInvoiceTax = Math.round(computedInvoiceSubtotal * 0.1);
  const computedInvoiceTotal = computedInvoiceSubtotal + computedInvoiceTax;

  const installmentPreview = calculateInstallments(computedInvoiceTotal, [
    { label: 'پیش‌پرداخت نقد (۳۰٪)', percentage: 30, dueDays: 0 },
    { label: 'قسط اول - یک ماهه (۳۵٪)', percentage: 35, dueDays: 30 },
    { label: 'قسط دوم - دو ماهه (۳۵٪)', percentage: 35, dueDays: 60 },
  ]);

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fiscalYearLocked) {
      onShowToast('دوره مالی بسته و قفل شده است؛ امکان ثبت سند در دوره قفل‌شده وجود ندارد.');
      return;
    }
    const newInv: SalesInvoiceRecord = {
      id: `sinv-${Date.now()}`,
      invoiceNo: `SINV-1404-${111 + salesInvoices.length}`,
      customerName: invCustomer,
      date: '۱۴۰۴/۰۸/۰۲',
      dueDate: invTermsType === 'cash' ? '۱۴۰۴/۰۸/۰۲' : '۱۴۰۴/۱۰/۰۲',
      branchDimension: invBranch,
      channelDimension: invChannel,
      paymentTermsTemplate:
        invTermsType === 'cash'
          ? 'تسویه نقد در لحظه'
          : invTermsType === 'installment3'
            ? '۳۰٪ نقد، ۳۵٪ یک ماهه، ۳۵٪ دو ماهه'
            : 'اشتراک خودکار ماهانه (Auto-Repeat)',
      updateStock: invUpdateStock,
      isSubscription: invTermsType === 'subscription',
      subscriptionInterval: invTermsType === 'subscription' ? 'ماهانه' : undefined,
      status: invTermsType === 'cash' ? 'پرداخت‌شده' : 'اقساطی فعال',
      totalAmount: computedInvoiceTotal,
      paidAmount:
        invTermsType === 'cash'
          ? computedInvoiceTotal
          : Math.round(computedInvoiceTotal * 0.3),
      taxAmount: computedInvoiceTax,
      itemsSummary: `${invQty} ${selectedItemObj?.uomPrimary || 'عدد'} ${selectedItemObj?.name || ''}`,
    };

    onCreateSalesInvoice(
      newInv,
      invUpdateStock ? selectedItemObj?.sku : undefined,
      invUpdateStock ? invQty : 0
    );
    setShowNewInvoiceModal(false);
  };

  const filteredAccounts = accounts.filter((acc) =>
    selectedCategory === 'همه' ? true : acc.category === selectedCategory
  );

  const selectedBudgetCenter =
    costCenters.find((c) => c.id === testBudgetCenterId) || costCenters[0];
  const budgetEval = evaluateBudgetControl(
    selectedBudgetCenter.allocatedBudget,
    selectedBudgetCenter.spentAmount,
    testExpenseInput,
    selectedBudgetCenter.controlPolicy
  );

  const sharedExpenseAllocations = allocateCostCenterExpense(
    sharedBillAmount,
    costCenters.map((c) => ({
      costCenterName: c.name,
      percentage: c.autoAllocationPercent,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Module Header & Period Closing Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            ۱. ماژول حسابداری و مدیریت مالی (Accounting & Finance)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            درخت حساب‌های ۵ سطحی، ابعاد تحلیلی، اسناد دوبل، فروش اقساطی، خزانه‌داری چک صیادی، کنترل بودجه و دارایی ثابت
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!checkRolePermission(activeRole, 'unlock_fiscal_year')) {
                onShowToast('خطای دسترسی: فقط نقش «ادمین کل (Super Admin)» مجاز به بستن یا بازگشایی قفل سال مالی است.');
                return;
              }
              onToggleFiscalYearLock();
              onShowToast(
                !fiscalYearLocked
                  ? 'سند بستن دوره مالی (Period Closing Voucher) توسط ادمین کل صادر شد و سال مالی قفل گردید.'
                  : 'قفل دوره مالی ۱۴۰۴ توسط ادمین کل بازگشایی شد.'
              );
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              fiscalYearLocked
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {fiscalYearLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>
              {fiscalYearLocked
                ? 'سال مالی ۱۴۰۴: قفل‌شده (ویژه ادمین کل)'
                : 'بستن دوره مالی (Period Closing)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewInvoiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت فاکتور فروش جدید (Sales Invoice)</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
        {[
          { id: 'coa', label: 'الف) درخت حساب‌ها و ابعاد', icon: BookOpen },
          { id: 'statements', label: 'تراز آزمایشی، سود و زیان و ترازنامه', icon: Calculator },
          { id: 'journal', label: 'اسناد روزنامه و قالب‌ها', icon: FileSpreadsheet },
          { id: 'receivable', label: 'ب) فروش، اقساط و دریافتنی', icon: ArrowDownLeft },
          { id: 'payable', label: 'ج) خرید و پرداختنی', icon: ArrowUpRight },
          { id: 'banking', label: 'د) خزانه‌داری، چک و تطبیق', icon: Landmark },
          { id: 'budget', label: 'هـ) مراکز هزینه و بودجه', icon: PieChart },
          { id: 'assets', label: 'و/ز/ح) مالیات، دارایی ثابت و سهام', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: FINANCIAL STATEMENTS (TRIAL BALANCE, P&L, BALANCE SHEET) */}
      {activeSubTab === 'statements' && (() => {
        const fin = calculateFinancialStatements(accounts);
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500">صورت سود و زیان دوره (Profit & Loss)</div>
                <div className="text-sm font-bold text-slate-900">
                  درآمد کل: <span className="font-mono">{formatCurrency(fin.totalRevenue)}</span> ت
                </div>
                <div className="text-xs text-rose-700">
                  بهای تمام‌شده و هزینه‌ها: <span className="font-mono">-{formatCurrency(fin.totalExpenses)}</span> ت
                </div>
                <div className="pt-2 border-t border-slate-100 text-sm font-bold text-emerald-700">
                  سود خالص دوره: <span className="font-mono">{formatCurrency(fin.netProfit)}</span> تومان
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500">ترازنامه (Balance Sheet — سمت راست)</div>
                <div className="text-sm font-bold text-slate-900">
                  جمع کل دارایی‌ها: <span className="font-mono">{formatCurrency(fin.totalAssets)}</span> تومان
                </div>
                <div className="text-xs text-slate-600">
                  دارایی‌های جاری، نقد و بانک، دریافتنی‌ها، انبار و اموال ثابت
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500">معادله اساسی حسابداری (سمت چپ ترازنامه)</div>
                <div className="text-xs text-slate-700">
                  بدهی‌ها (<span className="font-mono">{formatCurrency(fin.totalLiabilities)}</span>) + سرمایه (<span className="font-mono">{formatCurrency(fin.totalEquity)}</span>) + سود دوره (<span className="font-mono">{formatCurrency(fin.netProfit)}</span>)
                </div>
                <div className="pt-2 border-t border-slate-100 text-sm font-bold text-indigo-700">
                  جمع بدهی و حقوق صاحبان سهام: <span className="font-mono">{formatCurrency(fin.equityPlusLiabilitiesAndProfit)}</span> ت (تراز کامل)
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                تراز آزمایشی ۴ ستونی حساب‌های کل و معین (Trial Balance Report)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="py-2.5 px-3">کد حساب</th>
                      <th className="py-2.5 px-3">نام سرفصل حساب</th>
                      <th className="py-2.5 px-3">ماهیت حساب</th>
                      <th className="py-2.5 px-3 text-left">مانده بدهکار (تومان)</th>
                      <th className="py-2.5 px-3 text-left">مانده بستانکار (تومان)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accounts.filter((a) => a.level === 'معین' || a.level === 'گروه').map((acc) => {
                      const isDebitNature = acc.category === 'دارایی' || acc.category === 'هزینه';
                      return (
                        <tr key={acc.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-600">{acc.code}</td>
                          <td className={`py-2 px-3 ${acc.level === 'گروه' ? 'font-bold text-slate-900' : 'pr-6 text-slate-700'}`}>
                            {acc.name}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{acc.category} ({acc.level})</td>
                          <td className="py-2 px-3 font-mono text-left text-slate-900">
                            {isDebitNature ? formatCurrency(acc.balance) : '۰'}
                          </td>
                          <td className="py-2 px-3 font-mono text-left text-indigo-700">
                            {!isDebitNature ? formatCurrency(acc.balance) : '۰'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 1: CHART OF ACCOUNTS & ACCOUNTING DIMENSIONS */}
      {activeSubTab === 'coa' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  درخت حساب‌ها (Chart of Accounts) و ابعاد تحلیلی (Accounting Dimensions)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ساختار ۴ سطحی (گروه، کل، معین، تفصیلی) در ۵ دسته اصلی به همراه فیلتر متقاطع شعب و کانال‌های فروش
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="فیلتر بعد شعبه"
                  value={selectedDimensionBranch}
                  onChange={(e) => setSelectedDimensionBranch(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="همه شعب">بعد تحلیلی: همه شعب</option>
                  <option value="شعبه مرکزی تهران">بعد: شعبه مرکزی تهران</option>
                  <option value="شعبه الهیه">بعد: شعبه الهیه</option>
                  <option value="انبار کهریزک">بعد: انبار کهریزک</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewAccForm(!showNewAccForm)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 whitespace-nowrap shrink-0"
                >
                  + تعریف سرفصل حساب جدید
                </button>
              </div>
            </div>

            {showNewAccForm && (
              <form
                onSubmit={handleAddAccountSubmit}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    کد حساب
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً 1105"
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    عنوان سرفصل حسابداری
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً تنخواه گردان شعبه الهیه"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    طبقه اصلی و سطح
                  </label>
                  <div className="flex gap-1">
                    <select
                      aria-label="طبقه اصلی حساب"
                      value={newAccCat}
                      onChange={(e) => setNewAccCat(e.target.value as AccountNode['category'])}
                      className="w-1/2 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="دارایی">دارایی</option>
                      <option value="بدهی">بدهی</option>
                      <option value="سرمایه">سرمایه</option>
                      <option value="درآمد">درآمد</option>
                      <option value="هزینه">هزینه</option>
                    </select>
                    <select
                      aria-label="سطح حساب"
                      value={newAccLevel}
                      onChange={(e) => setNewAccLevel(e.target.value as AccountNode['level'])}
                      className="w-1/2 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="گروه">گروه</option>
                      <option value="کل">کل</option>
                      <option value="معین">معین</option>
                      <option value="تفصیلی">تفصیلی</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
                >
                  ذخیره سرفصل
                </button>
              </form>
            )}

            {/* 5 Category Filter Bar */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
              {['همه', 'دارایی', 'بدهی', 'سرمایه', 'درآمد', 'هزینه'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                    <th className="py-2.5 px-3 font-semibold">کدینگ حساب</th>
                    <th className="py-2.5 px-3 font-semibold">نام سرفصل حساب</th>
                    <th className="py-2.5 px-3 font-semibold">دسته اصلی · سطح</th>
                    <th className="py-2.5 px-3 font-semibold">ارز پایه</th>
                    <th className="py-2.5 px-3 font-semibold text-left">مانده دفتر کل (تومان)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map((acc) => {
                    const indentClass =
                      acc.level === 'گروه'
                        ? 'font-bold text-slate-900'
                        : acc.level === 'کل'
                          ? 'pr-6 font-semibold text-slate-800'
                          : acc.level === 'معین'
                            ? 'pr-10 text-slate-700'
                            : 'pr-14 text-slate-600';
                    const branchMultiplier =
                      selectedDimensionBranch === 'همه شعب'
                        ? 1
                        : selectedDimensionBranch === 'شعبه مرکزی تهران'
                          ? 0.55
                          : selectedDimensionBranch === 'شعبه الهیه'
                            ? 0.3
                            : 0.15;
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                          {acc.code}
                        </td>
                        <td className={`py-2.5 px-3 ${indentClass}`}>{acc.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          <span>{acc.category}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>سطح {acc.level}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{acc.currency}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-left text-slate-900">
                          {formatCurrency(Math.round(acc.balance * branchMultiplier))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOURNAL ENTRY & TEMPLATES */}
      {activeSubTab === 'journal' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                سند حسابداری روزنامه دوبل (Journal Entry) و قالب‌های آماده ماهانه
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                کنترل خودکار تراز بودن بدهکار و بستانکار (Double-Entry Validation) · تعداد اسناد ثبت‌شده این ماه: {formatCurrency(postedJournalsCount)} سند
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">فراخوانی قالب آماده (۱-کلیک):</span>
              <button
                type="button"
                onClick={() => applyJournalTemplate('payroll')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg whitespace-nowrap shrink-0"
              >
                قالب حقوق و دستمزد
              </button>
              <button
                type="button"
                onClick={() => applyJournalTemplate('depreciation')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg whitespace-nowrap shrink-0"
              >
                قالب استهلاک ماهانه
              </button>
              <button
                type="button"
                onClick={() => applyJournalTemplate('partner_draw')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg whitespace-nowrap shrink-0"
              >
                قالب برداشت/واریز شرکا
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-3">کد و عنوان سرفصل حساب</th>
                  <th className="py-2.5 px-3">بعد شعبه / مرکز هزینه</th>
                  <th className="py-2.5 px-3">شرح ردیف آرتیکل</th>
                  <th className="py-2.5 px-3">بدهکار (تومان)</th>
                  <th className="py-2.5 px-3">بستانکار (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalLines.map((line, idx) => (
                  <tr key={line.id}>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      <span className="font-mono text-slate-500 ml-2">{line.accountCode}</span>
                      <span>{line.accountName}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {line.dimensionBranch || 'شعبه مرکزی'}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        aria-label={`شرح آرتیکل ردیف ${idx + 1}`}
                        value={line.note || ''}
                        onChange={(e) => {
                          const updated = [...journalLines];
                          updated[idx] = { ...line, note: e.target.value };
                          setJournalLines(updated);
                        }}
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-md"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        aria-label={`مبلغ بدهکار ردیف ${idx + 1}`}
                        value={line.debit}
                        onChange={(e) => {
                          const updated = [...journalLines];
                          updated[idx] = { ...line, debit: Number(e.target.value) || 0 };
                          setJournalLines(updated);
                        }}
                        className="w-36 px-2.5 py-1 text-xs font-mono tabular-nums border border-slate-200 rounded-md"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        aria-label={`مبلغ بستانکار ردیف ${idx + 1}`}
                        value={line.credit}
                        onChange={(e) => {
                          const updated = [...journalLines];
                          updated[idx] = { ...line, credit: Number(e.target.value) || 0 };
                          setJournalLines(updated);
                        }}
                        className="w-36 px-2.5 py-1 text-xs font-mono tabular-nums border border-slate-200 rounded-md"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-4 text-xs">
              <span>
                جمع بدهکار:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {formatCurrency(journalValidation.totalDebit)}
                </strong>{' '}
                تومان
              </span>
              <span aria-hidden="true">·</span>
              <span>
                جمع بستانکار:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {formatCurrency(journalValidation.totalCredit)}
                </strong>{' '}
                تومان
              </span>
              <span aria-hidden="true">·</span>
              {journalValidation.isValid ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>سند تراز است (اختلاف: ۰)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{journalValidation.errorMessage}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setJournalLines([
                    ...journalLines,
                    {
                      id: `jl-${Date.now()}`,
                      accountCode: '110102',
                      accountName: 'صندوق شعبه الهیه',
                      dimensionBranch: 'شعبه الهیه',
                      debit: 0,
                      credit: 0,
                      note: 'ردیف جدید',
                    },
                  ])
                }
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 whitespace-nowrap shrink-0"
              >
                + افزودن ردیف آرتیکل
              </button>
              <button
                type="button"
                disabled={!journalValidation.isValid || fiscalYearLocked}
                onClick={() => {
                  if (!checkRolePermission(activeRole, 'post_journal')) {
                    onShowToast('خطای دسترسی: نقش فعلی شما مجوز ثبت قطعی سند روزنامه در دفتر کل را ندارد.');
                    return;
                  }
                  onPostJournal(
                    journalLines.map((l) => ({
                      accountCode: l.accountCode,
                      debit: l.debit,
                      credit: l.credit,
                    }))
                  );
                  setPostedJournalsCount((c) => c + 1);
                  onShowToast('سند روزنامه دوبل با موفقیت در دفتر کل ثبت قطعی شد و مانده حساب‌ها به‌روز گردید.');
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                ثبت قطعی سند در دفتر کل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNTS RECEIVABLE & SALES INVOICES */}
      {activeSubTab === 'receivable' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  چرخه مالی فروش، فاکتورهای اقساطی (Payment Terms)، اشتراک دوره‌ای و برگشت از فروش (Credit Note)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  پشتیبانی از تیک کسر مستقیم انبار (Update Stock)، تقسیط ۳۰/۳۵/۳۵ و صدور خودکار فاکتورهای اشتراکی
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                + صدور فاکتور فروش / اقساطی جدید
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">شماره سند</th>
                    <th className="py-2.5 px-3">مشتری · ابعاد تحلیلی</th>
                    <th className="py-2.5 px-3">الگوی پرداخت / اشتراک</th>
                    <th className="py-2.5 px-3">کسر انبار</th>
                    <th className="py-2.5 px-3">وضعیت سند</th>
                    <th className="py-2.5 px-3 text-left">مبلغ کل (تومان)</th>
                    <th className="py-2.5 px-3 text-left">مانده دریافتنی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesInvoices.map((inv) => {
                    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/90">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{inv.customerName}</div>
                          <div className="text-slate-500 mt-0.5">
                            <span>{inv.branchDimension}</span>
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span>{inv.channelDimension}</span>
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span>{inv.itemsSummary}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{inv.paymentTermsTemplate}</div>
                          {inv.isSubscription && (
                            <div className="text-indigo-600 font-medium mt-0.5">
                              تکرار خودکار: {inv.subscriptionInterval}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {inv.updateStock ? 'بله (Update Stock فعال)' : 'خیر (صرفاً مالی)'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{inv.status}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-left">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-left text-rose-700 font-semibold">
                          {formatCurrency(remaining)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNTS PAYABLE & PURCHASE INVOICES */}
      {activeSubTab === 'payable' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                حساب‌های پرداختنی، فاکتور خرید (Purchase Invoice) و یادداشت بدهکاری / برگشت از خرید (Debit Note)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت بدهی به تامین‌کننده، افزایش خودکار موجودی انبار و بازمحاسبه بهای تمام‌شده میانگین موزون
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewPurchaseForm(!showNewPurchaseForm)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              + ثبت فاکتور خرید جدید (افزایش موجودی انبار)
            </button>
          </div>

          {showNewPurchaseForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetItem = inventoryItems.find((i) => i.sku === pinvSku) || inventoryItems[0];
                const totalBill = pinvQty * pinvUnitCost + pinvLandedCost;
                onCreatePurchaseInvoice(
                  {
                    id: `pinv-${Date.now()}`,
                    billNo: `PINV-1404-00${90 + purchaseInvoices.length}`,
                    supplierName: pinvSupplier,
                    date: '۱۴۰۴/۰۸/۰۲',
                    warehouse: 'انبار مرکزی کهریزک',
                    status: 'بدهکار باز',
                    totalAmount: totalBill,
                    landedCostAdded: pinvLandedCost,
                    itemsSummary: `${pinvQty} ${targetItem.uomPrimary} ${targetItem.name}`,
                  },
                  pinvSku,
                  pinvQty,
                  pinvUnitCost + Math.round(pinvLandedCost / Math.max(1, pinvQty))
                );
                setShowNewPurchaseForm(false);
              }}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-xs"
            >
              <div>
                <label className="block font-medium text-slate-700 mb-1">نام تامین‌کننده</label>
                <input
                  type="text"
                  required
                  value={pinvSupplier}
                  onChange={(e) => setPinvSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">کالای خریداری‌شده</label>
                <select
                  aria-label="کالای فاکتور خرید"
                  value={pinvSku}
                  onChange={(e) => setPinvSku(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  {inventoryItems.map((it) => (
                    <option key={it.id} value={it.sku}>
                      {it.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">تعداد خرید</label>
                <input
                  type="number"
                  min={1}
                  value={pinvQty}
                  onChange={(e) => setPinvQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">فی خرید واحد (تومان)</label>
                <input
                  type="number"
                  value={pinvUnitCost}
                  onChange={(e) => setPinvUnitCost(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
              >
                ثبت خرید و ورود به انبار
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-3">شماره فاکتور خرید</th>
                  <th className="py-2.5 px-3">تامین‌کننده / عمده‌فروش</th>
                  <th className="py-2.5 px-3">انبار مقصد · شرح اقلام</th>
                  <th className="py-2.5 px-3">وضعیت تعهد</th>
                  <th className="py-2.5 px-3 text-left">هزینه جانبی سرشکن‌شده</th>
                  <th className="py-2.5 px-3 text-left">مبلغ کل تعهد (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseInvoices.map((pinv) => (
                  <tr key={pinv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {pinv.billNo}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {pinv.supplierName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span>{pinv.warehouse}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{pinv.itemsSummary}</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{pinv.status}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-left text-indigo-700">
                      {formatCurrency(pinv.landedCostAdded)}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-left text-slate-900">
                      {formatCurrency(pinv.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BANKING, CHEQUES & PAYMENT RECONCILIATION */}
      {activeSubTab === 'banking' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cheque Tracking */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                مدیریت چک‌های صیادی و پیگیری تاریخ وصول (Cheque / Reference Tracking)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت شناسه ۱۶ رقمی صیادی، سررسید و ثبت تاریخ وصول (Clearance Date) در حساب‌های واسط
              </p>
            </div>
            <div className="space-y-3">
              {cheques.map((chq) => (
                <div
                  key={chq.id}
                  className="p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-slate-900">
                        صیادی: {chq.sayadiNo}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">{chq.bankName}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {chq.partyName} ({chq.type})
                    </div>
                    <div className="text-xs text-slate-500">
                      <span>سررسید: {chq.dueDate}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>وضعیت: {chq.status}</span>
                      {chq.clearanceDate && (
                        <>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-medium">
                            تاریخ وصول: {chq.clearanceDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-mono tabular-nums text-sm font-bold text-slate-900">
                      {formatCurrency(chq.amount)} تومان
                    </span>
                    {chq.status === 'در جریان وصول' && (
                      <button
                        type="button"
                        onClick={() => onClearCheque(chq.id)}
                        className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 whitespace-nowrap"
                      >
                        ثبت وصول چک (Clearance)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Reconciliation & Payment Order */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                تطبیق خودکار پیش‌پرداخت‌ها (Payment Reconciliation) و دفترچه پرداخت بانکی
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                اتصال پیش‌پرداخت‌های قبلی و علی‌الحساب‌ها به فاکتورهای باز با یک کلیک و صدور دستور پرداخت تجمیعی پایا
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'adv-1',
                  party: 'پخش سراسری نیکوتین‌پارس',
                  advanceRef: 'PAY-ADV-1404-019 (واریز پایا)',
                  invoiceTarget: 'SINV-1404-0108',
                  amount: 35000000,
                },
                {
                  id: 'adv-2',
                  party: 'توزیع‌کننده رسمی کویل پارس',
                  advanceRef: 'PAY-ORD-1404-004 (دفترچه پرداخت تجمیعی بانک ملت)',
                  invoiceTarget: 'PINV-1404-0089',
                  amount: 40000000,
                },
              ].map((item) => {
                const isDone = reconciledAdvanceIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-slate-900">{item.party}</div>
                      <div className="text-slate-500">
                        <span>سند پیش‌پرداخت: {item.advanceRef}</span>
                        <span className="mx-1.5" aria-hidden="true">←</span>
                        <span>اتصال به فاکتور: {item.invoiceTarget}</span>
                      </div>
                      <div className="font-mono tabular-nums font-semibold text-indigo-700">
                        مبلغ قابل تهاتر: {formatCurrency(item.amount)} تومان
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isDone}
                      onClick={() => {
                        setReconciledAdvanceIds([...reconciledAdvanceIds, item.id]);
                        onShowToast(`پیش‌پرداخت ${item.advanceRef} با فاکتور ${item.invoiceTarget} تطبیق و تسویه شد.`);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:bg-emerald-600 whitespace-nowrap shrink-0"
                    >
                      {isDone ? 'تطبیق انجام شد (تسویه)' : 'تطبیق ۱-کلیکه'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COST CENTERS, AUTO ALLOCATION & BUDGET CONTROL */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Center Tree & Budget Control Simulator */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  درخت مراکز هزینه و موتور کنترل بودجه (Budget Control Engine)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تنظیم سیاست برخورد با عبور از سقف بودجه: «هشدار (WARN)» یا «توقف کامل و جلوگیری از ثبت فاکتور (STOP)»
                </p>
              </div>

              <div className="space-y-3">
                {costCenters.map((cc) => {
                  const pct = Math.round((cc.spentAmount / cc.allocatedBudget) * 100);
                  return (
                    <div key={cc.id} className="p-3.5 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-slate-500 ml-2">{cc.code}</span>
                          <span className="font-bold text-slate-900">{cc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateCostCenterPolicy(
                              cc.id,
                              cc.controlPolicy === 'STOP' ? 'WARN' : 'STOP'
                            )
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                            cc.controlPolicy === 'STOP'
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          سیاست فعلی: {cc.controlPolicy === 'STOP' ? 'توقف کامل (STOP)' : 'هشدار (WARN)'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>
                          مصرف‌شده: <strong className="font-mono">{formatCurrency(cc.spentAmount)}</strong> از{' '}
                          <strong className="font-mono">{formatCurrency(cc.allocatedBudget)}</strong> تومان ({pct}٪)
                        </span>
                        <span className="text-emerald-700 font-medium">
                          درآمد مرکز: {formatCurrency(cc.revenueGenerated)} تومان
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Budget Enforcement Test */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  شبیه‌ساز ثبت هزینه جدید و تست کنترل بودجه:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">انتخاب مرکز هزینه</label>
                    <select
                      aria-label="مرکز هزینه تست بودجه"
                      value={testBudgetCenterId}
                      onChange={(e) => setTestBudgetCenterId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      {costCenters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      مبلغ فاکتور هزینه جدید (تومان)
                    </label>
                    <input
                      type="number"
                      aria-label="مبلغ فاکتور هزینه جدید"
                      value={testExpenseInput}
                      onChange={(e) => setTestExpenseInput(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    budgetEval.status === 'OK'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : budgetEval.status === 'STOPPED'
                        ? 'bg-rose-50 text-rose-900 border border-rose-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <span>{budgetEval.message}</span>
                  <span className="font-mono">{budgetEval.utilizationPercent}٪</span>
                </div>
              </div>
            </div>

            {/* Cost Center Auto Allocation */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  تسهیم خودکار هزینه‌های عمومی (Cost Center Allocation)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تقسیم خودکار یک قبض یا هزینه اجاره عمومی بین مراکز هزینه بر اساس ضرایب از پیش تعیین‌شده (۴۵٪، ۳۵٪، ۲۰٪)
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  مبلغ کل هزینه عمومی (مثلاً اجاره کل ساختمان و برق مشترک - تومان)
                </label>
                <input
                  type="number"
                  aria-label="مبلغ کل هزینه عمومی برای تسهیم"
                  value={sharedBillAmount}
                  onChange={(e) => setSharedBillAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                {sharedExpenseAllocations.map((row) => (
                  <div
                    key={row.costCenterName}
                    className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{row.costCenterName}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="text-slate-500">ضریب تسهیم: {row.percentage}٪</span>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-indigo-700">
                      {formatCurrency(row.allocatedAmount)} تومان
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FIXED ASSETS, TAXATION & SHAREHOLDERS */}
      {activeSubTab === 'assets' && (
        <div className="space-y-6">
          {/* Fixed Assets Lifecycle & Automated Depreciation */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                چرخه عمر دارایی‌های ثابت (Fixed Assets) و محاسبه خودکار استهلاک (خط مستقیم و نزولی)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت پلاک اموال، محل استقرار، استهلاک ماهانه خودکار و عملیات فروش دست‌دوم یا اسقاط دارایی
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">پلاک اموال</th>
                    <th className="py-2.5 px-3">عنوان دارایی · محل استقرار</th>
                    <th className="py-2.5 px-3">روش استهلاک</th>
                    <th className="py-2.5 px-3 text-left">بهای خرید</th>
                    <th className="py-2.5 px-3 text-left">استهلاک ماهانه</th>
                    <th className="py-2.5 px-3 text-left">ارزش دفتری فعلی</th>
                    <th className="py-2.5 px-3">وضعیت / عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fixedAssets.map((ast) => {
                    const dep = calculateAssetDepreciation(
                      ast.purchaseValue,
                      ast.salvageValue,
                      ast.usefulLifeMonths,
                      ast.elapsedMonths,
                      ast.method
                    );
                    return (
                      <tr key={ast.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {ast.assetTag}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{ast.name}</div>
                          <div className="text-slate-500">
                            {ast.category} · {ast.location}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {ast.method === 'straight-line' ? 'خط مستقیم (Straight-Line)' : 'نزولی مضاعف (Declining)'}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-left">
                          {formatCurrency(ast.purchaseValue)}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-left text-amber-700 font-semibold">
                          {formatCurrency(dep.monthlyDepreciation)}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-left text-emerald-700 font-bold">
                          {formatCurrency(dep.currentBookValue)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-700">{ast.status}</span>
                            {ast.status === 'فعال در بهره‌برداری' && (
                              <button
                                type="button"
                                onClick={() => onScrapOrSellAsset(ast.id, 'فروخته‌شده')}
                                className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md whitespace-nowrap"
                              >
                                ثبت فروش/اسقاط
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shareholders & Multi-Currency Taxation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                مدیریت سهامداران و دفتر سهام (Shareholder & Share Ledger)
              </h3>
              <div className="space-y-2.5">
                {shareholders.map((sh) => (
                  <div
                    key={sh.id}
                    className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{sh.name}</div>
                      <div className="text-slate-500 mt-0.5">
                        کد سهامداری: {sh.folioNo} · تعداد سهام: {formatCurrency(sh.sharesCount)} سهم ({sh.ownershipPercent}٪)
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {formatCurrency(sh.capitalBalance)} تومان
                      </div>
                      <div className="text-emerald-700 font-mono">
                        سود تقسیمی: {formatCurrency(sh.dividendPaid)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                قالب‌های مالیاتی، ارزش افزوده و نرخ تسعیر چندارزی (Multi-Currency & Tax)
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 flex justify-between">
                  <span>قالب مالیات بر ارزش افزوده قانونی ۱۴۰۴ (VAT 10%)</span>
                  <span className="font-mono font-semibold text-indigo-700">۱۰٪ روی خالص فاکتور</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 flex justify-between">
                  <span>مالیات تکلیفی قراردادهای خدماتی و اجاره (Withholding Tax)</span>
                  <span className="font-mono font-semibold text-amber-700">کسر ۵٪ الی ۱۰٪ در مبدا</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 flex justify-between">
                  <span>نرخ تسعیر ارز بازرگانی واردات (USD / AED)</span>
                  <span className="font-mono font-semibold text-slate-900">
                    1 USD = ۶۸,۵۰۰ تومان · 1 AED = ۱۸,۶۵۰ تومان
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW SALES INVOICE WITH INSTALLMENTS & UPDATE STOCK */}
      {showNewInvoiceModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sales-invoice-title"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 id="modal-sales-invoice-title" className="text-base font-bold text-slate-900">
                صدور فاکتور فروش جدید (Sales Invoice & Payment Terms)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                بستن پنجره
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">نام مشتری / طرف حساب</label>
                  <input
                    type="text"
                    required
                    value={invCustomer}
                    onChange={(e) => setInvCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">کالای مورد فروش</label>
                  <select
                    aria-label="انتخاب کالای فاکتور"
                    value={invItemSku}
                    onChange={(e) => setInvItemSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.sku}>
                        {item.name} (موجودی: {item.stockQty})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">تعداد فروش</label>
                  <input
                    type="number"
                    min={1}
                    value={invQty}
                    onChange={(e) => setInvQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">الگوی شرایط پرداخت</label>
                  <select
                    aria-label="الگوی شرایط پرداخت"
                    value={invTermsType}
                    onChange={(e) =>
                      setInvTermsType(e.target.value as 'cash' | 'installment3' | 'subscription')
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="installment3">اقساطی: ۳۰٪ نقد، ۳۵٪ یک ماهه، ۳۵٪ دو ماهه</option>
                    <option value="cash">نقدی و تسویه کامل در لحظه</option>
                    <option value="subscription">اشتراک خودکار ماهانه (Subscription)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">بعد تحلیلی شعبه</label>
                  <input
                    type="text"
                    value={invBranch}
                    onChange={(e) => setInvBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">بعد کانال فروش</label>
                  <input
                    type="text"
                    value={invChannel}
                    onChange={(e) => setInvChannel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invUpdateStock}
                  onChange={(e) => setInvUpdateStock(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="font-semibold text-slate-800">
                  کسر مستقیم کالا از موجودی انبار همزمان با صدور فاکتور (Update Stock)
                </span>
              </label>

              {invTermsType === 'installment3' && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">
                    جدول زمان‌بندی اقساط (Payment Terms Schedule):
                  </div>
                  {installmentPreview.map((inst) => (
                    <div key={inst.label} className="flex justify-between text-slate-600">
                      <span>
                        {inst.label} (سررسید: {inst.dueDays === 0 ? 'امروز' : `${inst.dueDays} روز دیگر`})
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(inst.amount)} تومان ({inst.status})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="text-slate-700">
                  مبلغ کل با ۱۰٪ ارزش افزوده:{' '}
                  <strong className="font-mono text-sm text-indigo-700">
                    {formatCurrency(computedInvoiceTotal)} تومان
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewInvoiceModal(false)}
                    className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    ثبت فاکتور و سند دوبل
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
