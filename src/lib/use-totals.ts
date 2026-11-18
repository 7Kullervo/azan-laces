"use client";

import { useEffect, useState } from "react";
import { previewCoupon, refreshCartLines } from "@/app/actions/shop";
import { cartSubtotal, useCart } from "./cart-store";
import { normalizeQty } from "./units";

export interface Shipping {
  flat_rate: number;
  free_over: number | null;
}

/** Keeps cart prices/units in sync with the database (once per page view). */
export function useSyncCart() {
  const hydrated = useCart((s) => s.hydrated);
  const [synced, setSynced] = useState(false);
  const [removed, setRemoved] = useState<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    const lines = useCart.getState().lines;
    if (!lines.length) {
      setSynced(true);
      return;
    }
    refreshCartLines(lines.map((l) => l.productId))
      .then((fresh) => {
        const map = new Map(fresh.map((f) => [f.id, f]));
        const gone: string[] = [];
        const next = useCart
          .getState()
          .lines.flatMap((l) => {
            const f = map.get(l.productId);
            if (!f || !f.active || f.stock < f.minQty) {
              gone.push(l.name);
              return [];
            }
            const qty = normalizeQty(l.qty, { step: f.step, minQty: f.minQty, allowDecimal: f.allowDecimal, max: f.stock });
            return [{ ...l, qty, unitPrice: f.unitPrice, step: f.step, minQty: f.minQty, unitLabel: f.unitLabel, unitLabelPlural: f.unitLabelPlural, allowDecimal: f.allowDecimal }];
          });
        useCart.setState({ lines: next });
        setRemoved(gone);
      })
      .catch(() => undefined)
      .finally(() => setSynced(true));
  }, [hydrated]);

  return { synced, removed };
}

export function useTotals(shipping: Shipping) {
  const lines = useCart((s) => s.lines);
  const couponCode = useCart((s) => s.couponCode);
  const [coupon, setCouponState] = useState({ ok: false, discount: 0, message: "" });
  const [checking, setChecking] = useState(false);

  const subtotal = cartSubtotal(lines);
  const signature = lines.map((l) => `${l.productId}:${l.qty}`).join(",");

  useEffect(() => {
    if (!couponCode || !lines.length) {
      setCouponState({ ok: false, discount: 0, message: "" });
      return;
    }
    let cancelled = false;
    setChecking(true);
    previewCoupon(couponCode, lines.map((l) => ({ productId: l.productId, qty: l.qty })))
      .then((r) => !cancelled && setCouponState(r))
      .catch(() => !cancelled && setCouponState({ ok: false, discount: 0, message: "Could not check coupon" }))
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode, signature]);

  const discount = coupon.ok ? coupon.discount : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const free = shipping.free_over !== null && shipping.free_over !== undefined && afterDiscount >= shipping.free_over;
  const shippingCost = lines.length === 0 || free ? 0 : shipping.flat_rate;
  const total = Math.round((afterDiscount + shippingCost) * 100) / 100;

  return { lines, subtotal, discount, shippingCost, total, coupon, checking, couponCode, freeShipping: free && lines.length > 0 };
}
