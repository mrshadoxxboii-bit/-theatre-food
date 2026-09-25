export type ProductCategory = 'Popcorn' | 'Combos' | 'Beverages' | 'Snacks' | string;

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  isVeg?: boolean;
  calories?: string;
  badge?: string;
}

// Product is an alias of MenuItem for backwards-compatibility
export type Product = MenuItem;

export interface CartItem {
  product: MenuItem;
  quantity: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Preparing'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'demo_paid' | 'paid' | 'pending' | 'failed';

export interface CustomerDetails {
  name: string;
  phone: string;
}

export interface OrderItemRecord {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  isVeg?: boolean;
}

export interface Order {
  orderId: string;
  customerName?: string;
  phoneNumber?: string;
  customerDetails?: CustomerDetails;
  seatNumber: string;
  screenNumber: string;
  theatreName: string;
  items: OrderItemRecord[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  total?: number; // alias for totalAmount
  status?: OrderStatus; // alias for orderStatus
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string; // ISO string
  customerNotes?: string;
}

export function normalizeOrderStatus(raw: string | undefined): OrderStatus {
  if (!raw) return 'Pending';
  const lower = raw.toLowerCase().trim();
  if (lower === 'new' || lower === 'pending') return 'Pending';
  if (lower === 'preparing') return 'Preparing';
  if (lower === 'ready') return 'Ready';
  if (lower === 'delivered') return 'Delivered';
  if (lower === 'cancelled' || lower === 'canceled') return 'Cancelled';
  return 'Pending';
}
