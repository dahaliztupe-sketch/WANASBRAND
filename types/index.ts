export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
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
  modelUrl?: string;
  createdAt: string | { seconds: number; nanoseconds: number };
  updatedAt: string | { seconds: number; nanoseconds: number };
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
  status: 'pending_contact' | 'contacted' | 'deposit_paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';
  userId: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
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

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  version?: number;
  items: ReservationItem[];
  customerInfo: Reservation['customerInfo'];
}

export interface Log {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId?: string;
  targetType: 'product' | 'reservation' | 'user' | 'system';
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

export interface About {
  est: string;
  titleLine1: string;
  titleLine2: string;
  founder?: string;
  story?: string;
  philosophy: {
    number: string;
    titleLine1: string;
    titleLine2: string;
    p1: string;
    p2: string;
  };
  craftsmanship: {
    number: string;
    titleLine1: string;
    titleLine2: string;
    p1: string;
  };
  experience: {
    number: string;
    titleLine1: string;
    titleLine2: string;
    p1: string;
  };
}

export interface OrderDetailsTranslations {
  notFound: string;
  backToCollection: string;
  order: string;
  acquiredOn: string;
  viewCertificate: string;
  acquiredPieces: string;
  size: string;
  color: string;
  quantity: string;
  financialSummary: string;
  subtotal: string;
  vat: string;
  shipping: string;
  total: string;
  deliveryDetails: string;
  certificate: {
    title: string;
    atelier: string;
    description: string;
    orderId: string;
    issueDate: string;
    material: string;
    materialValue: string;
    status: string;
    statusValue: string;
    authenticatedBy: string;
    print: string;
  };
}

export interface AuthTranslations {
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  forgotPassword: string;
  resetPassword: string;
  continueWithGoogle: string;
  welcomeWanasToast: string;
  googleFailToast: string;
  signOutSuccess: string;
  sessionExpired: string;
  // Keys used in app/auth/page.tsx
  welcomeBack: string;
  joinWanas: string;
  signInDesc: string;
  signUpDesc: string;
  emailAddress: string;
  createAccount: string;
  orContinueWith: string;
  google: string;
  phone: string;
  noAccount: string;
  alreadyMember: string;
  welcomeBackToast: string;
  authFailToast: string;
  digitalAtelier: string;
}

export interface Translations {
  nav: Record<string, unknown>;
  common: Record<string, unknown>;
  home: Record<string, unknown>;
  collections: Record<string, unknown>;
  product: Record<string, unknown>;
  about: About;
  contact: Record<string, unknown>;
  account: Record<string, unknown>;
  ordersList: Record<string, unknown>;
  orderDetails: OrderDetailsTranslations;
  auth: AuthTranslations;
  reserve: Record<string, unknown>;
  reserveSuccess: Record<string, unknown>;
  faq: Record<string, unknown>;
  lookbook: Record<string, unknown>;
  privacy: Record<string, unknown>;
  returns: Record<string, unknown>;
  shippingReturns: Record<string, unknown>;
  sizeGuide: Record<string, unknown>;
  waitlistModal: Record<string, unknown>;
  conciergeModal: Record<string, unknown>;
  pushNotificationModal: Record<string, unknown>;
  styleProfileQuiz: Record<string, unknown>;
  selectionBag: Record<string, unknown>;
  cookieBanner: Record<string, unknown>;
  emptyStates: Record<string, unknown>;
  digitalCertificate: Record<string, unknown>;
  conciergeChat: Record<string, unknown>;
  admin: Record<string, unknown>;
}
