export type ProductCategory = 
  | 'picture_frames'
  | 'canvas_frames'
  | 'custom_chains'
  | 'phone_cases';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in Ghana Cedis (GHS)
  stock: number;
  inStock: boolean;
  size?: string;
  withRing?: boolean;
  description: string;
  image: string;
  badge?: string;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  withRing?: boolean;
  customDetails?: {
    phoneModel?: string;
    chainText?: string;
    photoNote?: string;
  };
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'production'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  customNote?: string;
}

export interface Order {
  id: string; // e.g. NF-7824
  customerName: string;
  customerPhone: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  customerNotes?: string;
  timeline: OrderTimelineItem[];
}

export interface StoreSettings {
  brandName: string;
  contactNumber: string;
  whatsappNumber: string;
  location: string;
  adminPin: string;
}
