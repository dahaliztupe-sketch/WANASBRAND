'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { User as UserIcon, Shield, Loader2 } from 'lucide-react';

import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { User } from '@/types';
import { triggerHaptic } from '@/lib/utils/haptics';

export default function SettingsPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUserData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || isUpdating) return;
    
    triggerHaptic();
    setIsUpdating(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;

    try {
      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        fullName,
        phone,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="h-96 bg-inverted/5 animate-pulse" />;

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif text-primary tracking-wide">Settings</h1>
        <p className="text-primary/50 font-light tracking-wide italic">Manage your boutique profile and atelier preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Profile Section */}
        <section className="space-y-10">
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-primary/40 font-bold border-b border-primary/5 pb-4">
            <UserIcon strokeWidth={1} className="w-4 h-4" />
            Personal Details
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-primary/40">Full Name</label>
              <input 
                name="fullName"
                type="text" 
                defaultValue={userData?.fullName || auth.currentUser?.displayName || ''}
                className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-primary/40">Email Address</label>
              <div className="flex items-center justify-between py-3 border-b border-primary/5 text-primary/40 text-sm">
                <span>{auth.currentUser?.email}</span>
                <Shield strokeWidth={1} className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-primary/40">Phone Number</label>
              <input 
                name="phone"
                type="tel" 
                defaultValue={userData?.phone || ''}
                placeholder="01xxxxxxxxx"
                className="w-full border-b border-primary/20 py-3 bg-transparent outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={isUpdating}
              className="px-8 py-4 bg-inverted text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update Profile'}
            </button>
          </form>
        </section>

        {/* Security & Preferences */}
        <section className="space-y-10">
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-primary/40 font-bold border-b border-primary/5 pb-4">
            <Shield strokeWidth={1} className="w-4 h-4" />
            Atelier Preferences
          </div>
          
          <div className="space-y-8">
            <div className="p-6 bg-inverted/[0.02] border border-primary/5 space-y-4">
              <h3 className="text-sm font-serif text-primary">Communication</h3>
              <p className="text-xs text-primary/50 leading-relaxed font-light italic">
                Receive exclusive invitations to collection previews and private atelier events.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-10 h-5 bg-accent-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-primary/60">Email Notifications</span>
              </div>
            </div>

            <div className="p-6 bg-inverted/[0.02] border border-primary/5 space-y-4">
              <h3 className="text-sm font-serif text-primary">Security</h3>
              <p className="text-xs text-primary/50 leading-relaxed font-light italic">
                Your data is encrypted with boutique-grade security protocols.
              </p>
              <button className="text-[10px] uppercase tracking-widest text-accent-primary hover:text-primary transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
