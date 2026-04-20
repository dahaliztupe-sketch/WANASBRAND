'use client';

import { useState } from 'react';
import {
  Sparkles, Wand2, BarChart3, Package, HeadphonesIcon,
  Loader2, Copy, Check, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AgentTab = 'style' | 'content' | 'analytics' | 'inventory' | 'customer';

interface AgentResult {
  text: string;
  timestamp: Date;
}

const AGENTS: {
  id: AgentTab;
  nameEn: string;
  nameAr: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  actions: { id: string; label: string; fields: { id: string; label: string; type: string; placeholder: string }[] }[];
}[] = [
  {
    id: 'style',
    nameEn: 'Style Agent',
    nameAr: 'وكيل الأناقة',
    icon: <Wand2 className="w-5 h-5" />,
    color: 'text-[#D4AF37]',
    description: 'مستشارة الأناقة الشخصية — توصيات أزياء وتنسيقات مخصصة',
    actions: [
      {
        id: 'advice',
        label: 'استشارة أناقة',
        fields: [
          { id: 'question', label: 'سؤال العميلة', type: 'textarea', placeholder: 'ما التشكيلة المناسبة لحفل زفاف صيفي؟' },
          { id: 'occasion', label: 'المناسبة', type: 'text', placeholder: 'حفل زفاف / عيد ميلاد / رمضان' },
          { id: 'budget', label: 'الميزانية (جنيه)', type: 'number', placeholder: '15000' },
        ],
      },
      {
        id: 'lookbook',
        label: 'لوك بوك موسمي',
        fields: [
          { id: 'season', label: 'الموسم', type: 'text', placeholder: 'رمضان / صيف / خريف' },
        ],
      },
    ],
  },
  {
    id: 'content',
    nameEn: 'Content Agent',
    nameAr: 'وكيل المحتوى',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-purple-400',
    description: 'كاتب المحتوى الإبداعي — أوصاف المنتجات وكابشن السوشيال ميديا',
    actions: [
      {
        id: 'description',
        label: 'وصف منتج',
        fields: [
          { id: 'name', label: 'اسم المنتج', type: 'text', placeholder: 'عباءة الفراشة الذهبية' },
          { id: 'category', label: 'الفئة', type: 'text', placeholder: 'عباءات فاخرة' },
          { id: 'fabric', label: 'القماش', type: 'text', placeholder: 'شيفون إيطالي مطرز' },
          { id: 'language', label: 'اللغة', type: 'text', placeholder: 'both / ar / en' },
        ],
      },
      {
        id: 'instagram',
        label: 'كابشن إنستغرام',
        fields: [
          { id: 'productName', label: 'اسم المنتج', type: 'text', placeholder: 'كفتان النيل' },
          { id: 'mood', label: 'الروح', type: 'text', placeholder: 'رومانسي / ملكي / عصري' },
        ],
      },
      {
        id: 'collectionStory',
        label: 'قصة التشكيلة',
        fields: [
          { id: 'collectionName', label: 'اسم التشكيلة', type: 'text', placeholder: 'نساء النيل' },
          { id: 'inspiration', label: 'مصدر الإلهام', type: 'text', placeholder: 'الحضارة الفرعونية' },
        ],
      },
    ],
  },
  {
    id: 'analytics',
    nameEn: 'Analytics Agent',
    nameAr: 'وكيل التحليلات',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'text-blue-400',
    description: 'محلل الأعمال الذكي — رؤى الإيرادات والتوقعات',
    actions: [
      {
        id: 'report',
        label: 'تقرير الأعمال',
        fields: [
          { id: 'revenue', label: 'الإيرادات (جنيه)', type: 'number', placeholder: '250000' },
          { id: 'totalReservations', label: 'إجمالي الحجوزات', type: 'number', placeholder: '45' },
          { id: 'totalCustomers', label: 'إجمالي العملاء', type: 'number', placeholder: '120' },
        ],
      },
    ],
  },
  {
    id: 'inventory',
    nameEn: 'Inventory Agent',
    nameAr: 'وكيل المخزون',
    icon: <Package className="w-5 h-5" />,
    color: 'text-green-400',
    description: 'مدير المخزون الذكي — تنبيهات وتوصيات إعادة الطلب',
    actions: [
      {
        id: 'alert',
        label: 'تحليل المخزون',
        fields: [
          { id: 'productName', label: 'اسم المنتج', type: 'text', placeholder: 'عباءة الياسمين' },
          { id: 'stock', label: 'المخزون الحالي', type: 'number', placeholder: '2' },
          { id: 'sold', label: 'مُباع', type: 'number', placeholder: '8' },
          { id: 'daysInInventory', label: 'أيام في المخزن', type: 'number', placeholder: '45' },
        ],
      },
    ],
  },
  {
    id: 'customer',
    nameEn: 'Customer Agent',
    nameAr: 'وكيل العملاء',
    icon: <HeadphonesIcon className="w-5 h-5" />,
    color: 'text-rose-400',
    description: 'خدمة العملاء الذكية — ردود مخصصة وكشف الشكاوى',
    actions: [
      {
        id: 'inquiry',
        label: 'رد على استفسار',
        fields: [
          { id: 'question', label: 'سؤال العميلة', type: 'textarea', placeholder: 'متى يصل طلبي؟' },
          { id: 'customerName', label: 'اسم العميلة', type: 'text', placeholder: 'نور' },
          { id: 'loyaltyTier', label: 'مستوى الولاء', type: 'text', placeholder: 'Gold' },
        ],
      },
      {
        id: 'urgency',
        label: 'فحص الشكوى',
        fields: [
          { id: 'message', label: 'رسالة العميلة', type: 'textarea', placeholder: 'القطعة وصلت بها عيب...' },
        ],
      },
    ],
  },
];

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<AgentTab>('style');
  const [activeAction, setActiveAction] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [copied, setCopied] = useState(false);

  const activeAgent = AGENTS.find(a => a.id === activeTab)!;

  const handleRun = async () => {
    if (!activeAction) return;
    setLoading(true);
    setResult(null);

    try {
      const agentRoutes: Record<AgentTab, string> = {
        style: '/api/agents/style',
        content: '/api/agents/content',
        analytics: '/api/agents/analytics',
        inventory: '/api/agents/inventory',
        customer: '/api/agents/customer',
      };

      const res = await fetch(agentRoutes[activeTab], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activeAction,
          data: {
            ...formData,
            language: 'ar',
          },
        }),
      });

      const json = await res.json() as { result?: { data?: string }; error?: string };
      const text = json.result?.data ?? json.error ?? 'لا توجد نتيجة';
      setResult({ text, timestamp: new Date() });
    } catch (err) {
      setResult({ text: `خطأ: ${String(err)}`, timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="border-b border-primary/10 px-8 py-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-accent-primary" strokeWidth={1} />
          <div>
            <h1 className="text-sm font-medium tracking-[0.2em] uppercase">AI Agents — وكلاء الذكاء الاصطناعي</h1>
            <p className="text-[10px] text-primary/40 mt-0.5 tracking-widest uppercase">Gemini Flash — Free Tier</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 border-e border-primary/10 flex flex-col">
          <div className="p-4 space-y-1">
            {AGENTS.map(agent => (
              <button
                key={agent.id}
                onClick={() => { setActiveTab(agent.id); setActiveAction(''); setResult(null); }}
                className={`w-full text-start px-3 py-3 flex items-center gap-3 transition-all duration-200 ${
                  activeTab === agent.id
                    ? 'bg-accent-primary/10 border-s-2 border-accent-primary'
                    : 'hover:bg-primary/5 border-s-2 border-transparent'
                }`}
              >
                <span className={agent.color}>{agent.icon}</span>
                <div>
                  <p className="text-[11px] font-medium tracking-wide">{agent.nameAr}</p>
                  <p className="text-[9px] text-primary/40 uppercase tracking-widest">{agent.nameEn}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 border-t border-primary/10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[9px] text-primary/40 uppercase tracking-widest">نشط — Gemini Flash</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">

            {/* Agent Info */}
            <div className="flex items-start gap-4">
              <div className={`p-3 border border-primary/10 ${activeAgent.color}`}>
                {activeAgent.icon}
              </div>
              <div>
                <h2 className="text-base font-medium">{activeAgent.nameAr}</h2>
                <p className="text-xs text-primary/50 mt-0.5">{activeAgent.description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary/40">اختر الإجراء</p>
              <div className="grid grid-cols-3 gap-2">
                {activeAgent.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => { setActiveAction(action.id); setFormData({}); setResult(null); }}
                    className={`px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all duration-200 border ${
                      activeAction === action.id
                        ? 'bg-inverted text-inverted border-transparent'
                        : 'border-primary/15 hover:border-accent-primary text-primary/60 hover:text-accent-primary'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <AnimatePresence>
              {activeAction && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/40">البيانات المطلوبة</p>
                  {activeAgent.actions
                    .find(a => a.id === activeAction)
                    ?.fields.map(field => (
                      <div key={field.id} className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-[0.2em] text-primary/40">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            placeholder={field.placeholder}
                            value={formData[field.id] ?? ''}
                            onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full bg-transparent border border-primary/15 px-3 py-2.5 text-sm focus:outline-none focus:border-accent-primary transition-colors resize-none text-primary placeholder:text-primary/20"
                          />
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.id] ?? ''}
                            onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full bg-transparent border border-primary/15 px-3 py-2.5 text-sm focus:outline-none focus:border-accent-primary transition-colors text-primary placeholder:text-primary/20"
                          />
                        )}
                      </div>
                    ))}

                  <button
                    onClick={handleRun}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-inverted text-inverted text-[10px] uppercase tracking-[0.25em] hover:bg-accent-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> جارٍ التشغيل...</>
                    ) : (
                      <><Zap className="w-3.5 h-3.5" /> تشغيل الوكيل</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border border-accent-primary/20 p-6 space-y-3 bg-accent-primary/3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-accent-primary">نتيجة الوكيل</p>
                    <div className="flex items-center gap-3">
                      <p className="text-[9px] text-primary/30">{result.timestamp.toLocaleTimeString('ar-EG')}</p>
                      <button onClick={copyResult} className="text-primary/40 hover:text-accent-primary transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary">{result.text}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
