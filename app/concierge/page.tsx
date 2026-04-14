'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ConciergeModal } from '@/components/ConciergeModal';
import { createConciergeRequest } from '@/lib/services/concierge.service';

export default function ConciergePage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await createConciergeRequest(data);
      router.push('/reservation/success?type=concierge');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <ConciergeModal 
        isOpen={isModalOpen} 
        onClose={() => router.push('/')} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
