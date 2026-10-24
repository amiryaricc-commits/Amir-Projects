import React, { useState } from 'react';
import {
  Globe,
  UserCheck,
  FileEdit,
  CreditCard,
  Download,
} from 'lucide-react';
import { InventoryItemRecord, SalesInvoiceRecord } from '../data/erpSeedData';
import { formatCurrency } from '../utils/erpEngine';

interface SupportWebshopModuleProps {
  inventoryItems: InventoryItemRecord[];
  salesInvoices: SalesInvoiceRecord[];
  onWebshopOrderCheckout: (item: InventoryItemRecord) => void;
  onShowToast: (msg: string) => void;
}

export const SupportWebshopModule: React.FC<SupportWebshopModuleProps> = ({
  inventoryItems,
  salesInvoices,
  onWebshopOrderCheckout,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'webshop' | 'portal' | 'builder'>('webshop');

  // Webshop Filter
  const [brandFilter, setBrandFilter] = useState('همه');

  // Web Form Submission State
  const [agencyApplicant, setAgencyApplicant] = useState('');
  const [agencyCity, setAgencyCity] = useState('');
  const [submittedWebFormsCount, setSubmittedWebFormsCount] = useState(19);

  const filteredShopItems = inventoryItems.filter((i) =>
    brandFilter === 'همه' ? true : i.brand === brandFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            وبسایت، فروشگاه اینترنتی و پورتال مشتریان
          </h2>
          <p className="text-sm text-slate-500">
            فروش آنلاین متصل به انبار، پورتال اختصاصی مشتریان و مدیریت محتوای سایت
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        {[
          { id: 'webshop', label: 'فروشگاه اینترنتی', icon: Globe },
          { id: 'portal', label: 'پورتال مشتریان', icon: UserCheck },
          { id: 'builder', label: 'سایت‌ساز و فرم‌های تماس', icon: FileEdit },
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
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BUILT-IN WEBSHOP */}
      {activeTab === 'webshop' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                فروشگاه آنلاین یکپارچه با موجودی انبار
              </h3>
              <p className="text-xs text-slate-500">
                ثبت سفارش آنلاین به‌صورت خودکار فاکتور فروش صادر کرده و از انبار کسر می‌کند
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {['همه', 'پیک‌بار', 'نستی جویس', 'واپورسو', 'پکیج امکان'].map((b) => (
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
                    خرید آنلاین و ثبت سفارش
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER & SUPPLIER PORTAL */}
      {activeTab === 'portal' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              پورتال اختصاصی مشتریان و تامین‌کنندگان
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              پنل اختصاصی هر مشتری برای مشاهده سوابق فاکتورها، وضعیت سفارش‌ها، دانلود صورت‌حساب و تسویه آنلاین بدهی
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">حساب کاربری متصل در پورتال</div>
              <div className="font-bold text-slate-900 text-sm mt-1">
                پخش سراسری نیکوتین‌پارس (مشتری ویژه)
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
              <div className="text-slate-500">وضعیت آخرین سفارش ارسالی</div>
              <div className="font-bold text-emerald-700 text-sm mt-1">
                تحویل به تیپاکس (کد رهگیری: ۸۸۴۹۲۰۱)
              </div>
              <div className="text-slate-500 mt-1">ارسال‌شده از انبار مرکزی کهریزک</div>
            </div>
          </div>

          {/* Customer Invoice History inside Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              سوابق فاکتورها و لینک تسویه آنلاین در پورتال مشتری
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">شماره فاکتور</th>
                    <th className="py-2.5 px-3">تاریخ صدور</th>
                    <th className="py-2.5 px-3">شرح اقلام</th>
                    <th className="py-2.5 px-3 text-left">مبلغ کل</th>
                    <th className="py-2.5 px-3 text-left">مانده قابل پرداخت</th>
                    <th className="py-2.5 px-3 text-left">عملیات پورتال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesInvoices.map((inv) => {
                    const rem = Math.max(0, inv.totalAmount - inv.paidAmount);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{inv.date}</td>
                        <td className="py-2.5 px-3 text-slate-700">{inv.itemsSummary}</td>
                        <td className="py-2.5 px-3 font-mono text-left">
                          {formatCurrency(inv.totalAmount)} ت
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-left text-rose-700">
                          {formatCurrency(rem)} ت
                        </td>
                        <td className="py-2.5 px-3 text-left">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>دانلود صورت‌حساب</span>
                            </button>
                            {rem > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onShowToast(
                                    `لینک درگاه پرداخت آنلاین برای فاکتور ${inv.invoiceNo} به مبلغ ${formatCurrency(rem)} تومان باز شد.`
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>تسویه آنلاین</span>
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
        </div>
      )}

      {/* TAB 3: WEB PAGE BUILDER, SEO BLOG & WEB FORMS */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              سایت‌ساز، صفحات فرود و مقالات وبلاگ
            </h3>
            <div className="space-y-2.5 text-xs">
              {[
                {
                  page: 'صفحه فرود جشنواره پاییزه پاد پیک‌بار ۶۰۰۰۰',
                  slug: 'مسیر صفحه: جشنواره پاییزه پیک‌بار',
                  seoScore: 'سئو کامل (متصل به کاتالوگ محصولات انبار)',
                },
                {
                  page: 'مقاله وبلاگ: تفاوت تخصصی جویس و سالت نیکوتین',
                  slug: 'مسیر صفحه: راهنمای جامع خرید پاد و سالت',
                  seoScore: 'رتبه ۱ موتورهای جستجو · ۴,۲۰۰ بازدید ماهانه',
                },
                {
                  page: 'صفحه کاتالوگ همکاری و شرایط اخذ نمایندگی فروش',
                  slug: 'مسیر صفحه: همکاری و فروش عمده',
                  seoScore: 'متصل به فرم ثبت سرنخ فروش در واحد ارتباط با مشتری',
                },
              ].map((pg) => (
                <div key={pg.page} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">{pg.page}</div>
                  <div className="text-indigo-700">{pg.slug}</div>
                  <div className="text-slate-500">{pg.seoScore}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                فرم‌های تماس و درخواست نمایندگی متصل به سرنخ‌های فروش
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
                onShowToast('فرم آنلاین درخواست نمایندگی مستقیماً در جدول سرنخ‌های فروش ثبت شد.');
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
                ارسال فرم آنلاین به واحد فروش
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
