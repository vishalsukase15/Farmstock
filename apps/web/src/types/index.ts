export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  preferredLang: string;
  state?: string;
  district?: string;
  taluka?: string;
  villageOrCity?: string;
  pincode?: string;
  isPhonePublic: boolean;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'FARMER' | 'ADMIN';
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  profile?: UserProfile;
  counts?: {
    products: number;
    purchaseRequestsSent: number;
    purchaseRequestsReceived: number;
    rentalRequestsSent: number;
    rentalRequestsReceived: number;
    cartItems: number;
    wishlist: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductSpecification {
  id: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  ownerId: string;
  categoryId: string;
  name: string;
  brand: string;
  model?: string;
  modelYear?: number;
  description: string;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  transactionType: 'SALE' | 'RENT' | 'BOTH';

  salePrice?: number;
  isNegotiable: boolean;
  rentalHourlyRate?: number;
  rentalDailyRate?: number;
  rentalWeeklyRate?: number;
  rentalMonthlyRate?: number;
  securityDeposit?: number;
  rentalTerms?: string;

  usageHours?: number;
  horsepower?: number;
  fuelType?: string;

  state: string;
  district: string;
  taluka?: string;
  villageOrCity: string;
  pincode?: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD' | 'UNAVAILABLE';
  viewCount: number;
  createdAt: string;
  updatedAt: string;

  category: Category;
  images: ProductImage[];
  specifications?: ProductSpecification[];
  owner: {
    id: string;
    phone?: string;
    email?: string;
    isVerified: boolean;
    createdAt?: string;
    profile?: UserProfile;
    _count?: {
      products: number;
      reviewsReceived: number;
    };
  };
  reviews?: Review[];
}

export interface PurchaseRequest {
  id: string;
  productId: string;
  buyerId: string;
  ownerId: string;
  quantity: number;
  offeredPrice: number;
  message?: string;
  preferredContact: 'CHAT' | 'PHONE';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  product: Product;
  buyer?: { id: string; phone?: string; profile?: UserProfile };
  owner?: { id: string; phone?: string; profile?: UserProfile };
}

export interface RentalRequest {
  id: string;
  productId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  pricingUnit: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  estimatedAmount: number;
  securityDeposit: number;
  intendedUse?: string;
  deliveryPreference: 'PICKUP' | 'DELIVERY';
  message?: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  product: Product;
  renter?: { id: string; phone?: string; profile?: UserProfile };
  owner?: { id: string; phone?: string; profile?: UserProfile };
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product: Product;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string };
  };
}

export interface Conversation {
  id: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
    salePrice?: number;
    rentalDailyRate?: number;
    images?: ProductImage[];
  };
  participant?: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string };
  };
  lastMessage?: Message;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'REQUEST' | 'CHAT' | 'MODERATION' | 'SYSTEM';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  authorId: string;
  targetUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
  author?: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string };
  };
}
