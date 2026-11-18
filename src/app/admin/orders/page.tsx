import Link from "next/link";
import { PageHead } from "@/components/admin/ui";
import { StatusBadge } from "@/components/OrderDetails";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUSES } from "@/lib/types";
import { formatPKR } from "@/lib/units";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const { supabase } = await requireAdmin();
  let req = supabase
    .from("orders")
    .select("id,order_number,customer_name,phone,status,payment_method,total,created_at,items:order_items(id)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (status && (ORDER_STATUSES as string[]).includes(status)) req = req.eq("status", status);
  if (q) {
    const term = q.replace(/[%,()]/g, " ");
    req = req.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`);
  }
  const { data } = await req;

  return (
    <>
      <PageHead title="Orders" />
      <div className="mb-4 flex flex-wrap gap-2">
        {[["", "All"], ...ORDER_STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1)])].map(([s, label]) => (
          <Link key={s} href={s ? `/admin/orders?status=${s}` : "/admin/orders"} className={`rounded-full border px-4 py-1.5 text-sm ${(status ?? "") === s ? "border-ink bg-ink text-ivory" : "border-line bg-white hover:border-gold"}`}>
            {label}
          </Link>
        ))}
      </div>
      <form className="mb-4 flex gap-2" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Order number, name or phone" className="input max-w-sm" aria-label="Search orders" />
        <button className="btn-outline">Search</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wider text-stone">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-cream/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-gold-dark">{o.order_number}</Link>
                  <p className="text-xs text-stone">{new Date(o.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })} · {o.items.length} item(s)</p>
                </td>
                <td className="px-4 py-3">{o.customer_name}<p className="text-xs text-stone">{o.phone}</p></td>
                <td className="px-4 py-3">{o.payment_method === "cod" ? "COD" : "Bank transfer"}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right font-semibold">{formatPKR(Number(o.total))}</td>
              </tr>
            ))}
            {!data?.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-stone">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
