"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { effectivePrice, formatPKR, formatQuantity, lineTotal } from "@/lib/units";
import QuantitySelector from "./QuantitySelector";
import WishlistButton from "./WishlistButton";

/** Quantity selector + Add to Cart + Buy Now for the product page and quick view. */
export default function AddToCart({ product, showWishlist = true }: { product: Product; showWishlist?: boolean }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);
  const [qty, setQty] = useState(product.min_qty);
  const outOfStock = product.stock < product.min_qty;
  const unit = product.unit;
  const total = lineTotal(effectivePrice(product), qty);

  function addToCart(openDrawer = true) {
    add(product, qty);
    if (!openDrawer) return;
    toast(`${product.name} (${formatQuantity(qty, unit)}) added to cart`);
  }

  return (
    <div className="space-y-5">
      <QuantitySelector
        qty={qty}
        onChange={setQty}
        step={product.step}
        minQty={product.min_qty}
        allowDecimal={unit.allow_decimal}
        max={product.stock}
        unitLabelPlural={unit.label_plural}
      />
      <div className="flex items-baseline justify-between rounded-xl bg-cream px-4 py-3 text-sm">
        <span className="text-stone">
          {formatQuantity(qty, unit)} × {formatPKR(effectivePrice(product))}
        </span>
        <span className="text-lg font-semibold">{formatPKR(total)}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button disabled={outOfStock} onClick={() => addToCart()} className="btn-dark flex-1 sm:flex-none sm:px-9">
          <ShoppingBag size={16} /> Add to Cart
        </button>
        <button
          disabled={outOfStock}
          onClick={() => {
            addToCart(false);
            router.push("/checkout");
          }}
          className="btn-gold flex-1 sm:flex-none sm:px-9"
        >
          Buy Now
        </button>
        {showWishlist && <WishlistButton productId={product.id} variant="full" />}
      </div>
    </div>
  );
}
