import { notFound } from "next/navigation";
import { PageHead } from "@/components/admin/ui";
import ProductForm, { type ProductFormData } from "@/components/admin/ProductForm";
import { getCategoryTree } from "@/lib/data";
import { requireAdmin } from "@/lib/admin";
import type { Unit } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [categories, { data: units }, { data: p }] = await Promise.all([
    getCategoryTree(),
    supabase.from("units").select("*").order("label"),
    supabase.from("products").select("*, images:product_images(url,sort_order)").eq("id", id).maybeSingle(),
  ]);
  if (!p) notFound();

  const initial: ProductFormData = {
    id: p.id,
    name: p.name,
    sku: p.sku,
    slug: p.slug,
    description: p.description ?? "",
    price: String(p.price),
    sale_price: p.sale_price === null ? "" : String(p.sale_price),
    unit_code: p.unit_code,
    step: String(Number(p.step)),
    min_qty: String(Number(p.min_qty)),
    stock: String(Number(p.stock)),
    low_stock_threshold: String(Number(p.low_stock_threshold)),
    category_id: p.category_id ?? "",
    subcategory_id: p.subcategory_id ?? "",
    colour: p.colour ?? "",
    material: p.material ?? "",
    specs: Array.isArray(p.specs) ? p.specs : [],
    is_featured: p.is_featured,
    is_best_seller: p.is_best_seller,
    is_new: p.is_new,
    is_active: p.is_active,
    images: [...(p.images ?? [])].sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((i: { url: string }) => i.url),
  };

  return (
    <>
      <PageHead title={`Edit: ${p.name}`} />
      <ProductForm initial={initial} categories={categories} units={(units ?? []) as Unit[]} />
    </>
  );
}
