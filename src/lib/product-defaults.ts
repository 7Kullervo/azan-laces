import type { Unit } from "./types";
import type { ProductFormData } from "@/components/admin/ProductForm";

// Kept out of the "use client" form file so server pages can call it.
export const EMPTY_PRODUCT = (unit: Unit | undefined): ProductFormData => ({
  name: "",
  sku: "",
  slug: "",
  description: "",
  price: "",
  sale_price: "",
  unit_code: unit?.code ?? "",
  step: String(unit?.default_step ?? 1),
  min_qty: "1",
  stock: "0",
  low_stock_threshold: "10",
  category_id: "",
  subcategory_id: "",
  colour: "",
  material: "",
  specs: [],
  is_featured: false,
  is_best_seller: false,
  is_new: true,
  is_active: true,
  images: [],
});
