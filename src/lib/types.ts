export type AppRole = 'admin' | 'manager' | 'employee' | 'customer';

export type OrderStatus = 'new' | 'contacted' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type NoteType = 'top' | 'heart' | 'base';

export interface Profile {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_path?: string | null;
  alt_text?: string | null;
  display_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string; // e.g. "50ml", "100ml", "150ml"
  sku?: string | null;
  price: number;
  sale_price?: number | null;
  stock_quantity: number;
  is_active: boolean;
}

export interface PerfumeNote {
  id: string;
  product_id: string;
  note_type: NoteType;
  name: string;
  image_url?: string | null;
  display_order: number;
}

export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  category_id?: string | null;
  price: number;
  sale_price?: number | null;
  sku?: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_active: boolean;
  average_rating: number;
  total_reviews: number;
  created_at?: string;
  updated_at?: string;
  category?: Category | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  perfume_notes?: PerfumeNote[];
}

export interface CartItem {
  id?: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number; // effective unit price
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string;
  area?: string | null;
  address: string;
  notes?: string | null;
  is_default: boolean;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface BankAccount {
  id: string;
  bank_name?: string;
  bank_name_ar?: string;
  bank_name_en?: string;
  account_holder?: string;
  account_name?: string;
  account_number: string;
  iban: string;
  bank_icon?: string; // e.g. "muscat" | "dhofar" | "nizwa" | "nbo" | "sohar" | custom URL
  bank_logo_url?: string;
  is_active: boolean;
  display_order?: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  city: string;
  area?: string | null;
  address: string;
  notes?: string | null;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  coupon_code?: string | null;
  status: OrderStatus;
  whatsapp_sent: boolean;
  created_at: string;
  order_items?: OrderItem[];
  // Location & Transfer proof
  latitude?: number | null;
  longitude?: number | null;
  location_url?: string | null;
  transfer_reference_number?: string | null;
  receipt_image_url?: string | null;
  selected_bank_account_id?: string | null;
  selected_bank_name?: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title_ar?: string | null;
  title_en?: string | null;
  subtitle?: string | null;
  image_url: string;
  button_text?: string | null;
  button_link?: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string | null;
  user_name?: string | null;
  rating: number;
  comment?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  product?: {
    name_ar: string;
    name_en: string;
  };
}

export interface StoreSettings {
  store_name: { ar: string; en: string };
  whatsapp: { number: string };
  phone: { number: string };
  email: { email: string };
  currency: { code: string; symbol: string };
  shipping: { default: number; free_shipping_threshold: number };
  seo: { title: string; description: string };
  logo?: {
    logo_url: string;
    light_logo_url?: string;
  };
  hero_section?: {
    image_url?: string;
    badge_text?: string;
    headline_line1?: string;
    headline_line2?: string;
    description?: string;
    card_title?: string;
    card_subtitle?: string;
    card_origin?: string;
    card_footer_text?: string;
  };
  bank_accounts?: BankAccount[];
  announcement_bar?: {
    enabled: boolean;
    text: string;
    link?: string;
    bg_color?: string;
    text_color?: string;
  };
}
