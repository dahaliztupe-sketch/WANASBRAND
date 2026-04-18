'use client';

import { useQuickViewStore } from '@/store/useQuickViewStore';
import { QuickViewModal } from '@/components/QuickViewModal';

export function QuickViewProvider() {
  const { product, isOpen, close } = useQuickViewStore();
  return <QuickViewModal product={product} isOpen={isOpen} onClose={close} />;
}
