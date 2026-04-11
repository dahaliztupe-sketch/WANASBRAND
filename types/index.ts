export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  uid: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'admin';
  tier?: 'Guest' | 'Member' | 'InnerCircle';
  savedAddresses?: Address[];
  isVIP?: boolean;
  totalSpent?: number;
  orderCount?: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  tourStatus?: 'pending' | 'completed' | 'skipped';
}

export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
  isActive?: boolean;
}

export interface FabricInfo {
  composition: string;
  softness: number; // 0-100
  breathability: number; // 0-100
  warmth: number; // 0-100
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // EGP
  category: string;
  images: string[];
  blurDataURL?: string;
  variants: ProductVariant[];
  status: 'Draft' | 'Published' | 'Archived';
  isArchived: boolean;
  fitNotes?: string;
  embedding?: number[];
  fabricInfo?: FabricInfo;
  glbModelUrl?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface ReservationItem {
  productId: string;
  productName: string;
  variant: ProductVariant;
  quantity: number;
  priceAtPurchase: number;
  image: string; // Keeping image for UI convenience
  holdExpiresAt?: string; // ISO string
  recommendedByAI?: boolean;
}

export interface Reservation {
  id: string;
  orderNumber: string; // Sequential
  reservationNumber: string; // Mandatory
  customerInfo: {
    fullName: string;
    phone: string; // MUST BE ENCRYPTED
    address?: string; // MUST BE ENCRYPTED
    city?: string;
    contactMethod: "whatsapp" | "phone";
    vibe: "styling" | "sizing";
    consent: boolean;
    email?: string;
  };
  items: ReservationItem[];
  totalAmount: number;
  financials: {
    subtotal: number;
    vat: number;
    total: number;
    shippingFee: number;
  };
  status: 'pending_contact' | 'contacted' | 'deposit_paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  userId: string;
  createdAt: string;
  magicLinkToken?: string;
  trackingNumber?: string;
  shippingProvider?: string;
  conciergeNotes?: string;
  holdExpiresAt?: string; // ISO string
  giftingDetails?: {
    isGift: boolean;
    recipientName?: string;
    handwrittenNote?: string;
    giftNote?: string;
  };
  emailDeliveryStatus?: 'pending' | 'sent' | 'failed';
}

export interface Log {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId?: string;
  targetType: 'product' | 'reservation' | 'user' | 'system';
  oldValue?: any;
  newValue?: any;
  createdAt: string;
}
