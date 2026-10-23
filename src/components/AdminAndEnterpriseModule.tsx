import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Factory,
  FolderKanban,
  CheckCircle2,
  Lock,
  RotateCcw,
  Download,
  FileCheck2,
  Cpu,
} from 'lucide-react';
import {
  SystemRole,
  checkRolePermission,
  formatCurrency,
} from '../utils/erpEngine';

interface AdminAndEnterpriseModuleProps {
  activeRole: SystemRole;
  onChangeRole: (role: SystemRole) => void;
  onResetDatabase: () => void;
  onExportDatabase: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminAndEnterpriseModule: React.FC<AdminAndEnterpriseModuleProps> = ({
  activeRole,
  onChangeRole,
  onResetDatabase,
  onExportDatabase,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'super_admin' | 'hr_bom_proj' | 'audit_roadmap'>(
    'super_admin'
  );

  // HR & Payroll State
  const [employees, setEmployees] = useState([
    {
      id: 'emp-1',
      code: 'EMP-1404-01',
      name: 'مهندس رضا نوادگان',
      role: 'مدیرعامل و ادمین کل (Super Admin)',
      branch: 'دفتر مرکزی تهران',
      baseSalary: 45000000,
      commissionBonus: 27600000,
      taxAndInsuranceDeduction: 7200000,
      status: 'فیش حقوقی صادرشده',
    },
    {
      id: 'emp-2',
      code: 'EMP-1404-02',
      name: 'سارا کاظمی',
      role: 'مدیر مالی و فروش (Accounts Manager)',
      branch: 'دفتر مرکزی تهران',
      baseSalary: 32000000,
      commissionBonus: 18500000,
      taxAndInsuranceDeduction: 4800000,
      status: 'فیش حقوقی صادرشده',
    },
    {
      id: 'emp-3',
      code: 'EMP-1404-03',
      name: 'بهرام صادقی',
      role: 'سرپرست انبار و لجستیک (Stock Manager)',
      branch: 'انبار مرکزی کهریزک',
      baseSalary: 24000000,
      commissionBonus: 4200000,
      taxAndInsuranceDeduction: 3100000,
      status: 'فیش حقوقی صادرشده',
    },
    {
      id: 'emp-4',
      code: 'EMP-1404-04',
      name: 'نگار محمدی',
      role: 'اپراتور صندوق فروشگاهی (POS Cashier)',
      branch: 'شعبه الهیه',
      baseSalary: 18000000,
      commissionBonus: 9600000,
      taxAndInsuranceDeduction: 2400000,
      status: 'در انتظار تایید کارکرد',
    },
  ]);

  // BOM & Work Orders
  const [workOrders, setWorkOrders] = useState([
    {
      id: 'wo-1',
      woNo: 'MFG-WO-1404-012',
      bomName: 'BOM-BUNDLE-01: فرمول مونتاژ و شیرینگ پک استارتر طلایی امکان',
      components: '۱ عدد پاد Peak Bar + ۱ عدد سالت Nasty ۳۰ میل + ۱ بسته کارتریج XROS + جعبه هاردباکس امکان',
      plannedQty: 50,
      completedQty: 50,
      unitProductionCost: 1760000,
      status: 'تولید تکمیل و وارد انبار شد',
    },
  ]);

  const rolesList: SystemRole[] = [
    'ادمین کل (Super Admin)',
    'مدیر مالی (Accounts Manager)',
    'سرپرست انبار (Stock Manager)',
    'صندوقدار POS',
  ];

  const permissionsMatrix: {
    key:
      | 'view_buying_cost'
      | 'unlock_fiscal_year'
      | 'manage_users_roles'
      | 'post_journal'
      | 'adjust_stock'
      | 'export_database';
    label: string;
  }[] = [
    { key: 'manage_users_roles', label: 'مدیریت کاربران، شعب و دسترسی‌های ادمین کل' },
    { key: 'unlock_fiscal_year', label: 'بستن و بازگشایی قفل سال مالی (Period Closing Override)' },
    { key: 'view_buying_cost', label: 'مشاهده بهای تمام‌شده خرید، میانگین موزون و سود خالص' },
    { key: 'post_journal', label: 'ثبت قطعی سند روزنامه دستی در دفتر کل' },
    { key: 'adjust_stock', label: 'ثبت سند تعدیل انبارگردانی و سرشکن هزینه گمرک' },
    { key: 'export_database', label: 'اکسپورت کل دیتابیس و بازنشانی تنظیمات کارخانه' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            مدیریت سیستم، منابع انسانی، تولید (BOM) و کنترل دسترسی (System & Enterprise)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            مدیریت دسترسی‌های سطح نقش (RBAC)، منابع انسانی و حقوق و دستمزد، فرمول ساخت و تولید (BOM)، مدیریت پروژه و ممیزی سلامت سیستم
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!checkRolePermission(activeRole, 'export_database')) {
                onShowToast('خطای دسترسی: فقط «ادمین کل (Super Admin)» مجاز به بازنشانی دیتابیس است.');
                return;
              }
              onResetDatabase();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازنشانی دیتابیس به داده اولیه</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!checkRolePermission(activeRole, 'export_database')) {
                onShowToast('خطای دسترسی: فقط «ادمین کل (Super Admin)» مجاز به خروجی گرفتن از کل دیتابیس است.');
                return;
              }
              onExportDatabase();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>دانلود پشتیبان کامل (Full JSON Backup)</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
        {[
          { id: 'super_admin', label: 'کنترل دسترسی نقش‌ها و امنیت (Role Permissions)', icon: ShieldAlert },
          { id: 'hr_bom_proj', label: 'منابع انسانی، تولید (BOM) و پروژه‌ها', icon: Factory },
          { id: 'audit_roadmap', label: 'ممیزی سلامت سیستم و یکپارچگی دفاتر (System Audit)', icon: FileCheck2 },
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

      {/* TAB 1: SUPER ADMIN RBAC MATRIX */}
      {activeTab === 'super_admin' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  شبیه‌ساز زنده نقش کاربری و دسترسی ادمین کل در سراسر سامانه امکان
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  با تغییر نقش در این بخش، محدودیت‌های دسترسی روی تمام ماژول‌ها (حسابداری، انبار، قفل سال مالی و قیمت خرید) بلافاصله اعمال می‌شود.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl">
                {rolesList.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onChangeRole(r);
                      onShowToast(`نقش کاربری کل سامانه به «${r}» تغییر یافت.`);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      activeRole === r
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">مجوز عملیاتی / سطح دسترسی</th>
                    {rolesList.map((r) => (
                      <th
                        key={r}
                        className={`py-2.5 px-3 text-center ${
                          activeRole === r ? 'text-indigo-700 font-bold bg-indigo-50/50' : ''
                        }`}
                      >
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map((perm) => (
                    <tr key={perm.key} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{perm.label}</td>
                      {rolesList.map((r) => {
                        const allowed = checkRolePermission(r, perm.key);
                        return (
                          <td
                            key={r}
                            className={`py-2.5 px-3 text-center font-semibold ${
                              activeRole === r ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            {allowed ? (
                              <span className="text-emerald-700 font-bold">مجاز (فعال)</span>
                            ) : (
                              <span className="text-rose-700">مسدود (عدم دسترسی)</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODULES 6 (HR & PAYROLL), 7 (MANUFACTURING BOM) & 8 (PROJECTS) */}
      {activeTab === 'hr_bom_proj' && (
        <div className="space-y-6">
          {/* Module 6: HR & Payroll */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ۶. ماژول منابع انسانی، حضور و غیاب و صدور فیش حقوقی (HR & Payroll)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  محاسبه خودکار حقوق پایه، پورسانت فروش از ماژول ۲، کسر بیمه و مالیات تکلیفی و صدور فیش حقوقی
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmployees((prev) =>
                    prev.map((e) => ({ ...e, status: 'فیش حقوقی صادر و تسویه شد' }))
                  );
                  onShowToast('فیش حقوقی کلیه پرسنل صادر شد و سند حسابداری حقوق در دفتر کل ثبت گردید.');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
              >
                صدور دسته‌جمعی فیش حقوقی آبان‌ماه
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">کد پرسنلی · نام کارمند</th>
                    <th className="py-2.5 px-3">سمت سازمانی · شعبه</th>
                    <th className="py-2.5 px-3 text-left">حقوق پایه</th>
                    <th className="py-2.5 px-3 text-left">پورسانت و مزایا</th>
                    <th className="py-2.5 px-3 text-left">کسورات بیمه/مالیات</th>
                    <th className="py-2.5 px-3 text-left">خالص پرداختی (تومان)</th>
                    <th className="py-2.5 px-3">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const netPay =
                      emp.baseSalary + emp.commissionBonus - emp.taxAndInsuranceDeduction;
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-slate-500 ml-2">{emp.code}</span>
                          <span className="font-bold text-slate-900">{emp.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {emp.role} · {emp.branch}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-left">
                          {formatCurrency(emp.baseSalary)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-left text-emerald-700">
                          +{formatCurrency(emp.commissionBonus)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-left text-rose-700">
                          -{formatCurrency(emp.taxAndInsuranceDeduction)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-left text-slate-900">
                          {formatCurrency(netPay)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-700">{emp.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Module 7 & 8: Manufacturing BOM & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  ۷. ماژول تولید، فرمول ساخت و مونتاژ (Manufacturing & BOM)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setWorkOrders([
                      ...workOrders,
                      {
                        id: `wo-${Date.now()}`,
                        woNo: `MFG-WO-1404-0${13 + workOrders.length}`,
                        bomName: 'BOM-GIFT-02: پک هدیه شب یلدا (۲ عدد پاد + بند گردنی)',
                        components: '۲ عدد پاد Peak Bar + ۱ عدد بند گردنی + بسته‌بندی وکیوم',
                        plannedQty: 30,
                        completedQty: 30,
                        unitProductionCost: 1550000,
                        status: 'تولید تکمیل و وارد انبار شد',
                      },
                    ]);
                    onShowToast('دستور کار تولید (Work Order) ثبت شد و مواد اولیه به محصول نهایی تبدیل گردید.');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
                >
                  + ثبت دستور کار تولید (Work Order)
                </button>
              </div>
              <div className="space-y-3 text-xs">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="font-mono text-indigo-700">{wo.woNo}</span>
                      <span className="text-emerald-700">{wo.status}</span>
                    </div>
                    <div className="font-semibold text-slate-800">{wo.bomName}</div>
                    <div className="text-slate-500">اجزا: {wo.components}</div>
                    <div className="font-mono text-slate-700 pt-1">
                      تعداد تولید: {wo.completedQty} پک · بهای تمام‌شده هر پک: {formatCurrency(wo.unitProductionCost)} تومان
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                ۸. ماژول مدیریت پروژه و تایم‌شیت (Projects & Timesheets)
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  {
                    code: 'PRJ-1404-01',
                    title: 'پروژه تجهیز و افتتاح شعبه ۳ امکان (مشهد)',
                    progress: 85,
                    budget: 450000000,
                    manager: 'مهندس رضا نوادگان',
                  },
                  {
                    code: 'PRJ-1404-02',
                    title: 'پروژه یکپارچه‌سازی سامانه مودیان مالیاتی و فاکتور الکترونیکی',
                    progress: 100,
                    budget: 65000000,
                    manager: 'سارا کاظمی',
                  },
                ].map((prj) => (
                  <div key={prj.code} className="p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{prj.title}</span>
                      <span className="font-mono text-indigo-700">پیشرفت: {prj.progress}٪</span>
                    </div>
                    <div className="text-slate-500">
                      کد پروژه: {prj.code} · مدیر پروژه: {prj.manager} · بودجه: {formatCurrency(prj.budget)} تومان
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPREHENSIVE SYSTEM AUDIT & ROADMAP ("کم و کسر برنامه") */}
      {activeTab === 'audit_roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-emerald-800">
              قابلیت‌های تکمیل و تثبیت‌شده در نسخه فعلی سامانه «امکان»
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <li>
                <strong>۱. پایداری داده‌ها (LocalStorage Persistence):</strong> تمامی فاکتورها، سرفصل‌های حسابداری، موجودی انبار، فیش‌های POS و فیلدهای سفارشی به‌طور خودکار در مرورگر ذخیره می‌شوند و با رفرش صفحه از بین نمی‌روند.
              </li>
              <li>
                <strong>۲. دسترسی ادمین کل (Super Admin RBAC):</strong> امکان تغییر نقش زنده در هدر بالای صفحه؛ محدودسازی مشاهده «بهای تمام‌شده» و «سود خالص» برای صندوقدار و انحصار «قفل سال مالی» و «اکسپورت دیتابیس» برای ادمین کل.
              </li>
              <li>
                <strong>۳. صورت‌های مالی استاندارد و چرخه خرید:</strong> تراز آزمایشی ۴ ستونی، صورت سود و زیان (P&L)، ترازنامه (Balance Sheet) و فرم ثبت فاکتور خرید با بازمحاسبه خودکار میانگین موزون انبار.
              </li>
              <li>
                <strong>۴. پوشش کامل ۱۱ ماژول (شامل ۶، ۷ و ۸):</strong> اضافه شدن ماژول‌های منابع انسانی و حقوق و دستمزد (۶)، تولید و فرمول ساخت BOM (۷) و مدیریت پروژه (۸) در کنار حسابداری، POS، CRM، WMS، وب‌شاپ و موتور Frappe.
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-indigo-900">
              🔍 تحلیل کارشناسی «کم و کسرها» برای استقرار تجاری در مقیاس کلان (Production ERP)
            </h3>
            <p className="text-xs text-slate-500">
              این برنامه در حال حاضر یک نسخه کامل کلاینت‌محور (Browser-Persisted SPA) است. برای تبدیل به یک ERP سازمانی چندشعبه‌ای در دنیای واقعی، ۴ اتصال زیرساختی زیر پیشنهاد می‌شود:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <li>
                <strong>۱. دیتابیس رابطه‌ای سرور (PostgreSQL / Cloud SQL):</strong> انتقال ذخیره‌سازی از LocalStorage مرورگر به دیتابیس PostgreSQL با تراکنش‌های ACID و قفل همزمانی (Row-Level Locking) برای زمانی که چندین صندوقدار همزمان از یک انبار فروش می‌زنند.
              </li>
              <li>
                <strong>۲. اتصال رسمی به سامانه مودیان مالیاتی (Tax API):</strong> افزودن ماژول امضای دیجیتال با کلید خصوصی (CSR/PKCS#12) جهت ارسال مستقیم صورت‌حساب الکترونیکی نوع ۱ و ۲ به کارپوشه دارایی و دریافت شماره منحصر‌به‌فرد مالیاتی ۲۲ رقمی.
              </li>
              <li>
                <strong>۳. اتصال سخت‌افزاری کارتخوان (PC-POS) و وب‌سرویس صیاد:</strong> ارتباط مستقیم پورت سریال/شبکه با کارتخوان‌های بانکی (به پرداخت، سامان کیش) جهت ارسال خودکار مبلغ از فیش POS به دستگاه کارتخوان و استعلام رنگ وضعیت چک صیادی از وب‌سرویس بانک مرکزی.
              </li>
              <li>
                <strong>۴. احراز هویت چندعاملی (JWT / 2FA):</strong> اتصال سوئیچر نقش ادمین کل به سرور احراز هویت واقعی همراه با رمز یکبارمصرف پیامکی (OTP) و ثبت IP در لاگ امنیتی.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
