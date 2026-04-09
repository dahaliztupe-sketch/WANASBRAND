'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Product, ProductVariant } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Archive, Package, AlertCircle, Eye, EyeOff, MoreHorizontal, CheckSquare, Square, Trash2, ChevronDown } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firebase/errors';
import { toast } from 'sonner';

import { ref, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to permanently delete "${product.name}"? This will also delete all associated images from storage.`)) return;
    
    setIsDeleting(product.id);
    try {
      // 1. Delete images from Firebase Storage
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map(async (url) => {
          if (url.includes('firebasestorage.googleapis.com')) {
            try {
              const imageRef = ref(storage, url);
              await deleteObject(imageRef);
            } catch (err) {
              console.error('Failed to delete image:', url, err);
            }
          }
        });
        await Promise.all(deletePromises);
      }

      // 2. Delete document from Firestore
      const response = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id }),
      });

      if (!response.ok) throw new Error('Failed to delete product document');

      toast.success('Product and associated assets deleted.');
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      console.error('Deletion error:', error);
      toast.error('Failed to delete product.');
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('name'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        setProducts(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleArchive = async (product: Product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        isArchived: !product.isArchived,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Product ${product.isArchived ? 'restored' : 'archived'}.`);
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id ? { ...p, isArchived: !p.isArchived } : p
        )
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
      toast.error('Failed to update product status.');
    }
  };

  const handleBulkAction = async (action: 'archive' | 'publish' | 'price', value?: number) => {
    if (selectedIds.length === 0) return;

    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      selectedIds.forEach(id => {
        const ref = doc(db, 'products', id);
        if (action === 'archive') {
          batch.update(ref, { status: 'Archived', updatedAt: now });
        } else if (action === 'publish') {
          batch.update(ref, { status: 'Published', updatedAt: now });
        } else if (action === 'price' && value !== undefined) {
          const product = products.find(p => p.id === id);
          if (product) {
            const newPrice = Math.round(product.price * (1 + value / 100));
            batch.update(ref, { price: newPrice, updatedAt: now });
          }
        }
      });

      await batch.commit();
      toast.success(`Bulk ${action} completed for ${selectedIds.length} items.`);
      
      // Refresh products list
      const q = query(collection(db, 'products'), orderBy('name'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      setProducts(data);
      
      setSelectedIds([]);
      setIsBulkMenuOpen(false);
    } catch (error) {
      toast.error('Bulk action failed.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getTotalStock = (variants: ProductVariant[]) => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  const getLowStockVariant = (variants: ProductVariant[]) => {
    return variants.find(v => v.stock < 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-serif text-2xl text-primary">The Collection</h1>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search strokeWidth={1} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
            <input 
              type="text" 
              placeholder="Search collection..." 
              className="w-full pl-10 pr-4 py-2 border border-primary/30 bg-primary focus:outline-none focus:border-primary/50 text-sm"
            />
          </div>
          
          <Link 
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-inverted text-inverted hover:bg-inverted/90 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Plus strokeWidth={1} size={18} />
            Add to Collection
          </Link>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary p-4 border border-primary/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-primary/60 uppercase tracking-widest">
              {selectedIds.length} Selected
            </span>
            <div className="h-4 w-px bg-secondary/30" />
            <div className="relative">
              <button 
                onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-accent-primary transition-colors uppercase tracking-widest"
              >
                Bulk Actions <ChevronDown strokeWidth={1} size={14} />
              </button>
              
              {isBulkMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-primary border border-primary/30 shadow-xl z-50 py-2">
                  <button 
                    onClick={() => handleBulkAction('publish')}
                    className="w-full text-left px-4 py-2 text-xs text-primary hover:bg-primary transition-colors uppercase tracking-widest"
                  >
                    Publish Selected
                  </button>
                  <button 
                    onClick={() => handleBulkAction('archive')}
                    className="w-full text-left px-4 py-2 text-xs text-primary hover:bg-primary transition-colors uppercase tracking-widest"
                  >
                    Archive Selected
                  </button>
                  <button 
                    onClick={() => {
                      const percentage = prompt('Enter percentage change (e.g. 10 or -10):');
                      if (percentage) handleBulkAction('price', parseFloat(percentage));
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-primary hover:bg-primary transition-colors uppercase tracking-widest"
                  >
                    Update Price (%)
                  </button>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setSelectedIds([])}
            className="text-xs text-primary/40 hover:text-primary transition-colors uppercase tracking-widest"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="bg-primary border border-primary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/50 border-b border-primary/30">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-primary/40 hover:text-primary transition-colors">
                    {selectedIds.length === products.length && products.length > 0 ? <CheckSquare strokeWidth={1} size={18} /> : <Square strokeWidth={1} size={18} />}
                  </button>
                </th>
                <th className="p-4 text-xs uppercase tracking-wider text-primary/60 font-medium w-20">Image</th>
                <th className="p-4 text-xs uppercase tracking-wider text-primary/60 font-medium">Product Details</th>
                <th className="p-4 text-xs uppercase tracking-wider text-primary/60 font-medium">Category</th>
                <th className="p-4 text-xs uppercase tracking-wider text-primary/60 font-medium">Price</th>
                <th className="p-4 text-xs uppercase tracking-wider text-primary/60 font-medium">Stock</th>
                <th className="p-4 text-xs uppercase tracking-wider text-primary/60 font-medium">Status</th>
                <th className="p-4 text-xs uppercase tracking-wider text-primary/60 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-primary/50 text-sm animate-pulse">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-primary/50 text-sm">
                    No products found. Click &quot;Add Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = getTotalStock(product.variants);
                  const lowStockVariant = getLowStockVariant(product.variants);
                  const isSelected = selectedIds.includes(product.id);
                  
                  return (
                    <tr key={product.id} className={`border-b border-primary/10 hover:bg-primary/30 transition-colors group ${isSelected ? 'bg-primary/50' : ''}`}>
                      <td className="p-4">
                        <button onClick={() => toggleSelect(product.id)} className={`${isSelected ? 'text-accent-primary' : 'text-primary/20'} hover:text-accent-primary transition-colors`}>
                          {isSelected ? <CheckSquare strokeWidth={1} size={18} /> : <Square strokeWidth={1} size={18} />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="relative w-12 h-16 bg-secondary/20 rounded-sm overflow-hidden">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/20">
                              <Package strokeWidth={1} size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-serif text-primary">{product.name}</div>
                        <div className="text-xs text-primary/50 mt-1 font-mono">{product.id}</div>
                      </td>
                      <td className="p-4 text-sm text-primary/70 capitalize">{product.category}</td>
                      <td className="p-4 text-sm text-primary font-medium">EGP {product.price.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${totalStock === 0 ? 'text-red-500' : 'text-primary'}`}>
                              {totalStock} Total
                            </span>
                          </div>
                          {lowStockVariant && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider ${lowStockVariant.stock < 2 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#8B4513]/5 text-[#8B4513]'}`}>
                              {lowStockVariant.stock < 2 ? 'Critical Stock' : 'Low Stock'}: {lowStockVariant.stock} left
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-primary/40 mt-1">{product.variants.length} variants</div>
                      </td>
                      <td className="p-4">
                        {product.isArchived ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-secondary text-primary rounded-full border border-primary/20 uppercase tracking-wider">
                            <Archive strokeWidth={1} size={10} /> Archived
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-green-50 text-green-700 rounded-full border border-green-200 uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-primary/60 hover:text-primary hover:bg-inverted/5 rounded transition-colors"
                            title="Edit Product"
                          >
                            <MoreHorizontal strokeWidth={1} size={18} />
                          </Link>
                          <button 
                            onClick={() => toggleArchive(product)}
                            className={`p-2 rounded transition-colors ${product.isArchived ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                            title={product.isArchived ? 'Restore Product' : 'Archive Product'}
                          >
                            {product.isArchived ? <Eye strokeWidth={1} size={18} /> : <EyeOff strokeWidth={1} size={18} />}
                          </button>
                          <button 
                            onClick={() => deleteProduct(product)}
                            disabled={isDeleting === product.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete Permanently"
                          >
                            <Trash2 strokeWidth={1} size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
