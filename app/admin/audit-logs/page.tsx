'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { ScrollText, Filter, ChevronDown, Loader2, Package, ShoppingBag, User, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase/client';

type TargetType = 'product' | 'reservation' | 'user' | 'system' | 'all';

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  product:     <Package className="w-3.5 h-3.5" />,
  reservation: <ShoppingBag className="w-3.5 h-3.5" />,
  user:        <User className="w-3.5 h-3.5" />,
  system:      <Settings className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  product:     'text-blue-400 bg-blue-400/10',
  reservation: 'text-[#D4AF37] bg-[#D4AF37]/10',
  user:        'text-green-400 bg-green-400/10',
  system:      'text-purple-400 bg-purple-400/10',
};

const ACTION_LABELS: Record<string, string> = {
  'product.created':            'إنشاء منتج',
  'product.updated':            'تعديل منتج',
  'product.deleted':            'حذف منتج',
  'reservation.status_updated': 'تحديث حالة الحجز',
  'reservation.cancelled':      'إلغاء حجز',
  'user.promoted':              'ترقية مستخدم',
  'user.demoted':               'خفض مستخدم',
  'system.settings_updated':    'تعديل الإعدادات',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TargetType>('all');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 25;

  const fetchLogs = async (reset = false) => {
    if (reset) { setLoading(true); setLogs([]); setLastDoc(null); setHasMore(true); }

    try {
      let q = query(
        collection(db, 'audit_logs'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      );

      if (filter !== 'all') {
        q = query(
          collection(db, 'audit_logs'),
          where('targetType', '==', filter),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );
      }

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snap = await getDocs(q);
      const newLogs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));

      setLogs(prev => reset ? newLogs : [...prev, ...newLogs]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.size === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchLogs(true); }, [filter]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchLogs(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        dateStyle: 'medium', timeStyle: 'short', hour12: true,
      }).format(new Date(iso));
    } catch { return iso; }
  };

  const FILTER_TABS: { id: TargetType; label: string }[] = [
    { id: 'all',         label: 'الكل'        },
    { id: 'reservation', label: 'الحجوزات'    },
    { id: 'product',     label: 'المنتجات'    },
    { id: 'user',        label: 'المستخدمون' },
    { id: 'system',      label: 'النظام'      },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ScrollText className="w-5 h-5 text-accent-primary" strokeWidth={1} />
        <div>
          <h1 className="text-sm font-medium tracking-[0.2em] uppercase">سجل العمليات</h1>
          <p className="text-[10px] text-primary/40 mt-0.5 tracking-widest uppercase">Audit Logs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-primary/30" strokeWidth={1} />
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] transition-all border ${
              filter === tab.id
                ? 'bg-inverted text-inverted border-transparent'
                : 'border-primary/15 text-primary/50 hover:border-accent-primary hover:text-accent-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log Table */}
      <div className="border border-primary/10">
        {/* Header row */}
        <div className="grid grid-cols-[140px_1fr_120px_140px] gap-4 px-4 py-2.5 border-b border-primary/10 bg-primary/3">
          {['التاريخ والوقت', 'الإجراء', 'النوع', 'المسؤول'].map(h => (
            <span key={h} className="text-[9px] uppercase tracking-[0.2em] text-primary/40">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-accent-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-primary/30">لا توجد سجلات بعد</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="grid grid-cols-[140px_1fr_120px_140px] gap-4 px-4 py-3.5 border-b border-primary/5 hover:bg-primary/3 transition-colors group"
            >
              <span className="text-[10px] text-primary/40 font-mono">{formatDate(log.createdAt)}</span>

              <div className="space-y-0.5">
                <p className="text-xs text-primary">{ACTION_LABELS[log.action] ?? log.action}</p>
                {log.targetId && (
                  <p className="text-[9px] text-primary/30 font-mono">#{log.targetId.slice(0, 12)}</p>
                )}
              </div>

              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] uppercase tracking-widest w-fit h-fit ${TYPE_COLORS[log.targetType] ?? 'text-primary/40 bg-primary/5'}`}>
                {TYPE_ICONS[log.targetType]}
                {log.targetType}
              </span>

              <span className="text-[10px] text-primary/60">{log.adminName}</span>
            </motion.div>
          ))
        )}

        {/* Load more */}
        {!loading && hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 mx-auto text-[10px] uppercase tracking-[0.2em] text-primary/40 hover:text-accent-primary transition-colors disabled:opacity-40"
            >
              {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
              تحميل المزيد
            </button>
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-[9px] text-primary/20 tracking-widest uppercase text-center">
          {logs.length} سجل مُعروض
        </p>
      )}
    </div>
  );
}
