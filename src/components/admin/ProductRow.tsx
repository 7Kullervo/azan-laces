"use client";

import Link from "next/link";
import { deleteProduct, quickUpdateProduct } from "@/app/admin/actions";
import { formatPKR, formatQuantity } from "@/lib/units";
import { useAction } from "./ui";

interface Row {
  id: string;
  name: string;
  sku: string;
  price: number;
  sale_price: number | null;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  unit: { label: string; label_plural: string } | { label: string; label_plural: string }[];
  category: { name: string } | { name: string }[] | null;
  images: { url: string; sort_order: number }[];
}

export default function ProductRow({ p }: { p: Row }) {
  const { run, pending } = useAction();
  const unit = Array.isArray(p.unit) ? p.unit[0] : p.unit;
  const cat = Array.isArray(p.category) ? p.category[0] : p.category;
  const img = [...p.images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  const stock = Number(p.stock);
  const low = stock <= Number(p.low_stock_threshold);
  const hasSale = p.sale_price !== null && Number(p.sale_price) < Number(p.price);

  const tag = (key: "is_featured" | "is_best_seller" | "is_new", label: string) => (
    <button
      disabled={pending}
      onClick={() => run(() => quickUpdateProduct(p.id, { [key]: !p[key] }), "Updated")}
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${p[key] ? "bg-gold text-white" : "bg-cream text-stone"}`}
    >
      {label}
    </button>
  );

  return (
    <tr className={p.is_active ? "" : "opacity-60"}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {img && <img src={img} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-gold-dark">{p.name}</Link>
            <p className="text-xs text-stone">{p.sku}{cat ? ` · ${cat.name}` : ""}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{formatPKR(hasSale ? Number(p.sale_price) : Number(p.price))} / {unit.label}</p>
        {hasSale && <p className="text-xs text-stone line-through">{formatPKR(Number(p.price))}</p>}
      </td>
      <td className={`px-4 py-3 ${low ? "font-semibold text-amber-700" : ""}`}>{formatQuantity(stock, unit)}</td>
      <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{tag("is_featured", "Featured")}{tag("is_best_seller", "Best")}{tag("is_new", "New")}</div></td>
      <td className="px-4 py-3">
        <button
          disabled={pending}
          onClick={() => run(() => quickUpdateProduct(p.id, { is_active: !p.is_active }), p.is_active ? "Product hidden" : "Product visible")}
          className={`badge ${p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-stone/20 text-stone"}`}
        >
          {p.is_active ? "Active" : "Hidden"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/admin/products/${p.id}`} className="mr-3 text-gold-dark underline">Edit</Link>
        <button
          disabled={pending}
          onClick={() => confirm(`Delete “${p.name}”?`) && run(() => deleteProduct(p.id), "Product deleted")}
          className="text-red-700 underline"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
