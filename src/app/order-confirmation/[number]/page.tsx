import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import OrderDetails, { type OrderRow } from "@/components/OrderDetails";
import { whatsappLink } from "@/components/WhatsAppButton";
import { getSettings } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOrderToken } from "@/lib/token";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false } };

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> };

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { t } = await searchParams;
  if (!verifyOrderToken(number, t)) notFound();

  const admin = createAdminClient();
  const { data } = await admin.from("orders").select("*, items:order_items(*)").eq("order_number", number).maybeSingle();
  if (!data) notFound();
  const order = data as unknown as OrderRow;
  const settings = await getSettings();

  return (
    <div className="container-page max-w-3xl py-12">
      <div className="mb-8 text-center">
        <CheckCircle2 size={56} className="mx-auto text-emerald-600" />
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Thank you for your order</h1>
        <p className="mt-2 text-stone">
          Your order number is <strong className="text-ink">{order.order_number}</strong>. We&apos;ve received it and will confirm shortly.
        </p>
      </div>

      {order.payment_method === "bank_transfer" && settings.payments.bank_details && (
        <div className="mb-6 rounded-2xl border border-gold/50 bg-gold-light/40 p-5 text-sm">
          <h2 className="text-xl font-semibold">Bank transfer details</h2>
          <p className="mt-2 whitespace-pre-line">{settings.payments.bank_details}</p>
          <p className="mt-2 font-medium">Amount to pay: Rs. {Number(order.total).toLocaleString("en-PK")}</p>
        </div>
      )}

      <OrderDetails order={order} />

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/collections/all" className="btn-dark">Continue shopping</Link>
        <Link href="/track" className="btn-outline">Track an order</Link>
        {settings.contact.whatsapp && (
          <a
            href={whatsappLink(settings.contact.whatsapp, `Hello Azan Lace, my order number is ${order.order_number}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn border border-[#25D366] text-[#128C4B] hover:bg-[#25D366] hover:text-white"
          >
            Message us on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
