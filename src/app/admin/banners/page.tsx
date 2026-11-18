import BannerManager, { type BannerRow } from "@/components/admin/BannerManager";
import { PageHead } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function AdminBanners() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("banners").select("*").order("sort_order");
  return (
    <>
      <PageHead title="Homepage banners" />
      <BannerManager banners={(data ?? []) as BannerRow[]} />
    </>
  );
}
