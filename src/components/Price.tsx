import type { Product } from "@/lib/types";
import { discountPercent, effectivePrice, formatPKR } from "@/lib/units";

/** Price always shown with the product's unit: "Rs. 150 / Yard". */
export default function Price({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const big = size === "lg";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-semibold ${big ? "text-2xl" : "text-[15px]"} ${off ? "text-gold-dark" : "text-ink"}`}>
        {formatPKR(price)}
      </span>
      <span className={`${big ? "text-base" : "text-xs"} text-stone`}>/ {product.unit.label}</span>
      {off > 0 && (
        <>
          <span className={`${big ? "text-base" : "text-xs"} text-stone line-through`}>{formatPKR(product.price)}</span>
          {big && <span className="badge bg-gold-light text-gold-dark">Save {off}%</span>}
        </>
      )}
    </div>
  );
}
