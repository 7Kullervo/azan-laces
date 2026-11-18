"use client";

import { formatPKR, formatPricePerUnit, formatQuantity, lineTotal } from "@/lib/units";
import type { CartLine } from "@/lib/types";

interface Props {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  freeShipping?: boolean;
}

/** Shared by cart and checkout: shows each line with its own unit. */
export default function OrderSummary({ lines, subtotal, discount, shipping, total, couponCode, freeShipping }: Props) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-2xl font-semibold">Order summary</h2>
      <ul className="mt-4 divide-y divide-line">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-3 py-3">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{l.name}</p>
              <p className="text-xs text-stone">
                {l.sku} · {formatPricePerUnit(l.unitPrice, { label: l.unitLabel })}
              </p>
              <p className="text-xs text-stone">
                Qty: {formatQuantity(l.qty, { label: l.unitLabel, label_plural: l.unitLabelPlural })}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatPKR(lineTotal(l.unitPrice, l.qty))}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone">Subtotal</dt>
          <dd>{formatPKR(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <dt>Discount{couponCode ? ` (${couponCode.toUpperCase()})` : ""}</dt>
            <dd>-{formatPKR(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-stone">Shipping</dt>
          <dd>{freeShipping || shipping === 0 ? "Free" : formatPKR(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
          <dt>Total</dt>
          <dd>{formatPKR(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
