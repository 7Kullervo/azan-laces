import Link from "next/link";
import { notFound } from "next/navigation";
import OrderDetails, { type OrderRow } from "@/components/OrderDetails";
import OrderStatusControl from "@/components/admin/OrderStatusControl";
import { requireAdmin } from "@/lib/admin";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("orders").select("*, items:order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-gold-dark underline">← All orders</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Order {data.order_number}</h1>
          <p className="text-sm text-stone">Placed {new Date(data.created_at).toLocaleString("en-PK", { dateStyle: "long", timeStyle: "short" })}</p>
        </div>
        <OrderStatusControl id={data.id} status={data.status} />
      </div>
      <OrderDetails order={data as unknown as OrderRow} />
    </>
  );
}
