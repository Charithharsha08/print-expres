export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: any;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface PrintSpec {
  paperSize: string;   // e.g. 'A4', 'A3', 'Letter'
  color: boolean;      // true = color, false = B&W
  copies: number;
  doubleSided: boolean;
  binding?: string;    // e.g. 'none', 'spiral', 'staple'
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  designFileUrl?: string;
  printSpec: PrintSpec;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  status: OrderStatus;
  totalPrice: number;
  notes?: string;
  paymentMethod?: 'payhere' | 'cod' | 'pay_at_store';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cash_on_delivery';
  createdAt: any;
  updatedAt: any;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  available: boolean;
  createdAt: any;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validUntil: any;
  active: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order_confirmation' | 'order_update' | 'promotion';
  read: boolean;
  createdAt: any;
}
