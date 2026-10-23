import React, { useState } from 'react';
import {
  Sliders,
  GitBranch,
  Printer,
  Shield,
  Code2,
  Download,
} from 'lucide-react';
import { CustomFieldDefinition, AuditLogRecord } from '../data/erpSeedData';
import { stripEnglishTerms } from '../utils/erpEngine';

interface FrappeCoreModuleProps {
  customFields: CustomFieldDefinition[];
  onAddCustomField: (field: CustomFieldDefinition) => void;
  auditLogs: AuditLogRecord[];
  onExportFullData: () => void;
  onShowToast: (msg: string) => void;
}

export const FrappeCoreModule: React.FC<FrappeCoreModuleProps> = ({
  customFields,
  onAddCustomField,
  auditLogs,
  onExportFullData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'doctype' | 'workflow' | 'print_notify' | 'permissions_audit' | 'scripts_api'
  >('doctype');

  // Custom Field Builder State
  const [targetDoc, setTargetDoc] = useState<CustomFieldDefinition['targetDocType']>(
    'فاکتور فروش (Sales Invoice)'
  );
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldDefinition['fieldType']>('متن (Data)');
  const [hideFromCashier, setHideFromCashier] = useState(true);

  // Workflow Simulator State
  const [workflowStep, setWorkflowStep] = useState<
    'ثبت توسط فروشنده' | 'تایید انباردار' | 'تایید نهایی مدیر'
  >('ثبت توسط فروشنده');

  // Role Permission Preview State
  const [previewRole, setPreviewRole] = useState<'مدیر ارشد سامانه' | 'صندوقدار فروشگاه'>(
    'مدیر ارشد سامانه'
  );

  // Server Script State
  const [serverScriptCode, setServerScriptCode] = useState(
    `// قانون خودکار سرور (پیش از ذخیره فاکتور فروش):
اگر (مبلغ_کل_فاکتور > ۵,۰۰۰,۰۰۰ تومان) آنگاه:
    ارسال_اعلان_فوری(
        گیرنده = "ربات_تلگرام_مدیرعامل"،
        پیام = "هشدار فاکتور کلان امکان به مبلغ " + مبلغ_کل_فاکتور + " تومان ثبت شد."
    )
    اولویت_پردازش_انبار = "فوری_ویژه"`
  );

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim()) return;
    onAddCustomField({
      id: `cf-${Date.now()}`,
      targetDocType: targetDoc,
      fieldLabel: fieldLabel.trim(),
      fieldName: fieldName.trim() || `فیلد_سفارشی_${customFields.length + 1}`,
      fieldType,
      isRequired: false,
      hiddenForRoles: hideFromCashier ? ['صندوقدار فروشگاه'] : [],
    });
    setFieldLabel('');
    setFieldName('');
    onShowToast(`فیلد سفارشی «${fieldLabel}» بدون کدنویسی به فرم اضافه شد.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            تنظیمات هسته، اتوماسیون و سفارشی‌سازی فرم‌ها
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            ساخت فیلد و فرم بدون کدنویسی، گردش کار تاییدات، اعلان تلگرام، طراح چاپ، دسترسی سطح فیلد، گزارش تغییرات امنیتی و وب‌هوک
          </p>
        </div>
        <button
          type="button"
          onClick={onExportFullData}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>دریافت خروجی یک‌کلیکه کل پایگاه داده</span>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
        {[
          { id: 'doctype', label: 'فرم‌ساز و فیلدهای سفارشی', icon: Sliders },
          { id: 'workflow', label: 'طراح گردش کار و زنجیره تاییدات', icon: GitBranch },
          { id: 'print_notify', label: 'موتور اعلان خودکار و طراح چاپ', icon: Printer },
          { id: 'permissions_audit', label: 'دسترسی سطح فیلد و تاریخچه امنیتی', icon: Shield },
          { id: 'scripts_api', label: 'وب‌هوک‌ها، یکپارچه‌سازی و قوانین سرور', icon: Code2 },
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

      {/* TAB 1: CUSTOMIZE FORM & DOCTYPE */}
      {activeTab === 'doctype' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              افزودن فیلد جدید بدون کدنویسی
            </h3>
            <form onSubmit={handleAddField} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">انتخاب فرم یا سند هدف</label>
                <select
                  aria-label="انتخاب فرم هدف برای افزودن فیلد"
                  value={targetDoc}
                  onChange={(e) => setTargetDoc(e.target.value as CustomFieldDefinition['targetDocType'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="فاکتور فروش (Sales Invoice)">فاکتور فروش</option>
                  <option value="کالا و خدمات (Item)">کالا و خدمات</option>
                  <option value="مشتری (Customer)">پرونده مشتری</option>
                  <option value="سند روزنامه (Journal Entry)">سند حسابداری روزنامه</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">عنوان فارسی فیلد جدید</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً شماره پلمپ امنیتی کارتن"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">نوع داده فیلد</label>
                <select
                  aria-label="نوع داده فیلد سفارشی"
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as CustomFieldDefinition['fieldType'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="متن (Data)">متن آزاد</option>
                  <option value="عدد (Int/Currency)">عدد / مبلغ ریالی</option>
                  <option value="لیست کشویی (Select)">لیست انتخابی کشویی</option>
                  <option value="تاریخ (Date)">تاریخ شمسی</option>
                  <option value="بارکد (Barcode)">اسکنر بارکد</option>
                  <option value="امضای دیجیتال (Signature)">امضای دیجیتال</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={hideFromCashier}
                  onChange={(e) => setHideFromCashier(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="text-slate-700">
                  مخفی‌سازی این فیلد برای نقش «صندوقدار فروشگاه» (دسترسی سطح فیلد)
                </span>
              </label>
              <button
                type="submit"
                className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                + ایجاد فیلد در ساختار پایگاه داده
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              فیلدهای سفارشی تعریف‌شده در هسته سامانه
            </h3>
            <div className="space-y-3 text-xs">
              {customFields.map((cf) => (
                <div
                  key={cf.id}
                  className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{cf.fieldLabel}</div>
                    <div className="text-slate-500">
                      <span>سند هدف: {stripEnglishTerms(cf.targetDocType)}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-indigo-700">{stripEnglishTerms(cf.fieldType)}</div>
                    {cf.hiddenForRoles.length > 0 && (
                      <div className="text-amber-700">
                        مخفی برای: {cf.hiddenForRoles.map((r) => r.replace('POS', 'فروشگاه')).join('، ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKFLOW BUILDER */}
      {activeTab === 'workflow' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              طراح گردش کار و زنجیره تایید اسناد
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              شبیه‌سازی زنده چرخه تایید سند: ثبت توسط فروشنده ⬅ تایید انباردار ⬅ تایید نهایی مدیر مالی
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              {
                step: 'ثبت توسط فروشنده',
                role: 'کارشناس فروش',
                desc: 'ثبت پیش‌نویس فاکتور و بررسی اعتبار اولیه مشتری',
              },
              {
                step: 'تایید انباردار',
                role: 'سرپرست انبار و لجستیک',
                desc: 'کنترل موجودی قفسه، سریال‌ها و تایید حواله خروج بار',
              },
              {
                step: 'تایید نهایی مدیر',
                role: 'مدیر مالی / مدیرعامل',
                desc: 'ثبت قطعی سند حسابداری دوبل و قفل کردن ویرایش فاکتور',
              },
            ].map((st) => {
              const isCurrent = workflowStep === st.step;
              return (
                <div
                  key={st.step}
                  className={`p-4 rounded-xl border transition-colors ${
                    isCurrent
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">{st.step}</div>
                  <div className="text-indigo-700 font-medium mt-1">نقش مجاز: {st.role}</div>
                  <p className="mt-2">{st.desc}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkflowStep(st.step as typeof workflowStep);
                      onShowToast(`وضعیت گردش کار سند به «${st.step}» تغییر یافت.`);
                    }}
                    className="mt-3 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    {isCurrent ? 'مرحله فعال فعلی ✓' : 'انتقال سند به این مرحله'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS ENGINE & PRINT FORMAT BUILDER */}
      {activeTab === 'print_notify' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              سیستم اعلان‌های خودکار تلگرام و پیامک
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  rule: 'وقتی فاکتور فروش بالای ۵,۰۰۰,۰۰۰ تومان ثبت شد',
                  channel: 'ارسال آنی به ربات تلگرام مدیرعامل',
                  status: 'فعال',
                },
                {
                  rule: 'وقتی ۳ روز از سررسید قسط یا بدهی مشتری گذشت',
                  channel: 'ارسال پیامک یادآوری خودکار + هشدار به واحد وصول مطالبات',
                  status: 'فعال',
                },
                {
                  rule: 'وقتی تاریخ انقضای سری ساخت جویس کمتر از ۳۰ روز شد',
                  channel: 'اعلان داخل سامانه به سرپرست انبار و واحد فروش جهت جشنواره فروش',
                  status: 'فعال',
                },
              ].map((n) => (
                <div key={n.rule} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">شرط رویداد: {n.rule}</div>
                  <div className="text-slate-600">{n.channel}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              طراح فرمت چاپ اسناد و برچسب‌ها
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'قالب فاکتور رسمی مالیاتی طلایی (افقی با مهر و امضای دیجیتال)',
                  target: 'فاکتور فروش رسمی',
                },
                {
                  name: 'فیش حرارتی ۸ سانتی‌متری صندوق فروشگاهی (همراه با بارکد و امتیاز باشگاه)',
                  target: 'فیش صندوق فروشگاهی',
                },
                {
                  name: 'برچسب بارکد و سریال حرارتی ۵×۳ سانتی‌متری ویژه قفسه‌بندی انبار',
                  target: 'کالا و شماره سریال',
                },
              ].map((pf) => (
                <div
                  key={pf.name}
                  className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{pf.name}</div>
                    <div className="text-slate-500">سند متصل: {pf.target}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold whitespace-nowrap"
                  >
                    پیش‌نمایش چاپ
                  </button>
                </div>
              ))}
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
                  شبیه‌ساز دسترسی دقیق در سطح فیلد
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مخفی‌سازی خودکار فیلدهای محرمانه («قیمت خرید»، «بهای تمام‌شده میانگین موزون» و «سود خالص») برای صندوقدار
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {(['مدیر ارشد سامانه', 'صندوقدار فروشگاه'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setPreviewRole(r)}
                    className={`px-3 py-1.5 font-semibold rounded-md ${
                      previewRole === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    مشاهده با نقش: {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500">نام کالا:</span>
                <div className="font-bold text-slate-900 mt-1">پاد پیک‌بار ۶۰۰۰۰ — انبه یخ</div>
              </div>
              <div>
                <span className="text-slate-500">قیمت فروش مشتری (سطح دسترسی عمومی):</span>
                <div className="font-mono font-bold text-slate-900 mt-1">۱,۱۸۰,۰۰۰ تومان</div>
              </div>
              <div>
                <span className="text-slate-500">بهای تمام‌شده خرید (سطح دسترسی مدیران):</span>
                <div className="font-mono font-bold text-rose-700 mt-1">
                  {previewRole === 'مدیر ارشد سامانه'
                    ? '۷۸۰,۰۰۰ تومان'
                    : '🔒 مخفی (عدم دسترسی نقش صندوقدار)'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">سود خالص هر عدد (سطح دسترسی مدیران):</span>
                <div className="font-mono font-bold text-emerald-700 mt-1">
                  {previewRole === 'مدیر ارشد سامانه'
                    ? '۴۰۰,۰۰۰ تومان (۳۳.۸٪)'
                    : '🔒 مخفی (عدم دسترسی نقش صندوقدار)'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              تاریخچه تغییرات و گزارش امنیتی سامانه
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
              قوانین و اسکریپت‌های خودکار سرور
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
              وب‌هوک‌های دوطرفه و اتصالات یکپارچه سازمانی
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'وب‌هوک اتوماسیون سازمانی (ارسال آنی فاکتورهای جدید)',
                  endpoint: 'مسیر اتصال: درگاه اتوماسیون مرکزی شرکت امکان',
                  event: 'هنگام ثبت قطعی فاکتور فروش',
                },
                {
                  name: 'همگام‌سازی دوطرفه موجودی و قیمت با فروشگاه اینترنتی',
                  endpoint: 'مسیر اتصال: وب‌سرویس موجودی و لیست قیمت فروشگاه آنلاین',
                  event: 'هنگام تغییر موجودی یا قیمت کالا در انبار',
                },
                {
                  name: 'ربات تلگرام گزارش‌گیری شبانه مدیران ارشد',
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
