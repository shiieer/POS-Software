export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderItemCreate {
  menu_item_id: number;
  quantity: number;
  notes?: string | null;
}

export type PaymentMethod = "cash" | "qris";

export interface OrderCreate {
  table_id: number | null;
  customer_name?: string | null;
  payment_method?: PaymentMethod;
  notes?: string | null;
  items: OrderItemCreate[];
}

export interface OrderItemOut {
  id: number;
  menu_item_id: number;
  menu_item_name: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
}

export interface OrderOut {
  id: number;
  table_id: number | null;
  table_name: string | null;
  customer_name: string | null;
  status: string;
  is_paid: boolean;
  payment_method: string | null;
  notes: string | null;
  total_amount: number;
  payment_proof_url: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItemOut[];
}
