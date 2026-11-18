import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";

type Section = { heading: string; body: string };

const POLICIES: Record<string, { title: string; sections: (s: { flat: number; freeOver: number | null }) => Section[] }> = {
  shipping: {
    title: "Shipping Policy",
    sections: ({ flat, freeOver }) => [
      { heading: "Delivery coverage", body: "We deliver across Pakistan through trusted courier partners." },
      { heading: "Delivery charges", body: `A flat delivery charge of Rs. ${flat.toLocaleString("en-PK")} applies to every order${freeOver ? `, and delivery is free on orders over Rs. ${freeOver.toLocaleString("en-PK")}` : ""}.` },
      { heading: "Processing time", body: "Orders are confirmed and packed within 1–2 working days. Delivery usually takes 3–5 working days depending on your city." },
      { heading: "Tracking", body: "Use your order number and phone number on our Track Order page, or sign in to your account, to follow your order status." },
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    sections: () => [
      { heading: "Returns", body: "If you receive a damaged or incorrect item, contact us within 3 days of delivery with your order number and a photo. We will replace the item or refund you." },
      { heading: "Cut-to-length items", body: "Laces, piping, organza and other products sold by the yard are cut to your requested length, so they cannot be returned unless they are faulty or wrong." },
      { heading: "Colour variation", body: "Screens show colours differently. Small variations between photos and the real product are not a defect. Message us on WhatsApp if you need a sample first." },
      { heading: "Refunds", body: "Approved refunds are issued by bank transfer within 5–7 working days." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: () => [
      { heading: "What we collect", body: "We collect the details you give us when you order or create an account: name, phone, email, delivery address and order history." },
      { heading: "How we use it", body: "We use your details only to process and deliver orders, provide support and manage your account. We never sell your information." },
      { heading: "Security", body: "Accounts are protected by secure authentication and your data is stored with access controls. Payments on delivery are handled in cash by the courier." },
      { heading: "Your choices", body: "You may ask us to correct or delete your account information at any time by contacting us." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    sections: () => [
      { heading: "Orders", body: "Placing an order is an offer to buy. We may cancel an order if an item is out of stock or information is incorrect, and will tell you promptly." },
      { heading: "Prices and units", body: "All prices are in Pakistani Rupees (PKR) and are shown per selling unit (yard, piece, bottle, needle, etc.). Your total is calculated as price per unit × quantity." },
      { heading: "Payment", body: "We accept Cash on Delivery and, where enabled, Bank Transfer. Bank transfer orders are processed after payment is confirmed." },
      { heading: "Changes", body: "We may update these terms and our prices from time to time. The terms at the time of your order apply." },
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: POLICIES[slug]?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();
  const { shipping } = await getSettings();

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-4xl font-semibold sm:text-5xl">{policy.title}</h1>
      <div className="mt-8 space-y-7">
        {policy.sections({ flat: shipping.flat_rate, freeOver: shipping.free_over }).map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl font-semibold">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-stone">{s.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-stone">These are template policies. Please review them with your actual business practices.</p>
    </div>
  );
}
