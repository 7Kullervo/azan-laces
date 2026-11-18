import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderDetails, { type OrderRow } from "@/components/OrderDetails";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*, items:order_items(*)").eq("order_number", number).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <Link href="/account/orders" className="text-sm text-gold-dark underline">← All orders</Link>
      <h2 className="mb-5 mt-2 text-3xl font-semibold">Order {data.order_number}</h2>
      <OrderDetails order={data as unknown as OrderRow} />
    </div>
  );
}
