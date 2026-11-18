import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current visitor is a signed-in admin (role stored in profiles).
 * Used by every admin page AND every admin server action. Writes then run as the
 * admin's own session, so database Row Level Security enforces the role again.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/");
  return { supabase, user: data.user };
}
