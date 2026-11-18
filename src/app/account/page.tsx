import type { Metadata } from "next";
import ProfileForm from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name,phone").eq("id", auth.user!.id).maybeSingle();
  return <ProfileForm userId={auth.user!.id} name={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />;
}
