import React, { useState } from 'react';
import {
  Printer,
  BarChart3,
  FileSpreadsheet,
  Shield,
  Code2,
  Download,
  Upload,
} from 'lucide-react';
import { AuditLogRecord } from '../data/erpSeedData';
import { formatCurrency, stripEnglishTerms } from '../utils/erpEngine';

interface FrappeCoreModuleProps {
  auditLogs: AuditLogRecord[];
  onExportFullData: () => void;
  onShowToast: (msg: string) => void;
}

export const FrappeCoreModule: React.FC<FrappeCoreModuleProps> = ({
  auditLogs,
  onExportFullData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'print_notify' | 'report_dashboard' | 'import_export' | 'permissions_audit' | 'scripts_api'
  >('print_notify');

  // Role Permission Preview State
  const [previewRole, setPreviewRole] = useState<'مدیر کل سامانه' | 'صندوقدار فروشگاه'>(
    'مدیر کل سامانه'
  );
  const [branchRestriction, setBranchRestriction] = useState<'همه شعب' | 'فقط شعبه الهیه'>(
    'همه شعب'
  );

  // Dynamic Report Builder State
  const [reportTarget, setReportTarget] = useState<'فاکتورهای فروش' | 'موجودی کالا و انبار' | 'گردش مراکز هزینه'>(
    'فاکتورهای فروش'
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'شماره سند',
    'نام طرف حساب',
    'شعبه',
    'مبلغ کل',
    'مانده تسویه‌نشده',
  ]);

  // Server Script State
  const [serverScriptCode, setServerScriptCode] = useState(
    `// قانون خودکار سمت سرور (پیش از ثبت نهایی فاکتور فروش):
اگر (مبلغ_کل_فاکتور > ۵۰,۰۰۰,۰۰۰ تومان) آنگاه:
    ارسال_اعلان_فوری(
        گیرنده = "پیام_رسان_مدیرعامل"،
        پیام = "فاکتور فروش کلان به مبلغ " + مبلغ_کل_فاکتور + " تومان ثبت شد."
    )
    اولویت_ارسال_انبار = "فوری_ویژه"`
  );

  const toggleReportColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            تنظیمات و امکانات هسته سیستم
          </h2>
          <p className="text-sm text-slate-500">
            اعلان‌های خودکار، قالب چاپ، گزارش‌ساز پویا، ورود و خروج اکسل، دسترسی‌ها و وب‌هوک
          </p>
        </div>
        <button
          type="button"
          onClick={onExportFullData}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>خروجی کامل پایگاه داده</span>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        {[
          { id: 'print_notify', label: 'اعلان‌ها و قالب چاپ', icon: Printer },
          { id: 'report_dashboard', label: 'گزارش‌ساز و داشبورد', icon: BarChart3 },
          { id: 'import_export', label: 'ورود و خروج اکسل', icon: FileSpreadsheet },
          { id: 'permissions_audit', label: 'دسترسی‌ها و لاگ امنیتی', icon: Shield },
          { id: 'scripts_api', label: 'وب‌هوک و اسکریپت‌ها', icon: Code2 },
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

      {/* TAB 1: NOTIFICATIONS ENGINE & PRINT FORMAT BUILDER */}
      {activeTab === 'print_notify' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                سیستم اعلان‌های خودکار (پیامک، ایمیل و اعلان داخلی)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ارسال خودکار هشدار بر اساس رویدادها (رسیدن چک به سررسید، کمبود موجودی انبار یا ثبت فاکتور جدید)
              </p>
            </div>
            <div className="space-y-3 text-xs">
              {[
                {
                  rule: 'وقتی فاکتور فروش جدید بالای ۵۰,۰۰۰,۰۰۰ تومان ثبت شد',
                  channel: 'ارسال پیامک و اعلان آنی به مدیرعامل و مدیر مالی',
                  status: 'فعال',
                },
                {
                  rule: 'وقتی ۴۸ ساعت تا سررسید چک صیادی یا قسط مشتری باقی مانده باشد',
                  channel: 'ارسال پیامک یادآوری خودکار به مشتری + اعلان داخلی به خزانه‌دار',
                  status: 'فعال',
                },
                {
                  rule: 'وقتی موجودی کالا در انبار به نقطه سفارش رسید',
                  channel: 'ارسال اعلان داخلی به سرپرست انبار جهت ثبت درخواست شارژ کالا',
                  status: 'فعال',
                },
              ].map((n) => (
                <div key={n.rule} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">رویداد: {n.rule}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                      {n.status}
                    </span>
                  </div>
                  <div className="text-slate-600">{n.channel}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                طراح فرمت چاپ اسناد و فاکتورها
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                شخصی‌سازی ظاهر فاکتورها، رسیدها و اسناد چاپی با چیدمان دلخواه، لوگو و مهر شرکت
              </p>
            </div>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'قالب فاکتور فروش رسمی شرکتی (افقی همراه با لوگو و مهر دیجیتال)',
                  target: 'فاکتور فروش',
                },
                {
                  name: 'فیش حرارتی ۸ سانتی‌متری صندوق فروشگاهی (همراه با بارکد و امتیاز باشگاه)',
                  target: 'فیش صندوق فروشگاهی',
                },
                {
                  name: 'برچسب بارکد و سریال حرارتی ۵×۳ سانتی‌متری ویژه قفسه‌های انبار',
                  target: 'کالا و شماره سریال',
                },
              ].map((pf) => (
                <div
                  key={pf.name}
                  className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">{pf.name}</div>
                    <div className="text-slate-500 mt-0.5">سند متصل: {pf.target}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                  >
                    پیش‌نمایش چاپ
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC REPORT BUILDER & DASHBOARD CHART */}
      {activeTab === 'report_dashboard' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                گزارش‌ساز و داشبوردساز پویا (بدون کدنویسی)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                انتخاب ستون‌های دلخواه، فیلترهای تحلیلی و ساخت کارت‌های آماری و نمودارهای مدیریتی
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">منبع داده گزارش:</span>
              {(['فاکتورهای فروش', 'موجودی کالا و انبار', 'گردش مراکز هزینه'] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setReportTarget(src)}
                  className={`px-3 py-1.5 rounded-lg font-semibold ${
                    reportTarget === src
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-800">ستون‌های فعال در گزارش سفارشی ({reportTarget}):</div>
            <div className="flex flex-wrap gap-2">
              {[
                'شماره سند',
                'نام طرف حساب',
                'شعبه',
                'کانال فروش',
                'مبلغ کل',
                'مانده تسویه‌نشده',
                'بهای تمام‌شده',
                'سود خالص ردیف',
              ].map((col) => {
                const active = selectedColumns.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => toggleReportColumn(col)}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {active ? `✓ ${col}` : `+ ${col}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500">کارت آماری ۱: میانگین مبلغ هر فاکتور</div>
              <div className="font-mono font-bold text-base text-slate-900">۴۶,۰۶۲,۵۰۰ تومان</div>
              <div className="text-emerald-700">+۱۸٪ رشد نسبت به ماه قبل</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500">کارت آماری ۲: نرخ وصول مطالبات</div>
              <div className="font-mono font-bold text-base text-indigo-700">۷۴.۸٪</div>
              <div className="text-slate-500">بر اساس فاکتورهای ثبت قطعی‌شده</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500">کارت آماری ۳: حاشیه سود ناخالص میانگین</div>
              <div className="font-mono font-bold text-base text-emerald-700">۳۱.۴٪</div>
              <div className="text-slate-500">پس از کسر بهای تمام‌شده میانگین موزون</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BULK DATA IMPORT / EXPORT TOOL */}
      {activeTab === 'import_export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ورود دسته‌جمعی اطلاعات از فایل اکسل (ایمپورت انبوه)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  بارگذاری یک‌باره هزاران ردیف کالا، لیست قیمت همکار، طرف‌حساب‌ها یا اسناد افتتاحیه
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                {
                  title: 'قالب اکسل ورود و به‌روزرسانی دسته‌جمعی کالاها و لیست قیمت',
                  records: 'پشتیبانی از کد کالا، نام، برند، طعم، قیمت تکی و قیمت عمده',
                },
                {
                  title: 'قالب اکسل ورود اطلاعات مشتریان و مانده حساب اول دوره',
                  records: 'پشتیبانی از نام مشتری، تلفن، سقف اعتبار و سطح باشگاه مشتریان',
                },
                {
                  title: 'قالب اکسل ورود اسناد حسابداری روزنامه و درخت حساب‌ها',
                  records: 'کنترل خودکار تراز بودن بدهکار و بستانکار پیش از ثبت نهایی',
                },
              ].map((tpl) => (
                <div
                  key={tpl.title}
                  className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">{tpl.title}</div>
                    <div className="text-slate-500 mt-0.5">{tpl.records}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onShowToast(`فایل نمونه «${tpl.title}» آماده بارگذاری و بررسی ستون‌ها شد.`)
                    }
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-semibold whitespace-nowrap shrink-0 hover:bg-indigo-100"
                  >
                    انتخاب فایل اکسل
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  خروجی دسته‌جمعی اطلاعات و پشتیبان‌گیری (اکسپورت)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  استخراج فوری جداول سامانه جهت تحلیل در اکسل یا انتقال به سایر سیستم‌ها
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">
                  استخراج یکپارچه کل اطلاعات سال مالی ۱۴۰۴
                </div>
                <p className="text-slate-600">
                  شامل درخت حساب‌ها، آرتیکل‌های دفتر کل، فاکتورهای فروش و خرید، موجودی و سریال‌های انبار و لیست مشتریان
                </p>
                <button
                  type="button"
                  onClick={onExportFullData}
                  className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
                >
                  دانلود فوری فایل خروجی کامل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROLE & FIELD-LEVEL PERMISSIONS + AUDIT TRAIL */}
      {activeTab === 'permissions_audit' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  مدیریت دسترسی‌های دقیق در سطح نقش، شعبه و فیلد
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  محدود کردن دسترسی کاربران به یک شعبه یا انبار خاص و مخفی‌سازی فیلدهای حساس (قیمت خرید و سود خالص)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['مدیر کل سامانه', 'صندوقدار فروشگاه'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPreviewRole(r)}
                      className={`px-3 py-1.5 font-semibold rounded-md ${
                        previewRole === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      نقش: {r}
                    </button>
                  ))}
                </div>
                <select
                  aria-label="محدودیت دسترسی شعبه"
                  value={branchRestriction}
                  onChange={(e) => setBranchRestriction(e.target.value as typeof branchRestriction)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="همه شعب">دسترسی سند: همه شعب سازمان</option>
                  <option value="فقط شعبه الهیه">محدودیت سند: فقط اسناد شعبه الهیه</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500">محدوده اسناد مجاز کاربر:</span>
                <div className="font-bold text-indigo-700 mt-1">{branchRestriction}</div>
              </div>
              <div>
                <span className="text-slate-500">قیمت فروش مشتری (فیلد عمومی):</span>
                <div className="font-mono font-bold text-slate-900 mt-1">{formatCurrency(1180000)} تومان</div>
              </div>
              <div>
                <span className="text-slate-500">بهای تمام‌شده خرید (فیلد محرمانه):</span>
                <div className="font-mono font-bold text-rose-700 mt-1">
                  {previewRole === 'مدیر کل سامانه'
                    ? `${formatCurrency(780000)} تومان`
                    : '🔒 مخفی برای نقش صندوقدار'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">سود خالص هر عدد (فیلد محرمانه):</span>
                <div className="font-mono font-bold text-emerald-700 mt-1">
                  {previewRole === 'مدیر کل سامانه'
                    ? `${formatCurrency(400000)} تومان (۳۳.۸٪)`
                    : '🔒 مخفی برای نقش صندوقدار'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              تاریخچه تغییرات و لاگ امنیتی سامانه
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">زمان دقیق</th>
                    <th className="py-2.5 px-3">کاربر تغییر دهنده · نقش</th>
                    <th className="py-2.5 px-3">نوع سند · شناسه</th>
                    <th className="py-2.5 px-3">فیلد تغییریافته</th>
                    <th className="py-2.5 px-3">مقدار قبلی</th>
                    <th className="py-2.5 px-3">مقدار جدید</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-600">{log.timestamp}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{log.user}</div>
                        <div className="text-slate-500">{stripEnglishTerms(log.role)}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold">{stripEnglishTerms(log.docType)}</span> ·{' '}
                        <span className="font-mono">{log.docId}</span>
                      </td>
                      <td className="py-2.5 px-3 text-indigo-700">{stripEnglishTerms(log.fieldChanged)}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-700 line-through">
                        {stripEnglishTerms(log.oldValue)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                        {stripEnglishTerms(log.newValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WEBHOOKS, REST API & SERVER SCRIPTS */}
      {activeTab === 'scripts_api' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              قوانین و اسکریپت‌نویسی سمت سرور
            </h3>
            <textarea
              rows={7}
              aria-label="کد اسکریپت سرور"
              value={serverScriptCode}
              onChange={(e) => setServerScriptCode(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl leading-relaxed"
            />
            <button
              type="button"
              onClick={() =>
                onShowToast('قانون خودکار سرور روی رویداد ثبت فاکتور فروش ذخیره و فعال شد.')
              }
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              ذخیره و فعال‌سازی قانون سرور
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              وب‌هوک‌ها و رابط برنامه‌نویسی اتصال دوطرفه
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'وب‌هوک ارسال آنی فاکتورهای جدید به نرم‌افزار بیرونی',
                  endpoint: 'مسیر اتصال: درگاه وب‌سرویس مرکزی شرکت امکان',
                  event: 'هنگام ثبت قطعی فاکتور فروش',
                },
                {
                  name: 'رابط برنامه‌نویسی همگام‌سازی دوطرفه موجودی و قیمت با سایت فروشگاهی',
                  endpoint: 'مسیر اتصال: وب‌سرویس موجودی و لیست قیمت فروشگاه آنلاین',
                  event: 'هنگام تغییر موجودی یا قیمت کالا در انبار',
                },
                {
                  name: 'وب‌هوک گزارش‌گیری شبانه مدیران ارشد',
                  endpoint: 'مسیر اتصال: درگاه پیام‌رسان گزارش‌های مالی مدیریت',
                  event: 'اجرای زمان‌بندی‌شده روزانه ساعت ۲۳:۰۰',
                },
              ].map((wh) => (
                <div key={wh.name} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">{wh.name}</div>
                  <div className="text-indigo-700 text-[11px]">
                    {wh.endpoint}
                  </div>
                  <div className="text-slate-500">رویداد اجراکننده: {wh.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
