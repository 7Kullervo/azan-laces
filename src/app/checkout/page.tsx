import type { Metadata } from "next";
import CheckoutForm, { type Prefill } from "@/components/CheckoutForm";
import { getSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [settings, supabase] = await Promise.all([getSettings(), createClient()]);
  const { data: auth } = await supabase.auth.getUser();

  const prefill: Prefill = {};
  if (auth.user) {
    prefill.email = auth.user.email ?? undefined;
    const [{ data: profile }, { data: addr }] = await Promise.all([
      supabase.from("profiles").select("full_name,phone").eq("id", auth.user.id).maybeSingle(),
      supabase.from("addresses").select("*").eq("user_id", auth.user.id).order("is_default", { ascending: false }).limit(1).maybeSingle(),
    ]);
    prefill.name = addr?.full_name ?? profile?.full_name ?? undefined;
    prefill.phone = addr?.phone ?? profile?.phone ?? undefined;
    if (addr) {
      prefill.address = addr.address;
      prefill.city = addr.city;
      prefill.province = addr.province;
      prefill.postalCode = addr.postal_code ?? undefined;
    }
  }

  return <CheckoutForm shipping={settings.shipping} payments={settings.payments} prefill={prefill} />;
}
