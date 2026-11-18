"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";
import AddToCart from "./AddToCart";
import Price from "./Price";
import StockLabel from "./StockLabel";

export default function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`Quick view of ${product.name}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="fade-up relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-ivory shadow-2xl sm:rounded-3xl md:grid-cols-2">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
        >
          <X size={18} />
        </button>
        <div className="aspect-[4/5] bg-cream md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images[0]?.url} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-stone">SKU: {product.sku}</p>
          <h2 className="text-3xl font-semibold leading-tight">{product.name}</h2>
          <Price product={product} size="lg" />
          <StockLabel product={product} />
          {product.description && <p className="text-sm leading-relaxed text-stone">{product.description}</p>}
          <AddToCart product={product} showWishlist={false} />
          <Link href={`/product/${product.slug}`} onClick={onClose} className="inline-block text-sm font-medium text-gold-dark underline underline-offset-4">
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
