'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { Plus, Trash2, Upload } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState({ name: '', slug: '', price: 0, category: '', description: '', fitNotes: '', modelUrl: '', variants: [{ size: '', color: '', stock: 0, isActive: true }] });
  const [images, setImages] = useState<File[]>([]);
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setProduct({ ...product, name, slug });
  };

  const addVariant = () => setProduct({...product, variants: [...product.variants, { size: '', color: '', stock: 0, isActive: true }]});
  const removeVariant = (index: number) => setProduct({...product, variants: product.variants.filter((_, i) => i !== index)});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let modelUrl = '';
      if (glbFile) {
        const glbRef = ref(storage, `models/${Date.now()}_${glbFile.name}`);
        await uploadBytes(glbRef, glbFile);
        modelUrl = await getDownloadURL(glbRef);
      }

      const imageUrls = await Promise.all(images.map(async (file) => {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      }));

      await addDoc(collection(db, 'products'), {
        ...product,
        images: imageUrls,
        modelUrl,
        createdAt: serverTimestamp(),
        isArchived: false
      });
      toast.success('Product created.');
      router.push('/admin/products');
    } catch (e) {
      toast.error('Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8 space-y-8 bg-primary text-primary">
      <h1 className="font-serif text-3xl">Add New Product</h1>
      <input type="text" placeholder="Name" value={product.name} onChange={handleNameChange} className="w-full p-4 bg-secondary border border-primary/10" required />
      <input type="text" placeholder="Slug (auto-generated)" value={product.slug} onChange={(e) => setProduct({...product, slug: e.target.value})} className="w-full p-4 bg-secondary border border-primary/10" required />
      <input type="number" placeholder="Price" onChange={(e) => setProduct({...product, price: Number(e.target.value)})} className="w-full p-4 bg-secondary border border-primary/10" required />
      <textarea placeholder="Description" onChange={(e) => setProduct({...product, description: e.target.value})} className="w-full p-4 bg-secondary border border-primary/10" />
      <textarea placeholder="Fit & Model Notes" onChange={(e) => setProduct({...product, fitNotes: e.target.value})} className="w-full p-4 bg-secondary border border-primary/10" />
      
      <div className="space-y-4">
        <h3 className="font-serif text-xl">Variants</h3>
        {product.variants.map((v, i) => (
          <div key={i} className="flex gap-4">
            <input placeholder="Size" onChange={(e) => {
              const variants = [...product.variants];
              variants[i].size = e.target.value;
              setProduct({...product, variants});
            }} className="p-2 bg-secondary border border-primary/10" />
            <input placeholder="Color" onChange={(e) => {
              const variants = [...product.variants];
              variants[i].color = e.target.value;
              setProduct({...product, variants});
            }} className="p-2 bg-secondary border border-primary/10" />
            <input type="number" placeholder="Stock" onChange={(e) => {
              const variants = [...product.variants];
              variants[i].stock = Number(e.target.value);
              setProduct({...product, variants});
            }} className="p-2 bg-secondary border border-primary/10" />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={v.isActive !== false} onChange={(e) => {
                const variants = [...product.variants];
                variants[i].isActive = e.target.checked;
                setProduct({...product, variants});
              }} />
              <span className="text-xs uppercase tracking-widest text-primary/40">Active</span>
            </div>
            <button type="button" onClick={() => removeVariant(i)}><Trash2 strokeWidth={1} size={18} /></button>
          </div>
        ))}
        <button type="button" onClick={addVariant} className="flex items-center gap-2 text-accent-primary"><Plus strokeWidth={1} size={18} /> Add Variant</button>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-xl">3D Model (AR)</h3>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-primary/40">Upload .glb file for Virtual Sanctuary</label>
          <input 
            type="file" 
            accept=".glb" 
            onChange={(e) => setGlbFile(e.target.files?.[0] || null)} 
            className="w-full p-4 bg-secondary border border-primary/10" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-xl">Product Images</h3>
        <input type="file" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} className="w-full p-4 bg-secondary border border-primary/10" />
      </div>
      
      <button type="submit" disabled={loading} className="w-full py-4 bg-accent-primary text-primary font-bold">
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
