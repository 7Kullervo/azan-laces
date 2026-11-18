import { PageHead } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";
import { EMPTY_PRODUCT } from "@/lib/product-defaults";
import { getCategoryTree } from "@/lib/data";
import { requireAdmin } from "@/lib/admin";
import type { Unit } from "@/lib/types";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const [categories, { data: units }] = await Promise.all([getCategoryTree(), supabase.from("units").select("*").order("label")]);
  return (
    <>
      <PageHead title="Add product" />
      <ProductForm initial={EMPTY_PRODUCT((units as Unit[])?.[0])} categories={categories} units={(units ?? []) as Unit[]} />
    </>
  );
}
