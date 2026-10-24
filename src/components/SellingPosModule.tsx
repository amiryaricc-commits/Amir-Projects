import React, { useState } from 'react';
import {
  ShoppingBag,
  Barcode,
  Printer,
  Gift,
  Users,
  FileText,
  Wifi,
  WifiOff,
  Plus,
  Minus,
} from 'lucide-react';
import { InventoryItemRecord } from '../data/erpSeedData';
import { formatCurrency, calculatePosCartTotals } from '../utils/erpEngine';

interface SellingPosModuleProps {
  inventoryItems: InventoryItemRecord[];
  onCompletePosSale: (
    cartItems: { sku: string; name: string; qty: number; unitPrice: number }[],
    netTotal: number,
    customerName: string
  ) => void;
  onShowToast: (msg: string) => void;
}

interface QuotationItem {
  id: string;
  quoteNo: string;
  customer: string;
  itemsDesc: string;
  validUntil: string;
  amount: number;
  convertedToOrder: boolean;
  reservedWarehouse: string;
}

export const SellingPosModule: React.FC<SellingPosModuleProps> = ({
  inventoryItems,
  onCompletePosSale,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'quotations' | 'commissions'>('pos');
  const [offlineModeSim, setOfflineModeSim] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // POS State
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [priceListType, setPriceListType] = useState<'retail' | 'wholesale' | 'partner'>('retail');
  const [selectedCustomer, setSelectedCustomer] = useState('امیرحسین رضایی (سطح طلایی — ۱,۴۵۰ امتیاز)');
  const [cart, setCart] = useState<{ item: InventoryItemRecord; qty: number }[]>([
    { item: inventoryItems[0], qty: 2 },
    { item: inventoryItems[2], qty: 1 },
  ]);
  const [couponInput, setCouponInput] = useState('EMKAN10');
  const [appliedCouponPct, setAppliedCouponPct] = useState(10);
  const [redeemPoints, setRedeemPoints] = useState(150); // 150,000 Toman
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);
  const [shiftClosed, setShiftClosed] = useState(false);
  const [posShiftTotalSales, setPosShiftTotalSales] = useState(48500000);

  // Quotations & Sales Orders State
  const [quotations, setQuotations] = useState<QuotationItem[]>([
    {
      id: 'qt-1',
      quoteNo: 'QTN-1404-0301',
      customer: 'پخش ویپ و لوازم جانبی خراسان',
      itemsDesc: '۵۰ عدد پاد پیک‌بار ۶۰۰۰۰ + ۳۰ بسته کارتریج اکس‌راس',
      validUntil: '۱۴۰۴/۰۸/۱۵',
      amount: 67800000,
      convertedToOrder: false,
      reservedWarehouse: 'انبار مرکزی کهریزک',
    },
    {
      id: 'qt-2',
      quoteNo: 'QTN-1404-0302',
      customer: 'فروشگاه مدرن کلاب تبریز',
      itemsDesc: '۲۰ پکیج استارتر باندل + ۴۰ عدد سالت نستی',
      validUntil: '۱۴۰۴/۰۸/۱۲',
      amount: 74200000,
      convertedToOrder: true,
      reservedWarehouse: 'انبار شعبه الهیه (رزرو شده)',
    },
  ]);

  const priceListMultiplier =
    priceListType === 'retail' ? 1 : priceListType === 'wholesale' ? 0.82 : 0.88;

  const posTotals = calculatePosCartTotals({
    items: cart.map((c) => ({
      price: c.item.retailPrice,
      qty: c.qty,
      category: c.item.category,
    })),
    priceListMultiplier,
    couponPercent: appliedCouponPct,
    redeemLoyaltyPoints: redeemPoints,
    partnerCommissionPercent: 5,
  });

  const addToCart = (item: InventoryItemRecord) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (existing) {
        return prev.map((p) => (p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => (p.item.id === itemId ? { ...p, qty: p.qty + delta } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const handleCheckoutPos = () => {
    if (cart.length === 0) return;
    if (offlineModeSim) {
      setOfflineQueueCount((c) => c + 1);
      onShowToast('فاکتور در حافظه آفلاین مرورگر ذخیره شد و به محض اتصال همگام‌سازی می‌شود.');
    }
    onCompletePosSale(
      cart.map((c) => ({
        sku: c.item.sku,
        name: c.item.name,
        qty: c.qty,
        unitPrice: Math.round(c.item.retailPrice * priceListMultiplier),
      })),
      posTotals.netPayable,
      selectedCustomer
    );
    setPosShiftTotalSales((s) => s + posTotals.netPayable);
    setShowThermalReceipt(true);
  };

  const filteredProducts = inventoryItems.filter(
    (i) =>
      i.name.includes(barcodeQuery) ||
      i.sku.toLowerCase().includes(barcodeQuery.toLowerCase()) ||
      (i.flavor && i.flavor.includes(barcodeQuery))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            صندوق فروشگاهی و پیش‌فاکتورها
          </h2>
          <p className="text-sm text-slate-500">
            فروش سریع حضوری، مدیریت پیش‌فاکتورها، باشگاه مشتریان و محاسبه پورسانت فروشندگان
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (offlineModeSim && offlineQueueCount > 0) {
                onShowToast(`${offlineQueueCount} فاکتور آفلاین با موفقیت با سرور مرکزی همگام‌سازی شد.`);
                setOfflineQueueCount(0);
              }
              setOfflineModeSim(!offlineModeSim);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              offlineModeSim
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {offlineModeSim ? <WifiOff className="w-4 h-4 shrink-0" /> : <Wifi className="w-4 h-4 shrink-0" />}
            <span>
              {offlineModeSim
                ? `حالت آفلاین (صف: ${offlineQueueCount})`
                : 'متصل به انبار مرکزی'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShiftClosed(!shiftClosed);
              onShowToast(
                !shiftClosed
                  ? 'سند بستن دخل شبانه صادر و موجودی کارتخوان و نقد شمارش شد.'
                  : 'شیفت جدید صندوق فروشگاهی بازگشایی شد.'
              );
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
          >
            {shiftClosed ? 'بازگشایی شیفت صندوق' : 'بستن شیفت صندوق'}
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        {[
          { id: 'pos', label: 'صندوق فروشگاهی', icon: ShoppingBag },
          { id: 'quotations', label: 'پیش‌فاکتور و سفارش فروش', icon: FileText },
          { id: 'commissions', label: 'فروشندگان و پورسانت', icon: Users },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as 'pos' | 'quotations' | 'commissions')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TOUCH POS */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Product Selection & Barcode Area (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  aria-label="جستجوی بارکد یا نام کالا در صندوق"
                  placeholder="اسکن بارکد، کد کالا، نام کالا یا طعم (مثلاً انبه)..."
                  value={barcodeQuery}
                  onChange={(e) => setBarcodeQuery(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {[
                  { id: 'retail', label: 'لیست قیمت تکی' },
                  { id: 'partner', label: 'قیمت همکار (-۱۲٪)' },
                  { id: 'wholesale', label: 'قیمت عمده (-۱۸٪)' },
                ].map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => setPriceListType(pl.id as 'retail' | 'wholesale' | 'partner')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      priceListType === pl.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Rule Notice */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-center justify-between text-xs text-indigo-950">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>موتور قوانین پروموشن:</strong> خرید ۳ عدد به بالا = اهدای اشانتیون خودکار · خرید ۵ عدد به بالا = ۵٪ تخفیف پلکانی خودکار
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((item) => {
                const effectivePrice = Math.round(item.retailPrice * priceListMultiplier);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 transition-colors flex flex-col justify-between gap-3 bg-slate-50/40"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono">{item.sku}</span>
                        <span>موجودی: {item.stockQty} {item.uomPrimary}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{item.name}</h4>
                      <div className="text-xs text-slate-500 mt-1">
                        <span>{item.brand}</span>
                        {item.flavor && (
                          <>
                            <span className="mx-1" aria-hidden="true">·</span>
                            <span>{item.flavor}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <span className="font-mono tabular-nums text-xs font-bold text-indigo-700">
                        {formatCurrency(effectivePrice)} تومان
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-indigo-600 transition-colors whitespace-nowrap"
                      >
                        + افزودن به فیش
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Cart, Loyalty, Coupon & Checkout (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">فیش صندوق فروشگاهی</h3>
                <p className="text-xs text-slate-500">پروفایل صندوق: شعبه الهیه · کارتخوان سامان</p>
              </div>
              <span className="text-xs font-mono text-slate-600">
                جمع دخل شیفت: {formatCurrency(posShiftTotalSales)}
              </span>
            </div>

            {/* Customer & Loyalty Tier Selector */}
            <div className="space-y-2 text-xs">
              <label className="block font-medium text-slate-700">
                مشتری و سطح باشگاه مشتریان
              </label>
              <select
                aria-label="انتخاب مشتری در صندوق"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="امیرحسین رضایی (سطح طلایی — ۱,۴۵۰ امتیاز)">
                  امیرحسین رضایی (سطح طلایی — ۱,۴۵۰ امتیاز وفاداری)
                </option>
                <option value="مهسا شجاعی (سطح نقره‌ای — ۶۲۰ امتیاز)">
                  مهسا شجاعی (سطح نقره‌ای — ۶۲۰ امتیاز وفاداری)
                </option>
                <option value="مشتری حضوری (سطح برنزی)">
                  مشتری حضوری (سطح برنزی)
                </option>
              </select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  سبد صندوق خالی است. از لیست سمت راست کالا اضافه کنید.
                </div>
              ) : (
                cart.map((c) => {
                  const unitRate = Math.round(c.item.retailPrice * priceListMultiplier);
                  return (
                    <div key={c.item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{c.item.name}</div>
                        <div className="font-mono text-slate-500">
                          {formatCurrency(unitRate)} × {c.qty} = {formatCurrency(unitRate * c.qty)} تومان
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`کاهش تعداد ${c.item.name}`}
                          onClick={() => updateCartQty(c.item.id, -1)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold">{c.qty}</span>
                        <button
                          type="button"
                          aria-label={`افزایش تعداد ${c.item.name}`}
                          onClick={() => updateCartQty(c.item.id, 1)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {posTotals.freeGiftTriggered && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                <span>اشانتیون خودکار پروموشن: ۱ عدد بند گردنی اورجینال پیک‌بار</span>
                <span className="font-bold">رایگان (۰ تومان)</span>
              </div>
            )}

            {/* Coupon & Loyalty Redemption */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">کد تخفیف / کارت هدیه</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    aria-label="کد تخفیف"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCouponPct(couponInput.trim() ? 10 : 0);
                      onShowToast('کد تخفیف ۱۰٪ روی فیش اعمال شد.');
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg whitespace-nowrap"
                  >
                    اعمال
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">خرج امتیاز وفاداری (هر امتیاز ۱,۰۰۰ ت)</label>
                <input
                  type="number"
                  aria-label="امتیاز وفاداری خرج‌شده"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Breakdown Summary (Tax Completely Removed) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>جمع کل اقلام ({priceListType === 'retail' ? 'قیمت تکی' : 'قیمت همکاری/عمده'}):</span>
                <span className="font-mono tabular-nums">{formatCurrency(posTotals.grossTotal)} تومان</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>تخفیف پلکانی پروموشن:</span>
                <span className="font-mono tabular-nums">-{formatCurrency(posTotals.pricingRuleDiscount)} تومان</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>کد تخفیف ({appliedCouponPct}٪) + کسر امتیاز باشگاه:</span>
                <span className="font-mono tabular-nums">
                  -{formatCurrency(posTotals.couponDiscount + posTotals.loyaltyDiscount)} تومان
                </span>
              </div>
              <div className="flex justify-between text-indigo-700 pt-1 border-t border-slate-200">
                <span>امتیاز جدید باشگاه مشتریان · پورسانت معرف:</span>
                <span className="font-mono">
                  +{posTotals.earnedLoyaltyPoints} امتیاز · پورسانت: {formatCurrency(posTotals.partnerCommissionAmount)} ت
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>مبلغ خالص قابل پرداخت (کارتخوان):</span>
                <span className="font-mono tabular-nums text-indigo-700">
                  {formatCurrency(posTotals.netPayable)} تومان
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={cart.length === 0 || shiftClosed}
              onClick={handleCheckoutPos}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>تسویه آنی کارتخوان و چاپ فیش حرارتی ۸ سانتی‌متری</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATIONS & SALES ORDERS */}
      {activeTab === 'quotations' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              پیش‌فاکتورها و تبدیل یک‌کلیکه به سفارش فروش با رزرو موجودی انبار
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              استعلام قیمت رسمی با تاریخ اعتبار مشخص؛ با تبدیل به سفارش فروش، موجودی کالا در انبار برای مشتری رزرو می‌شود.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-3">شماره پیش‌فاکتور</th>
                  <th className="py-2.5 px-3">مشتری · اقلام درخواستی</th>
                  <th className="py-2.5 px-3">اعتبار تا تاریخ</th>
                  <th className="py-2.5 px-3">انبار رزرو موجودی</th>
                  <th className="py-2.5 px-3 text-left">مبلغ برآوردی (تومان)</th>
                  <th className="py-2.5 px-3">عملیات تبدیل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                      {q.quoteNo}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{q.customer}</div>
                      <div className="text-slate-500">{q.itemsDesc}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{q.validUntil}</td>
                    <td className="py-2.5 px-3 text-slate-700">{q.reservedWarehouse}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-left">
                      {formatCurrency(q.amount)}
                    </td>
                    <td className="py-2.5 px-3">
                      {q.convertedToOrder ? (
                        <span className="text-emerald-700 font-semibold">
                          تبدیل‌شده به سفارش فروش (موجودی رزرو شد ✓)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setQuotations((prev) =>
                              prev.map((item) =>
                                item.id === q.id
                                  ? {
                                      ...item,
                                      convertedToOrder: true,
                                      reservedWarehouse: `${item.reservedWarehouse} (رزرو شده)`,
                                    }
                                  : item
                              )
                            );
                            onShowToast(
                              `پیش‌فاکتور ${q.quoteNo} به سفارش فروش قطعی تبدیل شد و موجودی در انبار رزرو گردید.`
                            );
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
                        >
                          تبدیل ۱-کلیکه به سفارش فروش
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SALES PERSON TREE & PARTNER COMMISSIONS */}
      {activeTab === 'commissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              درخت پرسنل فروش و تحقق تارگت ماهانه
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'سارا کاظمی (مدیر ارشد فروش کشوری)',
                  role: 'سرگروه درخت فروش',
                  target: 1500000000,
                  achieved: 1380000000,
                  commissionRate: '۲٪ کل فروش تیم',
                  commissionEarned: 27600000,
                },
                {
                  name: 'آرش نوری (کارشناس فروش سازمانی و عمده)',
                  role: 'زیرمجموعه شعبه مرکزی',
                  target: 800000000,
                  achieved: 740000000,
                  commissionRate: '۳.۵٪ فاکتورهای وصول‌شده',
                  commissionEarned: 25900000,
                },
                {
                  name: 'نگار محمدی (مسئول فروش شعبه الهیه و صندوق)',
                  role: 'زیرمجموعه شعبه الهیه',
                  target: 500000000,
                  achieved: 490000000,
                  commissionRate: '۴٪ فروش حضوری',
                  commissionEarned: 19600000,
                },
              ].map((sp) => {
                const pct = Math.round((sp.achieved / sp.target) * 100);
                return (
                  <div key={sp.name} className="p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{sp.name}</span>
                      <span className="font-mono text-indigo-700">{pct}٪ تحقق تارگت</span>
                    </div>
                    <div className="text-slate-500">
                      {sp.role} · فرمول پورسانت: {sp.commissionRate}
                    </div>
                    <div className="flex justify-between pt-1 text-slate-700">
                      <span>
                        فروش محقق‌شده: <strong className="font-mono">{formatCurrency(sp.achieved)}</strong> از{' '}
                        <strong className="font-mono">{formatCurrency(sp.target)}</strong>
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        پورسانت: {formatCurrency(sp.commissionEarned)} ت
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              مدیریت معرف‌ها و شرکای تجاری
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  partner: 'کافه ویپ جردن (کد معرف: ۱۰۱)',
                  referredInvoices: 28,
                  totalSales: 310000000,
                  commissionPct: 5,
                  payableCommission: 15500000,
                },
                {
                  partner: 'کانال تخصصی بررسی پاد و جویس (کد معرف: ۱۰۴)',
                  referredInvoices: 64,
                  totalSales: 185000000,
                  commissionPct: 7,
                  payableCommission: 12950000,
                },
              ].map((p) => (
                <div key={p.partner} className="p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">{p.partner}</div>
                  <div className="text-slate-500">
                    تعداد فاکتورهای ارجاعی: {p.referredInvoices} فاکتور · نرخ پورسانت: {p.commissionPct}٪
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>فروش ارجاعی: {formatCurrency(p.totalSales)} تومان</span>
                    <span className="font-mono font-bold text-indigo-700">
                      پورسانت قابل تهاتر: {formatCurrency(p.payableCommission)} تومان
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* THERMAL 8CM RECEIPT MODAL */}
      {showThermalReceipt && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thermal-receipt-title"
        >
          <div className="bg-white rounded-xl border border-slate-300 w-80 p-5 space-y-3 shadow-2xl font-mono text-xs">
            <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
              <div id="thermal-receipt-title" className="font-bold text-sm text-slate-900">
                فروشگاه و صندوق امکان
              </div>
              <div className="text-slate-500">فیش حرارتی استاندارد ۸ سانتی‌متری</div>
              <div className="text-slate-600">مشتری: {selectedCustomer}</div>
            </div>
            <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
              {cart.map((c) => (
                <div key={c.item.id} className="flex justify-between">
                  <span className="truncate max-w-[160px]">{c.item.name}</span>
                  <span>
                    {c.qty} × {formatCurrency(Math.round(c.item.retailPrice * priceListMultiplier))}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>جمع کل:</span>
                <span>{formatCurrency(posTotals.grossTotal)} ت</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>مجموع تخفیف و امتیاز:</span>
                <span>
                  -{formatCurrency(posTotals.pricingRuleDiscount + posTotals.couponDiscount + posTotals.loyaltyDiscount)} ت
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
                <span>پرداخت‌شده کارتخوان:</span>
                <span>{formatCurrency(posTotals.netPayable)} تومان</span>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-sans font-semibold"
              >
                چاپ فیش
              </button>
              <button
                type="button"
                onClick={() => setShowThermalReceipt(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-sans font-semibold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
