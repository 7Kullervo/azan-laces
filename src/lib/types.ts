export type UnitCode = string;

export interface Unit {
  code: UnitCode; // e.g. "yard"
  label: string; // e.g. "Yard"
  label_plural: string; // e.g. "Yards"
  allow_decimal: boolean; // yard-type units can use 0.5 steps
  default_step: number; // 1 or 0.5
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  parent_id: string | null;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  url: string;
  sort_order: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  unit_code: UnitCode;
  unit: Unit;
  step: number; // quantity increment for this product
  min_qty: number;
  stock: number;
  low_stock_threshold: number;
  category_id: string | null;
  subcategory_id: string | null;
  category?: { slug: string; name: string } | null;
  subcategory?: { slug: string; name: string } | null;
  colour: string | null;
  material: string | null;
  specs: ProductSpec[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  sales_count: number;
  created_at: string;
  images: ProductImage[];
}

export interface CartLine {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  image: string | null;
  unitPrice: number; // effective price per unit at time of adding
  unitCode: UnitCode;
  unitLabel: string;
  unitLabelPlural: string;
  step: number;
  minQty: number;
  allowDecimal: boolean;
  qty: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
