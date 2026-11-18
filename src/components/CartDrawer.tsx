"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPKR, formatPricePerUnit, formatQuantity, lineTotal } from "@/lib/units";
import QuantitySelector from "./QuantitySelector";

export default function CartDrawer({ shipping }: { shipping: { flat_rate: number; free_over: number | null } }) {
  const { lines, drawerOpen, openDrawer, setQty, remove } = useCart();
  const subtotal = cartSubtotal(lines);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, openDrawer]);

  if (!drawerOpen) return null;

  const freeOver = shipping.free_over;
  const remaining = freeOver ? Math.max(0, freeOver - subtotal) : 0;

  return (
    <div className="fixed inset-0 z-[65]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-black/40" onClick={() => openDrawer(false)} />
      <aside className="drawer-enter absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <h2 className="font-display text-2xl font-semibold">Your Cart</h2>
          <button onClick={() => openDrawer(false)} aria-label="Close cart" className="flex h-11 w-11 items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={44} className="text-gold" />
            <p className="font-display text-2xl">Your cart is empty</p>
            <p className="text-sm text-stone">Browse our laces and tailoring supplies to get started.</p>
            <Link href="/collections/all" onClick={() => openDrawer(false)} className="btn-dark">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            {freeOver && (
              <div className="border-b border-line bg-cream px-5 py-2.5 text-xs text-stone">
                {remaining > 0 ? (
                  <>Add <strong className="text-ink">{formatPKR(remaining)}</strong> more for free delivery</>
                ) : (
                  <strong className="text-gold-dark">You&apos;ve unlocked free delivery</strong>
                )}
              </div>
            )}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.productId} className="flex gap-4 py-4">
                  <Link href={`/product/${l.slug}`} onClick={() => openDrawer(false)} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.image && <img src={l.image} alt={l.name} className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="text-[11px] uppercase tracking-wider text-stone">{l.sku}</p>
                      </div>
                      <button onClick={() => remove(l.productId)} aria-label={`Remove ${l.name}`} className="text-stone transition hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-stone">{formatPricePerUnit(l.unitPrice, { label: l.unitLabel })}</p>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div>
                        <QuantitySelector
                          compact
                          qty={l.qty}
                          onChange={(q) => setQty(l.productId, q)}
                          step={l.step}
                          minQty={l.minQty}
                          allowDecimal={l.allowDecimal}
                          unitLabelPlural={l.unitLabelPlural}
                        />
                        <p className="mt-1 text-[11px] text-stone">
                          {formatQuantity(l.qty, { label: l.unitLabel, label_plural: l.unitLabelPlural })}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatPKR(lineTotal(l.unitPrice, l.qty))}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line bg-white p-5">
              <div className="flex items-center justify-between text-base">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPKR(subtotal)}</span>
              </div>
              <p className="text-xs text-stone">Shipping and coupons are calculated at checkout.</p>
              <Link href="/checkout" onClick={() => openDrawer(false)} className="btn-dark w-full">
                Checkout
              </Link>
              <Link href="/cart" onClick={() => openDrawer(false)} className="btn-outline w-full">
                View cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
