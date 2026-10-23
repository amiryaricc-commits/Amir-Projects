import React, { useState } from 'react';
import {
  Wrench,
  Globe,
  UserCheck,
  FileEdit,
  Search,
  ShoppingCart,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { InventoryItemRecord, WarrantyTicketRecord, SalesInvoiceRecord } from '../data/erpSeedData';
import { formatCurrency } from '../utils/erpEngine';

interface SupportWebshopModuleProps {
  inventoryItems: InventoryItemRecord[];
  warrantyTickets: WarrantyTicketRecord[];
  onAddWarrantyTicket: (ticket: WarrantyTicketRecord) => void;
  salesInvoices: SalesInvoiceRecord[];
  onWebshopOrderCheckout: (item: InventoryItemRecord) => void;
  onShowToast: (msg: string) => void;
}

export const SupportWebshopModule: React.FC<SupportWebshopModuleProps> = ({
  inventoryItems,
  warrantyTickets,
  onAddWarrantyTicket,
  salesInvoices,
  onWebshopOrderCheckout,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'webshop' | 'warranty' | 'portal' | 'builder'>('webshop');

  // Webshop Filter
  const [brandFilter, setBrandFilter] = useState('همه');

  // Serial Lookup & Warranty Claim
  const [serialQuery, setSerialQuery] = useState('SN-PK60-99101');
  const [newClaimCustomer, setNewClaimCustomer] = useState('');
  const [newClaimIssue, setNewClaimIssue] = useState('');

  // Web Form Submission State
  const [agencyApplicant, setAgencyApplicant] = useState('');
  const [agencyCity, setAgencyCity] = useState('');
  const [submittedWebFormsCount, setSubmittedWebFormsCount] = useState(19);

  const filteredShopItems = inventoryItems.filter((i) =>
    brandFilter === 'همه' ? true : i.brand === brandFilter
  );

  const matchedSerialItem = inventoryItems.find((i) =>
    i.serialNumbers.some((sn) => sn.toLowerCase() === serialQuery.trim().toLowerCase())
  );

  const handleWarrantySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimCustomer.trim() || !newClaimIssue.trim()) return;
    onAddWarrantyTicket({
      id: `war-${Date.now()}`,
      ticketNo: `SUP-1404-0${43 + warrantyTickets.length}`,
      serialNo: serialQuery || 'SN-PK60-99102',
      customerName: newClaimCustomer.trim(),
      itemName: matchedSerialItem?.name || 'پاد هوشمند Peak Bar 60000',
      issueDescription: newClaimIssue.trim(),
      warrantyExpiry: '۱۴۰۵/۰۶/۳۰',
      status: 'پذیرش در تعمیرگاه',
      repairCost: 0,
    });
    setNewClaimCustomer('');
    setNewClaimIssue('');
    onShowToast('پرونده پذیرش گارانتی و تعمیرات با موفقیت ثبت شد.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            ۹ و ۱۰. ماژول پشتیبانی، گارانتی، فروشگاه اینترنتی و پورتال مشتریان (Support, Webshop & Portal)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            فروشگاه آنلاین متصل به موجودی زنده انبار، استعلام سریال گارانتی و تعمیرات، پورتال مشتریان و صفحه‌ساز بدون کدنویسی
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
        {[
          { id: 'webshop', label: 'فروشگاه آنلاین یکپارچه (Built-in Webshop)', icon: Globe },
          { id: 'warranty', label: 'پشتیبانی، استعلام سریال گارانتی و تعمیرات', icon: Wrench },
          { id: 'portal', label: 'پورتال اختصاصی مشتریان و تامین‌کنندگان', icon: UserCheck },
          { id: 'builder', label: 'صفحه‌ساز، وبلاگ سئو و فرم‌های تحت وب (Web Forms)', icon: FileEdit },
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

      {/* TAB 1: BUILT-IN WEBSHOP */}
      {activeTab === 'webshop' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ویترین فروشگاه اینترنتی متصل به موجودی لحظه‌ای انبار ERP
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                هر خرید در سایت فروشگاهی مستقیماً فاکتور فروش صادر کرده و از موجودی انبار کسر می‌کند.
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {['همه', 'Peak Bar', 'Nasty Juice', 'Vaporesso', 'FaraPay Bundle'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrandFilter(b)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    brandFilter === b
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredShopItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-4 hover:border-indigo-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>برند: {item.brand}</span>
                    <span>موجودی آنلاین: {item.stockQty} {item.uomPrimary}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <div className="text-xs text-slate-600">
                    <span>طعم: {item.flavor || 'استاندارد'}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>نیکوتین: {item.nicotine || '۰'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="font-mono tabular-nums text-sm font-bold text-indigo-700">
                    {formatCurrency(item.retailPrice)} تومان
                  </span>
                  <button
                    type="button"
                    onClick={() => onWebshopOrderCheckout(item)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                  >
                    خرید آنلاین و ثبت سفارش ERP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUPPORT, SERIAL WARRANTY LOOKUP & REPAIRS */}
      {activeTab === 'warranty' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                استعلام اصالت و گارانتی بر اساس شماره سریال یکتا (Serial Tracking)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                بررسی تاریخ انقضای گارانتی هر سریال و ثبت پذیرش تعمیرگاه یا تعویض دستگاه
              </p>
            </div>

            <div className="flex gap-2 text-xs">
              <input
                type="text"
                aria-label="شماره سریال دستگاه جهت استعلام گارانتی"
                value={serialQuery}
                onChange={(e) => setSerialQuery(e.target.value)}
                placeholder="مثلاً SN-PK60-99101"
                className="flex-1 px-3 py-2 font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              {matchedSerialItem ? (
                <>
                  <div className="font-bold text-emerald-800">
                    ✓ سریال معتبر در دیتابیس انبار یافت شد: {matchedSerialItem.name}
                  </div>
                  <div className="text-slate-600">
                    سری ساخت: {matchedSerialItem.batchNo} · وضعیت گارانتی شرکتی: فعال تا ۱۴۰۵/۰۶/۳۰
                  </div>
                </>
              ) : (
                <div className="text-slate-600">
                  سریال نمونه جهت تست: <code className="font-mono">SN-PK60-99101</code> یا{' '}
                  <code className="font-mono">SN-VP-7001</code>
                </div>
              )}
            </div>

            <form onSubmit={handleWarrantySubmit} className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              <div className="font-bold text-slate-900">فرم پذیرش دستگاه در واحد گارانتی و تعمیرات:</div>
              <div>
                <label className="block text-slate-600 mb-1">نام مشتری مراجعه‌کننده</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً بهروز کریمی"
                  value={newClaimCustomer}
                  onChange={(e) => setNewClaimCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">شرح ایراد فنی دستگاه</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً خطای سنسور کام‌دهی اتوماتیک یا نشتی کارتریج"
                  value={newClaimIssue}
                  onChange={(e) => setNewClaimIssue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                ثبت قبض پذیرش تعمیرات / گارانتی
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              پرونده‌های فعال گارانتی و تعمیرات (Warranty & Maintenance Tickets)
            </h3>
            <div className="space-y-3 text-xs">
              {warrantyTickets.map((t) => (
                <div key={t.id} className="p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="font-mono text-indigo-700">
                      {t.ticketNo} · سریال: {t.serialNo}
                    </span>
                    <span className="text-emerald-700">{t.status}</span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {t.customerName} — {t.itemName}
                  </div>
                  <div className="text-slate-600">{t.issueDescription}</div>
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>انقضای گارانتی: {t.warrantyExpiry}</span>
                    <span className="font-mono">
                      هزینه تعمیر: {t.repairCost === 0 ? 'رایگان (تحت پوشش گارانتی)' : `${formatCurrency(t.repairCost)} ت`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER & SUPPLIER PORTAL */}
      {activeTab === 'portal' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              پورتال اختصاصی مشتریان و تامین‌کنندگان (Customer / Supplier Self-Service Portal)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              نمای پنل مشتری پس از لاگین: مشاهده سوابق فاکتورها، اقساط باقی‌مانده و کد رهگیری مرسوله پستی/تیپاکس
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">حساب کاربری متصل در پورتال</div>
              <div className="font-bold text-slate-900 text-sm mt-1">
                پخش سراسری نیکوتین‌پارس (مشتری VIP)
              </div>
              <div className="text-indigo-700 mt-1">سطح باشگاه: طلایی · ۱,۴۵۰ امتیاز</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">مانده بدهی اقساطی باز</div>
              <div className="font-mono font-bold text-rose-700 text-sm mt-1">
                ۱۰۱,۵۰۰,۰۰۰ تومان
              </div>
              <div className="text-slate-500 mt-1">سررسید قسط بعدی: ۱۴۰۴/۰۹/۰۱</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">وضعیت آخرین مرسوله ارسالی</div>
              <div className="font-bold text-emerald-700 text-sm mt-1">
                تحویل به تیپاکس (کد رهگیری: TPX-8849201)
              </div>
              <div className="text-slate-500 mt-1">بسته‌بندی تاییدشده توسط انبار کهریزک</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEB PAGE BUILDER, SEO BLOG & WEB FORMS */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              صفحه‌ساز بدون کدنویسی و مقالات سئو (Web Page Builder & SEO Blog)
            </h3>
            <div className="space-y-2.5 text-xs">
              {[
                {
                  page: 'لندینگ‌پیج جشنواره پاییزه پاد Peak Bar 60000',
                  slug: '/landing/peak-bar-60000',
                  seoScore: 'سئو کامل (Schema.org Product JSON-LD فعال)',
                },
                {
                  page: 'مقاله وبلاگ: تفاوت تخصصی جویس (DTL) و سالت نیکوتین (MTL)',
                  slug: '/blog/mtl-vs-dtl-complete-guide',
                  seoScore: 'رتبه ۱ گوگل · ۴,۲۰۰ بازدید ماهانه',
                },
                {
                  page: 'صفحه استعلام آنلاین اصالت کالا و سریال گارانتی',
                  slug: '/warranty-check',
                  seoScore: 'متصل به جدول Serial Number انبار',
                },
              ].map((pg) => (
                <div key={pg.slug} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">{pg.page}</div>
                  <div className="font-mono text-indigo-700">{pg.slug}</div>
                  <div className="text-slate-500">{pg.seoScore}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                فرم‌های تحت وب متصل به دیتابیس ERP (Web Forms)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                فرم آنلاین «درخواست اخذ نمایندگی فروش و همکاری عمده» (تعداد فرم‌های دریافتی: {submittedWebFormsCount})
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!agencyApplicant.trim()) return;
                setSubmittedWebFormsCount((c) => c + 1);
                setAgencyApplicant('');
                setAgencyCity('');
                onShowToast('فرم آنلاین درخواست نمایندگی مستقیماً در جدول سرنخ‌های ERP ثبت شد.');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-medium text-slate-700 mb-1">نام متقاضی نمایندگی / فروشگاه</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً گالری ویپ مدرن اهواز"
                  value={agencyApplicant}
                  onChange={(e) => setAgencyApplicant(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">شهر و استان فعالیت</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً اهواز - کیانپارس"
                  value={agencyCity}
                  onChange={(e) => setAgencyCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                ارسال فرم آنلاین به هسته ERP
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
