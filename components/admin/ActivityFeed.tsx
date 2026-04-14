'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

import { db, auth } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { Log } from '@/types';

export function ActivityFeed() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Log));
      setLogs(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'logs', auth));
    return unsubscribe;
  }, []);

  return (
    <div className="bg-primary p-8 border border-primary/30 shadow-sm">
      <h2 className="font-serif text-2xl text-primary mb-8 tracking-wide">Reception Log</h2>
      <div className="space-y-6">
        {logs.map(log => (
          <div key={log.id} className="text-sm">
            <p className="text-primary">{log.action}</p>
            <p className="text-[10px] text-primary/40 uppercase tracking-widest mt-1">
              {log.adminName} • {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
