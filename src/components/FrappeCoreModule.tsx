import React, { useState } from 'react';
import {
  Sliders,
  GitBranch,
  Bell,
  Printer,
  Shield,
  History,
  Code2,
  Download,
  Upload,
  Plus,
  Play,
} from 'lucide-react';
import { CustomFieldDefinition, AuditLogRecord } from '../data/erpSeedData';

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
  const [previewRole, setPreviewRole] = useState<'مدیر ارشد (System Manager)' | 'صندوقدار POS'>(
    'مدیر ارشد (System Manager)'
  );

  // Server Script State
  const [serverScriptCode, setServerScriptCode] = useState(
    `# Frappe Server Script (Before Save: Sales Invoice)
if doc.grand_total > 5000000:
    frappe.sendmail(
        recipients=["telegram_webhook@farapay.ir"],
        message=f"هشدار فاکتور کلان: {doc.name} به مبلغ {doc.grand_total} تومان ثبت شد."
    )
    doc.custom_vip_priority = 1`
  );

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim()) return;
    onAddCustomField({
      id: `cf-${Date.now()}`,
      targetDocType: targetDoc,
      fieldLabel: fieldLabel.trim(),
      fieldName: fieldName.trim() || `custom_field_${customFields.length + 1}`,
      fieldType,
      isRequired: false,
      hiddenForRoles: hideFromCashier ? ['صندوقدار POS'] : [],
    });
    setFieldLabel('');
    setFieldName('');
    onShowToast(`فیلد سفارشی «${fieldLabel}» بدون کدنویسی به فرم ${targetDoc} اضافه شد.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            ۱۱. موتور فریم‌ورک، اتوماسیون و نرم‌افزارساز (Frappe Core & Customization)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            ساخت فیلد و DocType بدون کدنویسی، گردش کار تاییدات، اعلان تلگرام، طراح چاپ، دسترسی سطح فیلد، لاگ امنیتی و وب‌هوک n8n
          </p>
        </div>
        <button
          type="button"
          onClick={onExportFullData}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>اکسپورت یک‌کلیکه کل دیتابیس (Data Export JSON/CSV)</span>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
        {[
          { id: 'doctype', label: 'فرم‌ساز و فیلد سفارشی (Customize Form & DocType)', icon: Sliders },
          { id: 'workflow', label: 'طراح گردش کار و تاییدات (Workflow Builder)', icon: GitBranch },
          { id: 'print_notify', label: 'موتور اعلان تلگرام و طراح چاپ (Print & Notify)', icon: Printer },
          { id: 'permissions_audit', label: 'دسترسی سطح فیلد و لاگ امنیتی (RBAC & Audit Trail)', icon: Shield },
          { id: 'scripts_api', label: 'وب‌هوک n8n، ووکامرس و اسکریپت سرور', icon: Code2 },
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
              افزودن فیلد جدید بدون کدنویسی (Customize Form)
            </h3>
            <form onSubmit={handleAddField} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">انتخاب فرم / DocType هدف</label>
                <select
                  aria-label="انتخاب فرم هدف برای افزودن فیلد"
                  value={targetDoc}
                  onChange={(e) => setTargetDoc(e.target.value as CustomFieldDefinition['targetDocType'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="فاکتور فروش (Sales Invoice)">فاکتور فروش (Sales Invoice)</option>
                  <option value="کالا و خدمات (Item)">کالا و خدمات (Item)</option>
                  <option value="مشتری (Customer)">مشتری (Customer)</option>
                  <option value="سند روزنامه (Journal Entry)">سند روزنامه (Journal Entry)</option>
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
                <label className="block font-medium text-slate-700 mb-1">نوع داده فیلد (Field Type)</label>
                <select
                  aria-label="نوع داده فیلد سفارشی"
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as CustomFieldDefinition['fieldType'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="متن (Data)">متن (Data)</option>
                  <option value="عدد (Int/Currency)">عدد / مبلغ (Int/Currency)</option>
                  <option value="لیست کشویی (Select)">لیست کشویی (Select)</option>
                  <option value="تاریخ (Date)">تاریخ شمسی (Date)</option>
                  <option value="بارکد (Barcode)">بارکد خوان (Barcode)</option>
                  <option value="امضای دیجیتال (Signature)">امضای دیجیتال (Signature)</option>
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
                  مخفی‌سازی این فیلد برای نقش «صندوقدار POS» (Field-level Permission)
                </span>
              </label>
              <button
                type="submit"
                className="w-full py-2 px-4 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                + ایجاد فیلد در ساختار دیتابیس (Schema Migration)
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              فیلدهای سفارشی تعریف‌شده در هسته سیستم (Custom Fields Registry)
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
                      <span>سند هدف: {cf.targetDocType}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="font-mono">{cf.fieldName}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-indigo-700">{cf.fieldType}</div>
                    {cf.hiddenForRoles.length > 0 && (
                      <div className="text-amber-700">
                        مخفی برای: {cf.hiddenForRoles.join('، ')}
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
              طراح گردش کار و زنجیره تایید اسناد (Workflow Builder)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              شبیه‌سازی زنده چرخه تایید سند: ثبت توسط فروشنده ⬅ تایید انباردار ⬅ تایید نهایی مدیر مالی
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              {
                step: 'ثبت توسط فروشنده',
                role: 'کارشناس فروش (Sales User)',
                desc: 'ثبت پیش‌نویس فاکتور و بررسی اعتبار اولیه مشتری',
              },
              {
                step: 'تایید انباردار',
                role: 'سرپرست انبار (Stock Manager)',
                desc: 'کنترل موجودی قفسه، سریال‌ها و تایید حواله خروج بار',
              },
              {
                step: 'تایید نهایی مدیر',
                role: 'مدیر مالی / مدیرعامل (Accounts Manager)',
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
              سیستم اعلان‌های خودکار تلگرام و پیامک (Notifications Engine)
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  rule: 'وقتی فاکتور فروش بالای ۵,۰۰۰,۰۰۰ تومان ثبت شد',
                  channel: 'ارسال آنی به ربات تلگرام مدیرعامل (Telegram Webhook)',
                  status: 'فعال',
                },
                {
                  rule: 'وقتی ۳ روز از سررسید قسط یا بدهی مشتری گذشت',
                  channel: 'ارسال پیامک یادآوری خودکار + هشدار به واحد وصول مطالبات',
                  status: 'فعال',
                },
                {
                  rule: 'وقتی تاریخ انقضای سری ساخت (Batch) جویس کمتر از ۳۰ روز شد',
                  channel: 'اعلان داخل سیستم به سرپرست انبار و واحد فروش جهت پروموشن',
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
              طراح فرمت چاپ (Print Format Builder — HTML/CSS & Drag-Drop)
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'قالب فاکتور رسمی مالیاتی طلایی (A4 افقی با مهر و امضای دیجیتال)',
                  target: 'Sales Invoice',
                },
                {
                  name: 'فیش حرارتی ۸ سانتی‌متری صندوق فروشگاهی (همراه با بارکد و امتیاز باشگاه)',
                  target: 'POS Invoice',
                },
                {
                  name: 'لیبل بارکد و سریال حرارتی ۵×۳ سانتی‌متری ویژه قفسه‌بندی انبار',
                  target: 'Item / Serial No',
                },
              ].map((pf) => (
                <div
                  key={pf.name}
                  className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{pf.name}</div>
                    <div className="font-mono text-slate-500">DocType: {pf.target}</div>
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
                  شبیه‌ساز دسترسی فوق‌العاده دقیق در سطح فیلد (Role & Field-Level Permissions)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مخفی‌سازی خودکار فیلدهای محرمانه («قیمت خرید»، «بهای تمام‌شده میانگین موزون» و «سود خالص») برای صندوقدار
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {(['مدیر ارشد (System Manager)', 'صندوقدار POS'] as const).map((r) => (
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
                <div className="font-bold text-slate-900 mt-1">پاد Peak Bar 60000 — انبه یخ</div>
              </div>
              <div>
                <span className="text-slate-500">قیمت فروش مشتری (سطح دسترسی ۰):</span>
                <div className="font-mono font-bold text-slate-900 mt-1">۱,۱۸۰,۰۰۰ تومان</div>
              </div>
              <div>
                <span className="text-slate-500">بهای تمام‌شده خرید (سطح دسترسی ۱):</span>
                <div className="font-mono font-bold text-rose-700 mt-1">
                  {previewRole === 'مدیر ارشد (System Manager)'
                    ? '۷۸۰,۰۰۰ تومان'
                    : '🔒 مخفی (عدم دسترسی نقش صندوقدار)'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">سود خالص هر عدد (سطح دسترسی ۱):</span>
                <div className="font-mono font-bold text-emerald-700 mt-1">
                  {previewRole === 'مدیر ارشد (System Manager)'
                    ? '۴۰۰,۰۰۰ تومان (۳۳.۸٪)'
                    : '🔒 مخفی (عدم دسترسی نقش صندوقدار)'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              تاریخچه تغییرات و لاگ امنیتی (Audit Trail & Version Tracking)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">زمان دقیق</th>
                    <th className="py-2.5 px-3">کاربر تغییر دهنده · نقش</th>
                    <th className="py-2.5 px-3">نوع سند (DocType) · شناسه</th>
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
                        <div className="text-slate-500">{log.role}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold">{log.docType}</span> ·{' '}
                        <span className="font-mono">{log.docId}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-indigo-700">{log.fieldChanged}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-700 line-through">
                        {log.oldValue}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                        {log.newValue}
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
              اسکریپت‌نویسی داخل پنل (Server Scripts — Python / JS Sandbox)
            </h3>
            <textarea
              rows={7}
              aria-label="کد اسکریپت سرور"
              dir="ltr"
              value={serverScriptCode}
              onChange={(e) => setServerScriptCode(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl"
            />
            <button
              type="button"
              onClick={() =>
                onShowToast('اسکریپت سرور روی رویداد Before Save فاکتور فروش ذخیره و فعال شد.')
              }
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              ذخیره و فعال‌سازی اسکریپت سرور
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              وب‌هوک‌های دوطرفه و اتصالات REST API (n8n / WooCommerce / Telegram)
            </h3>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'وب‌هوک اتوماسیون n8n (ارسال آنی فاکتورهای جدید)',
                  endpoint: 'https://n8n.farapay.ir/webhook/erpnext-sales-invoice',
                  event: 'on_submit (Sales Invoice)',
                },
                {
                  name: 'همگام‌سازی دوطرفه موجودی و قیمت با سایت وردپرسی (WooCommerce REST)',
                  endpoint: 'https://shop.farapay.ir/wp-json/wc/v3/products/batch',
                  event: 'on_update (Item & Bin Stock)',
                },
                {
                  name: 'ربات تلگرام گزارش‌گیری شبانه مدیران',
                  endpoint: 'https://api.telegram.org/bot<TOKEN>/sendMessage',
                  event: 'Scheduled Daily 23:00',
                },
              ].map((wh) => (
                <div key={wh.name} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">{wh.name}</div>
                  <div className="font-mono text-indigo-700 text-[11px]" dir="ltr">
                    {wh.endpoint}
                  </div>
                  <div className="text-slate-500">رویداد ماشه (Trigger): {wh.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
