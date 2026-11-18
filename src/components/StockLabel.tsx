import type { Product } from "@/lib/types";
import { formatQuantity } from "@/lib/units";

export default function StockLabel({ product }: { product: Product }) {
  if (product.stock < product.min_qty) {
    return <p className="text-sm font-medium text-red-700">Out of stock</p>;
  }
  const low = product.stock <= product.low_stock_threshold;
  return (
    <p className={`text-sm font-medium ${low ? "text-amber-700" : "text-emerald-700"}`}>
      {low ? `Only ${formatQuantity(product.stock, product.unit)} left` : "In stock"}
    </p>
  );
}
