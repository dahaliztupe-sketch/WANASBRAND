'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDocs, getDoc } from 'firebase/firestore';
import { Send, Loader2, Bot, X, ShoppingBag, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { db, auth } from '@/lib/firebase/client';
import { useShoppingBagStore } from '@/store/useShoppingBagStore';
import { Product, User, Reservation } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  productRecommendation?: Partial<Product>;
  imageUrl?: string;
  isHandoff?: boolean;
}

interface ConciergeChatProps {
  onClose: () => void;
}

export default function ConciergeChat({ onClose }: ConciergeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<Partial<Product>[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (useEffect hooks remain the same)
  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch User Profile (Style Profile)
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users/' + auth.currentUser!.uid, auth);
      }
    };
    fetchProfile();

    // Fetch Products for recommendations (Optimized: Only fetch basic info for active products, limit to 50)
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('status', '==', 'Published'));
      const snap = await getDocs(q);
      // Only keep essential fields to save token cost and memory
      const optimizedProducts = snap.docs.slice(0, 50).map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          name: data.name, 
          category: data.category, 
          price: data.price,
          images: data.images // keep images for the UI card
        };
      });
      setProducts(optimizedProducts);
    };
    fetchProducts();

    // Listen to chat history
    const qChat = query(
      collection(db, 'concierge_chats'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(qChat, (snapshot) => {
      if (!snapshot.empty) {
        const chatData = snapshot.docs[0].data();
        setMessages(chatData.messages || []);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'concierge_chats', auth);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        import('sonner').then(({ toast }) => toast.error('Image must be less than 5MB'));
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !auth.currentUser) return;

    if (input.length > 500) {
      import('sonner').then(({ toast }) => toast.error('Your message is too long. Please keep it under 500 characters.'));
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      imageUrl: selectedImagePreview || undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
    setSelectedImagePreview(null);
    setIsLoading(true);

    try {
      const reservationsSnapshot = await getDocs(query(collection(db, 'reservations'), where('userId', '==', auth.currentUser.uid)));
      const purchaseHistory = reservationsSnapshot.docs.map(d => {
        const data = d.data() as Reservation;
        return data.items?.map((i) => i.productName).join(', ');
      }).join(', ');

      const styleContext = userProfile?.styleProfile
        ? `User prefers colors: ${userProfile.styleProfile.preferredColors?.join(', ')}. Preferred silhouettes: ${userProfile.styleProfile.preferredSilhouettes?.join(', ')}.`
        : 'No style profile set.';

      const recentHistory = newMessages.slice(-11, -1).map(m => ({
        role: m.role,
        content: m.content,
      }));

      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      if (userMessage.imageUrl) {
        imageMimeType = userMessage.imageUrl.split(';')[0].split(':')[1];
        imageBase64 = userMessage.imageUrl.split(',')[1];
      }

      const res = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          imageBase64,
          imageMimeType,
          history: recentHistory,
          products: products.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price })),
          styleContext,
          purchaseHistory,
        }),
      });

      if (!res.ok) {
        throw new Error('API error');
      }

      const data = await res.json();
      const assistantMessage: Message = { role: 'assistant', content: '', timestamp: new Date().toISOString() };

      if (data.type === 'tool_call') {
        const { toolName, toolArgs } = data;

        if (toolName === 'recommend_product') {
          const recommendedProduct = products.find(p => p.id === toolArgs.productId);
          assistantMessage.content = toolArgs.reason;
          if (recommendedProduct) {
            assistantMessage.productRecommendation = recommendedProduct;
          }
        } else if (toolName === 'human_handoff') {
          assistantMessage.content = 'I understand. I am connecting you with one of our senior style ambassadors who will assist you personally. They will reach out to you shortly.';
          assistantMessage.isHandoff = true;
        } else if (toolName === 'check_inventory') {
          const productDoc = await getDoc(doc(db, 'products', toolArgs.productId));
          if (productDoc.exists()) {
            const productData = productDoc.data() as Product;
            const availableVariants = productData.variants?.filter((v) => v.stock > 0) || [];
            if (availableVariants.length > 0) {
              const sizes = [...new Set(availableVariants.map((v) => v.size))].join(', ');
              const colors = [...new Set(availableVariants.map((v) => v.color))].join(', ');
              assistantMessage.content = `Yes, the ${productData.name} is currently in stock in sizes: ${sizes} and colors: ${colors}. Would you like me to add it to your bag?`;
            } else {
              assistantMessage.content = `I apologize, but the ${productData.name} is currently out of stock. Would you like me to recommend a similar piece?`;
            }
          } else {
            assistantMessage.content = "I'm sorry, I couldn't find that specific piece in our current catalog.";
          }
        } else if (toolName === 'add_to_cart') {
          const productDoc = await getDoc(doc(db, 'products', toolArgs.productId));
          if (productDoc.exists()) {
            const productData = productDoc.data() as Product;
            const variant = productData.variants?.find((v) =>
              v.size.toLowerCase() === toolArgs.size.toLowerCase() &&
              v.color.toLowerCase() === toolArgs.color.toLowerCase()
            );
            if (variant && variant.stock > 0) {
              useShoppingBagStore.getState().addItem({ id: productDoc.id, ...productData }, variant, 1);
              assistantMessage.content = `Excellent choice. I have added the ${productData.name} (Size: ${toolArgs.size}, Color: ${toolArgs.color}) to your shopping bag. Is there anything else I can assist you with?`;
            } else {
              assistantMessage.content = `I apologize, but the ${productData.name} in ${toolArgs.color} size ${toolArgs.size} is currently unavailable.`;
            }
          } else {
            assistantMessage.content = "I'm sorry, I couldn't find that specific piece to add to your bag.";
          }
        }
      } else {
        assistantMessage.content = data.text || '';
      }

      setMessages([...newMessages, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      import('sonner').then(({ toast }) => toast.error('The concierge is currently unavailable. Please try again later.'));
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm p-4">
      <div className="bg-secondary w-full max-w-lg h-[600px] flex flex-col rounded-sm border border-primary/10 shadow-xl relative overflow-hidden">
        <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-secondary z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <Bot size={16} className="text-accent-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-primary leading-none">WANAS Concierge</h2>
              <p className="text-[10px] uppercase tracking-widest text-primary/40 mt-1">AI Styling Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="text-primary/40 hover:text-primary transition-colors"><X strokeWidth={1} size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-inverted/5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                  <Bot size={14} className="text-accent-primary" />
                </div>
              )}
              
              <div className={`flex flex-col gap-3 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-inverted' : msg.isHandoff ? 'bg-accent-primary/10 border border-accent-primary/20 text-primary' : 'bg-secondary border border-primary/10 text-primary'}`}>
                  <div className="markdown-body prose prose-sm prose-stone dark:prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]} skipHtml={true}>
                      {msg.content}
                    </Markdown>
                  </div>
                  {msg.imageUrl && (
                    <div className="mt-3 relative w-48 h-48 rounded-sm overflow-hidden">
                      <Image src={msg.imageUrl} alt="Uploaded" fill className="object-cover" />
                    </div>
                  )}
                </div>
                
                {/* Rich UI Product Card */}
                {msg.productRecommendation && (
                  <div className="w-64 bg-secondary border border-primary/10 overflow-hidden group">
                    <div className="relative h-80 bg-primary/5">
                      {msg.productRecommendation.images?.[0] && (
                        <Image 
                          src={msg.productRecommendation.images[0]} 
                          alt={msg.productRecommendation.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-serif text-primary truncate">{msg.productRecommendation.name}</h3>
                      <p className="text-xs text-primary/60">EGP {msg.productRecommendation.price.toLocaleString()}</p>
                      <Link 
                        href={`/product/${msg.productRecommendation.id}`}
                        onClick={onClose}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-primary/5 text-primary text-[10px] uppercase tracking-widest hover:bg-accent-primary hover:text-inverted transition-colors"
                      >
                        <ShoppingBag size={12} /> View Piece
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex-shrink-0 flex items-center justify-center">
                <Loader2 size={14} className="text-accent-primary animate-spin" />
              </div>
              <div className="p-4 rounded-sm bg-secondary border border-primary/10 text-primary/40 text-sm italic">
                Curating selections...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedImagePreview && (
          <div className="px-4 py-2 bg-secondary border-t border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-sm overflow-hidden border border-primary/20">
                <Image src={selectedImagePreview} alt="Preview" fill className="object-cover" />
              </div>
              <span className="text-xs text-primary/60">Image attached</span>
            </div>
            <button onClick={() => { setSelectedImage(null); setSelectedImagePreview(null); }} className="text-primary/40 hover:text-primary">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-4 bg-secondary border-t border-primary/10">
          <div className="relative flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-primary/40 hover:text-accent-primary transition-colors border border-transparent hover:border-primary/10 rounded-sm bg-primary/5"
              title="Upload an image for style matching"
            >
              <ImagePlus size={18} strokeWidth={1.5} />
            </button>
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                maxLength={500}
                className="w-full bg-primary/5 border border-primary/10 py-3 ps-4 pe-12 rounded-sm text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent-primary/50 transition-colors"
                placeholder="Ask for styling advice or upload an image..."
                disabled={isLoading}
              />
              <button 
                onClick={handleSend} 
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="absolute end-2 top-1/2 -translate-y-1/2 p-2 text-primary/40 hover:text-accent-primary disabled:opacity-50 transition-colors"
              >
                <Send size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
