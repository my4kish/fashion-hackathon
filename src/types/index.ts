export type UserRole = 'customer' | 'franchisee' | 'production';

export type OrderStatus = 'new' | 'confirmed' | 'sewing' | 'ready' | 'cancelled';

export type ProductType = 'in_stock' | 'preorder';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar_initials: string;
  franchise_name?: string;
  franchise_location?: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  price: number;
  type: ProductType;
  image_url: string;
  category: string;
  description: string;
  sizes: string[];
  is_active: boolean;
  franchise_id?: string;
  production_id?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  size: string;
  price_snapshot: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  franchisee_id?: string;
  production_id?: string;
  status: OrderStatus;
  total_amount: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  customer?: { full_name: string; phone: string; email?: string };
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  size: string;
  due_date?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'НОВЫЙ',
  confirmed: 'ОФОРМЛЕН',
  sewing: 'ПОШИВ',
  ready: 'ГОТОВ',
  cancelled: 'ОТМЕНЕН',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: '#3B82F6',
  confirmed: '#8B5CF6',
  sewing: '#F59E0B',
  ready: '#22C55E',
  cancelled: '#E53935',
};
