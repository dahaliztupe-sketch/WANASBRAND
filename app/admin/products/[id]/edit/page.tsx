'use client';

import { useState, useEffect, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ArrowLeft, Plus, Trash2, Save, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { db, storage } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/errors';
import { Product, ProductVariant } from '@/types';

async function generateBlurDataURL(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = 10;
      const height = Math.floor((img.height / img.width) * width);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => {
      resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    };
    img.src = imageUrl;
  });
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    category: 'loungewear',
    description: '',
    fitNotes: '',
    status: 'Draft' as 'Draft' | 'Published' | 'Archived',
    modelUrl: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [glbFile, setGlbFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setFormData({
            name: data.name,
            slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            price: data.price.toString(),
            category: data.category,
            description: data.description,
            fitNotes: data.fitNotes || '',
            status: data.status || (data.isArchived ? 'Archived' : 'Published'),
            modelUrl: data.modelUrl || '',
          });
          setImages(data.images || []);
          setVariants(data.variants || []);
        } else {
          toast.error('Product not found');
          router.push('/admin/products');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${id}`);
        toast.error('Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, name: value, slug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number | boolean) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { sku: '', size: 'L', color: 'Pearl', stock: 0, isActive: true }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        newImages.push(downloadURL);
      }
      setImages(newImages);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const urlToRemove = images[index];
    if (urlToRemove && urlToRemove.includes('firebasestorage.googleapis.com')) {
      setToDelete(prev => [...prev, urlToRemove]);
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Delete orphaned images from storage
      if (toDelete.length > 0) {
        const deletePromises = toDelete.map(async (url) => {
          try {
            const imageRef = ref(storage, url);
            await deleteObject(imageRef);
          } catch (err) {
            console.error('Failed to delete orphaned image:', url, err);
          }
        });
        await Promise.all(deletePromises);
      }

      const finalVariants = variants.map((v) => ({
        ...v,
        sku: v.sku || `${id}-${v.size}-${v.color}`.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
        stock: Number(v.stock)
      }));

      let blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const mainImageUrl = images.length > 0 ? images[0] : `https://images.unsplash.com/photo-1594913785162-e6786b42dea3?q=80&w=800&auto=format&fit=crop`;
      
      let finalModelUrl = formData.modelUrl;
      if (glbFile) {
        const glbRef = ref(storage, `models/${Date.now()}_${glbFile.name}`);
        await uploadBytes(glbRef, glbFile);
        finalModelUrl = await getDownloadURL(glbRef);
      }

      try {
        blurDataURL = await generateBlurDataURL(mainImageUrl);
      } catch (err) {
        console.error('Failed to generate blurDataURL:', err);
      }

      const updates: Partial<Product> = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        fitNotes: formData.fitNotes,
        price: Number(formData.price),
        category: formData.category,
        images: images.length > 0 ? images : [mainImageUrl],
        blurDataURL,
        variants: finalVariants,
        status: formData.status as 'Draft' | 'Published' | 'Archived',
        isArchived: formData.status === 'Archived',
        modelUrl: finalModelUrl,
      };

      const response = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      setErrorToast('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-primary/50 animate-pulse">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {errorToast && (
        <div className="fixed bottom-8 right-8 bg-secondary text-primary px-6 py-4 shadow-lg flex items-center gap-4 z-50 border border-primary/10 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm tracking-widest uppercase">{errorToast}</span>
          <button type="button" onClick={() => setErrorToast(null)} className="text-primary/50 hover:text-primary transition-colors text-xl leading-none">&times;</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-inverted/5 rounded-full transition-colors">
            <ArrowLeft strokeWidth={1} size={20} className="text-primary" />
          </Link>
          <h1 className="font-serif text-3xl text-primary">Edit Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-primary p-8 border border-primary/30 shadow-sm">
          <h2 className="font-serif text-xl text-primary mb-6 border-b border-primary/30 pb-4">Basic Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-xs uppercase tracking-wider text-primary/70 mb-2">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary transition-colors font-serif text-lg"
                  placeholder="e.g. The Silk Robe"
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-xs uppercase tracking-wider text-primary/70 mb-2">Slug (Auto-generated) *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                  placeholder="e.g. the-silk-robe"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="price" className="block text-xs uppercase tracking-wider text-primary/70 mb-2">Price (EGP) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary transition-colors"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-xs uppercase tracking-wider text-primary/70 mb-2">Category *</label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary transition-colors capitalize"
                  >
                    <option value="dresses">Dresses</option>
                    <option value="couture">Couture</option>
                    <option value="accessories">Accessories</option>
                    <option value="bridal">Bridal</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-xs uppercase tracking-wider text-primary/70 mb-2">Status *</label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border-b border-primary/20 py-2 bg-transparent focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs uppercase tracking-wider text-primary/70 mb-2">Description *</label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-primary/20 p-4 bg-transparent focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"
                placeholder="Describe the product, materials, and fit..."
              />
            </div>

            <div>
              <label htmlFor="fitNotes" className="block text-xs uppercase tracking-wider text-primary/70 mb-2">Fit & Model Notes</label>
              <textarea
                id="fitNotes"
                name="fitNotes"
                rows={3}
                value={formData.fitNotes}
                onChange={handleChange}
                className="w-full border border-primary/20 p-4 bg-transparent focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"
                placeholder="e.g. Model is 175cm wearing size S. Fits true to size."
              />
            </div>
          </div>
        </div>

        {/* Image Upload Zone */}
        <div className="bg-primary p-8 border border-primary/30 shadow-sm">
          <h2 className="font-serif text-xl text-primary mb-6 border-b border-primary/30 pb-4">3D Model (AR Virtual Sanctuary)</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-primary/40">Current Model URL</label>
              <input 
                type="text" 
                readOnly 
                value={formData.modelUrl || 'No model uploaded'} 
                className="w-full p-2 bg-secondary/50 border border-primary/10 text-[10px] font-mono text-primary/60"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-primary/40">Upload New .glb Model</label>
              <input 
                type="file" 
                accept=".glb" 
                onChange={(e) => setGlbFile(e.target.files?.[0] || null)} 
                className="w-full p-4 bg-secondary border border-primary/10" 
              />
            </div>
          </div>
        </div>

        {/* Image Upload Zone */}
        <div className="bg-primary p-8 border border-primary/30 shadow-sm">
          <h2 className="font-serif text-xl text-primary mb-6 border-b border-primary/30 pb-4">Product Images</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-primary/20 border-dashed rounded-lg cursor-pointer bg-primary/50 hover:bg-primary transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Plus strokeWidth={1} className="w-8 h-8 mb-4 text-primary/40" />
                  <p className="mb-2 text-sm text-primary/60"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-primary/40">PNG, JPG or WEBP (MAX. 2MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>
            
            {isUploading && <div className="text-sm text-primary/60 animate-pulse">Uploading images...</div>}
            
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square border border-primary/10 rounded overflow-hidden group">
                    <Image 
                      src={url} 
                      alt={`Preview ${idx}`} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-primary/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X strokeWidth={1} size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-primary p-8 border border-primary/30 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-primary/30 pb-4">
            <h2 className="font-serif text-xl text-primary">Variants & Inventory</h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary px-3 py-1.5 border border-primary/20 hover:bg-inverted/5 transition-colors"
            >
              <Plus strokeWidth={1} size={14} /> Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="flex items-end gap-4 p-4 bg-primary/50 border border-primary/30 relative group">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-primary/50 mb-1">Size</label>
                    <select
                      required
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      className="w-full border-b border-primary/20 py-1 bg-transparent focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="OS">One Size</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-primary/50 mb-1">Color</label>
                    <input
                      type="text"
                      required
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      className="w-full border-b border-primary/20 py-1 bg-transparent focus:outline-none focus:border-primary text-sm"
                      placeholder="Pearl, Onyx..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-primary/50 mb-1">Stock Qty</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                      className="w-full border-b border-primary/20 py-1 bg-transparent focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-primary/50 mb-1">SKU (Auto-generated)</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      className="w-full border-b border-primary/10 py-1 bg-transparent focus:outline-none text-sm text-primary/50 font-mono"
                      placeholder="Leave blank"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id={`active-${index}`}
                      checked={variant.isActive !== false}
                      onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                      className="accent-charcoal-dark"
                    />
                    <label htmlFor={`active-${index}`} className="text-[10px] uppercase tracking-wider text-primary/50">Active</label>
                  </div>
                </div>
                
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded"
                    title="Remove Variant"
                  >
                    <Trash2 strokeWidth={1} size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-primary/20 text-primary hover:bg-inverted/5 transition-colors text-sm tracking-widest uppercase"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-inverted text-inverted hover:bg-inverted/90 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
          >
            <Save strokeWidth={1} size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
