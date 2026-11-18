import type { Metadata } from "next";
import OrderDetails, { type OrderRow } from "@/components/OrderDetails";
import { trackOrder } from "@/app/actions/shop";

export const metadata: Metadata = { title: "Track Your Order" };

type Props = { searchParams: Promise<{ order?: string; phone?: string }> };

export default async function TrackPage({ searchParams }: Props) {
  const { order: number, phone } = await searchParams;
  const result = number && phone ? ((await trackOrder(number, phone)) as OrderRow | null) : null;
  const searched = Boolean(number && phone);

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-4xl font-semibold sm:text-5xl">Track Your Order</h1>
      <p className="mt-2 text-stone">Enter your order number and the phone number used at checkout.</p>

      <form className="mt-6 grid gap-3 sm:grid-cols-3" method="get">
        <input name="order" defaultValue={number} required placeholder="Order number (AZ-…)" className="input" aria-label="Order number" />
        <input name="phone" defaultValue={phone} required placeholder="Phone number" className="input" aria-label="Phone number" />
        <button className="btn-dark">Track order</button>
      </form>

      {searched && !result && (
        <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          We couldn&apos;t find an order matching those details. Please check and try again.
        </p>
      )}
      {result && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-stone">Order <strong className="text-ink">{result.order_number}</strong></p>
          <OrderDetails order={result} />
        </div>
      )}
    </div>
  );
}
