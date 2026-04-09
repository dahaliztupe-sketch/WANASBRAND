'use client';

import { useEffect, useState } from 'react';
import { initializeProductionDatabase } from '../actions';
import Link from 'next/link';

export default function InitializePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function run() {
      setStatus('loading');
      try {
        await initializeProductionDatabase();
        setStatus('success');
        setMessage('Database initialized successfully. Reservation counter set to 10000.');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    }
    run();
  }, []);

  return (
    <div className="min-h-screen bg-inverted text-inverted flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-primary/5 backdrop-blur-xl p-8 rounded-2xl border border-primary/10 text-center">
        <h1 className="font-serif text-3xl mb-6">Production Initialization</h1>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-inverted/60">Seeding initial structure...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-inverted/80">{message}</p>
            <Link 
              href="/admin"
              className="block w-full py-3 bg-accent-primary text-inverted rounded-xl font-medium hover:bg-accent-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="block w-full py-3 bg-primary/10 text-inverted rounded-xl font-medium hover:bg-primary/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
