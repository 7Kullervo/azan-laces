"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { discountPercent } from "@/lib/units";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import Price from "./Price";
import QuickView from "./QuickView";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const [quick, setQuick] = useState(false);
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);
  const off = discountPercent(product);
  const soldOut = product.stock < product.min_qty;
  const img1 = product.images[0]?.url;
  const img2 = product.images[1]?.url;

  return (
    <>
      <article className="group flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
          <Link href={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
            {img1 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img1}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-0"
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img2 ?? img1}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100"
            />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {soldOut && <span className="badge bg-ink text-ivory">Sold out</span>}
            {off > 0 && <span className="badge bg-gold text-white">-{off}%</span>}
            {product.is_best_seller && <span className="badge bg-white text-gold-dark">Best Seller</span>}
            {product.is_new && <span className="badge bg-ink/90 text-ivory">New</span>}
          </div>

          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <WishlistButton productId={product.id} />
            <button
              onClick={() => setQuick(true)}
              aria-label={`Quick view ${product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 sm:translate-x-12 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100"
            >
              <Eye size={17} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-3.5">
          <p className="text-[11px] uppercase tracking-widest text-stone">{product.sku}</p>
          <Link href={`/product/${product.slug}`} className="mt-0.5 line-clamp-2 text-[15px] font-medium leading-snug transition hover:text-gold-dark">
            {product.name}
          </Link>
          <div className="mt-1.5">
            <Price product={product} />
          </div>
          <button
            disabled={soldOut}
            onClick={() => {
              add(product, product.min_qty);
              toast(`${product.name} added to cart`);
            }}
            className="btn-outline mt-3 !min-h-[40px] w-full !py-2"
          >
            <ShoppingBag size={15} /> {soldOut ? "Sold out" : "Add to Cart"}
          </button>
        </div>
      </article>
      {quick && <QuickView product={product} onClose={() => setQuick(false)} />}
    </>
  );
}
