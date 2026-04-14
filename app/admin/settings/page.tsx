'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Save, 
  Bell, 
  CreditCard, 
  Percent, 
  Globe, 
  ShieldCheck, 
  Loader2,
  Mail,
  Smartphone,
  Layout,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/client';

interface SiteSettings {
  announcementBanner: string;
  announcementBarEnabled: boolean;
  heroHeadline: string;
  heroImage: string;
  enableCOD: boolean;
  taxRate: number;
  shippingRateCairoGiza: number;
  shippingRateOther: number;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  currency: string;
}

const defaultSettings: SiteSettings = {
  announcementBanner: 'Complimentary shipping on all curated selections.',
  announcementBarEnabled: true,
  heroHeadline: 'The Sanctuary of Modern Elegance',
  heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop',
  enableCOD: true,
  taxRate: 14,
  shippingRateCairoGiza: 50,
  shippingRateOther: 100,
  contactEmail: 'concierge@aura.com',
  contactPhone: '+20 100 000 0000',
  maintenanceMode: false,
  currency: 'EGP',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...settings,
        updatedAt: serverTimestamp(),
      });
      toast.success('Global settings updated successfully.');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-primary/5 pb-12">
        <div>
          <h1 className="text-4xl font-serif text-primary mb-4 tracking-wide">Global Settings</h1>
          <p className="text-primary/50 font-light tracking-wide">
            Configure the core parameters of the WANAS digital boudoir.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-inverted text-inverted px-10 py-4 uppercase tracking-[0.2em] text-xs hover:bg-accent-primary transition-all duration-500 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save strokeWidth={1} className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left Column: General & Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Storefront Content */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Layout strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <h2 className="text-xl font-serif text-primary tracking-wide">Storefront Content</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-inverted/[0.02] border border-primary/5">
                <div>
                  <p className="text-sm font-medium text-primary">Announcement Bar</p>
                  <p className="text-[10px] text-primary/40 uppercase tracking-widest">Toggle visibility on storefront</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSettings({ ...settings, announcementBarEnabled: !settings.announcementBarEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.announcementBarEnabled ? 'bg-accent-primary' : 'bg-inverted/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-primary rounded-full transition-all ${settings.announcementBarEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-primary/40">Announcement Text</label>
                <div className="relative group">
                  <Bell strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent-primary transition-colors" />
                  <input 
                    type="text" 
                    value={settings.announcementBanner}
                    onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-primary/40">Hero Headline</label>
                  <input 
                    type="text" 
                    value={settings.heroHeadline}
                    onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-6 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-primary/40">Hero Image URL</label>
                  <input 
                    type="text" 
                    value={settings.heroImage}
                    onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-6 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Smartphone strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <h2 className="text-xl font-serif text-primary tracking-wide">Concierge Contact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-primary/40">Support Email</label>
                <div className="relative group">
                  <Mail strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent-primary transition-colors" />
                  <input 
                    type="email" 
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-primary/40">Support Phone</label>
                <div className="relative group">
                  <Smartphone strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent-primary transition-colors" />
                  <input 
                    type="text" 
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Financials & Shipping */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <CreditCard strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <h2 className="text-xl font-serif text-primary tracking-wide">Financials & Logistics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-primary/40">Tax Rate (%)</label>
                <div className="relative group">
                  <Percent strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent-primary transition-colors" />
                  <input 
                    type="number" 
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-primary/40">Shipping: Cairo & Giza</label>
                <div className="relative group">
                  <Globe strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent-primary transition-colors" />
                  <input 
                    type="number" 
                    value={settings.shippingRateCairoGiza}
                    onChange={(e) => setSettings({ ...settings, shippingRateCairoGiza: Number(e.target.value) })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-widest text-primary/40">Shipping: Other Governorates</label>
                <div className="relative group">
                  <Globe strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent-primary transition-colors" />
                  <input 
                    type="number" 
                    value={settings.shippingRateOther}
                    onChange={(e) => setSettings({ ...settings, shippingRateOther: Number(e.target.value) })}
                    className="w-full bg-inverted/[0.02] border border-primary/5 px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-primary/40">Currency</label>
              <select 
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full bg-inverted/[0.02] border border-primary/5 px-6 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EGP">EGP (E£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </section>
        </div>

        {/* Right Column: Toggles & Status */}
        <div className="space-y-12">
          <section className="bg-inverted/[0.02] p-10 border border-primary/5 space-y-10">
            <div className="flex items-center gap-4 mb-4">
              <ShieldCheck strokeWidth={1} className="w-5 h-5 text-accent-primary" />
              <h2 className="text-xs uppercase tracking-widest text-primary/40">System Status</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Enable COD</p>
                <p className="text-[10px] text-primary/40 uppercase tracking-widest">Cash on Delivery</p>
              </div>
              <button 
                type="button"
                onClick={() => setSettings({ ...settings, enableCOD: !settings.enableCOD })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableCOD ? 'bg-accent-primary' : 'bg-inverted/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-primary rounded-full transition-all ${settings.enableCOD ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Maintenance Mode</p>
                <p className="text-[10px] text-primary/40 uppercase tracking-widest">Disable Storefront</p>
              </div>
              <button 
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-inverted/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-primary rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </section>

          <div className="p-10 border border-dashed border-primary/10 text-center">
            <Palette strokeWidth={1} className="w-8 h-8 text-primary/10 mx-auto mb-6" />
            <h3 className="text-xs uppercase tracking-widest text-primary/40 mb-4">Visual Identity</h3>
            <p className="text-sm text-primary/60 font-light leading-relaxed mb-6">
              Theme customization and brand assets are managed in the Atelier Design System.
            </p>
            <button className="text-[10px] uppercase tracking-widest text-accent-primary hover:text-primary transition-colors">
              Open Design System
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
