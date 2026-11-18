import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/OrderDetails";
import { createClient } from "@/lib/supabase/server";
import { formatPKR, formatQuantity } from "@/lib/units";

export const metadata: Metadata = { title: "My Orders", robots: { index: false } };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id,order_number,status,total,created_at,items:order_items(id,product_name,quantity,unit_label,unit_label_plural)")
    .order("created_at", { ascending: false });

  if (!orders?.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white py-16 text-center">
        <p className="font-display text-3xl">No orders yet</p>
        <p className="mt-2 text-sm text-stone">When you place an order it will appear here.</p>
        <Link href="/collections/all" className="btn-dark mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.order_number}`} className="block rounded-2xl border border-line bg-white p-5 transition hover:border-gold">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{o.order_number}</p>
              <StatusBadge status={o.status} />
            </div>
            <p className="mt-1 text-xs text-stone">{new Date(o.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}</p>
            <ul className="mt-3 space-y-0.5 text-sm text-stone">
              {o.items.slice(0, 3).map((it) => (
                <li key={it.id}>
                  {it.product_name} — {formatQuantity(Number(it.quantity), { label: it.unit_label, label_plural: it.unit_label_plural })}
                </li>
              ))}
              {o.items.length > 3 && <li>+ {o.items.length - 3} more</li>}
            </ul>
            <p className="mt-3 font-semibold">{formatPKR(Number(o.total))}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
