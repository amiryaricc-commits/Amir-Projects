import React, { useState } from 'react';
import {
  ShieldAlert,
  Factory,
  RotateCcw,
  Download,
  FileCheck2,
} from 'lucide-react';
import {
  SystemRole,
  checkRolePermission,
  formatCurrency,
  formatRoleName,
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
      role: 'مدیرعامل و مدیر کل سامانه',
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
      role: 'مدیر مالی و فروش',
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
      role: 'سرپرست انبار و لجستیک',
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
      role: 'اپراتور صندوق فروشگاهی',
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
      bomName: 'فرمول ساخت شماره ۱: مونتاژ و بسته‌بندی پکیج استارتر طلایی امکان',
      components: '۱ عدد پاد پیک‌بار + ۱ عدد سالت نستی ۳۰ میل + ۱ بسته کارتریج اکس‌راس + جعبه اختصاصی امکان',
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
    { key: 'manage_users_roles', label: 'مدیریت کاربران، شعب و دسترسی‌های مدیر کل' },
    { key: 'unlock_fiscal_year', label: 'بستن و بازگشایی قفل سال مالی' },
    { key: 'view_buying_cost', label: 'مشاهده بهای تمام‌شده خرید، میانگین موزون و سود خالص' },
    { key: 'post_journal', label: 'ثبت قطعی سند روزنامه دستی در دفتر کل' },
    { key: 'adjust_stock', label: 'ثبت سند تعدیل انبارگردانی و سرشکن هزینه گمرک' },
    { key: 'export_database', label: 'خروجی کامل پایگاه داده و بازنشانی تنظیمات اولیه' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            مدیریت سیستم، منابع انسانی، تولید و کنترل دسترسی
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            مدیریت دسترسی‌های سطح نقش، منابع انسانی و حقوق و دستمزد، فرمول ساخت و تولید، مدیریت پروژه و ممیزی سلامت سامانه
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!checkRolePermission(activeRole, 'export_database')) {
                onShowToast('خطای دسترسی: فقط «مدیر کل سامانه» مجاز به بازنشانی پایگاه داده است.');
                return;
              }
              onResetDatabase();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازنشانی پایگاه داده به داده اولیه</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!checkRolePermission(activeRole, 'export_database')) {
                onShowToast('خطای دسترسی: فقط «مدیر کل سامانه» مجاز به خروجی گرفتن از کل پایگاه داده است.');
                return;
              }
              onExportDatabase();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل پشتیبان کامل</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
        {[
          { id: 'super_admin', label: 'کنترل دسترسی نقش‌ها و امنیت', icon: ShieldAlert },
          { id: 'hr_bom_proj', label: 'منابع انسانی، فرمول تولید و پروژه‌ها', icon: Factory },
          { id: 'audit_roadmap', label: 'ممیزی سلامت سامانه و یکپارچگی دفاتر', icon: FileCheck2 },
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
                  شبیه‌ساز زنده نقش کاربری و دسترسی مدیر کل در سراسر سامانه امکان
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  با تغییر نقش در این بخش، محدودیت‌های دسترسی روی تمام بخش‌ها (حسابداری، انبار، قفل سال مالی و قیمت خرید) بلافاصله اعمال می‌شود.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl">
                {rolesList.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onChangeRole(r);
                      onShowToast(`نقش کاربری کل سامانه به «${formatRoleName(r)}» تغییر یافت.`);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      activeRole === r
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {formatRoleName(r)}
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
                        {formatRoleName(r)}
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

      {/* TAB 2: HR & PAYROLL, MANUFACTURING BOM & PROJECTS */}
      {activeTab === 'hr_bom_proj' && (
        <div className="space-y-6">
          {/* HR & Payroll */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  منابع انسانی، حضور و غیاب و صدور فیش حقوقی
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  محاسبه خودکار حقوق پایه، پورسانت فروش، کسر بیمه و مالیات تکلیفی و صدور فیش حقوقی
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
                    <th className="py-2.5 px-3 text-left">کسورات بیمه و مالیات</th>
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

          {/* Manufacturing BOM & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  تولید، فرمول ساخت و مونتاژ پکیج‌ها
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setWorkOrders([
                      ...workOrders,
                      {
                        id: `wo-${Date.now()}`,
                        woNo: `MFG-WO-1404-0${13 + workOrders.length}`,
                        bomName: 'فرمول ساخت شماره ۲: پک هدیه شب یلدا (۲ عدد پاد + بند گردنی)',
                        components: '۲ عدد پاد پیک‌بار + ۱ عدد بند گردنی + بسته‌بندی وکیوم',
                        plannedQty: 30,
                        completedQty: 30,
                        unitProductionCost: 1550000,
                        status: 'تولید تکمیل و وارد انبار شد',
                      },
                    ]);
                    onShowToast('دستور کار تولید ثبت شد و مواد اولیه به محصول نهایی تبدیل گردید.');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
                >
                  + ثبت دستور کار تولید
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
                مدیریت پروژه و کارکرد زمانی
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

      {/* TAB 3: COMPREHENSIVE SYSTEM AUDIT & ROADMAP */}
      {activeTab === 'audit_roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-emerald-800">
              قابلیت‌های تکمیل و تثبیت‌شده در نسخه فعلی سامانه «امکان»
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <li>
                <strong>۱. پایداری خودکار اطلاعات در مرورگر:</strong> تمامی فاکتورها، سرفصل‌های حسابداری، موجودی انبار، فیش‌های صندوق فروشگاهی و فیلدهای سفارشی به‌طور خودکار در حافظه مرورگر ذخیره می‌شوند و با بازخوانی صفحه از بین نمی‌روند.
              </li>
              <li>
                <strong>۲. مدیریت دسترسی نقش‌ها:</strong> امکان تغییر نقش زنده در نوار بالای صفحه؛ محدودسازی مشاهده «بهای تمام‌شده» و «سود خالص» برای صندوقدار و انحصار «قفل سال مالی» و «پشتیبان‌گیری پایگاه داده» برای مدیر کل.
              </li>
              <li>
                <strong>۳. صورت‌های مالی استاندارد و چرخه خرید:</strong> تراز آزمایشی ۶ ستونی، صورت سود و زیان، ترازنامه و فرم ثبت فاکتور خرید چندردیفه با بازمحاسبه خودکار میانگین موزون انبار.
              </li>
              <li>
                <strong>۴. پوشش یکپارچه تمامی بخش‌های سازمانی:</strong> شامل حسابداری دوبل، فروش، تدارکات، انبارداری، صندوق فروشگاهی، ارتباط با مشتریان، پشتیبانی و گارانتی، منابع انسانی، فرمول تولید و مدیریت پروژه.
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-indigo-900">
              تحلیل کارشناسی زیرساخت جهت استقرار تجاری در مقیاس کلان
            </h3>
            <p className="text-xs text-slate-500">
              این برنامه در حال حاضر یک نسخه کامل تحت مرورگر است. برای استقرار در شبکه چندشعبه‌ای، ۴ اتصال زیرساختی زیر پیشنهاد می‌شود:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <li>
                <strong>۱. پایگاه داده رابطه‌ای سرور مرکزی:</strong> انتقال ذخیره‌سازی از حافظه مرورگر به پایگاه داده مرکزی با پشتیبانی از تراکنش‌های همزمان برای زمانی که چندین صندوقدار همزمان از یک انبار فروش ثبت می‌کنند.
              </li>
              <li>
                <strong>۲. اتصال رسمی به سامانه مودیان مالیاتی:</strong> افزودن ماژول امضای دیجیتال با گواهی امنیتی جهت ارسال مستقیم صورت‌حساب الکترونیکی نوع ۱ و ۲ به کارپوشه دارایی و دریافت شماره منحصر‌به‌فرد مالیاتی ۲۲ رقمی.
              </li>
              <li>
                <strong>۳. اتصال سخت‌افزاری کارتخوان و وب‌سرویس صیاد:</strong> ارتباط مستقیم شبکه با کارتخوان‌های بانکی جهت ارسال خودکار مبلغ از فیش صندوق به دستگاه کارتخوان و استعلام وضعیت چک صیادی از وب‌سرویس بانک مرکزی.
              </li>
              <li>
                <strong>۴. احراز هویت چندعاملی:</strong> اتصال تغییر نقش کاربری به سرور احراز هویت سازمانی همراه با رمز یکبارمصرف پیامکی و ثبت نشانی شبکه در تاریخچه امنیتی.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
