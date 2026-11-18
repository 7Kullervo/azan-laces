import type { Metadata } from "next";
import AddressManager from "@/components/AddressManager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Saved Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data } = await supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at");
  return <AddressManager userId={auth.user!.id} addresses={data ?? []} />;
}
