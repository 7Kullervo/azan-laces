"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Product } from "./types";
import { effectivePrice, lineTotal, normalizeQty } from "./units";

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  drawerOpen: boolean;
  couponCode: string;
  setCoupon: (code: string) => void;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openDrawer: (open: boolean) => void;
}

export function lineFromProduct(product: Product, qty: number): CartLine {
  const allowDecimal = product.unit.allow_decimal;
  return {
    productId: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    image: product.images[0]?.url ?? null,
    unitPrice: effectivePrice(product),
    unitCode: product.unit_code,
    unitLabel: product.unit.label,
    unitLabelPlural: product.unit.label_plural,
    step: product.step,
    minQty: product.min_qty,
    allowDecimal,
    qty: normalizeQty(qty, { step: product.step, minQty: product.min_qty, allowDecimal }),
  };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      drawerOpen: false,
      couponCode: "",
      setCoupon: (code) => set({ couponCode: code }),
      add: (product, qty) => {
        const wanted = qty ?? product.min_qty;
        const existing = get().lines.find((l) => l.productId === product.id);
        if (existing) {
          const next = normalizeQty(existing.qty + wanted, {
            step: existing.step,
            minQty: existing.minQty,
            allowDecimal: existing.allowDecimal,
            max: product.stock,
          });
          set({
            lines: get().lines.map((l) =>
              l.productId === product.id
                ? { ...l, qty: next, unitPrice: effectivePrice(product) }
                : l
            ),
            drawerOpen: true,
          });
        } else {
          const line = lineFromProduct(product, wanted);
          line.qty = Math.min(line.qty, Math.max(product.stock, product.min_qty));
          set({ lines: [...get().lines, line], drawerOpen: true });
        }
      },
      setQty: (productId, qty) =>
        set({
          lines: get().lines.map((l) =>
            l.productId === productId
              ? {
                  ...l,
                  qty: normalizeQty(qty, {
                    step: l.step,
                    minQty: l.minQty,
                    allowDecimal: l.allowDecimal,
                  }),
                }
              : l
          ),
        }),
      remove: (productId) => set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      clear: () => set({ lines: [], couponCode: "" }),
      openDrawer: (open) => set({ drawerOpen: open }),
    }),
    {
      name: "azan-lace-cart",
      partialize: (s) => ({ lines: s.lines, couponCode: s.couponCode }),
      // Rehydrate from localStorage after mount (see Providers) so server and first client render match.
      skipHydration: true,
    }
  )
);

export function cartSubtotal(lines: CartLine[]): number {
  return Math.round(lines.reduce((sum, l) => sum + lineTotal(l.unitPrice, l.qty), 0) * 100) / 100;
}

/** Number of distinct products in the cart (used for the header badge). */
export function cartCount(lines: CartLine[]): number {
  return lines.length;
}

/** Loads the saved cart from localStorage once, then marks the store as ready. */
export async function hydrateCart() {
  try {
    await useCart.persist.rehydrate();
  } catch {
    // storage unavailable (private mode, blocked cookies): start with an empty cart
  } finally {
    useCart.setState({ hydrated: true });
  }
}
