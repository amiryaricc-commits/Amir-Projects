import React, { useState } from 'react';
import {
  Users,
  Megaphone,
  Calendar,
  TrendingUp,
  Send,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { CrmLeadRecord } from '../data/erpSeedData';
import { formatCurrency } from '../utils/erpEngine';

interface CrmMarketingModuleProps {
  leads: CrmLeadRecord[];
  onAddLead: (lead: CrmLeadRecord) => void;
  onAdvanceLeadStage: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const CrmMarketingModule: React.FC<CrmMarketingModuleProps> = ({
  leads,
  onAddLead,
  onAdvanceLeadStage,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'campaigns' | 'appointments' | 'newsletter'>('pipeline');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSource, setLeadSource] = useState<CrmLeadRecord['source']>('اینستاگرام');
  const [leadStyle, setLeadStyle] = useState<CrmLeadRecord['interestStyle']>('سبک MTL (سیگاری)');
  const [leadValue, setLeadValue] = useState(6500000);

  // Appointments state
  const [appointments, setAppointments] = useState([
    {
      id: 'apt-1',
      title: 'جلسه حضوری تست سمپل طعم‌های جدید Peak Bar 60000',
      contact: 'کیانوش رستمی (پخش اصفهان)',
      datetime: '۱۴۰۴/۰۸/۰۴ — ساعت ۱۱:۰۰',
      channel: 'شوروم شعبه الهیه · همگام با Google Calendar',
      status: 'تاییدشده',
    },
    {
      id: 'apt-2',
      title: 'مشاوره تلفنی راه‌اندازی استند فروشگاهی و شرایط اقساطی',
      contact: 'فرهاد امینی (همکار رشت)',
      datetime: '۱۴۰۴/۰۸/۰۵ — ساعت ۱۶:۳۰',
      channel: 'تماس تصویری Google Meet',
      status: 'در انتظار برگشت تماس',
    },
  ]);

  // Newsletter state
  const [selectedSegment, setSelectedSegment] = useState<'MTL' | 'DTL' | 'B2B'>('MTL');
  const [newsletterSubject, setNewsletterSubject] = useState(
    'شارژ مجدد سالت‌های اورجینال Nasty و پاد ۶۰ هزار پاف با کد تخفیف ویژه باشگاه مشتریان'
  );

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) return;
    onAddLead({
      id: `crm-${Date.now()}`,
      fullName: leadName.trim(),
      phone: leadPhone.trim() || '۰۹۱۲۰۰۰۰۰۰۰',
      source: leadSource,
      campaignName: 'کمپین پاییزه اینستاگرام',
      interestStyle: leadStyle,
      stage: 'سرنخ جدید (Lead)',
      probability: 40,
      estimatedValue: leadValue,
      loyaltyTier: 'برنزی',
      loyaltyPoints: 50,
      clvAmount: leadValue,
      lastPurchaseDaysAgo: 1,
    });
    setLeadName('');
    setLeadPhone('');
    setShowNewLeadForm(false);
    onShowToast('سرنخ فروش جدید (Lead) در قیف CRM ثبت شد.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            مدیریت ارتباط با مشتری و بازاریابی (CRM & Marketing)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            قیف سرنخ‌ها و فرصت‌های فروش، ردیابی کمپین‌های UTM و اینفلوئنسرها، تقویم جلسات، ارزش طول عمر مشتری (CLV) و خبرنامه MTL/DTL
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewLeadForm(!showNewLeadForm)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت سرنخ / فرصت فروش جدید</span>
        </button>
      </div>

      {showNewLeadForm && (
        <form
          onSubmit={handleCreateLead}
          className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-xs"
        >
          <div>
            <label className="block font-medium text-slate-700 mb-1">نام مخاطب / فروشگاه</label>
            <input
              type="text"
              required
              placeholder="مثلاً کامران تقوی"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">شماره تماس</label>
            <input
              type="text"
              placeholder="۰۹۱۲..."
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">کانال ورودی (UTM)</label>
            <select
              aria-label="کانال ورودی سرنخ"
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value as CrmLeadRecord['source'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="اینستاگرام">اینستاگرام</option>
              <option value="تلگرام">تلگرام</option>
              <option value="کمپین اینفلوئنسر">کمپین اینفلوئنسر</option>
              <option value="تماس تلفنی">تماس تلفنی</option>
              <option value="مراجعه حضوری">مراجعه حضوری</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">سبک مورد علاقه</label>
            <select
              aria-label="سبک مورد علاقه مشتری"
              value={leadStyle}
              onChange={(e) => setLeadStyle(e.target.value as CrmLeadRecord['interestStyle'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="سبک MTL (سیگاری)">سبک MTL (سیگاری)</option>
              <option value="سبک DTL (قلیانی)">سبک DTL (قلیانی)</option>
              <option value="همکار عمده‌فروش">همکار عمده‌فروش</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
          >
            افزودن به قیف CRM
          </button>
        </form>
      )}

      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        {[
          { id: 'pipeline', label: 'قیف سرنخ‌ها، فرصت‌ها و ارزش طول عمر (CLV)', icon: Users },
          { id: 'campaigns', label: 'کمپین‌های تبلیغاتی و UTM Tracking', icon: Megaphone },
          { id: 'appointments', label: 'قرارهای ملاقات و تقویم گوگل', icon: Calendar },
          { id: 'newsletter', label: 'خبرنامه و پیام گروهی (MTL / DTL)', icon: Send },
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

      {/* TAB 1: LEADS, OPPORTUNITIES & CUSTOMER ANALYTICS */}
      {activeTab === 'pipeline' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              مدیریت سرنخ‌ها (Leads)، فرصت‌های فروش (Opportunities) و تحلیل رفتار خرید (Customer Analytics)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              پایش احتمال بسته شدن معامله، فاصله زمانی آخرین خرید (تشخیص ریزش مشتری) و ارزش طول عمر (CLV)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-3">مشتری / سرنخ</th>
                  <th className="py-2.5 px-3">منبع ورودی · کمپین · سبک</th>
                  <th className="py-2.5 px-3">مرحله فعلی قیف فروش</th>
                  <th className="py-2.5 px-3">احتمال موفقیت</th>
                  <th className="py-2.5 px-3 text-left">ارزش طول عمر (CLV)</th>
                  <th className="py-2.5 px-3">وضعیت وفاداری / ریزش</th>
                  <th className="py-2.5 px-3">ارتقای مرحله</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{lead.fullName}</div>
                      <div className="font-mono text-slate-500">{lead.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span>{lead.source}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{lead.campaignName}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="font-medium text-indigo-700">{lead.interestStyle}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{lead.stage}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700">
                      {lead.probability}٪
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-left">
                      {formatCurrency(lead.clvAmount)} ت
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={
                          lead.lastPurchaseDaysAgo > 30
                            ? 'text-rose-700 font-semibold'
                            : 'text-emerald-700 font-medium'
                        }
                      >
                        آخرین خرید: {lead.lastPurchaseDaysAgo} روز پیش (
                        {lead.lastPurchaseDaysAgo > 30 ? 'هشدار ریزش' : `فعال - ${lead.loyaltyTier}`}
                        )
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => onAdvanceLeadStage(lead.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                      >
                        ارتقا به مرحله بعد ←
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGN & UTM TRACKING */}
      {activeTab === 'campaigns' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            عملکرد کمپین‌های تبلیغاتی و نرخ بازگشت سرمایه (Campaign & UTM ROI Tracking)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              {
                name: 'کمپین اینفلوئنسر اینستاگرام — معرفی Peak Bar 60000',
                utm: 'utm_source=instagram&utm_campaign=peakbar60k',
                spend: 35000000,
                leadsCount: 142,
                revenue: 485000000,
                roi: '+۱۲۸۵٪',
              },
              {
                name: 'کمپین کانال‌های تلگرامی ویپ و پاد',
                utm: 'utm_source=telegram&utm_campaign=autumn_salt',
                spend: 18000000,
                leadsCount: 89,
                revenue: 210000000,
                roi: '+۱۰۶۶٪',
              },
              {
                name: 'سئو و مقالات وبلاگ راهنمای خرید MTL / DTL',
                utm: 'utm_source=google_organic&utm_medium=blog',
                spend: 8000000,
                leadsCount: 215,
                revenue: 340000000,
                roi: '+۴۱۵۰٪',
              },
            ].map((cmp) => (
              <div key={cmp.name} className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">{cmp.name}</div>
                <div className="font-mono text-slate-500 text-[11px]">{cmp.utm}</div>
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">هزینه تبلیغات:</span>
                    <span className="font-mono">{formatCurrency(cmp.spend)} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">سرنخ‌های جذب‌شده:</span>
                    <span className="font-mono font-semibold">{cmp.leadsCount} سرنخ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">فروش قطعی حاصل‌شده:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(cmp.revenue)} تومان ({cmp.roi})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPOINTMENTS & GOOGLE CALENDAR */}
      {activeTab === 'appointments' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                قرارهای ملاقات حضوری و مشاوره (Appointment & Google Calendar Sync)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مدیریت رزرو وقت بازدید از شوروم و جلسات فروش عمده همگام با تقویم گوگل
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAppointments([
                  ...appointments,
                  {
                    id: `apt-${Date.now()}`,
                    title: 'جلسه تست محصولات جدید و مذاکره قرارداد نمایندگی',
                    contact: 'مشتری جدید VIP',
                    datetime: '۱۴۰۴/۰۸/۰۶ — ساعت ۱۴:۰۰',
                    channel: 'شوروم الهیه · ثبت در Google Calendar',
                    status: 'تاییدشده',
                  },
                ]);
                onShowToast('قرار ملاقات جدید ثبت و در تقویم همگام‌سازی شد.');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 whitespace-nowrap"
            >
              + ثبت قرار ملاقات جدید
            </button>
          </div>
          <div className="space-y-3 text-xs">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{apt.title}</div>
                  <div className="text-slate-600">
                    مخاطب: {apt.contact} · {apt.channel}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-mono font-semibold text-indigo-700">{apt.datetime}</div>
                  <div className="text-emerald-700 font-medium">{apt.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NEWSLETTER & SEGMENTED MESSAGING */}
      {activeTab === 'newsletter' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ارسال خبرنامه و پیام گروهی هوشمند (Newsletter & Audience Groups)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تفکیک مخاطبان بر اساس علاقه‌مندی فنی (طرفداران سبک MTL، سبک DTL یا خریداران عمده B2B)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {[
              { id: 'MTL', label: 'گروه طرفداران سبک MTL (سیگاری / سالت نیکوتین) — ۱,۲۴۰ عضو' },
              { id: 'DTL', label: 'گروه طرفداران سبک DTL (قلیانی / جویس) — ۸۹۰ عضو' },
              { id: 'B2B', label: 'همکاران و پخش‌کنندگان عمده — ۱۶۵ عضو' },
            ].map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setSelectedSegment(seg.id as 'MTL' | 'DTL' | 'B2B')}
                className={`px-3.5 py-2 rounded-lg font-semibold border transition-colors ${
                  selectedSegment === seg.id
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 text-xs">
            <label className="block font-medium text-slate-700">متن پیامک / خبرنامه ایمیلی و تلگرامی</label>
            <textarea
              rows={3}
              aria-label="متن خبرنامه"
              value={newsletterSubject}
              onChange={(e) => setNewsletterSubject(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              onShowToast(
                `خبرنامه هدفمند برای گروه «${selectedSegment}» با موفقیت در صف ارسال قرار گرفت.`
              )
            }
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            ارسال فوری خبرنامه به اعضای گروه انتخابی
          </button>
        </div>
      )}
    </div>
  );
};
