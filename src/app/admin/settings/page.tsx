import SettingsManager from "@/components/admin/SettingsManager";
import { PageHead } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";
import { requireAdmin } from "@/lib/admin";
import type { Unit } from "@/lib/types";

export default async function AdminSettings() {
  const { supabase } = await requireAdmin();
  const [settings, { data: units }] = await Promise.all([getSettings(), supabase.from("units").select("*").order("label")]);
  return (
    <>
      <PageHead title="Settings" />
      <SettingsManager settings={settings} units={(units ?? []) as Unit[]} />
    </>
  );
}
