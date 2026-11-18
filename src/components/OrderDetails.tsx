import { formatPKR, formatPricePerUnit, formatQuantity } from "@/lib/units";
import { ORDER_STATUSES } from "@/lib/types";

export interface OrderItemRow {
  id: string;
  product_name: string;
  sku: string;
  image_url: string | null;
  unit_label: string;
  unit_label_plural: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderRow {
  order_number: string;
  status: string;
  created_at: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postal_code: string | null;
  notes: string | null;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_code: string | null;
  items: OrderItemRow[];
}

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STATUS_STYLES[status] ?? "bg-cream text-ink"}`}>{status}</span>;
}

export function StatusTracker({ status }: { status: string }) {
  if (status === "cancelled") {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">This order has been cancelled.</p>;
  }
  const steps = ORDER_STATUSES.filter((s) => s !== "cancelled");
  const idx = steps.indexOf(status as (typeof steps)[number]);
  return (
    <ol className="grid grid-cols-5 gap-1 text-center text-[11px] sm:text-xs">
      {steps.map((s, i) => (
        <li key={s}>
          <div className={`mx-auto mb-1.5 h-1.5 rounded-full ${i <= idx ? "bg-gold" : "bg-line"}`} />
          <span className={`capitalize ${i <= idx ? "font-semibold text-ink" : "text-stone"}`}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export default function OrderDetails({ order }: { order: OrderRow }) {
  const pay = order.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer";
  return (
    <div className="space-y-6">
      <StatusTracker status={order.status} />
      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        <ul className="divide-y divide-line">
          {order.items.map((it) => {
            const unit = { label: it.unit_label, label_plural: it.unit_label_plural };
            return (
              <li key={it.id} className="flex gap-4 p-4 sm:p-5">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.image_url && <img src={it.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{it.product_name}</p>
                  <p className="text-xs text-stone">{it.sku}</p>
                  <p className="mt-1 text-stone">{formatPricePerUnit(Number(it.unit_price), unit)}</p>
                  <p className="text-stone">Quantity: <strong className="text-ink">{formatQuantity(Number(it.quantity), unit)}</strong></p>
                </div>
                <p className="text-sm font-semibold">{formatPKR(Number(it.line_total))}</p>
              </li>
            );
          })}
        </ul>
        <dl className="space-y-2 border-t border-line bg-cream/50 p-5 text-sm">
          <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatPKR(Number(order.subtotal))}</dd></div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-emerald-700"><dt>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt><dd>-{formatPKR(Number(order.discount))}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-stone">Shipping</dt><dd>{Number(order.shipping) === 0 ? "Free" : formatPKR(Number(order.shipping))}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatPKR(Number(order.total))}</dd></div>
        </dl>
      </div>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-2 text-lg font-semibold">Delivery address</h3>
          <p>{order.customer_name}</p>
          <p className="text-stone">{order.address}</p>
          <p className="text-stone">{order.city}, {order.province} {order.postal_code}</p>
          <p className="mt-1 text-stone">{order.phone} · {order.email}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="mb-2 text-lg font-semibold">Payment</h3>
          <p>{pay}</p>
          {order.notes && (
            <>
              <h3 className="mb-1 mt-4 text-lg font-semibold">Order notes</h3>
              <p className="text-stone">{order.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
