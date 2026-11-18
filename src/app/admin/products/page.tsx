import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHead } from "@/components/admin/ui";
import ProductRow from "@/components/admin/ProductRow";
import { requireAdmin } from "@/lib/admin";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { supabase } = await requireAdmin();
  let req = supabase
    .from("products")
    .select("id,name,sku,price,sale_price,stock,low_stock_threshold,is_active,is_featured,is_best_seller,is_new,unit:units(label,label_plural),category:categories(name),images:product_images(url,sort_order)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (q) {
    const term = q.replace(/[%,()]/g, " ");
    req = req.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  }
  const { data } = await req;

  return (
    <>
      <PageHead title="Products">
        <Link href="/admin/products/new" className="btn-dark"><Plus size={16} /> Add product</Link>
      </PageHead>
      <form className="mb-4 flex gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Search by name or SKU" className="input max-w-sm" aria-label="Search products" />
        <button className="btn-outline">Search</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price / unit</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Labels</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((p) => <ProductRow key={p.id} p={JSON.parse(JSON.stringify(p))} />)}
            {!data?.length && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-stone">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
