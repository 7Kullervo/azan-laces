import Link from "next/link";
import { Card, PageHead, Stat } from "@/components/admin/ui";
import { StatusBadge } from "@/components/OrderDetails";
import { requireAdmin } from "@/lib/admin";
import { formatPKR, formatQuantity } from "@/lib/units";

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();

  const [{ data: orders }, { data: products }, { data: recent }] = await Promise.all([
    supabase.from("orders").select("status,total"),
    supabase.from("products").select("id,name,sku,stock,low_stock_threshold,min_qty,is_active,unit:units(label,label_plural)"),
    supabase.from("orders").select("id,order_number,customer_name,status,total,created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const all = orders ?? [];
  const revenue = all.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const pending = all.filter((o) => o.status === "pending").length;
  const completed = all.filter((o) => o.status === "delivered").length;
  const prods = products ?? [];
  const low = prods.filter((p) => p.is_active && Number(p.stock) <= Number(p.low_stock_threshold));

  return (
    <>
      <PageHead title="Overview" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total orders" value={all.length} />
        <Stat label="Total revenue" value={formatPKR(revenue)} hint="Excludes cancelled orders" />
        <Stat label="Pending orders" value={pending} tone={pending ? "warn" : undefined} />
        <Stat label="Completed orders" value={completed} hint="Delivered" />
        <Stat label="Total products" value={prods.length} />
        <Stat label="Low stock products" value={low.length} tone={low.length ? "warn" : undefined} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-gold-dark underline">View all</Link>
          </div>
          {recent?.length ? (
            <ul className="divide-y divide-line text-sm">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-gold-dark">
                    <span>
                      <span className="font-medium">{o.order_number}</span>
                      <span className="block text-xs text-stone">{o.customer_name}</span>
                    </span>
                    <span className="flex items-center gap-3"><StatusBadge status={o.status} /><span className="font-semibold">{formatPKR(Number(o.total))}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-stone">No orders yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-semibold">Low stock</h2>
          {low.length ? (
            <ul className="divide-y divide-line text-sm">
              {low.slice(0, 8).map((p) => {
                const unit = (Array.isArray(p.unit) ? p.unit[0] : p.unit) as { label: string; label_plural: string };
                return (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-gold-dark">
                      <span><span className="font-medium">{p.name}</span><span className="block text-xs text-stone">{p.sku}</span></span>
                      <span className="font-semibold text-amber-700">{formatQuantity(Number(p.stock), unit)} left</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-stone">All products are well stocked.</p>
          )}
        </Card>
      </div>
    </>
  );
}
