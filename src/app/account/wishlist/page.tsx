import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getProductsByIds } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("wishlists").select("product_id").order("created_at", { ascending: false });
  const products = await getProductsByIds((data ?? []).map((r) => r.product_id));

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white py-16 text-center">
        <p className="font-display text-3xl">Your wishlist is empty</p>
        <p className="mt-2 text-sm text-stone">Tap the heart on any product to save it here.</p>
        <Link href="/collections/all" className="btn-dark mt-6">Browse products</Link>
      </div>
    );
  }
  return <ProductGrid products={products} />;
}
