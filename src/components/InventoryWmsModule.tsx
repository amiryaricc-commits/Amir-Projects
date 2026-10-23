import React, { useState } from 'react';
import {
  Package,
  Layers,
  ArrowLeftRight,
  ShieldCheck,
  Calculator,
  ClipboardCheck,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { InventoryItemRecord } from '../data/erpSeedData';
import {
  formatCurrency,
  allocateLandedCost,
  calculateStockReconciliation,
  generateItemVariants,
  SystemRole,
  checkRolePermission,
} from '../utils/erpEngine';

interface InventoryWmsModuleProps {
  activeRole: SystemRole;
  items: InventoryItemRecord[];
  onUpdateItemStock: (sku: string, newPhysicalQty: number) => void;
  onAddGeneratedVariants: (newItems: InventoryItemRecord[]) => void;
  onShowToast: (msg: string) => void;
}

export const InventoryWmsModule: React.FC<InventoryWmsModuleProps> = ({
  activeRole,
  items,
  onUpdateItemStock,
  onAddGeneratedVariants,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'items' | 'variants' | 'movements' | 'landed_cost' | 'reconciliation'
  >('items');

  // Variant Generator State
  const [templateName, setTemplateName] = useState('پاد هوشمند Peak Bar 60000');
  const [templateSku, setTemplateSku] = useState('PK60-PRO');
  const [flavorsInput, setFlavorsInput] = useState('انبه یخ, هندوانه توت‌فرنگی, نعناع قطبی');
  const [nicotinesInput, setNicotinesInput] = useState('۲۰ میلی‌گرم, ۵۰ میلی‌گرم');

  // Stock Movement State
  const [stockEntries, setStockEntries] = useState([
    {
      id: 'se-1',
      entryNo: 'STE-1404-0210',
      type: 'انتقال بین انبارها (Material Transfer)',
      fromWarehouse: 'انبار مرکزی کهریزک',
      toWarehouse: 'انبار شعبه الهیه',
      itemSummary: '۵۰ عدد پاد Peak Bar 60000 + ۲۰ بسته کارتریج',
      packingWeight: 'وزن خالص: ۸.۴ کیلوگرم · وزن ناخالص کارتن: ۹.۱ کیلوگرم (Packing Slip #PS-92)',
      date: '۱۴۰۴/۰۸/۰۱',
    },
    {
      id: 'se-2',
      entryNo: 'STE-1404-0211',
      type: 'مصرف داخلی و سمپل تستر (Material Issue)',
      fromWarehouse: 'انبار شعبه الهیه',
      toWarehouse: 'استند تستر شوروم',
      itemSummary: '۴ عدد سالت Nasty ۳۰ میل جهت تست حضوری مشتریان',
      packingWeight: 'تحویل به سرپرست شوروم',
      date: '۱۴۰۴/۰۸/۰۲',
    },
    {
      id: 'se-3',
      entryNo: 'PREC-1404-0088',
      type: 'رسید ورود کالا و قرنطینه کیفیت (Purchase Receipt)',
      fromWarehouse: 'تامین‌کننده وارداتی',
      toWarehouse: 'انبار مرکزی کهریزک',
      itemSummary: 'ورود ۵۰۰ عدد دستگاه: ۴۹۶ عدد سالم تاییدشده · ۴ عدد معیوب برگشتی',
      packingWeight: '۵ کارتن مادر پلمپ گمرکی',
      date: '۱۴۰۴/۰۷/۲۹',
    },
  ]);

  // Landed Cost Calculator State
  const [customsCost, setCustomsCost] = useState(25000000);
  const [freightCost, setFreightCost] = useState(9500000);
  const [insuranceCost, setInsuranceCost] = useState(4000000);
  const [landedBasis, setLandedBasis] = useState<'amount' | 'qty' | 'weight'>('amount');

  // Stock Reconciliation State
  const [reconSku, setReconSku] = useState(items[1]?.sku || 'PK60-BLUE-20');
  const [physicalCountInput, setPhysicalCountInput] = useState(14);
  const [materialRequests, setMaterialRequests] = useState([
    {
      id: 'mr-1',
      reqNo: 'MREQ-1404-0091',
      sku: 'PK60-BLUE-20',
      itemName: 'پاد Peak Bar 60000 — بلوبری تمشک',
      currentStock: 18,
      reorderPoint: 25,
      suggestedOrderQty: 50,
      triggerType: 'تولید خودکار توسط نقطه سفارش (Auto Re-order)',
      status: 'ارسال‌شده به واحد تدارکات و خرید',
    },
  ]);

  const totalExtraLanded = customsCost + freightCost + insuranceCost;
  const landedOutput = allocateLandedCost(
    [
      {
        itemCode: 'PK60-MANGO-50',
        itemName: 'پاد Peak Bar 60000 — انبه یخ',
        qty: 100,
        weightGrams: 95,
        unitCost: 750000,
      },
      {
        itemCode: 'SALT-NASTY-30',
        itemName: 'سالت اورجینال Nasty ۳۰ میل',
        qty: 150,
        weightGrams: 55,
        unitCost: 420000,
      },
      {
        itemCode: 'COIL-XROS-06',
        itemName: 'بسته کارتریج XROS 0.6',
        qty: 80,
        weightGrams: 40,
        unitCost: 480000,
      },
    ],
    totalExtraLanded,
    landedBasis
  );

  const selectedReconItem = items.find((i) => i.sku === reconSku) || items[0];
  const reconResult = calculateStockReconciliation(
    selectedReconItem.stockQty,
    physicalCountInput,
    selectedReconItem.valuationRate,
    selectedReconItem.reorderLevel
  );

  const previewVariants = generateItemVariants(
    templateName,
    templateSku,
    flavorsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    nicotinesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            ۴ و ۵. ماژول انبارداری پیشرفته، لجستیک و تدارکات خرید (Stock / WMS & Buying)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            تنوع کالا، ضریب تبدیل چندگانه (Multi-UOM)، پکیج باندل، میانگین موزون، ردیابی سریال و تاریخ انقضا، سرشکن هزینه گمرک و انبارگردانی
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
        {[
          { id: 'items', label: 'الف) کالاها، Multi-UOM، باندل و سریال/بچ', icon: Package },
          { id: 'variants', label: 'موتور تولید خودکار تنوع کالا (Item Variants)', icon: Layers },
          { id: 'movements', label: 'ب) اسناد حرکت انبار، رسید خرید و بارنامه', icon: ArrowLeftRight },
          { id: 'landed_cost', label: 'ج) سرشکن هزینه‌های جانبی خرید (Landed Cost)', icon: Calculator },
          { id: 'reconciliation', label: 'انبارگردانی و نقطه سفارش خودکار (Procurement)', icon: ClipboardCheck },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ITEMS, MULTI-UOM, BUNDLES, SERIAL & BATCH */}
      {activeTab === 'items' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              دفتر کل موجودی کالا، ضرایب تبدیل چندگانه (Multi-UOM)، پکیج‌های باندل و ردیابی سریال/انقضا
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              محاسبه لحظه‌ای ارزش انبار به روش «میانگین موزون متحرک (Moving Average)» و هشدار کالاهای زیر نقطه سفارش
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-3">کد SKU · سری ساخت</th>
                  <th className="py-2.5 px-3">نام کالا / پکیج باندل</th>
                  <th className="py-2.5 px-3">واحد شمارش و ضریب تبدیل</th>
                  <th className="py-2.5 px-3">سریال‌ها و تاریخ انقضا</th>
                  <th className="py-2.5 px-3">موجودی (آزاد / رزرو)</th>
                  <th className="py-2.5 px-3 text-left">بهای تمام‌شده (میانگین موزون)</th>
                  <th className="py-2.5 px-3 text-left">قیمت فروش تکی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const lowStock = item.stockQty <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono">
                        <div className="font-semibold text-slate-900">{item.sku}</div>
                        <div className="text-slate-500">Batch: {item.batchNo}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-slate-500 mt-0.5">
                          <span>{item.category}</span>
                          {item.flavor && (
                            <>
                              <span className="mx-1" aria-hidden="true">·</span>
                              <span>طعم: {item.flavor}</span>
                            </>
                          )}
                          {item.isBundle && item.bundleComponents && (
                            <div className="text-indigo-700 font-medium mt-0.5">
                              اجزای پکیج (کسر خودکار از انبار): {item.bundleComponents.join(' + ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>واحد پایه: {item.uomPrimary}</div>
                        <div className="text-slate-500">
                          ۱ {item.uomSecondary} = {item.conversionFactor} {item.uomPrimary}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div className="font-mono text-[11px]">
                          {item.serialNumbers.slice(0, 2).join(', ')}
                        </div>
                        <div className="text-slate-500">انقضا: {item.expiryDate}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div
                          className={`font-mono font-bold ${
                            lowStock ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {item.stockQty} {item.uomPrimary} {lowStock && '(نیاز به شارژ!)'}
                        </div>
                        <div className="text-slate-500">
                          رزرو سفارش: {item.reservedQty} · نقطه سفارش: {item.reorderLevel}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-left text-slate-700">
                        {checkRolePermission(activeRole, 'view_buying_cost')
                          ? `${formatCurrency(item.valuationRate)} ت`
                          : '🔒 مخفی (عدم دسترسی)'}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-left text-slate-900">
                        {formatCurrency(item.retailPrice)} ت
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ITEM VARIANTS GENERATOR */}
      {activeTab === 'variants' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              تولید خودکار زیرکالاها از کالای مادر (Item Variants & Attributes Matrix)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تعریف یک کالای مادر و ساخت خودکار تمامی زیرکالاها بر اساس ماتریس ویژگی‌ها (طعم، نیکوتین، رنگ، وضعیت آکبند/کارکرده)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">نام کالای مادر (Template)</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">پیشوند کد SKU</label>
              <input
                type="text"
                value={templateSku}
                onChange={(e) => setTemplateSku(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">ویژگی طعم‌ها (با ویرگول)</label>
              <input
                type="text"
                value={flavorsInput}
                onChange={(e) => setFlavorsInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">میزان نیکوتین (با ویرگول)</label>
              <input
                type="text"
                value={nicotinesInput}
                onChange={(e) => setNicotinesInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                پیش‌نمایش {previewVariants.length} زیرکالای تولیدشده:
              </span>
              <button
                type="button"
                onClick={() => {
                  const created: InventoryItemRecord[] = previewVariants.map((v, i) => ({
                    id: `var-${Date.now()}-${i}`,
                    sku: v.sku,
                    name: v.variantName,
                    category: 'دستگاه پاد و ماد',
                    brand: 'Peak Bar',
                    flavor: v.flavor,
                    nicotine: v.nicotine,
                    condition: 'آکبند شرکتی',
                    uomPrimary: 'عدد',
                    uomSecondary: 'بسته ۱۰ عددی',
                    conversionFactor: 10,
                    stockQty: 40,
                    reservedQty: 0,
                    reorderLevel: 15,
                    valuationRate: 780000,
                    retailPrice: 1180000,
                    wholesalePrice: 960000,
                    partnerPrice: 1020000,
                    serialNumbers: [`SN-${v.sku}-01`],
                    batchNo: 'BCH-2026-NEW',
                    expiryDate: '۱۴۰۶/۰۸/۰۱',
                  }));
                  onAddGeneratedVariants(created);
                  onShowToast(`${created.length} تنوع کالای جدید با موفقیت به انبار اضافه شدند.`);
                }}
                className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                + ثبت و افزودن تمامی زیرکالاها به انبار
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {previewVariants.map((v) => (
                <div key={v.sku} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-mono font-semibold text-indigo-700">{v.sku}</div>
                  <div className="font-bold text-slate-900 mt-0.5">{v.variantName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK MOVEMENTS, PURCHASE RECEIPT & PACKING SLIP */}
      {activeTab === 'movements' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                اسناد حرکت انبار (Stock Entry)، رسید کنترل کیفیت ورود کالا (Purchase Receipt) و بارنامه (Packing Slip)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                انتقال بین انبارها، مصرف داخلی و تستر، بسته‌بندی مجدد (Repack) و ثبت وزن خالص/ناخالص کارتن‌ها
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStockEntries([
                  {
                    id: `se-${Date.now()}`,
                    entryNo: `STE-1404-${212 + stockEntries.length}`,
                    type: 'بسته‌بندی مجدد پکیج (Repack / Bundle)',
                    fromWarehouse: 'انبار مرکزی کهریزک',
                    toWarehouse: 'انبار فروش آنلاین',
                    itemSummary: 'تولید ۲۰ پکیج استارتر از کالاهای منفرد انبار',
                    packingWeight: 'وزن خالص: ۶.۲ کیلوگرم · وزن ناخالص: ۶.۸ کیلوگرم',
                    date: '۱۴۰۴/۰۸/۰۲',
                  },
                  ...stockEntries,
                ]);
                onShowToast('سند حرکت انبار و بارنامه (Packing Slip) جدید صادر شد.');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
            >
              + ثبت سند حرکت انبار / بارنامه جدید
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {stockEntries.map((se) => (
              <div
                key={se.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700">{se.entryNo}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-slate-900">{se.type}</span>
                  </div>
                  <div className="text-slate-700">
                    از: <strong>{se.fromWarehouse}</strong> ← به: <strong>{se.toWarehouse}</strong> · {se.itemSummary}
                  </div>
                  <div className="text-slate-500">{se.packingWeight}</div>
                </div>
                <div className="font-mono text-slate-500">{se.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LANDED COST VOUCHER */}
      {activeTab === 'landed_cost' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              سرشکن کردن هزینه‌های جانبی خرید روی بهای تمام‌شده کالا (Landed Cost Voucher)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تقسیم خودکار هزینه گمرک، باربری، تیپاکس و بیمه روی تک‌تک کالاهای فاکتور خرید بر اساس مبلغ، تعداد یا وزن
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">هزینه گمرک و ترخیص (تومان)</label>
              <input
                type="number"
                value={customsCost}
                onChange={(e) => setCustomsCost(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">هزینه حمل هوایی و باربری (تومان)</label>
              <input
                type="number"
                value={freightCost}
                onChange={(e) => setFreightCost(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">هزینه بیمه باربری (تومان)</label>
              <input
                type="number"
                value={insuranceCost}
                onChange={(e) => setInsuranceCost(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">مبنای تسهیم هزینه</label>
              <select
                aria-label="مبنای تسهیم هزینه جانبی"
                value={landedBasis}
                onChange={(e) => setLandedBasis(e.target.value as 'amount' | 'qty' | 'weight')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="amount">بر اساس مبلغ ارزی/ریالی کالا</option>
                <option value="qty">بر اساس تعداد کالا</option>
                <option value="weight">بر اساس وزن ناخالص (گرم)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-3">کد و نام کالا</th>
                  <th className="py-2.5 px-3">تعداد · وزن واحد</th>
                  <th className="py-2.5 px-3 text-left">قیمت خرید اولیه (واحد)</th>
                  <th className="py-2.5 px-3 text-left">سهم از هزینه جانبی (کل ردیف)</th>
                  <th className="py-2.5 px-3 text-left">بهای تمام‌شده نهایی هر عدد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {landedOutput.map((row) => (
                  <tr key={row.itemCode} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className="font-mono text-slate-500 ml-2">{row.itemCode}</span>
                      {row.itemName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {row.qty} عدد · {row.weightGrams} گرم
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-left">
                      {formatCurrency(row.unitCost)} ت
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-left text-indigo-700 font-semibold">
                      +{formatCurrency(row.allocatedLandedCost)} ت
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-left text-emerald-700 font-bold">
                      {formatCurrency(row.finalUnitCost)} تومان
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STOCK RECONCILIATION & AUTO RE-ORDER */}
      {activeTab === 'reconciliation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                انبارگردانی و تعدیل موجودی فیزیکی قفسه‌ها (Stock Reconciliation)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مقایسه شمارش فیزیکی انبارگردانی با موجودی سیستم و صدور خودکار سند مالی کسری یا اضافات انبار
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">انتخاب کالا جهت شمارش</label>
                <select
                  aria-label="کالای انبارگردانی"
                  value={reconSku}
                  onChange={(e) => setReconSku(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.sku}>
                      {i.name} (سیستم: {i.stockQty})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  شمارش فیزیکی قفسه (Physical Qty)
                </label>
                <input
                  type="number"
                  aria-label="تعداد شمارش فیزیکی"
                  value={physicalCountInput}
                  onChange={(e) => setPhysicalCountInput(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">موجودی فعلی سیستم:</span>
                <span className="font-mono font-bold">{selectedReconItem.stockQty} عدد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">مغایرت انبارگردانی (کسری / اضافات):</span>
                <span
                  className={`font-mono font-bold ${
                    reconResult.varianceQty < 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {reconResult.varianceQty > 0 ? `+${reconResult.varianceQty}` : reconResult.varianceQty} عدد
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ارزش ریالی سند تعدیل انبار:</span>
                <span className="font-mono font-bold">
                  {formatCurrency(reconResult.varianceValue)} تومان
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onUpdateItemStock(selectedReconItem.sku, physicalCountInput);
                if (reconResult.needsAutoReorder) {
                  setMaterialRequests([
                    {
                      id: `mr-${Date.now()}`,
                      reqNo: `MREQ-1404-00${92 + materialRequests.length}`,
                      sku: selectedReconItem.sku,
                      itemName: selectedReconItem.name,
                      currentStock: physicalCountInput,
                      reorderPoint: selectedReconItem.reorderLevel,
                      suggestedOrderQty: reconResult.suggestedOrderQty,
                      triggerType: 'نقطه سفارش خودکار پس از انبارگردانی',
                      status: 'در انتظار تایید مدیر خرید',
                    },
                    ...materialRequests,
                  ]);
                }
                onShowToast(
                  `موجودی کالای ${selectedReconItem.sku} به ${physicalCountInput} عدد تعدیل شد و سند مالی انبارگردانی صادر گردید.`
                );
              }}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              ثبت سند تعدیل انبارگردانی و به‌روزرسانی موجودی
            </button>
          </div>

          {/* Material Requests & Auto Reorder */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                درخواست مواد و کالا و نقطه سفارش خودکار (Material Request & Auto Re-order)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                به محض رسیدن موجودی کالا به حداقل مجاز (Re-order Level)، سیستم خودکار درخواست خرید صادر می‌کند.
              </p>
            </div>
            <div className="space-y-3 text-xs">
              {materialRequests.map((mr) => (
                <div key={mr.id} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="font-mono text-indigo-700">{mr.reqNo}</span>
                    <span>پیشنهاد خرید: {mr.suggestedOrderQty} عدد</span>
                  </div>
                  <div className="font-semibold text-slate-800">{mr.itemName}</div>
                  <div className="text-slate-500">
                    موجودی فعلی: {mr.currentStock} · نقطه سفارش: {mr.reorderPoint} · {mr.triggerType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
