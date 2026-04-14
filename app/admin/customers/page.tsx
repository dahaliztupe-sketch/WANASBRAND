'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  MoreVertical, 
  Mail, 
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/client';

interface Customer {
  id: string;
  email: string;
  displayName: string;
  isVIP?: boolean;
  createdAt: string;
  totalSpent?: number;
  orderCount?: number;
  lastOrderDate?: string;
}

export default function CustomerCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const customerList = snapshot.docs.map(doc => {
          const data = doc.data() as Customer;
          return { ...data, id: doc.id };
        });
        setCustomers(customerList);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const toggleVIP = async (customer: Customer) => {
    try {
      const customerRef = doc(db, 'users', customer.id);
      await updateDoc(customerRef, { isVIP: !customer.isVIP });
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, isVIP: !c.isVIP } : c));
      toast.success(`${customer.displayName} is now ${!customer.isVIP ? 'a VIP' : 'a regular member'}.`);
    } catch {
      toast.error('Failed to update VIP status.');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-primary/5 pb-12">
        <div>
          <h1 className="text-4xl font-serif text-primary mb-4 tracking-wide">Customer CRM</h1>
          <p className="text-primary/50 font-light tracking-wide">
            Manage your atelier members and identify your most loyal patrons.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-accent-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search Members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-inverted/[0.02] border border-primary/5 px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all placeholder:text-primary/20 min-w-[300px]"
            />
          </div>
          <button className="flex items-center gap-3 px-6 py-4 border border-primary/5 text-xs uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-inverted/5 transition-all">
            <Filter strokeWidth={1} className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Members', value: customers.length, icon: Users, color: 'text-blue-500' },
          { label: 'VIP Patrons', value: customers.filter(c => c.isVIP).length, icon: Star, color: 'text-accent-primary' },
          { label: 'New This Month', value: '12', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Active Today', value: '4', icon: UserCheck, color: 'text-amber-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-inverted/[0.02] p-8 border border-primary/5">
            <div className="flex items-center justify-between mb-6">
              <stat.icon className={`w-6 h-6 stroke-[1.5px] ${stat.color}`} />
              <span className="text-3xl font-serif text-primary">{stat.value}</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-primary/40">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Customer Table */}
      <div className="bg-primary border border-primary/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-inverted/[0.02] border-b border-primary/5">
              <th className="px-8 py-6 text-xs uppercase tracking-widest text-primary/40 font-medium">Customer</th>
              <th className="px-8 py-6 text-xs uppercase tracking-widest text-primary/40 font-medium">Status</th>
              <th className="px-8 py-6 text-xs uppercase tracking-widest text-primary/40 font-medium">Lifetime Value</th>
              <th className="px-8 py-6 text-xs uppercase tracking-widest text-primary/40 font-medium">Joined</th>
              <th className="px-8 py-6 text-xs uppercase tracking-widest text-primary/40 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-10 h-24 bg-inverted/[0.01]" />
                </tr>
              ))
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-inverted/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-inverted/5 flex items-center justify-center text-primary/40 font-serif text-lg">
                        {customer.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{customer.displayName || 'Unnamed User'}</p>
                        <p className="text-xs text-primary/40 font-light">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {customer.isVIP ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] uppercase tracking-widest font-medium">
                        <Star strokeWidth={1} className="w-3 h-3 fill-current" />
                        VIP Patron
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 bg-inverted/5 text-primary/40 text-[10px] uppercase tracking-widest font-medium">
                        Member
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-serif text-primary">${(customer.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-primary/40 uppercase tracking-widest">{customer.orderCount || 0} Reservations</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-primary/60 font-light">
                      {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => toggleVIP(customer)}
                        className={`p-2 transition-colors ${customer.isVIP ? 'text-accent-primary hover:text-primary' : 'text-primary/20 hover:text-accent-primary'}`}
                        title={customer.isVIP ? 'Remove VIP Status' : 'Mark as VIP'}
                      >
                        <Star strokeWidth={1} className={`w-5 h-5 ${customer.isVIP ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 text-primary/20 hover:text-primary transition-colors">
                        <Mail strokeWidth={1} className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-primary/20 hover:text-primary transition-colors">
                        <MoreVertical strokeWidth={1} className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                  <p className="text-primary/40 font-light italic">No members found matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
