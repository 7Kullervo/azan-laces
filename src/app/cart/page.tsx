import type { Metadata } from "next";
import CartPage from "@/components/CartPage";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Shopping Cart" };

export default async function Page() {
  const s = await getSettings();
  return <CartPage shipping={s.shipping} whatsapp={s.contact.whatsapp} />;
}
