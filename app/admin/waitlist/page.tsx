'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/client';

interface WaitlistEntry {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  contactInfo: string;
  status: 'pending' | 'notified';
  createdAt: Timestamp;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WaitlistEntry[];
      setEntries(data);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      toast.error('Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotified = async (id: string) => {
    try {
      await updateDoc(doc(db, 'waitlist', id), {
        status: 'notified'
      });
      setEntries(entries.map(entry => 
        entry.id === id ? { ...entry, status: 'notified' } : entry
      ));
      toast.success('Marked as notified');
    } catch (error) {
      console.error('Error updating waitlist entry:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading waitlist...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Waitlist Requests</h2>
      </div>

      <div className="bg-primary rounded-sm shadow-sm border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary text-primary/50 font-sans uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Variant</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-primary/50">
                    No waitlist requests found.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-primary/50 transition-colors">
                    <td className="px-6 py-4 text-primary/70">
                      {entry.createdAt?.toDate ? format(entry.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {entry.productName}
                    </td>
                    <td className="px-6 py-4 text-primary/70">
                      {entry.variantName}
                    </td>
                    <td className="px-6 py-4 text-primary/70">
                      {entry.contactInfo}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'notified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {entry.status === 'pending' && (
                        <button
                          onClick={() => handleMarkNotified(entry.id)}
                          className="text-xs uppercase tracking-wider text-primary/70 hover:text-primary font-medium transition-colors"
                        >
                          Mark Notified
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
