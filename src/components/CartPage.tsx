"use client";

import Link from "next/link";
import { MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPKR, formatPricePerUnit, formatQuantity, lineTotal } from "@/lib/units";
import { useSyncCart, useTotals, type Shipping } from "@/lib/use-totals";
import CouponBox from "./CouponBox";
import OrderSummary from "./OrderSummary";
import QuantitySelector from "./QuantitySelector";
import { whatsappLink } from "./WhatsAppButton";

export default function CartPage({ shipping, whatsapp }: { shipping: Shipping; whatsapp?: string }) {
  const hydrated = useCart((s) => s.hydrated);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const { synced, removed } = useSyncCart();
  const t = useTotals(shipping);

  if (!hydrated || !synced) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-10 w-48 rounded-lg" />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="skeleton h-80 rounded-3xl lg:col-span-2" />
          <div className="skeleton h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (t.lines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <ShoppingBag size={52} className="text-gold" />
        <h1 className="mt-5 text-4xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-stone">Find something beautiful in our laces and tailoring supplies.</p>
        <Link href="/collections/all" className="btn-dark mt-7">Continue shopping</Link>
      </div>
    );
  }

  const waText =
    "Hello Azan Lace, I'd like to order:\n" +
    t.lines
      .map(
        (l) =>
          `• ${l.name} (${l.sku}) — ${formatQuantity(l.qty, { label: l.unitLabel, label_plural: l.unitLabelPlural })} @ ${formatPricePerUnit(l.unitPrice, { label: l.unitLabel })} = ${formatPKR(lineTotal(l.unitPrice, l.qty))}`
      )
      .join("\n") +
    `\n\nSubtotal: ${formatPKR(t.subtotal)}`;

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">Shopping Cart</h1>
      {removed.length > 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Removed because they are no longer available: {removed.join(", ")}.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-line rounded-3xl border border-line bg-white px-4 sm:px-6">
            {t.lines.map((l) => (
              <li key={l.productId} className="flex gap-4 py-5">
                <Link href={`/product/${l.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image && <img src={l.image} alt={l.name} className="h-full w-full object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/product/${l.slug}`} className="font-medium leading-snug hover:text-gold-dark">
                        {l.name} – {l.sku}
                      </Link>
                      <p className="mt-0.5 text-sm text-stone">{formatPricePerUnit(l.unitPrice, { label: l.unitLabel })}</p>
                      <p className="text-sm text-stone">
                        Quantity: <strong className="text-ink">{formatQuantity(l.qty, { label: l.unitLabel, label_plural: l.unitLabelPlural })}</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => remove(l.productId)}
                      aria-label={`Remove ${l.name}`}
                      className="h-9 w-9 shrink-0 text-stone transition hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                    <QuantitySelector
                      qty={l.qty}
                      onChange={(q) => setQty(l.productId, q)}
                      step={l.step}
                      minQty={l.minQty}
                      allowDecimal={l.allowDecimal}
                      unitLabelPlural={l.unitLabelPlural}
                    />
                    <p className="text-lg font-semibold">
                      <span className="mr-1 text-xs font-normal text-stone">Subtotal</span>
                      {formatPKR(lineTotal(l.unitPrice, l.qty))}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/collections/all" className="btn-outline">Continue Shopping</Link>
            {whatsapp && (
              <a href={whatsappLink(whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="btn border border-[#25D366] text-[#128C4B] hover:bg-[#25D366] hover:text-white">
                <MessageCircle size={16} /> Share cart on WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-xl font-semibold">Coupon code</h2>
            <CouponBox message={t.coupon.message} ok={t.coupon.ok} checking={t.checking} />
          </div>
          <OrderSummary
            lines={t.lines}
            subtotal={t.subtotal}
            discount={t.discount}
            shipping={t.shippingCost}
            total={t.total}
            couponCode={t.coupon.ok ? t.couponCode : undefined}
            freeShipping={t.freeShipping}
          />
          {shipping.free_over && !t.freeShipping && (
            <p className="text-center text-xs text-stone">
              Free delivery on orders over {formatPKR(shipping.free_over)}
            </p>
          )}
          <Link href="/checkout" className="btn-dark w-full !min-h-[50px] text-base">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
